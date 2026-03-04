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
} from "lucide-react";
import { pricingPlans, verticals } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const features = [
  {
    icon: Database,
    title: "Flux BODACC quotidien",
    description:
      "Ingestion automatique des créations d'entreprises publiées au BODACC chaque jour. Données fraîches, structurées et prêtes à l'emploi.",
  },
  {
    icon: Brain,
    title: "Score IA DeepSeek V3",
    description:
      "Chaque lead est scoré de 0 à 100 par notre IA selon votre verticale. Priorisez vos efforts sur les prospects les plus pertinents.",
  },
  {
    icon: Users,
    title: "Enrichissement contact",
    description:
      "Societeinfo, Dropcontact, API-Datastore et DNS scraping combinés pour trouver le bon interlocuteur avec email et téléphone.",
  },
  {
    icon: Target,
    title: "Angle d'accroche personnalisé",
    description:
      "L'IA génère un message d'approche unique pour chaque lead, adapté à votre verticale et au profil de l'entreprise.",
  },
  {
    icon: Clock,
    title: "Livraison à 8h",
    description:
      "Vos leads qualifiés sont prêts chaque matin à 8h. Commencez votre prospection avec une longueur d'avance.",
  },
  {
    icon: TrendingUp,
    title: "Multi-verticale",
    description:
      "Agences web, experts-comptables, assureurs... Configurez vos critères de qualification par profil d'acheteur.",
  },
];

const verticalIcons = { Globe, Calculator, Shield };

export default function Landing() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.04%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Zap className="h-4 w-4" />
              Qualification automatique de leads B2B
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Transformez les créations{" "}
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                BODACC
              </span>{" "}
              en leads qualifiés
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              NewCo Intel ingère chaque jour les nouvelles créations
              d'entreprises françaises, les qualifie par IA selon votre
              verticale, enrichit les contacts et vous livre des fiches leads
              prêtes à l'emploi chaque matin à 8h.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl"
              >
                Démarrer l'essai gratuit
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Voir les tarifs
              </a>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-accent-500" />
                14 jours gratuits
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-accent-500" />
                Sans engagement
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-accent-500" />
                Setup en 5 min
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline visuel */}
      <section className="border-y border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Du BODACC à votre CRM en 4 étapes
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Ingestion BODACC",
                desc: "Collecte automatique des créations du jour via l'API BODACC",
                icon: Database,
              },
              {
                step: "2",
                title: "Scoring IA",
                desc: "DeepSeek V3 analyse et score chaque entreprise selon votre verticale",
                icon: Brain,
              },
              {
                step: "3",
                title: "Enrichissement",
                desc: "Societeinfo, Dropcontact, DNS scraping pour trouver les contacts",
                icon: Users,
              },
              {
                step: "4",
                title: "Livraison 8h",
                desc: "Fiches leads qualifiées livrées dans votre dashboard ou par webhook",
                icon: Mail,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-gray-200 bg-white p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-500">
                  Étape {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verticales */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Un modèle multi-verticale
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Des critères de qualification adaptés à chaque profil d'acheteur
              B2B
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {verticals.map((v) => {
              const Icon =
                verticalIcons[v.icon as keyof typeof verticalIcons] || Globe;
              return (
                <div
                  key={v.id}
                  className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-lg"
                >
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${v.color}15`,
                      color: v.color,
                    }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {v.label}
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">{v.description}</p>
                  <ul className="space-y-2">
                    {v.criteria.map((c) => (
                      <li
                        key={c}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <Check
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: v.color }}
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              De l'ingestion BODACC à l'angle d'accroche personnalisé
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Tarifs simples et transparents
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Choisissez le plan adapté à votre volume de prospection
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-primary-500 bg-white shadow-xl shadow-primary-500/10 ring-1 ring-primary-500"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white">
                    Plus populaire
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dashboard"
                  className={`mt-8 block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
              N
            </div>
            <span className="font-semibold text-gray-700">NewCo Intel</span>
          </div>
          <p>
            SaaS de qualification verticale des nouvelles entreprises
            françaises.
          </p>
          <p className="mt-1">
            Données BODACC &middot; Score IA DeepSeek V3 &middot; Enrichissement
            multi-sources
          </p>
        </div>
      </footer>
    </div>
  );
}
