import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { BarChart3, TrendingUp, PieChartIcon, MapPin } from "lucide-react";
import { mockDailyStats, mockLeads, verticals } from "@/lib/mock-data";

const SCORE_COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444"];

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
    mockLeads.forEach((l) => {
      map[l.region] = (map[l.region] || 0) + 1;
    });
    return Object.entries(map)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, []);

  const maxRegionCount = regionData[0]?.count || 1;

  const tooltipStyle = {
    contentStyle: {
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(8px)",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      padding: "8px 12px",
      fontSize: "13px",
    },
    itemStyle: { padding: "2px 0" },
  };

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
            <BarChart3 className="h-4 w-4 text-primary-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Analytics
          </h1>
        </div>
        <p className="text-sm text-gray-400">
          Vue d'ensemble des 14 derniers jours
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Volume chart */}
        <div className="surface-elevated rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">
              Volume : créations vs qualifiés
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="Créations" fill="#e0e7ff" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Qualifiés" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-5 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary-200" /> Créations BODACC
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary-600" /> Leads qualifiés
            </span>
          </div>
        </div>

        {/* Score distribution */}
        <div className="surface-elevated rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">
              Distribution des scores IA
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={scoreDistribution} layout="vertical" barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} width={50} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {scoreDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vertical pie */}
        <div className="surface-elevated rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">
              Répartition par verticale
            </h3>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={verticalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
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
          </div>
          <div className="mt-2 flex justify-center gap-5">
            {verticalDistribution.map((v) => (
              <div key={v.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                <span className="font-medium text-gray-600">{v.name}</span>
                <span className="font-bold text-gray-900">{v.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Qualification trend */}
        <div className="surface-elevated rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">
              Taux de qualification
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={qualificationTrend}>
              <defs>
                <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} unit="%" axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="taux"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#qualGrad)"
                dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top regions — full width */}
        <div className="surface-elevated rounded-2xl p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">
              Top régions
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {regionData.map((r, i) => (
              <div key={r.region} className="group relative overflow-hidden rounded-xl bg-gray-50 px-4 py-3">
                {/* Background bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-primary-100/60 transition-all group-hover:bg-primary-100"
                  style={{ width: `${(r.count / maxRegionCount) * 100}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold ${
                      i < 3 ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{r.region}</span>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
