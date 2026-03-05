import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
  Star,
  ArrowUpRight,
  Quote,
  Phone,
  ChevronDown,
} from "lucide-react";
import { pricingPlans, verticals, mockLeads } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import Logo from "@/components/Logo";

const faqs = [
  {
    q: "D'où viennent les données ?",
    a: "Du BODACC (Bulletin Officiel des Annonces Civiles et Commerciales), la source officielle et publique des créations d'entreprises en France. Les données sont complétées par enrichissement via Societeinfo, Dropcontact et scraping DNS.",
  },
  {
    q: "Est-ce conforme au RGPD ?",
    a: "Oui. Les données BODACC sont publiques par nature (publication légale obligatoire). L'enrichissement contact respecte le cadre de l'intérêt légitime B2B. Chaque lead inclut un lien de désinscription conforme.",
  },
  {
    q: "Combien de leads vais-je recevoir par jour ?",
    a: "Entre 12 et 40 leads qualifiés par jour selon votre verticale et votre zone géographique. Le plan Starter est limité à 30/jour, les plans Pro et Enterprise sont illimités.",
  },
  {
    q: "Est-ce que les leads sont partagés avec d'autres utilisateurs ?",
    a: "Les données BODACC sont publiques, mais notre qualification IA, l'enrichissement contact et le message d'accroche sont exclusifs à votre compte. Vous avez un avantage de timing : nos utilisateurs contactent les leads en moyenne 48h après la création, vs 2 à 4 semaines pour les fichiers CSV classiques.",
  },
  {
    q: "Puis-je intégrer NewCo Intel à mon CRM ?",
    a: "Oui. Le plan Pro inclut l'accès API et les webhooks temps réel. Le plan Enterprise ajoute les intégrations natives HubSpot et Pipedrive. Vous pouvez aussi exporter en CSV à tout moment.",
  },
  {
    q: "Que se passe-t-il après les 14 jours d'essai ?",
    a: "Votre compte passe automatiquement en lecture seule. Pas de facturation surprise, pas de carte bancaire demandée à l'inscription. Vous choisissez votre plan si vous souhaitez continuer.",
  },
];

const features = [
  { icon: Database, title: "Flux BODACC temps réel", desc: "300 à 800 créations ingérées chaque jour. Structurées, dédupliquées et prêtes à qualifier — sans aucune intervention manuelle." },
  { icon: Brain, title: "Scoring IA calibré à votre marché", desc: "Chaque lead reçoit un score 0-100 adapté à votre verticale. Vous ne contactez que les entreprises qui ont réellement besoin de vous." },
  { icon: Users, title: "Enrichissement multi-sources", desc: "Email, téléphone, LinkedIn du dirigeant — croisés via 4 sources (Societeinfo, Dropcontact, API-Datastore, DNS). 65% de couverture." },
  { icon: Target, title: "Message d'accroche IA", desc: "Un angle de prospection unique par lead, rédigé par IA, adapté au profil de l'entreprise. Vous n'avez plus qu'à envoyer." },
  { icon: Clock, title: "Livrés à 8h, chaque matin", desc: "Vos leads qualifiés arrivent avant le premier café. Prospectez à froid pendant que vos concurrents cherchent encore dans les CSV." },
  { icon: TrendingUp, title: "Multi-verticale en un clic", desc: "Agences web, comptables, assureurs — ajoutez une verticale en quelques jours. Même infra, prompt et segment dédiés." },
];

const verticalIcons = { Globe, Calculator, Shield };

const verticalSlugs: Record<string, string> = {
  "agence-web": "agences-web",
  "expert-comptable": "comptables",
  assureur: "assureurs",
};

const tickerCompanies = mockLeads.slice(0, 16).map((l) => ({
  name: l.companyName,
  city: l.city,
  score: l.aiScore,
}));

const testimonials = [
  {
    quote: "En 3 mois, on a signé 14 clients trouvés via NewCo Intel. Le ROI est délirant — on a remboursé 6 mois d'abonnement avec le premier contrat.",
    name: "Marie Lefebvre",
    role: "Co-fondatrice",
    company: "Agence Pixel",
    vertical: "Agence Web",
  },
  {
    quote: "On recevait les mêmes CSV que tout le monde. Maintenant, on contacte les SAS fraîchement créées avant nos confrères. Le taux de réponse a doublé.",
    name: "Thomas Moreau",
    role: "Expert-comptable associé",
    company: "Cabinet TM & Associés",
    vertical: "Expert-Comptable",
  },
  {
    quote: "Chaque matin, j'ai 15 entreprises nouvellement créées qui ont besoin d'une RC Pro. C'est exactement ce que je cherchais depuis 2 ans.",
    name: "Nicolas Durand",
    role: "Courtier indépendant",
    company: "Assur+",
    vertical: "Assureur",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-[16px] font-medium text-heading">{q}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="anim-fade-in pb-5 pr-8 text-[14px] leading-relaxed text-sub">{a}</p>
      )}
    </div>
  );
}

export default function Landing() {
  useEffect(() => {
    document.title = "NewCo Intel — Leads B2B qualifiés par IA depuis le BODACC";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Recevez chaque matin des leads qualifiés issus des créations d'entreprises BODACC. Score IA, email du dirigeant, message d'accroche — prêts à prospecter.");
  }, []);

  return (
    <div className="bg-white">
      {/* ── Hero ─────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden pb-8">
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left column */}
            <div className="lg:col-span-7">
              <div className="anim-fade-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-accent/20 bg-accent/[0.04] px-4 py-2 text-[13px] font-medium text-accent">
                <span className="inline-flex h-2 w-2 rounded-full bg-accent" style={{ animation: "pulse-dot 2s ease infinite" }} />
                +23 entreprises signées ce mois
              </div>

              <h1 className="anim-fade-up d1 font-display text-[clamp(2.8rem,6vw,5rem)] font-normal leading-[1.05] tracking-tight text-heading">
                Vos concurrents prospectent
                <br />
                <span className="relative italic text-accent">
                  à l'aveugle.
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6c40-4 80-4 196-2" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
                  </svg>
                </span>
                <br />
                Pas vous.
              </h1>

              <p className="anim-fade-up d2 mt-7 max-w-lg text-[17px] leading-relaxed text-sub">
                Chaque matin à 8h, recevez{" "}
                <span className="font-semibold text-heading">12 à 15 leads qualifiés</span>{" "}
                issus des créations d'entreprises BODACC — avec score IA, email du dirigeant et message d'accroche prêt à envoyer.
              </p>

              <div className="anim-fade-up d3 mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="btn-primary group flex items-center gap-2.5 px-7 py-3.5 text-[15px]"
                >
                  Démarrer mon essai gratuit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#pricing"
                  className="flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-[15px] font-medium text-sub transition-all hover:border-heading hover:text-heading hover:shadow-sm"
                >
                  Voir les tarifs
                </a>
              </div>

              <div className="anim-fade-up d4 mt-8 flex flex-wrap gap-6 text-[13px] text-muted">
                {["14 jours gratuits · sans CB", "Setup en 5 min", "Résiliable en 1 clic"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-score-high/10">
                      <Check className="h-3 w-3 text-score-high" />
                    </span>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — live data panel */}
            <div className="anim-slide-left d3 lg:col-span-5">
              <div className="card overflow-hidden shadow-xl shadow-black/[0.06]">
                <div className="flex items-center justify-between bg-bg/50 px-5 py-3.5">
                  <span className="text-[13px] font-semibold text-heading">Leads qualifiés du jour</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-score-high/10 px-2.5 py-1 text-[11px] font-semibold text-score-high">
                    <span className="h-1.5 w-1.5 rounded-full bg-score-high" style={{ animation: "pulse-dot 2s ease infinite" }} />
                    Live
                  </span>
                </div>
                <div className="divide-y divide-border-subtle">
                  {mockLeads.slice(0, 6).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-bg/50"
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
                <div className="flex items-center justify-center gap-1.5 bg-bg/50 px-5 py-3 text-[12px] text-muted">
                  <ArrowUpRight className="h-3 w-3" />
                  +{mockLeads.length - 6} leads qualifiés aujourd'hui
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted by ────────────────────────────────── */}
      <section className="border-y border-border bg-bg/50 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 sm:flex-row sm:gap-8">
          <span className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-widest text-muted">
            Conçu pour
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {[
              { icon: Globe, label: "Agences web", color: "var(--color-vert-web)", to: "/agences-web" },
              { icon: Calculator, label: "Cabinets comptables", color: "var(--color-vert-compta)", to: "/comptables" },
              { icon: Shield, label: "Courtiers & assureurs", color: "var(--color-vert-assur)", to: "/assureurs" },
            ].map((v) => (
              <Link key={v.label} to={v.to} className="flex items-center gap-2 text-[14px] font-medium text-sub transition-colors hover:text-heading">
                <v.icon className="h-4 w-4" style={{ color: v.color }} />
                {v.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrics (outcome-focused) ─────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { val: "23", unit: "", label: "clients signés ce mois", detail: "via leads NewCo Intel" },
              { val: "4,2", unit: "x", label: "ROI moyen", detail: "sur les 90 premiers jours" },
              { val: "< 24", unit: "h", label: "premier lead qualifié", detail: "après inscription" },
              { val: "97", unit: "%", label: "taux de satisfaction", detail: "sur 180+ utilisateurs" },
            ].map((m, i) => (
              <div key={m.label} className={`anim-count-in d${i + 1} text-center`}>
                <div className="font-display text-[2.5rem] leading-none text-heading sm:text-5xl">
                  {m.val}
                  <span className="text-accent">{m.unit}</span>
                </div>
                <div className="mt-3 text-[13px] font-semibold text-heading">
                  {m.label}
                </div>
                <div className="mt-1 text-[12px] text-muted">
                  {m.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-5xl" />

      {/* ── Ticker ──────────────────────────────────── */}
      <section className="overflow-hidden py-4">
        <div className="ticker-track">
          {[...tickerCompanies, ...tickerCompanies].map((c, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap px-5 text-[13px] text-muted">
              <span className="font-medium text-heading">{c.name}</span>
              <span className="text-raised">·</span>
              <span>{c.city}</span>
              <span className="text-raised">·</span>
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

      <div className="section-divider mx-auto max-w-5xl" />

      {/* ── The problem / solution ──────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Problem */}
            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-red-500">
                Le problème
              </p>
              <h2 className="font-display text-[2rem] leading-tight text-heading sm:text-[2.5rem]">
                Vous perdez des heures à chercher des prospects qui existent déjà.
              </h2>
              <div className="mt-8 space-y-4">
                {[
                  "Scraping manuel de listes LinkedIn — 2h/jour pour 5 prospects tièdes",
                  "Fichiers CSV achetés = les mêmes leads que vos 50 concurrents",
                  "Aucune qualification : impossible de savoir qui a vraiment besoin de vous",
                  "Zéro timing : vous contactez des entreprises créées il y a 6 mois",
                ].map((p) => (
                  <div key={p} className="flex items-start gap-3 text-[15px] leading-relaxed text-sub">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            {/* Solution */}
            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
                La solution NewCo Intel
              </p>
              <h2 className="font-display text-[2rem] leading-tight text-heading sm:text-[2.5rem]">
                Des leads exclusifs, qualifiés par IA, livrés chaque matin.
              </h2>
              <div className="mt-8 space-y-4">
                {[
                  "Leads issus du BODACC officiel — des entreprises créées hier, pas il y a 6 mois",
                  "Score IA personnalisé par verticale : vous ne contactez que les leads pertinents",
                  "Email + téléphone du dirigeant enrichis via 4 sources croisées",
                  "Message d'accroche IA prêt à copier-coller dans votre CRM ou votre boîte mail",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-3 text-[15px] leading-relaxed text-sub">
                    <span className="flex mt-0.5 h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Check className="h-3 w-3 text-accent" />
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pipeline: 4 steps ───────────────────────── */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Comment ça marche
            </p>
            <h2 className="font-display text-[2.5rem] leading-tight text-heading sm:text-5xl">
              De l'inscription au premier client signé en 4 étapes.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-sub">
              Aucune configuration technique. Aucun CSV à importer. Vous choisissez votre verticale et vos leads arrivent demain matin.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Choisissez votre verticale", desc: "Agence web, comptable ou assureur — votre IA est calibrée sur les critères qui comptent pour votre métier.", icon: Target },
              { step: "02", title: "L'IA qualifie pour vous", desc: "Chaque nuit, notre IA analyse les créations BODACC et score les entreprises de 0 à 100 selon votre segment.", icon: Brain },
              { step: "03", title: "Contacts enrichis automatiquement", desc: "Email, téléphone et LinkedIn du dirigeant — croisés via 4 sources. Vous ne cherchez plus, vous contactez.", icon: Users },
              { step: "04", title: "Prospectez dès 8h", desc: "Fiches complètes + message d'accroche IA dans votre dashboard. Premiers RDV possibles dès le jour même.", icon: Mail },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`anim-fade-up d${i + 1} group relative`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/[0.08] to-accent/[0.03] text-accent transition-all group-hover:from-accent group-hover:to-accent-dim group-hover:text-white group-hover:shadow-lg group-hover:shadow-accent/20">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-[12px] font-semibold text-accent/60">{item.step}</span>
                <h3 className="mt-1 text-[17px] font-semibold text-heading">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-sub">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Tout est inclus
            </p>
            <h2 className="font-display text-[2.5rem] leading-tight text-heading sm:text-5xl">
              Ce que vous obtenez.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-sub">
              Pas de modules à acheter séparément. Pas de crédits. Un abonnement, toute la puissance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`anim-fade-up d${i + 1} card-interactive group p-7`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/[0.08] to-accent/[0.03] text-accent transition-all group-hover:from-accent group-hover:to-accent-dim group-hover:text-white group-hover:shadow-lg group-hover:shadow-accent/20">
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
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Votre métier, vos critères
            </p>
            <h2 className="font-display text-[2.5rem] leading-tight text-heading sm:text-5xl">
              Une IA entraînée pour votre secteur.
            </h2>
            <p className="mt-4 text-[16px] text-sub">
              Même technologie, qualification radicalement différente. Chaque verticale a ses propres critères de scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {verticals.map((v, i) => {
              const Icon = verticalIcons[v.icon as keyof typeof verticalIcons] || Globe;
              const slug = verticalSlugs[v.id] || v.id;
              return (
                <Link
                  key={v.id}
                  to={`/${slug}`}
                  className={`anim-fade-up d${i + 1} card-interactive group overflow-hidden`}
                >
                  <div
                    className="h-1 transition-all group-hover:h-1.5"
                    style={{ background: `linear-gradient(90deg, ${v.color}, ${v.color}88)` }}
                  />
                  <div className="p-7">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${v.color}12` }}>
                        <Icon className="h-5 w-5" style={{ color: v.color }} />
                      </div>
                      <h3 className="text-[18px] font-semibold text-heading">{v.label}</h3>
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
                    <div className="mt-6 flex items-center gap-1.5 text-[14px] font-semibold transition-colors group-hover:translate-x-1" style={{ color: v.color }}>
                      Voir la solution
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Ils l'utilisent déjà
            </p>
            <h2 className="font-display text-[2.5rem] leading-tight text-heading sm:text-5xl">
              Ce qu'en disent nos utilisateurs.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`anim-fade-up d${i + 1} card p-8`}
              >
                <Quote className="mb-4 h-6 w-6 text-accent/20" />
                <p className="text-[15px] leading-relaxed text-sub italic">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/[0.06] text-[14px] font-bold text-accent">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-heading">{t.name}</p>
                    <p className="text-[12px] text-muted">{t.role}, {t.company} · {t.vertical}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI calculator teaser ─────────────────── */}
      <section className="bg-bg py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-10">
                <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
                  Faites le calcul
                </p>
                <h3 className="font-display text-[1.8rem] leading-tight text-heading sm:text-[2rem]">
                  1 client signé rembourse 2 à 6 mois d'abonnement.
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-sub">
                  Un client web = 2 000 à 5 000€. Un client comptable = 3 000 à 8 000€/an. Un contrat assurance pro = 800 à 3 000€/an. Votre abonnement NewCo Intel démarre à 299€/mois.
                </p>
                <Link
                  to="/dashboard"
                  className="btn-primary mt-8 inline-flex items-center gap-2.5 px-6 py-3 text-[14px]"
                >
                  Tester gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex flex-col justify-center gap-6 bg-accent/[0.03] p-8 md:p-10">
                {[
                  { label: "Coût mensuel Pro", val: "499€", sub: "/mois" },
                  { label: "Valeur moyenne d'1 client signé", val: "3 200€", sub: "récurrent" },
                  { label: "ROI si 2 clients/mois signés", val: "12,8x", sub: "retour sur investissement", highlight: true },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] text-muted">{r.label}</p>
                      <p className="text-[12px] text-muted">{r.sub}</p>
                    </div>
                    <p className={`font-mono text-xl font-bold ${r.highlight ? "text-accent" : "text-heading"}`}>{r.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Questions fréquentes
            </p>
            <h2 className="font-display text-[2.5rem] leading-tight text-heading sm:text-5xl">
              Tout ce que vous devez savoir.
            </h2>
          </div>

          <div className="border-t border-border">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>

          <p className="mt-8 text-center text-[14px] text-muted">
            Une autre question ?{" "}
            <a href="mailto:contact@newcointel.fr" className="font-medium text-accent transition-colors hover:text-accent-dim">
              Écrivez-nous
            </a>
          </p>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
              Tarifs
            </p>
            <h2 className="font-display text-[2.5rem] leading-tight text-heading sm:text-5xl">
              Rentabilisé dès le premier client signé.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] text-sub">
              Pas de frais cachés. Pas de crédits. Tous les plans incluent le scoring IA et l'enrichissement contact.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`card relative overflow-hidden p-8 transition-all ${
                  plan.highlighted
                    ? "ring-2 ring-accent shadow-xl shadow-accent/[0.08] scale-[1.02]"
                    : "hover:shadow-lg hover:shadow-black/[0.04]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-accent" />
                )}
                {plan.highlighted && (
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-accent/[0.06] px-3 py-1 text-[12px] font-semibold text-accent">
                    <Star className="h-3 w-3" fill="currentColor" />
                    Choisi par 70% des utilisateurs
                  </span>
                )}

                <h3 className="text-[18px] font-semibold text-heading">{plan.name}</h3>

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
                  className={`mt-8 block rounded-xl py-3.5 text-center text-[14px] font-semibold transition-all ${
                    plan.highlighted
                      ? "btn-primary"
                      : "border border-border text-heading hover:border-heading hover:shadow-sm"
                  }`}
                >
                  {plan.highlighted ? "Démarrer l'essai gratuit" : "Commencer gratuitement"}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-[13px] text-muted">
            14 jours d'essai gratuit · Sans carte bancaire · Résiliable en 1 clic
          </p>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-heading via-heading to-accent/80 py-28">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-[2.5rem] text-white sm:text-[3.5rem] leading-[1.1]">
            Demain matin à 8h,{" "}
            <span className="italic">vos premiers leads arrivent.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-white/50">
            Inscription en 5 minutes. Pas de configuration technique. Pas de carte bancaire. Vous recevez vos premiers leads qualifiés dès demain.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-heading shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Démarrer mon essai gratuit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <p className="mt-6 text-[13px] text-white/30">
            Rejoint par 180+ professionnels en France
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 sm:px-6 md:flex-row md:justify-between lg:px-8">
          <Logo size="sm" />
          <div className="flex gap-8 text-[13px] text-muted">
            <Link to="/agences-web" className="transition-colors hover:text-heading">Agences Web</Link>
            <Link to="/comptables" className="transition-colors hover:text-heading">Comptables</Link>
            <Link to="/assureurs" className="transition-colors hover:text-heading">Assureurs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
