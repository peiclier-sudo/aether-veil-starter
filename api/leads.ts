/**
 * API route: GET /api/leads
 *
 * Query params:
 *   vertical  — filter by vertical (agence-web, expert-comptable, assureur)
 *   minScore  — minimum AI score (default 0)
 *   search    — search company name, city, activity
 *   limit     — max results (default 50)
 *   offset    — pagination offset (default 0)
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceClient } from "./lib/supabase-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = getServiceClient();

  const vertical = req.query.vertical as string | undefined;
  const minScore = parseInt(req.query.minScore as string) || 0;
  const search = req.query.search as string | undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = parseInt(req.query.offset as string) || 0;

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .gte("ai_score", minScore)
    .order("ai_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (vertical && vertical !== "all") {
    query = query.eq("vertical", vertical);
  }

  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,city.ilike.%${search}%,activity.ilike.%${search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({
    leads: data,
    total: count,
    limit,
    offset,
  });
}
