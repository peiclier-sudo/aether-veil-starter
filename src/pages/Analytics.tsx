import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  LineChart,
  Line,
} from "recharts";
import { mockDailyStats, mockLeads } from "@/lib/mock-data";

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

/* ── Simulated client-facing data ─────────────── */

const conversionFunnel = [
  { stage: "BODACC brut", count: 4850, fill: "#e4e4e7" },
  { stage: "Qualifiés IA", count: 387, fill: "#a5b4fc" },
  { stage: "Contactés", count: 214, fill: "#818cf8" },
  { stage: "RDV obtenus", count: 68, fill: "#6366f1" },
  { stage: "Signés", count: 23, fill: "#4f46e5" },
];

export default function Analytics() {
  const chartData = mockDailyStats.slice(-14).map((d) => ({
    date: d.date.slice(5),
    Créations: d.totalCreations,
    Qualifiés: d.qualified,
  }));

  const qualificationTrend = mockDailyStats.slice(-14).map((d) => ({
    date: d.date.slice(5),
    taux: Math.round((d.qualified / d.totalCreations) * 100),
  }));

  /* Revenue tracking (simulated 30 days) */
  const revenueData = useMemo(() => {
    return mockDailyStats.slice(-14).map((d, i) => ({
      date: d.date.slice(5),
      pipeline: Math.round(3200 + i * 420 + Math.random() * 800),
      signé: Math.round(800 + i * 180 + Math.random() * 400),
    }));
  }, []);

  /* Response time data */
  const responseData = useMemo(() => {
    return mockDailyStats.slice(-14).map((d) => ({
      date: d.date.slice(5),
      minutes: Math.round(12 + Math.random() * 35),
    }));
  }, []);

  const regionData = useMemo(() => {
    const map: Record<string, number> = {};
    mockLeads.forEach((l) => { map[l.region] = (map[l.region] || 0) + 1; });
    return Object.entries(map)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, []);

  const maxRegion = regionData[0]?.count || 1;

  /* KPI cards */
  const totalLeads = mockLeads.length;
  const highScore = mockLeads.filter((l) => l.aiScore >= 75).length;
  const contactRate = Math.round((mockLeads.filter((l) => l.contact).length / totalLeads) * 100);
  const avgScore = Math.round(mockLeads.reduce((a, b) => a + b.aiScore, 0) / totalLeads);

  return (
    <div className="page-in mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">Performance</p>
        <h1 className="mt-1 font-display text-[2rem] text-heading">
          Votre pipeline en temps réel
        </h1>
        <p className="mt-1 text-[13px] text-muted">14 derniers jours · Données actualisées en continu</p>
      </div>

      {/* ── KPI row ────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Leads qualifiés", val: totalLeads, sub: "ce mois", accent: true },
          { label: "Score moyen", val: avgScore, sub: "sur 100" },
          { label: "Contacts enrichis", val: `${contactRate}%`, sub: "email + téléphone" },
          { label: "Leads chauds (>75)", val: highScore, sub: `${Math.round((highScore / totalLeads) * 100)}% du total`, accent: true },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5 transition-all hover:shadow-md hover:shadow-black/[0.04]">
            <p className="text-[12px] font-medium text-muted">{kpi.label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${kpi.accent ? "text-accent" : "text-heading"}`}>{kpi.val}</p>
            <p className="mt-0.5 text-[11px] text-muted">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Volume */}
        <div className="card p-6">
          <h3 className="mb-1 text-[15px] font-semibold text-heading">
            Volume quotidien
          </h3>
          <p className="mb-5 text-[12px] text-muted">Créations BODACC vs leads qualifiés pour vous</p>
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

        {/* Conversion funnel */}
        <div className="card p-6">
          <h3 className="mb-1 text-[15px] font-semibold text-heading">
            Funnel de conversion
          </h3>
          <p className="mb-5 text-[12px] text-muted">Du flux BODACC brut au contrat signé</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={conversionFunnel} layout="vertical" barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey="stage" type="category" tick={{ ...axisStyle, fontWeight: 500, fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {conversionFunnel.map((entry, i) => (
                  <Bar key={i} dataKey="count" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline revenue */}
        <div className="card p-6">
          <h3 className="mb-1 text-[15px] font-semibold text-heading">
            Valeur pipeline
          </h3>
          <p className="mb-5 text-[12px] text-muted">Chiffre d'affaires estimé vs signé (€)</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="signeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="pipeline" stroke="#6366f1" strokeWidth={2} fill="url(#pipelineGrad)" dot={false} name="Pipeline" />
              <Area type="monotone" dataKey="signé" stroke="#16a34a" strokeWidth={2} fill="url(#signeGrad)" dot={false} name="Signé" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex justify-center gap-6">
            {[
              { label: "Pipeline", color: "#6366f1" },
              { label: "Signé", color: "#16a34a" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-[12px] text-muted">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Taux de qualification */}
        <div className="card p-6">
          <h3 className="mb-1 text-[15px] font-semibold text-heading">
            Taux de qualification
          </h3>
          <p className="mb-5 text-[12px] text-muted">% de créations BODACC qualifiées pour votre segment</p>
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

        {/* Temps de réponse moyen */}
        <div className="card p-6">
          <h3 className="mb-1 text-[15px] font-semibold text-heading">
            Rapidité de contact
          </h3>
          <p className="mb-5 text-[12px] text-muted">Temps moyen entre réception du lead et premier contact (min)</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={responseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
              <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} unit="min" axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#d97706"
                strokeWidth={2}
                dot={{ fill: "#d97706", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Regions — full width */}
        <div className="card p-6">
          <h3 className="mb-1 text-[15px] font-semibold text-heading">
            Top régions
          </h3>
          <p className="mb-5 text-[12px] text-muted">Répartition géographique de vos leads qualifiés</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
