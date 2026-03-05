import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { dbLeadToFrontend } from "./supabase-types";
import { mockLeads, mockDailyStats } from "./mock-data";
import type { Lead, DailyStats, Vertical } from "./types";

/**
 * Hook that fetches leads from Supabase if configured,
 * otherwise falls back to mock data.
 */
export function useLeads(options?: {
  vertical?: Vertical;
  minScore?: number;
  search?: string;
  limit?: number;
}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeads() {
      setLoading(true);

      // If Supabase is not configured, use mock data
      if (!supabase) {
        let filtered = [...mockLeads];

        if (options?.vertical && options.vertical !== "all") {
          filtered = filtered.filter((l) => l.vertical === options.vertical);
        }
        if (options?.minScore) {
          filtered = filtered.filter((l) => l.aiScore >= options.minScore!);
        }
        if (options?.search) {
          const q = options.search.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              l.companyName.toLowerCase().includes(q) ||
              l.activity.toLowerCase().includes(q) ||
              l.city.toLowerCase().includes(q)
          );
        }

        if (!cancelled) {
          setLeads(filtered.slice(0, options?.limit || 50));
          setTotal(filtered.length);
          setLoading(false);
        }
        return;
      }

      // Fetch from Supabase
      try {
        let query = supabase
          .from("leads")
          .select("*", { count: "exact" })
          .order("ai_score", { ascending: false })
          .limit(options?.limit || 50);

        if (options?.vertical && options.vertical !== "all") {
          query = query.eq("vertical", options.vertical);
        }
        if (options?.minScore) {
          query = query.gte("ai_score", options.minScore);
        }
        if (options?.search) {
          query = query.or(
            `company_name.ilike.%${options.search}%,city.ilike.%${options.search}%,activity.ilike.%${options.search}%`
          );
        }

        const { data, count, error } = await query;

        if (error) throw error;

        if (!cancelled) {
          setLeads((data || []).map(dbLeadToFrontend));
          setTotal(count || 0);
        }
      } catch (err) {
        console.warn("[useLeads] Supabase error, falling back to mock data:", err);
        if (!cancelled) {
          setLeads(mockLeads.slice(0, options?.limit || 50));
          setTotal(mockLeads.length);
        }
      }

      if (!cancelled) setLoading(false);
    }

    fetchLeads();

    return () => {
      cancelled = true;
    };
  }, [options?.vertical, options?.minScore, options?.search, options?.limit]);

  return { leads, loading, total };
}

/**
 * Hook that fetches a single lead by ID
 */
export function useLead(id: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchLead() {
      setLoading(true);

      if (!supabase) {
        const found = mockLeads.find((l) => l.id === id) || null;
        if (!cancelled) {
          setLead(found);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (!cancelled) {
          setLead(data ? dbLeadToFrontend(data) : null);
        }
      } catch {
        // Fallback to mock
        const found = mockLeads.find((l) => l.id === id) || null;
        if (!cancelled) setLead(found);
      }

      if (!cancelled) setLoading(false);
    }

    fetchLead();
    return () => { cancelled = true; };
  }, [id]);

  return { lead, loading };
}

/**
 * Hook that fetches daily stats
 */
export function useDailyStats(days = 14) {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);

      if (!supabase) {
        if (!cancelled) {
          setStats(mockDailyStats.slice(-days));
          setLoading(false);
        }
        return;
      }

      try {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data, error } = await supabase
          .from("daily_stats")
          .select("*")
          .gte("date", since.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (error) throw error;

        if (!cancelled) {
          setStats(
            (data || []).map((d) => ({
              date: d.date,
              totalCreations: d.total_creations,
              qualified: d.qualified,
              highScore: d.high_score,
              mediumScore: d.medium_score,
              lowScore: d.low_score,
            }))
          );
        }
      } catch {
        if (!cancelled) setStats(mockDailyStats.slice(-days));
      }

      if (!cancelled) setLoading(false);
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [days]);

  return { stats, loading };
}
