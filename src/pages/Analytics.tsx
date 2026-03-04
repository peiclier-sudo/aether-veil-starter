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
} from "recharts";
import { mockDailyStats, mockLeads, verticals } from "@/lib/mock-data";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const chartData = mockDailyStats.slice(-14).map((d) => ({
    date: d.date.slice(5),
    "Créations": d.totalCreations,
    "Qualifiés": d.qualified,
  }));

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: "75-100", count: 0 },
      { name: "50-74", count: 0 },
      { name: "25-49", count: 0 },
      { name: "0-24", count: 0 },
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de vos données de qualification
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Volume chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Volume créations vs leads qualifiés (14j)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="Créations" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Qualifiés" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Distribution des scores IA
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scoreDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {scoreDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vertical pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Répartition par verticale
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={verticalDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {verticalDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6">
            {verticalDistribution.map((v) => (
              <div key={v.name} className="flex items-center gap-2 text-xs">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: v.color }}
                />
                <span className="text-gray-600">
                  {v.name} ({v.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend line */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Taux de qualification (14j)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={mockDailyStats.slice(-14).map((d) => ({
                date: d.date.slice(5),
                taux: Math.round((d.qualified / d.totalCreations) * 100),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="taux"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top regions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Top régions
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {regionData.map((r, i) => (
              <div
                key={r.region}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {r.region}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
