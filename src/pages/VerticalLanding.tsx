import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
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
  Phone,
  Search,
  ChevronDown,
  Download,
  Building2,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { mockLeads, verticals } from "@/lib/mock-data";
import { relativeDate } from "@/lib/utils";
import Logo from "@/components/Logo";
import ScoreBadge from "@/components/ScoreBadge";

/* ── Vertical-specific content ─────────────────── */

const verticalContent: Record<
  string,
  {
    slug: string;
    verticalId: string;
    headline: [string, string, string];
    sub: string;
    badge: string;
    heroStats: { val: string; label: string }[];
    benefits: { icon: typeof Globe; title: string; desc: string }[];
    cta: string;
    ctaFinal: string;
  }
> = {
  "agences-web": {
    slug: "agences-web",
    verticalId: "agence-web",
    headline: [
      "Trouvez les entreprises",
      "sans site web",
      "avant vos concurrents.",
    ],
    sub: "Chaque jour, des centaines d'entreprises sont créées sans présence digitale. NewCo Intel les identifie, les qualifie et vous les livre avec email du dirigeant — prêtes à prospecter.",
    badge: "Pipeline agences web",
    heroStats: [
      { val: "62%", label: "n'ont pas de site web" },
      { val: "~40", label: "leads/jour pour votre agence" },
      { val: "8h", label: "livrés chaque matin" },
    ],
    benefits: [
      { icon: Globe, title: "Détection DNS automatique", desc: "On scrape le DNS de chaque nouvelle entreprise. Pas de domaine = prospect chaud pour vous." },
      { icon: Brain, title: "Score IA « besoin digital »", desc: "Notre IA évalue la probabilité qu'une entreprise ait besoin d'un site : secteur B2C, capital élevé, zone urbaine." },
      { icon: Target, title: "Angle d'accroche personnalisé", desc: "Un message d'approche IA adapté au profil : « Votre activité de [X] mérite une vitrine en ligne. »" },
      { icon: Mail, title: "Email du dirigeant vérifié", desc: "Enrichissement via Dropcontact + Societeinfo. 65% de couverture email sur les créations récentes." },
      { icon: TrendingUp, title: "Stack technique détectée", desc: "Quand un site existe déjà, on détecte WordPress, Wix, Shopify — pour cibler les refontes." },
      { icon: Clock, title: "Livraison quotidienne à 8h", desc: "Leads qualifiés dans votre dashboard ou par webhook. Prospectez avant que le café refroidisse." },
    ],
    cta: "Trouver mes premiers leads web",
    ctaFinal: "Prêt à remplir votre pipeline agence ?",
  },
  comptables: {
    slug: "comptables",
    verticalId: "expert-comptable",
    headline: [
      "Les SAS et SARL",
      "fraîchement créées",
      "cherchent un comptable.",
    ],
    sub: "Chaque jour, des dizaines de SAS, SARL et EURL sont immatriculées. Elles ont besoin d'un expert-comptable dans les 30 premiers jours. Soyez le premier à les contacter.",
    badge: "Pipeline experts-comptables",
    heroStats: [
      { val: "300+", label: "SAS/SARL créées par jour" },
      { val: "~35", label: "leads qualifiés/jour" },
      { val: "30j", label: "fenêtre de décision" },
    ],
    benefits: [
      { icon: Calculator, title: "Filtre forme juridique", desc: "On cible SAS, SARL, EURL et SCI — les structures qui ont structurellement besoin d'un expert-comptable." },
      { icon: Brain, title: "Score IA « complexité fiscale »", desc: "Capital social, multi-associés, activité réglementée — notre IA identifie les dossiers à forte valeur." },
      { icon: Target, title: "Accroche cabinet adaptée", desc: "« Votre SAS au capital de 50 000€ nécessite un accompagnement fiscal structuré dès J1. »" },
      { icon: Users, title: "Contact dirigeant enrichi", desc: "Email + téléphone du gérant ou président via 4 sources croisées. Approche directe garantie." },
      { icon: Database, title: "Données BODACC complètes", desc: "SIREN, SIRET, NAF, capital, adresse — toutes les infos légales pour qualifier avant d'appeler." },
      { icon: Clock, title: "Alerte matinale", desc: "Les créations du jour livrées à 8h. Contactez le dirigeant avant qu'un confrère le fasse." },
    ],
    cta: "Trouver mes premiers leads comptables",
    ctaFinal: "Prêt à développer votre portefeuille clients ?",
  },
  assureurs: {
    slug: "assureurs",
    verticalId: "assureur",
    headline: [
      "Chaque nouvelle entreprise",
      "a besoin d'une assurance",
      "professionnelle.",
    ],
    sub: "RC Pro, multirisque, flotte auto — les entreprises nouvellement créées sont obligées de s'assurer. Contactez-les dans les premières semaines, quand la décision n'est pas encore prise.",
    badge: "Pipeline assureurs & courtiers",
    heroStats: [
      { val: "100%", label: "ont besoin de RC Pro" },
      { val: "~30", label: "leads qualifiés/jour" },
      { val: "< 60j", label: "pour décider de l'assureur" },
    ],
    benefits: [
      { icon: Shield, title: "Détection activité à risque", desc: "BTP, restauration, transport — on identifie les secteurs où l'assurance est critique et obligatoire." },
      { icon: Brain, title: "Score IA « besoin assurance »", desc: "Local commercial, employés estimés, véhicules pro — chaque signal augmente le score." },
      { icon: Target, title: "Accroche courtier ciblée", desc: "« Votre activité de [X] nécessite une RC Pro adaptée. Obtenez un devis en 24h. »" },
      { icon: Building2, title: "Local commercial détecté", desc: "On croise l'adresse avec les données immobilières pour estimer si un bail commercial est probable." },
      { icon: Users, title: "Décideur identifié", desc: "Nom, email, téléphone du gérant — pour une approche directe et personnalisée." },
      { icon: Clock, title: "Timing parfait", desc: "Les créations du jour livrées avant 8h. L'entreprise vient d'être créée : c'est le moment idéal." },
    ],
    cta: "Trouver mes premiers leads assurance",
    ctaFinal: "Prêt à capter les nouvelles entreprises ?",
  },
};

const verticalIcons: Record<string, typeof Globe> = { Globe, Calculator, Shield };

/* ── Component ─────────────────────────────────── */

export default function VerticalLanding({ slug }: { slug: string }) {
  const content = verticalContent[slug] || null;

  if (!content) return <Navigate to="/" replace />;

  const vConfig = verticals.find((v) => v.id === content.verticalId)!;
  const Icon = verticalIcons[vConfig.icon] || Globe;
  const leads = mockLeads.filter((l) => l.vertical === content.verticalId);
  const topLeads = leads.slice(0, 8);
  const avgScore = Math.round(leads.reduce((a, b) => a + b.aiScore, 0) / (leads.length || 1));
  const contactRate = Math.round((leads.filter((l) => l.contact).length / (leads.length || 1)) * 100);

  const [visibleCount, setVisibleCount] = useState(6);
  const [search, setSearch] = useState("");

  const filteredLeads = useMemo(() => {
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.companyName.toLowerCase().includes(q) ||
        l.activity.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
    );
  }, [leads, search]);

  return (
    <div className="bg-white">
      {/* ── Hero ─────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden pb-8">
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="anim-fade-up mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-medium" style={{ background: `${vConfig.color}0a`, border: `1px solid ${vConfig.color}30`, color: vConfig.color }}>
                <Icon className="h-4 w-4" />
                {content.badge}
              </div>

              <h1 className="anim-fade-up d1 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-normal leading-[1.08] tracking-tight text-heading">
                {content.headline[0]}
                <br />
                <span className="italic" style={{ color: vConfig.color }}>{content.headline[1]}</span>
                <br />
                {content.headline[2]}
              </h1>

              <p className="anim-fade-up d2 mt-7 max-w-lg text-[16px] leading-relaxed text-sub">
                {content.sub}
              </p>

              <div className="anim-fade-up d3 mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="btn-primary group flex items-center gap-2.5 px-7 py-3.5 text-[15px]"
                  style={{ background: `linear-gradient(135deg, ${vConfig.color}, ${vConfig.color}cc)` }}
                >
                  {content.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Mini stats */}
              <div className="anim-fade-up d4 mt-10 flex flex-wrap gap-8">
                {content.heroStats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl text-heading">{s.val}</div>
                    <div className="text-[13px] text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — preview card */}
            <div className="anim-slide-left d3 lg:col-span-5">
              <div className="card overflow-hidden shadow-xl shadow-black/[0.06]">
                <div className="flex items-center justify-between px-5 py-3.5" style={{ background: `${vConfig.color}06` }}>
                  <span className="text-[13px] font-semibold text-heading">Leads {vConfig.label}</span>
                  <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${vConfig.color}12`, color: vConfig.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: vConfig.color, animation: "pulse-dot 2s ease infinite" }} />
                    {leads.length} leads
                  </span>
                </div>
                <div className="divide-y divide-border-subtle">
                  {topLeads.slice(0, 5).map((lead) => (
                    <Link
                      key={lead.id}
                      to={`/lead/${lead.id}`}
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
                      <div className="ml-3 flex items-center gap-2">
                        <span
                          className={`font-mono text-[13px] font-semibold ${
                            lead.aiScore >= 75 ? "text-score-high" : lead.aiScore >= 50 ? "text-score-mid" : "text-score-low"
                          }`}
                        >
                          {lead.aiScore}
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-muted" />
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-1.5 px-5 py-3 text-[13px] font-medium transition-colors hover:text-heading"
                  style={{ background: `${vConfig.color}04`, color: vConfig.color }}
                >
                  Voir tous les leads
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest" style={{ color: vConfig.color }}>
              Conçu pour les {vConfig.label.toLowerCase()}
            </p>
            <h2 className="font-display text-[2.5rem] leading-tight text-heading sm:text-5xl">
              Pourquoi NewCo Intel pour{" "}
              <span className="italic" style={{ color: vConfig.color }}>votre métier</span> ?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {content.benefits.map((b, i) => (
              <div
                key={b.title}
                className={`anim-fade-up d${i + 1} card-interactive group p-7`}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-all group-hover:text-white group-hover:shadow-lg"
                  style={{
                    background: `${vConfig.color}0a`,
                    color: vConfig.color,
                  }}
                >
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-[16px] font-semibold text-heading">{b.title}</h3>
                <p className="text-[14px] leading-relaxed text-sub">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ─────────────────── */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-widest" style={{ color: vConfig.color }}>
                Aperçu dashboard
              </p>
              <h2 className="font-display text-[2rem] text-heading">
                Leads {vConfig.label} du jour
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-[13px] font-semibold text-heading transition-all hover:border-heading hover:shadow-sm"
            >
              <Download className="h-4 w-4" />
              Dashboard complet
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Leads du jour", val: leads.length, color: vConfig.color },
              { label: "Score moyen", val: avgScore, color: "var(--color-score-mid)" },
              { label: "Contacts enrichis", val: `${contactRate}%`, color: "var(--color-accent)" },
              { label: "Score > 75", val: leads.filter((l) => l.aiScore >= 75).length, color: "var(--color-score-high)" },
            ].map((s) => (
              <div key={s.label} className="card p-5 transition-all hover:shadow-md hover:shadow-black/[0.04]">
                <p className="text-[12px] font-medium text-muted">{s.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-heading">{s.val}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder={`Rechercher un lead ${vConfig.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!pl-11"
            />
          </div>

          {/* Lead list */}
          <div className="space-y-3">
            {filteredLeads.slice(0, visibleCount).map((lead, i) => (
              <Link
                key={lead.id}
                to={`/lead/${lead.id}`}
                className="anim-fade-up card-interactive group flex items-center gap-4 p-5"
                style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
              >
                {/* Left accent */}
                <div className="hidden h-10 w-1 flex-shrink-0 rounded-full sm:block" style={{ background: vConfig.color }} />

                {/* Score */}
                <div className="flex-shrink-0">
                  <ScoreBadge score={lead.aiScore} size="sm" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-heading group-hover:text-accent">
                      {lead.companyName}
                    </h3>
                    <ArrowUpRight className="hidden h-3.5 w-3.5 flex-shrink-0 text-muted transition-all group-hover:text-accent sm:block" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.legalForm}</span>
                    <span>{lead.city}</span>
                    <span>{relativeDate(lead.bodaccDate)}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="hidden flex-wrap gap-1.5 lg:flex">
                  {lead.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-lg border border-border px-2 py-0.5 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Contact */}
                <div className="hidden flex-shrink-0 text-right md:block">
                  {lead.contact ? (
                    <div className="text-[12px]">
                      <p className="font-medium text-heading">{lead.contact.firstName} {lead.contact.lastName}</p>
                      <p className="text-muted">{lead.contact.email}</p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted">Non enrichi</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Load more */}
          {filteredLeads.length > visibleCount && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleCount((c) => c + 6)}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-[13px] font-semibold text-heading transition-all hover:border-accent hover:text-accent hover:shadow-sm"
              >
                <ChevronDown className="h-4 w-4" />
                Voir plus ({filteredLeads.length - visibleCount} restants)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="relative overflow-hidden py-28" style={{ background: `linear-gradient(135deg, ${vConfig.color}, ${vConfig.color}bb)` }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-[2.5rem] text-white sm:text-[3.5rem] leading-[1.1]">
            {content.ctaFinal}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-white/60">
            14 jours gratuits. Sans carte bancaire. Leads qualifiés dès demain matin.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-heading shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Démarrer l'essai gratuit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/" className="text-[15px] font-medium text-white/60 transition-colors hover:text-white">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 sm:px-6 md:flex-row md:justify-between lg:px-8">
          <Logo size="sm" />
          <div className="flex gap-8 text-[13px] text-muted">
            {Object.values(verticalContent).map((v) => {
              const vc = verticals.find((x) => x.id === v.verticalId)!;
              return (
                <Link key={v.slug} to={`/${v.slug}`} className="transition-colors hover:text-heading">
                  {vc.label}
                </Link>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
