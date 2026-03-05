import { useState, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  Target,
  Zap,
  Search,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import { mockLeads, mockDailyStats } from "@/lib/mock-data";
import type { Vertical } from "@/lib/types";
import LeadCard from "@/components/LeadCard";
import StatsCard from "@/components/StatsCard";
import VerticalFilter from "@/components/VerticalFilter";

export default function Dashboard() {
  const [vertical, setVertical] = useState<Vertical>("all");
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const filteredLeads = useMemo(() => {
    return mockLeads.filter((lead) => {
      if (vertical !== "all" && lead.vertical !== vertical) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !lead.companyName.toLowerCase().includes(q) &&
          !lead.activity.toLowerCase().includes(q) &&
          !lead.city.toLowerCase().includes(q)
        )
          return false;
      }
      if (scoreFilter === "high" && lead.aiScore < 75) return false;
      if (scoreFilter === "medium" && (lead.aiScore < 50 || lead.aiScore >= 75))
        return false;
      if (scoreFilter === "low" && lead.aiScore >= 50) return false;
      return true;
    });
  }, [vertical, search, scoreFilter]);

  const todayStats = mockDailyStats[mockDailyStats.length - 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Leads qualifiés du jour &mdash;{" "}
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Créations du jour"
          value={todayStats.totalCreations}
          change="+12% vs hier"
          icon={<Building2 className="h-6 w-6" />}
          color="#6366f1"
        />
        <StatsCard
          label="Leads qualifiés"
          value={todayStats.qualified}
          change={`${Math.round((todayStats.qualified / todayStats.totalCreations) * 100)}% taux de qualification`}
          icon={<Target className="h-6 w-6" />}
          color="#10b981"
        />
        <StatsCard
          label="Score moyen"
          value={`${Math.round(mockLeads.reduce((a, b) => a + b.aiScore, 0) / mockLeads.length)}/100`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="#f59e0b"
        />
        <StatsCard
          label="Contacts enrichis"
          value={`${Math.round((mockLeads.filter((l) => l.contact).length / mockLeads.length) * 100)}%`}
          icon={<Zap className="h-6 w-6" />}
          color="#8b5cf6"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <VerticalFilter selected={vertical} onChange={setVertical} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, activité, ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            {(
              [
                { id: "all", label: "Tous" },
                { id: "high", label: "Score 75+" },
                { id: "medium", label: "Score 50-74" },
                { id: "low", label: "Score < 50" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setScoreFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  scoreFilter === f.id
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        {filteredLeads.length} lead{filteredLeads.length > 1 ? "s" : ""}{" "}
        trouvé{filteredLeads.length > 1 ? "s" : ""}
      </div>

      {/* Lead list */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredLeads.slice(0, 20).map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>

      {filteredLeads.length > 20 && (
        <div className="mt-6 text-center">
          <button className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-50">
            Voir plus de leads ({filteredLeads.length - 20} restants)
          </button>
        </div>
      )}
    </div>
  );
}
