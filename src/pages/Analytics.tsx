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

const SCORE_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

const tooltipStyle = {
  contentStyle: {
    background: "#111116",
    border: "1px solid #2a2a33",
    borderRadius: 0,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#c4c4d4",
  },
  itemStyle: { padding: "2px 0" },
  cursor: { fill: "rgba(200,255,0,0.03)" },
};

const axisStyle = { fontSize: 10, fill: "#5a5a6e", fontFamily: "'JetBrains Mono', monospace" };

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
        <p className="font-mono text-[10px] uppercase tracking-widest text-lime">02 / Analytics</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-heading">
          Vue d'ensemble
        </h1>
        <p className="mt-1 font-mono text-[11px] text-muted">14 derniers jours</p>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border-subtle lg:grid-cols-2">
        {/* Volume */}
        <div className="card rounded-none p-6">
          <h3 className="mb-5 font-mono text-[10px] uppercase tracking-widest text-muted">
            Volume créations vs qualifiés
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e26" vertical={false} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="Créations" fill="#2a2a33" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Qualifiés" fill="#c8ff00" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score distribution */}
        <div className="card rounded-none p-6">
          <h3 className="mb-5 font-mono text-[10px] uppercase tracking-widest text-muted">
            Distribution scores IA
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scoreDistribution} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e26" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ ...axisStyle, fontWeight: 600 }} width={50} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                {scoreDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vertical pie */}
        <div className="card rounded-none p-6">
          <h3 className="mb-5 font-mono text-[10px] uppercase tracking-widest text-muted">
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
              <div key={v.name} className="flex items-center gap-2 font-mono text-[10px]">
                <span className="h-2 w-2" style={{ background: v.color }} />
                <span className="text-muted">{v.name}</span>
                <span className="font-bold text-heading">{v.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Qualification trend */}
        <div className="card rounded-none p-6">
          <h3 className="mb-5 font-mono text-[10px] uppercase tracking-widest text-muted">
            Taux de qualification
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={qualificationTrend}>
              <defs>
                <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c8ff00" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#c8ff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e26" vertical={false} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} unit="%" axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="taux"
                stroke="#c8ff00"
                strokeWidth={2}
                fill="url(#limeGrad)"
                dot={{ fill: "#c8ff00", r: 2.5, strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#08080c" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Regions — full width */}
        <div className="card rounded-none p-6 lg:col-span-2">
          <h3 className="mb-5 font-mono text-[10px] uppercase tracking-widest text-muted">
            Top régions
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {regionData.map((r, i) => (
              <div key={r.region} className="group relative overflow-hidden bg-slab p-3">
                <div
                  className="absolute inset-y-0 left-0 bg-lime/5 transition-all group-hover:bg-lime/10"
                  style={{ width: `${(r.count / maxRegion) * 100}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-6 w-6 items-center justify-center font-mono text-[10px] font-bold ${
                      i < 3 ? "bg-lime text-void" : "bg-border text-muted"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-medium text-heading">{r.region}</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-heading">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
