/**
 * Daily BODACC ingestion cron
 *
 * Runs daily at 6:00 AM UTC (7:00 or 8:00 Paris time)
 * 1. Fetch yesterday's BODACC immatriculations
 * 2. Deduplicate by SIREN
 * 3. Insert into Supabase
 * 4. Enrich each lead (INSEE + DNS + web)
 * 5. Score each lead (rule-based or DeepSeek)
 * 6. Update daily stats
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceClient } from "../lib/supabase-server.js";
import { fetchBodaccCreations } from "../lib/bodacc.js";
import { enrichLead } from "../lib/enrich.js";
import { ruleBasedScore, deepseekScore } from "../lib/scoring.js";

export const config = {
  // Vercel cron: run daily at 6:00 UTC
  // Set this in vercel.json
  maxDuration: 300, // 5 min timeout (Pro plan), 60s on free
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret (prevent unauthorized calls)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getServiceClient();
  // Support both INSEE_API_TOKEN (key:secret) and separate INSEE_CLIENT_ID/SECRET
  const inseeClientId = process.env.INSEE_CLIENT_ID;
  const inseeClientSecret = process.env.INSEE_CLIENT_SECRET;
  const inseeToken = process.env.INSEE_API_TOKEN || (inseeClientId && inseeClientSecret ? `${inseeClientId}:${inseeClientSecret}` : undefined);
  console.log(`[INGEST] INSEE configured: ${!!inseeToken} (API_TOKEN=${!!process.env.INSEE_API_TOKEN}, CLIENT_ID=${!!inseeClientId}, CLIENT_SECRET=${!!inseeClientSecret})`);
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  // Use yesterday's date (BODACC publishes with 1-day delay)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];

  // Log pipeline run
  const { data: run } = await supabase
    .from("pipeline_runs")
    .insert({ run_date: dateStr, step: "ingest", status: "running" })
    .select()
    .single();

  try {
    // ── Step 1: Fetch BODACC ────────────────
    console.log(`[INGEST] Fetching BODACC for ${dateStr}...`);
    const rawLeads = await fetchBodaccCreations(dateStr);
    console.log(`[INGEST] Found ${rawLeads.length} raw creations`);

    if (rawLeads.length === 0) {
      await supabase
        .from("pipeline_runs")
        .update({ status: "success", leads_count: 0, finished_at: new Date().toISOString() })
        .eq("id", run?.id);
      return res.json({ status: "ok", message: "No creations found for this date", date: dateStr });
    }

    // ── Step 2: Deduplicate by SIREN ────────
    const seen = new Set<string>();
    const uniqueLeads = rawLeads.filter((l) => {
      if (!l.siren || seen.has(l.siren)) return false;
      seen.add(l.siren);
      return true;
    });
    console.log(`[INGEST] ${uniqueLeads.length} unique leads after dedup`);

    // ── Step 3: Process each lead ───────────
    let enrichedCount = 0;
    let scoredCount = 0;
    let skippedCount = 0;
    let inseeHits = 0;
    let domainHits = 0;
    let websiteHits = 0;
    const sampleLeads: Array<{ name: string; siren: string; nafCode: string; hasDomain: boolean; hasWebsite: boolean; score: number; vertical: string }> = [];

    // Time budget: stop enriching 30s before Vercel kills us
    const startTime = Date.now();
    const TIME_BUDGET_MS = (config.maxDuration - 30) * 1000; // 270s

    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < uniqueLeads.length; i += batchSize) {
      // Check time budget before starting a new batch
      if (Date.now() - startTime > TIME_BUDGET_MS) {
        skippedCount = uniqueLeads.length - i;
        console.log(`[INGEST] Time budget exceeded, inserting ${skippedCount} remaining leads without enrichment`);

        // Bulk-insert remaining leads with basic data (no enrichment)
        const remaining = uniqueLeads.slice(i).map((lead) => ({
          siren: lead.siren,
          siret: lead.siren,
          company_name: lead.companyName,
          legal_form: lead.legalForm,
          activity: lead.activity,
          capital: lead.capital,
          city: lead.city,
          postal_code: lead.postalCode,
          region: lead.region,
          address: lead.address,
          bodacc_id: lead.bodaccId,
          bodacc_date: lead.bodaccDate,
          enrichment_status: "pending",
          scoring_status: "pending",
        }));
        await supabase.from("leads").upsert(remaining, { onConflict: "bodacc_id" });
        break;
      }

      const batch = uniqueLeads.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (lead) => {
          // Skip web probes when less than 60s remaining
          const remainingMs = TIME_BUDGET_MS - (Date.now() - startTime);
          const skipWebProbe = remainingMs < 60_000;

          // Enrich
          const enrichment = await enrichLead(lead.siren, lead.companyName, inseeToken, skipWebProbe);
          enrichedCount++;
          if (enrichment.nafCode) inseeHits++;
          if (enrichment.hasDomain) domainHits++;
          if (enrichment.hasWebsite) websiteHits++;

          // Score (rule-based first, then optionally DeepSeek)
          const leadForScoring = {
            companyName: lead.companyName,
            legalForm: lead.legalForm,
            capital: lead.capital,
            activity: lead.activity,
            nafCode: enrichment.nafCode || "",
            city: lead.city,
            region: lead.region,
            hasDomain: enrichment.hasDomain,
            hasWebsite: enrichment.hasWebsite,
            websiteStack: enrichment.websiteStack,
            employeeEstimate: enrichment.employeeEstimate,
          };

          let scoring = ruleBasedScore(leadForScoring);

          // Optionally upgrade with DeepSeek
          if (deepseekKey && scoring.score >= 40) {
            const aiResult = await deepseekScore(
              leadForScoring,
              scoring.vertical,
              deepseekKey
            );
            if (aiResult && aiResult.score > scoring.score) {
              scoring = {
                ...scoring,
                score: aiResult.score,
                reasons: aiResult.reasons,
                outreachAngle: aiResult.outreachAngle,
              };
            }
          }
          scoredCount++;

          // Capture first 5 leads for diagnostics
          if (sampleLeads.length < 5) {
            sampleLeads.push({
              name: lead.companyName,
              siren: lead.siren,
              nafCode: enrichment.nafCode || "",
              hasDomain: enrichment.hasDomain,
              hasWebsite: enrichment.hasWebsite,
              score: scoring.score,
              vertical: scoring.vertical,
            });
          }

          // Insert into Supabase
          return supabase.from("leads").upsert(
            {
              siren: lead.siren,
              siret: lead.siren, // Will be updated if INSEE provides SIRET
              company_name: lead.companyName,
              legal_form: lead.legalForm,
              activity: lead.activity,
              naf_code: enrichment.nafCode || "",
              capital: lead.capital,
              city: lead.city,
              postal_code: lead.postalCode,
              region: lead.region,
              address: lead.address,
              bodacc_id: lead.bodaccId,
              bodacc_date: lead.bodaccDate,
              creation_date: enrichment.creationDate || lead.bodaccDate,
              vertical: scoring.vertical,
              ai_score: scoring.score,
              score_reasons: scoring.reasons,
              has_domain: enrichment.hasDomain,
              domain: enrichment.domain || null,
              has_website: enrichment.hasWebsite,
              website_stack: enrichment.websiteStack,
              social_presence: enrichment.socialPresence,
              employee_estimate: enrichment.employeeEstimate || null,
              outreach_angle: scoring.outreachAngle,
              tags: scoring.tags,
              enrichment_status: "enriched",
              scoring_status: "scored",
            },
            { onConflict: "bodacc_id" }
          );
        })
      );

      // Log failures
      results.forEach((r, idx) => {
        if (r.status === "rejected") {
          console.error(`[INGEST] Failed to process lead ${i + idx}:`, r.reason);
        }
      });

      // Small delay between batches to respect rate limits
      if (i + batchSize < uniqueLeads.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // ── Step 4: Update daily stats ──────────
    const { data: todayLeads } = await supabase
      .from("leads")
      .select("ai_score")
      .eq("bodacc_date", dateStr);

    const stats = {
      date: dateStr,
      total_creations: rawLeads.length,
      qualified: uniqueLeads.length,
      high_score: (todayLeads || []).filter((l) => l.ai_score >= 75).length,
      medium_score: (todayLeads || []).filter((l) => l.ai_score >= 50 && l.ai_score < 75).length,
      low_score: (todayLeads || []).filter((l) => l.ai_score < 50).length,
    };

    await supabase.from("daily_stats").upsert(stats, { onConflict: "date" });

    // Update pipeline run
    await supabase
      .from("pipeline_runs")
      .update({
        status: "success",
        leads_count: uniqueLeads.length,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run?.id);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[INGEST] Done in ${elapsed}s! ${uniqueLeads.length} leads (${enrichedCount} enriched, ${scoredCount} scored, ${skippedCount} skipped)`);

    return res.json({
      status: "ok",
      date: dateStr,
      raw: rawLeads.length,
      unique: uniqueLeads.length,
      enriched: enrichedCount,
      scored: scoredCount,
      skipped: skippedCount,
      elapsed: `${elapsed}s`,
      stats,
      diagnostics: {
        inseeConfigured: !!inseeToken,
        inseeHits,
        domainHits,
        websiteHits,
        sampleLeads,
      },
    });
  } catch (error) {
    console.error("[INGEST] Pipeline error:", error);

    await supabase
      .from("pipeline_runs")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        finished_at: new Date().toISOString(),
      })
      .eq("id", run?.id);

    return res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
