import { useState, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  Target,
  Zap,
  Search,
  Download,
  ChevronDown,
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
      if (scoreFilter === "medium" && (lead.aiScore < 50 || lead.aiScore >= 75)) return false;
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
    { id: "all" as const, label: "Tous" },
    { id: "high" as const, label: "75+" },
    { id: "medium" as const, label: "50-74" },
    { id: "low" as const, label: "<50" },
  ];

  return (
    <div className="page-in mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-heading">
            Dashboard
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            Leads qualifiés — {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <button className="card-interactive flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-sub">
          <Download className="h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Créations"
          value={todayStats.totalCreations}
          change="+12%"
          icon={<Building2 className="h-5 w-5" />}
          color="var(--color-vert-web)"
        />
        <StatsCard
          label="Qualifiés"
          value={todayStats.qualified}
          change={`${Math.round((todayStats.qualified / todayStats.totalCreations) * 100)}%`}
          icon={<Target className="h-5 w-5" />}
          color="var(--color-score-high)"
        />
        <StatsCard
          label="Score moyen"
          value={`${avgScore}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="var(--color-score-mid)"
        />
        <StatsCard
          label="Contacts"
          value={`${contactRate}%`}
          icon={<Zap className="h-5 w-5" />}
          color="var(--color-accent)"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <VerticalFilter selected={vertical} onChange={setVertical} />

          <div className="flex items-center gap-1 rounded-lg bg-surface p-1">
            {scoreFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setScoreFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all ${
                  scoreFilter === f.id
                    ? "bg-white text-heading shadow-sm"
                    : "text-muted hover:text-heading"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom, activité, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!pl-11"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-[13px] text-muted">
          <span className="font-semibold text-heading">{filteredLeads.length}</span>{" "}
          lead{filteredLeads.length !== 1 ? "s" : ""} trouvé{filteredLeads.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Lead grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredLeads.slice(0, visibleCount).map((lead, i) => (
          <div
            key={lead.id}
            className="anim-fade-up"
            style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}
          >
            <LeadCard lead={lead} />
          </div>
        ))}
      </div>

      {/* Empty */}
      {filteredLeads.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Search className="mb-4 h-8 w-8 text-raised" />
          <p className="text-base font-semibold text-heading">Aucun lead trouvé</p>
          <p className="mt-1 text-sm text-muted">Essayez de modifier vos filtres</p>
        </div>
      )}

      {/* Load more */}
      {filteredLeads.length > visibleCount && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + 20)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-[13px] font-semibold text-heading transition-all hover:border-accent hover:text-accent hover:shadow-sm"
          >
            <ChevronDown className="h-4 w-4" />
            Voir plus ({filteredLeads.length - visibleCount} restants)
          </button>
        </div>
      )}
    </div>
  );
}
