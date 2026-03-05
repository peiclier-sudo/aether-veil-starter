import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { mockDailyStats, mockLeads, verticals } from "@/lib/mock-data";

const SCORE_COLORS = ["#16a34a", "#d97706", "#f97316", "#dc2626"];

const tooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    color: "#3f3f46",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  itemStyle: { padding: "2px 0" },
  cursor: { fill: "rgba(79,70,229,0.03)" },
};

const axisStyle = { fontSize: 11, fill: "#a1a1aa", fontFamily: "'IBM Plex Mono', monospace" };

export default function Analytics() {
  const chartData = mockDailyStats.slice(-14).map((d) => ({
    date: d.date.slice(5),
    Créations: d.totalCreations,
    Qualifiés: d.qualified,
  }));

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: "75-100", count: 0, fill: SCORE_COLORS[0] },
      { name: "50-74", count: 0, fill: SCORE_COLORS[1] },
      { name: "25-49", count: 0, fill: SCORE_COLORS[2] },
      { name: "0-24", count: 0, fill: SCORE_COLORS[3] },
    ];
    mockLeads.forEach((l) => {
      if (l.aiScore >= 75) ranges[0].count++;
      else if (l.aiScore >= 50) ranges[1].count++;
      else if (l.aiScore >= 25) ranges[2].count++;
      else ranges[3].count++;
    });
    return ranges;
  }, []);

  const verticalDistribution = useMemo(() => {
    return verticals.map((v) => ({
      name: v.label,
      value: mockLeads.filter((l) => l.vertical === v.id).length,
      color: v.color,
    }));
  }, []);

  const qualificationTrend = mockDailyStats.slice(-14).map((d) => ({
    date: d.date.slice(5),
    taux: Math.round((d.qualified / d.totalCreations) * 100),
  }));

  const regionData = useMemo(() => {
    const map: Record<string, number> = {};
    mockLeads.forEach((l) => { map[l.region] = (map[l.region] || 0) + 1; });
    return Object.entries(map)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, []);

  const maxRegion = regionData[0]?.count || 1;

  return (
    <div className="page-in mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">Analytics</p>
        <h1 className="mt-1 font-display text-[2rem] text-heading">
          Vue d'ensemble
        </h1>
        <p className="mt-1 text-[13px] text-muted">14 derniers jours</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Volume */}
        <div className="card p-6">
          <h3 className="mb-5 text-[12px] font-semibold uppercase tracking-wider text-muted">
            Volume créations vs qualifiés
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="Créations" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Qualifiés" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score distribution */}
        <div className="card p-6">
          <h3 className="mb-5 text-[12px] font-semibold uppercase tracking-wider text-muted">
            Distribution scores IA
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scoreDistribution} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ ...axisStyle, fontWeight: 600 }} width={50} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {scoreDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vertical pie */}
        <div className="card p-6">
          <h3 className="mb-5 text-[12px] font-semibold uppercase tracking-wider text-muted">
            Répartition par verticale
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={verticalDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {verticalDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-5">
            {verticalDistribution.map((v) => (
              <div key={v.name} className="flex items-center gap-2 text-[12px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: v.color }} />
                <span className="text-muted">{v.name}</span>
                <span className="font-mono font-semibold text-heading">{v.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Qualification trend */}
        <div className="card p-6">
          <h3 className="mb-5 text-[12px] font-semibold uppercase tracking-wider text-muted">
            Taux de qualification
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={qualificationTrend}>
              <defs>
                <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} unit="%" axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="taux"
                stroke="#4f46e5"
                strokeWidth={2}
                fill="url(#accentGrad)"
                dot={{ fill: "#4f46e5", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Regions — full width */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-5 text-[12px] font-semibold uppercase tracking-wider text-muted">
            Top régions
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {regionData.map((r, i) => (
              <div key={r.region} className="group relative overflow-hidden rounded-xl bg-surface p-3.5">
                <div
                  className="absolute inset-y-0 left-0 bg-accent/[0.06] transition-all group-hover:bg-accent/[0.1]"
                  style={{ width: `${(r.count / maxRegion) * 100}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                      i < 3 ? "bg-accent text-white" : "bg-raised text-muted"
                    }`}>
                      {String(i + 1)}
                    </span>
                    <span className="text-[14px] font-medium text-heading">{r.region}</span>
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-heading">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
