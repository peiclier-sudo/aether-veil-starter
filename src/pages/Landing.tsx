import { Link } from "react-router-dom";
import {
  ArrowRight,
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
  BarChart3,
  Zap,
} from "lucide-react";
import { pricingPlans, verticals, mockLeads } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const features = [
  { icon: Database, title: "Flux BODACC quotidien", desc: "Ingestion automatique des 300-800 créations. Structurées, nettoyées, prêtes à l'emploi." },
  { icon: Brain, title: "Score IA DeepSeek V3", desc: "Score 0-100 personnalisé par verticale. ~500 tokens, ~0,02€ par fiche qualifiée." },
  { icon: Users, title: "Enrichissement 4 sources", desc: "Societeinfo, Dropcontact, API-Datastore et DNS scraping combinés. 65% de couverture." },
  { icon: Target, title: "Angle d'accroche IA", desc: "Un message d'approche unique par lead, adapté à votre verticale et au profil de l'entreprise." },
  { icon: Clock, title: "Livraison à 8h", desc: "12-15 leads qualifiés livrés chaque matin. Email récapitulatif + dashboard temps réel." },
  { icon: TrendingUp, title: "Multi-verticale", desc: "Ajout d'un nouveau vertical en 1 semaine. Même infrastructure, prompt et segment dédiés." },
];

const verticalIcons = { Globe, Calculator, Shield };

const tickerCompanies = mockLeads.slice(0, 16).map((l) => ({
  name: l.companyName,
  city: l.city,
  score: l.aiScore,
}));

export default function Landing() {
  return (
    <div className="bg-white">
      {/* ── Hero ─────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-accent/[0.03] blur-[80px]" />
        <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-vert-web/[0.04] blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left column */}
            <div className="lg:col-span-7">
              <div className="anim-fade-up mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-1.5 text-[13px] text-sub">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-score-high" />
                Pipeline de qualification actif
              </div>

              <h1 className="anim-fade-up d1 font-display text-[clamp(2.6rem,5.5vw,4.5rem)] font-normal leading-[1.1] tracking-tight text-heading">
                Du flux BODACC
                <br />
                au pipeline{" "}
                <span className="italic text-accent">commercial.</span>
              </h1>

              <p className="anim-fade-up d2 mt-6 max-w-lg text-[16px] leading-relaxed text-sub">
                NewCo Intel transforme les{" "}
                <span className="font-semibold text-heading">800 créations d'entreprises quotidiennes</span>{" "}
                en{" "}
                <span className="font-semibold text-heading">12 fiches leads qualifiées</span>{" "}
                — avec score IA, angle d'accroche et contacts enrichis. Livrées chaque matin à 8h.
              </p>

              <div className="anim-fade-up d3 mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="group flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-accent-dim"
                >
                  Voir le dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#pricing"
                  className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-[15px] font-medium text-sub transition-colors hover:border-heading hover:text-heading"
                >
                  Voir les tarifs
                </a>
              </div>

              <div className="anim-fade-up d4 mt-8 flex flex-wrap gap-6 text-[13px] text-muted">
                {["14 jours gratuits", "Sans engagement", "Setup en 5 min"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-score-high" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — live data panel */}
            <div className="anim-slide-left d3 lg:col-span-5">
              <div className="card overflow-hidden shadow-lg shadow-black/[0.04]">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <span className="text-[13px] font-medium text-sub">Leads qualifiés du jour</span>
                  <span className="flex items-center gap-1.5 text-[12px] text-score-high">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-score-high" />
                    Temps réel
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {mockLeads.slice(0, 6).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-bg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-heading">
                          {lead.companyName}
                        </p>
                        <p className="text-[12px] text-muted">
                          {lead.city} · {lead.legalForm}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2.5">
                        <span
                          className={`font-mono text-[13px] font-semibold ${
                            lead.aiScore >= 75
                              ? "text-score-high"
                              : lead.aiScore >= 50
                                ? "text-score-mid"
                                : "text-score-low"
                          }`}
                        >
                          {lead.aiScore}
                        </span>
                        <div className="h-1.5 w-10 overflow-hidden rounded-full bg-surface">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${lead.aiScore}%`,
                              background:
                                lead.aiScore >= 75 ? "#16a34a" : lead.aiScore >= 50 ? "#d97706" : "#dc2626",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-5 py-3 text-center text-[12px] text-muted">
                  +{mockLeads.length - 6} leads qualifiés aujourd'hui
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics bar ─────────────────────────────── */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            { val: "800", unit: "/j", label: "Créations BODACC" },
            { val: "87", unit: "%", label: "Précision scoring" },
            { val: "0,02", unit: "€", label: "Coût IA par fiche" },
            { val: "98", unit: "%", label: "Marge brute" },
          ].map((m, i) => (
            <div key={m.label} className={`anim-count-in d${i + 1} px-4 py-8 text-center sm:px-6`}>
              <div className="font-display text-3xl text-heading sm:text-4xl">
                {m.val}
                <span className="text-accent">{m.unit}</span>
              </div>
              <div className="mt-2 text-[12px] font-medium text-muted">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────── */}
      <section className="overflow-hidden border-b border-border bg-white py-3">
        <div className="ticker-track">
          {[...tickerCompanies, ...tickerCompanies].map((c, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap px-5 text-[13px] text-muted">
              <span className="font-medium text-heading">{c.name}</span>
              <span className="text-border">·</span>
              <span>{c.city}</span>
              <span className="text-border">·</span>
              <span
                className={`font-mono font-semibold ${
                  c.score >= 75 ? "text-score-high" : c.score >= 50 ? "text-score-mid" : "text-score-low"
                }`}
              >
                {c.score}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ── Pipeline: 4 steps ───────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Comment ça marche
            </p>
            <h2 className="font-display text-3xl text-heading sm:text-[2.8rem]">
              4 étapes, zéro effort.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-0 border-l-2 border-border md:grid-cols-2">
            {[
              { step: "01", title: "Ingestion BODACC", desc: "Collecte automatique des créations du jour via l'API officielle. 300-800 entreprises chaque jour.", icon: Database },
              { step: "02", title: "Scoring IA", desc: "DeepSeek V3 analyse et score chaque entreprise de 0 à 100, calibré sur votre verticale.", icon: Brain },
              { step: "03", title: "Enrichissement", desc: "4 sources croisées pour trouver email, téléphone et profil du décideur.", icon: Users },
              { step: "04", title: "Livraison à 8h", desc: "Fiches qualifiées livrées dans votre dashboard ou par webhook chaque matin.", icon: Mail },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`anim-fade-up d${i + 1} group relative border-b border-border py-10 pl-10 pr-6 transition-colors hover:bg-bg`}
              >
                <div className="absolute -left-[7px] top-12 h-3 w-3 rounded-full border-2 border-accent bg-white transition-colors group-hover:bg-accent" />
                <span className="font-mono text-[12px] font-medium text-muted">{item.step}</span>
                <h3 className="mt-2 font-display text-xl text-heading">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-sub">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="border-y border-border bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Fonctionnalités
            </p>
            <h2 className="font-display text-3xl text-heading sm:text-[2.8rem]">
              Tout ce dont vous avez besoin.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`anim-fade-up d${i + 1} card-interactive group p-7`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/[0.08] text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-[16px] font-semibold text-heading">{f.title}</h3>
                <p className="text-[14px] leading-relaxed text-sub">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verticals ───────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Multi-verticale
            </p>
            <h2 className="font-display text-3xl text-heading sm:text-[2.8rem]">
              Un vertical, un prompt, un segment.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] text-sub">
              Même infrastructure, critères de qualification adaptés par profil d'acheteur B2B.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {verticals.map((v, i) => {
              const Icon = verticalIcons[v.icon as keyof typeof verticalIcons] || Globe;
              return (
                <div
                  key={v.id}
                  className={`anim-fade-up d${i + 1} card-interactive group overflow-hidden p-7`}
                >
                  <div
                    className="mb-6 h-1 w-12 rounded-full transition-all group-hover:w-20"
                    style={{ background: v.color }}
                  />
                  <div className="mb-4 flex items-center gap-3">
                    <Icon className="h-5 w-5" style={{ color: v.color }} />
                    <h3 className="font-display text-xl text-heading">{v.label}</h3>
                  </div>
                  <p className="mb-6 text-[14px] leading-relaxed text-sub">{v.description}</p>
                  <div className="space-y-3">
                    {v.criteria.map((c) => (
                      <div key={c} className="flex items-start gap-2.5 text-[13px] text-sub">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: v.color }} />
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

      {/* ── Social proof ────────────────────────────── */}
      <section className="border-y border-border bg-bg py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              { icon: BarChart3, stat: "50-120", label: "fiches qualifiées/jour", detail: "sur l'ensemble des verticaux" },
              { icon: Zap, stat: "~0,02€", label: "coût IA par scoring", detail: "DeepSeek V3, ~500+200 tokens" },
              { icon: TrendingUp, stat: "98%", label: "marge brute", detail: "coût IA négligeable à l'échelle" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent/[0.08] text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-2xl text-heading">{item.stat}</div>
                  <div className="text-[14px] font-medium text-sub">{item.label}</div>
                  <div className="text-[12px] text-muted">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Tarifs
            </p>
            <h2 className="font-display text-3xl text-heading sm:text-[2.8rem]">
              Simples, transparents, rentables.
            </h2>
            <p className="mt-4 text-[15px] text-sub">ROI dès le premier contrat signé. 1 client = 800-3 000€/an de récurrent.</p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`card relative overflow-hidden p-8 transition-all ${
                  plan.highlighted
                    ? "ring-2 ring-accent shadow-lg shadow-accent/[0.06]"
                    : "hover:shadow-md hover:shadow-black/[0.04]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
                )}
                {plan.highlighted && (
                  <span className="mb-4 inline-flex rounded-full bg-accent/[0.08] px-3 py-1 text-[12px] font-semibold text-accent">
                    Le plus populaire
                  </span>
                )}

                <h3 className="font-display text-xl text-heading">{plan.name}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-heading">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-[14px] text-muted">{plan.period}</span>
                </div>

                <p className="mt-2 text-[13px] text-muted">
                  {plan.leadsPerDay} leads/jour ·{" "}
                  {plan.verticals === -1 ? "toutes verticales" : `${plan.verticals} verticale${plan.verticals > 1 ? "s" : ""}`}
                </p>

                <div className="my-6 h-px bg-border" />

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-sub">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/dashboard"
                  className={`mt-8 block rounded-lg py-3 text-center text-[14px] font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-accent text-white shadow-sm hover:bg-accent-dim"
                      : "border border-border text-heading hover:border-heading hover:shadow-sm"
                  }`}
                >
                  Commencer l'essai gratuit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-heading py-24">
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl text-white sm:text-5xl">
            Prêt à gagner du{" "}
            <span className="italic text-accent">temps commercial</span> ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-white/60">
            Des leads qualifiés au lieu de CSV bruts. Testez 14 jours, sans carte bancaire.
          </p>
          <Link
            to="/dashboard"
            className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-[15px] font-semibold text-heading shadow-sm transition-all hover:bg-bg"
          >
            Démarrer gratuitement
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 sm:px-6 md:flex-row md:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-white">
              N
            </div>
            <span className="text-[14px] font-semibold text-heading">
              NewCo<span className="text-accent">Intel</span>
            </span>
          </div>
          <div className="flex gap-6 text-[12px] text-muted">
            <span>Données BODACC</span>
            <span>Score IA DeepSeek V3</span>
            <span>Enrichissement multi-sources</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
