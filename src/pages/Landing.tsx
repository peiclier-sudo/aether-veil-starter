import { Link } from "react-router-dom";
import {
  Zap,
  Target,
  Brain,
  Users,
  ArrowRight,
  Check,
  Globe,
  Calculator,
  Shield,
  Clock,
  TrendingUp,
  Database,
  Mail,
  Sparkles,
  BarChart3,
  Webhook,
} from "lucide-react";
import { pricingPlans, verticals } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const features = [
  {
    icon: Database,
    title: "Flux BODACC quotidien",
    description:
      "Ingestion automatique des 300-800 créations quotidiennes. Données structurées, prêtes à l'emploi.",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    icon: Brain,
    title: "Score IA DeepSeek V3",
    description:
      "Score 0-100 personnalisé par verticale. Priorisez vos efforts sur les prospects les plus pertinents.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Enrichissement contact",
    description:
      "4 sources combinées : Societeinfo, Dropcontact, API-Datastore, DNS scraping. 65% de couverture.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    icon: Target,
    title: "Angle d'accroche IA",
    description:
      "Message d'approche unique pour chaque lead, adapté à votre verticale et au profil de l'entreprise.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: Clock,
    title: "Livraison à 8h",
    description:
      "Vos 12-15 leads qualifiés livrés chaque matin. Email récapitulatif + dashboard temps réel.",
    accent: "from-pink-500 to-rose-600",
  },
  {
    icon: TrendingUp,
    title: "Multi-verticale",
    description:
      "Ajout d'un nouveau vertical en 1 semaine. Même infra, prompt dédié, segment marketing personnalisé.",
    accent: "from-cyan-500 to-blue-600",
  },
];

const metrics = [
  { value: "800", suffix: "/j", label: "Créations BODACC" },
  { value: "87", suffix: "%", label: "Précision scoring" },
  { value: "2", suffix: "min", label: "Par fiche qualifiée" },
  { value: "0,10", suffix: "€", label: "Coût par fiche" },
];

const verticalIcons = { Globe, Calculator, Shield };

export default function Landing() {
  return (
    <div className="bg-white">
      {/* ── HERO ── dark, immersive ──────────────────────── */}
      <section className="hero-gradient grain relative overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-primary-500/20 blur-[100px] animate-float" />
        <div className="absolute right-[15%] bottom-[10%] h-96 w-96 rounded-full bg-accent-500/15 blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute left-[50%] top-[60%] h-48 w-48 rounded-full bg-warning-500/10 blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 sm:pb-32 sm:pt-40 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-primary-300 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Qualification automatique de leads B2B
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up stagger-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
              Ne vendez plus des données.{" "}
              <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">
                Vendez du temps commercial.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up stagger-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
              NewCo Intel transforme les{" "}
              <span className="font-medium text-white">800 créations BODACC quotidiennes</span>{" "}
              en{" "}
              <span className="font-medium text-white">12 fiches leads qualifiées</span>{" "}
              avec score IA, angle d'accroche et contacts enrichis — livrées chaque matin à 8h.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up stagger-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-gray-900 shadow-2xl shadow-white/10 transition-all hover:shadow-white/20"
              >
                Voir le dashboard
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Voir les tarifs
              </a>
            </div>

            {/* Trust line */}
            <div className="animate-fade-up stagger-4 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              {["14 jours gratuits", "Sans engagement", "Setup en 5 min"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-accent-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Metrics bar ───────────────────── */}
          <div className="animate-fade-up stagger-5 mx-auto mt-16 max-w-3xl">
            <div className="glass-dark grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 md:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="px-6 py-5 text-center">
                  <div className="text-2xl font-extrabold text-white">
                    {m.value}
                    <span className="ml-0.5 text-base font-semibold text-primary-400">
                      {m.suffix}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-gray-500">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── PIPELINE ── visual steps ─────────────────── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600">
              Comment ça marche
            </p>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Du BODACC à votre CRM en 4 étapes
            </h2>
          </div>

          <div className="relative grid grid-cols-1 gap-0 md:grid-cols-4">
            {/* Connector line (desktop) */}
            <div className="absolute top-12 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-primary-200 via-primary-300 to-accent-300 md:block" />

            {[
              { step: "1", title: "Ingestion BODACC", desc: "Collecte automatique des créations du jour via l'API officielle", icon: Database, color: "from-blue-500 to-indigo-600" },
              { step: "2", title: "Scoring IA", desc: "DeepSeek V3 analyse et score 0-100 selon votre verticale", icon: Brain, color: "from-violet-500 to-purple-600" },
              { step: "3", title: "Enrichissement", desc: "4 sources croisées pour trouver email, téléphone et profil", icon: Users, color: "from-emerald-500 to-teal-600" },
              { step: "4", title: "Livraison 8h", desc: "Fiches qualifiées livrées dans votre dashboard ou webhook", icon: Mail, color: "from-amber-500 to-orange-600" },
            ].map((item, i) => (
              <div key={item.step} className={`animate-fade-up stagger-${i + 1} relative flex flex-col items-center px-6 py-4 text-center`}>
                {/* Step circle */}
                <div className={`relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Étape {item.step}
                </span>
                <h3 className="mb-1.5 text-base font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ── asymmetric grid ────────── */}
      <section className="mesh-gradient relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600">
              Fonctionnalités
            </p>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              De l'ingestion BODACC à l'angle d'accroche personnalisé, en passant par l'enrichissement multi-sources.
            </p>
          </div>

          {/* Bento grid — asymmetric */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {features.map((f, i) => {
              const spans = [
                "md:col-span-4",
                "md:col-span-2",
                "md:col-span-2",
                "md:col-span-4",
                "md:col-span-3",
                "md:col-span-3",
              ];
              return (
                <div
                  key={f.title}
                  className={`${spans[i]} surface-interactive group rounded-2xl p-6 sm:p-8`}
                >
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} text-white shadow-sm`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VERTICALES ── ────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600">
              Multi-verticale
            </p>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Un prompt, un segment, un vertical
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              Même infrastructure, critères de qualification uniques par profil d'acheteur B2B.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {verticals.map((v, i) => {
              const Icon = verticalIcons[v.icon as keyof typeof verticalIcons] || Globe;
              return (
                <div
                  key={v.id}
                  className={`animate-fade-up stagger-${i + 1} group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:shadow-xl`}
                >
                  {/* Accent top bar */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 transition-all duration-300 group-hover:h-1.5"
                    style={{ background: v.color }}
                  />

                  <div
                    className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${v.color}12`, color: v.color }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-900">{v.label}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-gray-500">{v.description}</p>

                  <div className="space-y-2.5">
                    {v.criteria.map((c) => (
                      <div key={c} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <div
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${v.color}15` }}
                        >
                          <Check className="h-3 w-3" style={{ color: v.color }} />
                        </div>
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

      {/* ── SOCIAL PROOF BAR ── ──────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50/80 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: BarChart3,
                stat: "50-120",
                label: "fiches qualifiées/jour",
                detail: "sur l'ensemble des verticaux",
              },
              {
                icon: Zap,
                stat: "~0,02€",
                label: "coût IA par scoring",
                detail: "DeepSeek V3, ~500+200 tokens",
              },
              {
                icon: Webhook,
                stat: "98%",
                label: "marge brute",
                detail: "coût IA négligeable à l'échelle",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-gray-900">{item.stat}</div>
                  <div className="text-sm font-medium text-gray-600">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── ───────────────────────────────── */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600">
              Tarifs
            </p>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simples, transparents, sans surprise
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              ROI dès le premier contrat signé. 1 client = 800-3 000€/an de récurrent.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "scale-[1.02] border-primary-400 bg-white shadow-2xl shadow-primary-500/10 ring-1 ring-primary-400"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
                )}
                {plan.highlighted && (
                  <div className="mb-4 inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                    Le plus populaire
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  {plan.verticals === -1
                    ? "Toutes les verticales"
                    : `${plan.verticals} verticale${plan.verticals > 1 ? "s" : ""}`}
                  {" · "}
                  {plan.leadsPerDay} leads/jour
                </p>

                <div className="my-6 h-px bg-gray-100" />

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/dashboard"
                  className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Commencer l'essai gratuit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-900 py-20">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-primary-500/20 blur-[100px]" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-accent-500/15 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Prêt à gagner du temps commercial ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Rejoignez les équipes commerciales qui prospectent avec des leads qualifiés plutôt que des CSV bruts.
          </p>
          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-gray-900 transition-all hover:bg-gray-100"
          >
            Démarrer gratuitement
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── ────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-extrabold text-white shadow-sm">
                N
              </div>
              <span className="text-base font-bold text-gray-900">
                NewCo Intel
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <span>Données BODACC</span>
              <span>·</span>
              <span>Score IA DeepSeek V3</span>
              <span>·</span>
              <span>Enrichissement multi-sources</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
