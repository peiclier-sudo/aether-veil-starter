import { useState, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  Target,
  Zap,
  Search,
  Download,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { mockLeads, mockDailyStats } from "@/lib/mock-data";
import type { Vertical } from "@/lib/types";
import LeadCard from "@/components/LeadCard";
import StatsCard from "@/components/StatsCard";
import VerticalFilter from "@/components/VerticalFilter";

export default function Dashboard() {
  const [vertical, setVertical] = useState<Vertical>("all");
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [visibleCount, setVisibleCount] = useState(20);

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
  const avgScore = Math.round(
    mockLeads.reduce((a, b) => a + b.aiScore, 0) / mockLeads.length
  );
  const contactRate = Math.round(
    (mockLeads.filter((l) => l.contact).length / mockLeads.length) * 100
  );

  const scoreFilters = [
    { id: "all" as const, label: "Tous", color: "" },
    { id: "high" as const, label: "75+", color: "text-emerald-600" },
    { id: "medium" as const, label: "50-74", color: "text-amber-600" },
    { id: "low" as const, label: "<50", color: "text-red-500" },
  ];

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
              <Sparkles className="h-4 w-4 text-primary-600" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Leads qualifiés &mdash;{" "}
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <button className="surface-interactive inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700">
          <Download className="h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatsCard
          label="Créations"
          value={todayStats.totalCreations}
          change="+12%"
          icon={<Building2 className="h-5 w-5" />}
          color="#6366f1"
        />
        <StatsCard
          label="Qualifiés"
          value={todayStats.qualified}
          change={`${Math.round((todayStats.qualified / todayStats.totalCreations) * 100)}%`}
          icon={<Target className="h-5 w-5" />}
          color="#10b981"
        />
        <StatsCard
          label="Score moyen"
          value={`${avgScore}/100`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="#f59e0b"
        />
        <StatsCard
          label="Contacts"
          value={`${contactRate}%`}
          icon={<Zap className="h-5 w-5" />}
          color="#8b5cf6"
        />
      </div>

      {/* Filters bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <VerticalFilter selected={vertical} onChange={setVertical} />

          {/* Score filter pills */}
          <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
            {scoreFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setScoreFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  scoreFilter === f.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Rechercher par nom, activité, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          <span className="font-semibold text-gray-700">
            {filteredLeads.length}
          </span>{" "}
          lead{filteredLeads.length !== 1 ? "s" : ""} trouvé
          {filteredLeads.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Lead grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        {filteredLeads.slice(0, visibleCount).map((lead, i) => (
          <div
            key={lead.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}
          >
            <LeadCard lead={lead} />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredLeads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <Search className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-base font-semibold text-gray-900">
            Aucun lead trouvé
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Essayez de modifier vos filtres ou votre recherche
          </p>
        </div>
      )}

      {/* Load more */}
      {filteredLeads.length > visibleCount && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + 20)}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
          >
            <ChevronDown className="h-4 w-4" />
            Voir plus ({filteredLeads.length - visibleCount} restants)
          </button>
        </div>
      )}
    </div>
  );
}
