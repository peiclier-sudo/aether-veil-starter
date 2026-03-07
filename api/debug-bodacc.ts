/**
 * Debug endpoint: fetch 1 raw BODACC record and return the full JSON structure.
 * Usage: GET /api/debug-bodacc?date=2026-03-06
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_URL =
  "https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const date = String(req.query.date || new Date(Date.now() - 86400000).toISOString().slice(0, 10));
  const where = encodeURIComponent(`dateparution=date'${date}'`);
  const refine = encodeURIComponent("familleavis:immatriculation");
  const url = `${BASE_URL}?where=${where}&refine=${refine}&limit=3&offset=0`;

  const resp = await fetch(url);
  const data = await resp.json();
  const records = data.results || [];

  return res.json({
    date,
    totalResults: data.total_count,
    recordCount: records.length,
    records: records.map((r: Record<string, unknown>) => ({
      fields: Object.keys(r),
      id: r.id,
      commercant: r.commercant,
      ville: r.ville,
      cp: r.cp,
      registre: r.registre,
      acte: r.acte,
      listepersonnes: r.listepersonnes,
      listeetablissements: r.listeetablissements,
    })),
  });
}
