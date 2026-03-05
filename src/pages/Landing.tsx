import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe,
  Calculator,
  Shield,
  Database,
  Brain,
  Users,
  Target,
  Clock,
  TrendingUp,
  Mail,
} from "lucide-react";
import { pricingPlans, verticals, mockLeads } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const features = [
  { icon: Database, title: "Flux BODACC quotidien", desc: "Ingestion automatique des 300-800 créations. Structurées, prêtes, fraîches.", num: "01" },
  { icon: Brain, title: "Score IA DeepSeek V3", desc: "Score 0-100 personnalisé par verticale. ~500 tokens, ~0,02€ par fiche.", num: "02" },
  { icon: Users, title: "Enrichissement 4 sources", desc: "Societeinfo + Dropcontact + API-Datastore + DNS scraping combinés.", num: "03" },
  { icon: Target, title: "Angle d'accroche IA", desc: "Message unique par lead. Adapté à votre verticale et au profil.", num: "04" },
  { icon: Clock, title: "Livraison à 8h", desc: "12-15 leads qualifiés chaque matin. Email récap + dashboard temps réel.", num: "05" },
  { icon: TrendingUp, title: "Multi-verticale", desc: "Nouveau vertical en 1 semaine. Même infra, prompt dédié.", num: "06" },
];

const verticalIcons = { Globe, Calculator, Shield };

// Sample companies for the ticker
const tickerCompanies = mockLeads.slice(0, 16).map((l) => ({
  name: l.companyName,
  city: l.city,
  score: l.aiScore,
}));

export default function Landing() {
  return (
    <div className="bg-void">
      {/* ═══ HERO ═══ asymmetric, left-heavy ══════════ */}
      <section className="noise relative overflow-hidden">
        {/* Gradient accents */}
        <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-lime/5 blur-[150px]" />
        <div className="absolute right-0 top-1/2 h-[300px] w-[400px] bg-lime/3 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left — oversized type */}
            <div className="lg:col-span-7">
              {/* Status line */}
              <div className="anim-fade-up mb-8 flex items-center gap-3 font-mono text-xs text-muted">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-lime" />
                <span>PIPELINE ACTIF</span>
                <span className="text-border">|</span>
                <span>{mockLeads.length} leads en base</span>
              </div>

              <h1 className="anim-fade-up d1 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight text-heading">
                Du flux{" "}
                <span className="font-mono text-lime">BODACC</span>
                <br />
                au pipeline
                <br />
                commercial.
              </h1>

              <p className="anim-fade-up d2 mt-6 max-w-lg text-base leading-relaxed text-sub">
                <span className="text-heading font-medium">800 créations/jour</span> passées au crible par IA.{" "}
                <span className="text-heading font-medium">12 fiches qualifiées</span> livrées à 8h avec score, angle
                d'accroche et contacts enrichis.
              </p>

              {/* CTA row */}
              <div className="anim-fade-up d3 mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="group flex items-center gap-2 bg-lime px-6 py-3 text-sm font-bold text-void transition-all hover:bg-lime-dim"
                >
                  VOIR LE DASHBOARD
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#pricing"
                  className="flex items-center gap-2 border border-border px-6 py-3 text-sm font-medium text-sub transition-colors hover:border-heading hover:text-heading"
                >
                  TARIFS
                </a>
              </div>

              {/* Trust */}
              <div className="anim-fade-up d4 mt-8 flex flex-wrap gap-6 font-mono text-[11px] text-muted">
                {["14j gratuits", "Sans engagement", "Setup 5 min"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-lime" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — data panel */}
            <div className="anim-slide-left d3 lg:col-span-5">
              <div className="card overflow-hidden rounded-none">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                  <span className="font-mono text-[10px] text-muted">LIVE FEED</span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-lime">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                    STREAMING
                  </span>
                </div>
                {/* Mini lead rows */}
                <div className="divide-y divide-border-subtle">
                  {mockLeads.slice(0, 6).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-surface"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-heading">
                          {lead.companyName}
                        </p>
                        <p className="font-mono text-[10px] text-muted">
                          {lead.city} · {lead.legalForm}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold ${
                            lead.aiScore >= 75
                              ? "text-score-high"
                              : lead.aiScore >= 50
                                ? "text-score-mid"
                                : "text-score-low"
                          }`}
                        >
                          {lead.aiScore}
                        </span>
                        <div
                          className="h-1 w-8 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${
                              lead.aiScore >= 75 ? "#22c55e" : lead.aiScore >= 50 ? "#eab308" : "#ef4444"
                            } ${lead.aiScore}%, transparent ${lead.aiScore}%)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Footer */}
                <div className="border-t border-border-subtle px-4 py-2.5 text-center font-mono text-[10px] text-muted">
                  +{mockLeads.length - 6} leads qualifiés aujourd'hui
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ METRICS BAR ═══ full width, stark ════════ */}
      <section className="border-y border-border-subtle bg-slab">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border-subtle md:grid-cols-4">
          {[
            { val: "800", unit: "/j", label: "Créations BODACC" },
            { val: "87", unit: "%", label: "Précision scoring" },
            { val: "0,02", unit: "€", label: "Coût IA / fiche" },
            { val: "98", unit: "%", label: "Marge brute" },
          ].map((m, i) => (
            <div key={m.label} className={`anim-count-in d${i + 1} px-4 py-6 text-center sm:px-6`}>
              <div className="font-display text-2xl font-extrabold text-heading sm:text-3xl">
                {m.val}
                <span className="text-lime">{m.unit}</span>
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TICKER ═══ infinite scroll of company names */}
      <section className="overflow-hidden border-b border-border-subtle bg-void py-3">
        <div className="ticker-track">
          {[...tickerCompanies, ...tickerCompanies].map((c, i) => (
            <span key={i} className="flex items-center gap-2 px-6 text-[12px] text-muted whitespace-nowrap">
              <span className="text-heading font-medium">{c.name}</span>
              <span className="text-border">·</span>
              <span>{c.city}</span>
              <span className="text-border">·</span>
              <span
                className={`font-mono font-bold ${
                  c.score >= 75 ? "text-score-high" : c.score >= 50 ? "text-score-mid" : "text-score-low"
                }`}
              >
                {c.score}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ═══ PIPELINE ═══ numbered list, left-aligned ═ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-mono text-[11px] uppercase tracking-widest text-lime">Processus</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-heading sm:text-4xl">
              4 étapes. Zéro effort.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-0 border-l border-border md:grid-cols-2">
            {[
              { step: "01", title: "Ingestion BODACC", desc: "Collecte automatique des créations du jour via l'API officielle. 300-800 entreprises/jour.", icon: Database },
              { step: "02", title: "Scoring IA", desc: "DeepSeek V3 analyse chaque entreprise. Score 0-100 calibré sur votre verticale.", icon: Brain },
              { step: "03", title: "Enrichissement", desc: "4 sources croisées : Societeinfo, Dropcontact, API-Datastore, DNS scraping.", icon: Users },
              { step: "04", title: "Livraison 8h", desc: "Fiches qualifiées dans votre dashboard ou webhook. Email récap optionnel.", icon: Mail },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`anim-fade-up d${i + 1} group relative border-b border-border py-8 pl-8 pr-6 transition-colors hover:bg-slab`}
              >
                {/* Left dot on the border line */}
                <div className="absolute -left-[5px] top-10 h-2.5 w-2.5 border-2 border-lime bg-void transition-colors group-hover:bg-lime" />

                <span className="font-mono text-xs text-muted">{item.step}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-heading">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-sub">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ stacked list, alternating ═══ */}
      <section className="border-y border-border-subtle bg-slab py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-mono text-[11px] uppercase tracking-widest text-lime">Capabilities</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-heading sm:text-4xl">
              Ce qui est inclus.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-border-subtle md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.num}
                className={`anim-fade-up d${i + 1} group bg-slab p-6 transition-colors hover:bg-surface`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <f.icon className="h-5 w-5 text-muted transition-colors group-hover:text-lime" />
                  <span className="font-mono text-[10px] text-border">{f.num}</span>
                </div>
                <h3 className="mb-2 text-base font-bold text-heading">{f.title}</h3>
                <p className="text-sm leading-relaxed text-sub">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VERTICALS ═══ ════════════════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-mono text-[11px] uppercase tracking-widest text-lime">Segments</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-heading sm:text-4xl">
              Un prompt. Un segment. Un vertical.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {verticals.map((v, i) => {
              const Icon = verticalIcons[v.icon as keyof typeof verticalIcons] || Globe;
              return (
                <div
                  key={v.id}
                  className={`anim-fade-up d${i + 1} group card-interactive overflow-hidden rounded-none p-6`}
                >
                  {/* Top accent */}
                  <div className="mb-5 h-px w-12 transition-all group-hover:w-20" style={{ background: v.color }} />

                  <div className="mb-4 flex items-center gap-3">
                    <Icon className="h-5 w-5" style={{ color: v.color }} />
                    <h3 className="font-display text-lg font-bold text-heading">{v.label}</h3>
                  </div>

                  <p className="mb-5 text-sm text-sub">{v.description}</p>

                  <div className="space-y-2">
                    {v.criteria.map((c) => (
                      <div key={c} className="flex items-start gap-2 text-[13px] text-muted">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: v.color }} />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ ══════════════════════════════ */}
      <section id="pricing" className="border-y border-border-subtle bg-slab py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-mono text-[11px] uppercase tracking-widest text-lime">Tarifs</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-heading sm:text-4xl">
              ROI dès le premier contrat.
            </h2>
            <p className="mt-3 text-sub">1 client signé = 800-3 000€/an de récurrent.</p>
          </div>

          <div className="grid grid-cols-1 gap-px bg-border-subtle md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-slab p-8 ${plan.highlighted ? "ring-1 ring-lime" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-x-0 top-0 h-px bg-lime" />
                )}
                {plan.highlighted && (
                  <span className="mb-3 inline-block bg-lime px-2 py-0.5 font-mono text-[10px] font-bold text-void">
                    POPULAIRE
                  </span>
                )}

                <h3 className="font-display text-lg font-bold text-heading">{plan.name}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-heading">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-sm text-muted">{plan.period}</span>
                </div>

                <p className="mt-2 font-mono text-[11px] text-muted">
                  {plan.leadsPerDay} leads/jour ·{" "}
                  {plan.verticals === -1 ? "illimité" : `${plan.verticals} vert.`}
                </p>

                <div className="my-6 h-px bg-border-subtle" />

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-sub">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-lime" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/dashboard"
                  className={`mt-8 block py-3 text-center text-sm font-bold transition-all ${
                    plan.highlighted
                      ? "bg-lime text-void hover:bg-lime-dim"
                      : "border border-border text-heading hover:border-heading"
                  }`}
                >
                  COMMENCER
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ ════════════════════════════ */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-extrabold text-heading sm:text-5xl">
            Prêt à vendre du
            <br />
            <span className="text-lime">temps commercial</span> ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sub">
            Des leads qualifiés au lieu de CSV bruts. Testez 14 jours, sans carte.
          </p>
          <Link
            to="/dashboard"
            className="group mt-8 inline-flex items-center gap-2 bg-lime px-8 py-3.5 text-base font-bold text-void transition-all hover:bg-lime-dim"
          >
            DÉMARRER GRATUITEMENT
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ ═══════════════════════════════ */}
      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center bg-lime text-[9px] font-extrabold text-void">
              N
            </div>
            <span className="font-display text-xs font-bold text-heading">
              NEWCO<span className="text-lime">INTEL</span>
            </span>
          </div>
          <div className="flex gap-6 font-mono text-[10px] text-muted">
            <span>BODACC</span>
            <span>DEEPSEEK V3</span>
            <span>ENRICHISSEMENT</span>
            <span>QUALIFICATION IA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
