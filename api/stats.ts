/**
 * API route: GET /api/stats
 *
 * Returns daily stats for the analytics dashboard.
 * Query params:
 *   days — number of days to return (default 14, max 90)
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceClient } from "./lib/supabase-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = getServiceClient();
  const days = Math.min(parseInt(req.query.days as string) || 14, 90);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_stats")
    .select("*")
    .gte("date", sinceStr)
    .order("date", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ stats: data, days });
}
