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
  Quote,
  Star,
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
    painPoints: string[];
    testimonial: { quote: string; name: string; role: string; company: string };
    roiExample: { revenue: string; label: string; payback: string };
  }
> = {
  "agences-web": {
    slug: "agences-web",
    verticalId: "agence-web",
    headline: [
      "62% des entreprises créées hier",
      "n'ont pas de site web.",
      "Vous les contactez demain à 8h.",
    ],
    sub: "Chaque jour, des centaines d'entreprises sont immatriculées sans aucune présence digitale. NewCo Intel les détecte par DNS, les qualifie par IA et vous les livre avec l'email du dirigeant — avant que vos concurrents ne les trouvent.",
    badge: "Solution Agences Web",
    heroStats: [
      { val: "62%", label: "sans site web détecté" },
      { val: "~40", label: "leads qualifiés / jour" },
      { val: "48h", label: "entre création et premier contact" },
    ],
    painPoints: [
      "Vous prospectez sur LinkedIn — 2h/jour pour 3 réponses",
      "Les annuaires d'entreprises ont les mêmes leads que 50 autres agences",
      "Impossible de savoir quelles nouvelles entreprises n'ont pas encore de site",
      "Quand vous les trouvez, un concurrent les a déjà contactées",
    ],
    benefits: [
      { icon: Globe, title: "Détection DNS automatique", desc: "On scrape le DNS de chaque nouvelle entreprise. Pas de domaine enregistré = prospect chaud qui a besoin d'un site." },
      { icon: Brain, title: "Score « besoin digital »", desc: "L'IA évalue chaque entreprise : secteur B2C, capital élevé, zone urbaine, activité commerciale — plus le score est haut, plus elle a besoin de vous." },
      { icon: Target, title: "Message d'accroche prêt à envoyer", desc: "Un email de prospection IA personnalisé pour chaque lead : « Votre activité de [X] à [ville] mérite une vitrine en ligne. »" },
      { icon: Mail, title: "Email du dirigeant vérifié", desc: "Enrichissement via 4 sources croisées. 65% de couverture email sur les créations de moins de 7 jours." },
      { icon: TrendingUp, title: "Stack technique détectée", desc: "Quand un site existe déjà, on détecte WordPress, Wix, Shopify — pour cibler les entreprises qui ont besoin d'une refonte." },
      { icon: Clock, title: "Livraison à 8h, chaque matin", desc: "Vos leads qualifiés sont dans votre dashboard avant le premier café. Prospectez pendant que vos concurrents cherchent encore." },
    ],
    testimonial: {
      quote: "En 3 mois, on a signé 14 clients trouvés via NewCo Intel. Le ROI est délirant — le premier contrat a remboursé 6 mois d'abonnement.",
      name: "Marie Lefebvre",
      role: "Co-fondatrice",
      company: "Agence Pixel",
    },
    roiExample: { revenue: "3 500€", label: "Valeur moyenne d'un site vitrine + SEO", payback: "Remboursé dès le 1er client" },
    cta: "Trouver mes premiers prospects web",
    ctaFinal: "Demain matin, 40 entreprises sans site web vous attendent.",
  },
  comptables: {
    slug: "comptables",
    verticalId: "expert-comptable",
    headline: [
      "Les SAS créées hier",
      "cherchent un comptable.",
      "Soyez le premier à appeler.",
    ],
    sub: "Chaque jour, des dizaines de SAS, SARL et EURL sont immatriculées. Elles ont besoin d'un expert-comptable dans les 30 premiers jours. NewCo Intel vous les livre avec le numéro du dirigeant — avant vos confrères.",
    badge: "Solution Experts-Comptables",
    heroStats: [
      { val: "300+", label: "SAS/SARL créées par jour en France" },
      { val: "~35", label: "leads qualifiés / jour" },
      { val: "30 jours", label: "fenêtre de décision du dirigeant" },
    ],
    painPoints: [
      "Vous comptez sur le bouche-à-oreille — imprévisible et non scalable",
      "Les créateurs d'entreprises appellent 3 cabinets : celui qui appelle en premier gagne",
      "Vous n'avez aucune visibilité sur les créations d'entreprises de votre zone",
      "Les CSV achetés contiennent des entreprises créées il y a 6 mois — trop tard",
    ],
    benefits: [
      { icon: Calculator, title: "Filtre par forme juridique", desc: "On cible SAS, SARL, EURL et SCI — les structures qui ont structurellement besoin d'un expert-comptable dès J1." },
      { icon: Brain, title: "Score « complexité fiscale »", desc: "Capital social élevé, multi-associés, activité réglementée — l'IA identifie les dossiers à forte valeur pour votre cabinet." },
      { icon: Target, title: "Accroche adaptée à votre cabinet", desc: "« Votre SAS au capital de 50 000€ nécessite un accompagnement fiscal structuré dès le premier exercice. »" },
      { icon: Phone, title: "Téléphone du dirigeant enrichi", desc: "Email + téléphone du gérant ou président via 4 sources croisées. Appelez directement, sans intermédiaire." },
      { icon: Database, title: "Données légales complètes", desc: "SIREN, SIRET, NAF, capital, adresse — toutes les infos pour qualifier avant de décrocher le téléphone." },
      { icon: Clock, title: "Les créations d'hier, à 8h ce matin", desc: "Contactez le dirigeant le lendemain de la création de son entreprise. Aucun confrère n'est aussi rapide." },
    ],
    testimonial: {
      quote: "On a ajouté 22 dossiers en un trimestre, uniquement via NewCo Intel. Les dirigeants sont impressionnés qu'on les contacte le lendemain de leur immatriculation.",
      name: "Thomas Moreau",
      role: "Expert-comptable associé",
      company: "Cabinet TM & Associés",
    },
    roiExample: { revenue: "4 500€/an", label: "Honoraires annuels moyens d'un dossier SAS", payback: "Remboursé dès le 1er dossier" },
    cta: "Trouver mes premiers leads comptables",
    ctaFinal: "Demain matin, 35 SAS fraîchement créées attendent votre appel.",
  },
  assureurs: {
    slug: "assureurs",
    verticalId: "assureur",
    headline: [
      "Chaque entreprise créée hier",
      "a besoin d'une assurance.",
      "Vous leur proposez dès demain.",
    ],
    sub: "RC Pro, multirisque, flotte auto — les entreprises nouvellement créées sont légalement obligées de s'assurer. Contactez-les dans les premières semaines, quand la décision n'est pas encore prise.",
    badge: "Solution Assureurs & Courtiers",
    heroStats: [
      { val: "100%", label: "ont besoin d'une RC Pro" },
      { val: "~30", label: "leads qualifiés / jour" },
      { val: "< 45j", label: "pour choisir leur assureur" },
    ],
    painPoints: [
      "Les créateurs d'entreprises finissent chez l'assureur qui les contacte en premier",
      "Vous achetez des listes déjà démarchées par 10 courtiers",
      "Aucune visibilité sur les activités à risque (BTP, restauration, transport)",
      "Quand vous les trouvez, ils ont déjà souscrit un contrat standard en ligne",
    ],
    benefits: [
      { icon: Shield, title: "Détection d'activité à risque", desc: "BTP, restauration, transport, sécurité — on identifie les secteurs où l'assurance est critique, obligatoire et à forte prime." },
      { icon: Brain, title: "Score « besoin assurance »", desc: "Local commercial, nombre estimé d'employés, véhicules pro, stock marchandises — chaque signal augmente le score." },
      { icon: Target, title: "Accroche courtier ciblée", desc: "« Votre activité de maçonnerie à Lyon nécessite une RC Pro décennale. Obtenez un devis comparatif en 24h. »" },
      { icon: Building2, title: "Local commercial détecté", desc: "On croise l'adresse avec les données immobilières pour estimer si un bail commercial est probable — signal fort pour multirisque." },
      { icon: Users, title: "Décideur identifié et joignable", desc: "Nom, email, téléphone du gérant — approche directe et personnalisée. Pas de standard, pas de secrétariat." },
      { icon: Clock, title: "Le timing parfait", desc: "Les créations d'hier livrées avant 8h. L'entreprise vient d'être immatriculée : c'est le moment exact où tout se décide." },
    ],
    testimonial: {
      quote: "J'ai signé 8 contrats RC Pro le premier mois. Les dirigeants sont surpris et reconnaissants d'être contactés aussi vite après la création.",
      name: "Nicolas Durand",
      role: "Courtier indépendant",
      company: "Assur+",
    },
    roiExample: { revenue: "1 800€/an", label: "Prime moyenne RC Pro + multirisque", payback: "Remboursé dès le 2e contrat" },
    cta: "Trouver mes premiers leads assurance",
    ctaFinal: "Demain matin, 30 entreprises nouvellement créées attendent votre devis.",
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
                <span className="flex items-center gap-2 text-[13px] text-muted">
                  <Check className="h-3.5 w-3.5 text-score-high" />
                  14 jours gratuits · sans CB
                </span>
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
                  <span className="text-[13px] font-semibold text-heading">Leads du jour — {vConfig.label}</span>
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

      {/* ── Pain points → Solution ───────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-red-500">
                Ce que vous vivez aujourd'hui
              </p>
              <h2 className="font-display text-[2rem] leading-tight text-heading sm:text-[2.2rem]">
                Prospecter à l'aveugle, c'est brûler du temps et de l'argent.
              </h2>
              <div className="mt-8 space-y-4">
                {content.painPoints.map((p) => (
                  <div key={p} className="flex items-start gap-3 text-[15px] leading-relaxed text-sub">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest" style={{ color: vConfig.color }}>
                Avec NewCo Intel
              </p>
              <h2 className="font-display text-[2rem] leading-tight text-heading sm:text-[2.2rem]">
                Des leads exclusifs, qualifiés, livrés chaque matin.
              </h2>
              <div className="mt-8 space-y-4">
                {[
                  `${content.heroStats[1].val} leads qualifiés par jour, adaptés à votre métier`,
                  "Email + téléphone du dirigeant enrichis automatiquement",
                  "Score IA 0-100 : vous ne contactez que les meilleurs prospects",
                  "Message d'accroche IA prêt à copier dans votre email ou CRM",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-3 text-[15px] leading-relaxed text-sub">
                    <span className="flex mt-0.5 h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: `${vConfig.color}12` }}>
                      <Check className="h-3 w-3" style={{ color: vConfig.color }} />
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ────────────────────────────── */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest" style={{ color: vConfig.color }}>
              Conçu pour votre métier
            </p>
            <h2 className="font-display text-[2.5rem] leading-tight text-heading sm:text-5xl">
              Ce que NewCo Intel fait pour{" "}
              <span className="italic" style={{ color: vConfig.color }}>vous</span>.
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

      {/* ── Testimonial + ROI ──────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Testimonial */}
            <div className="card p-8">
              <Quote className="mb-4 h-6 w-6" style={{ color: `${vConfig.color}33` }} />
              <p className="text-[16px] leading-relaxed text-sub italic">
                "{content.testimonial.quote}"
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: vConfig.color }}>
                  {content.testimonial.name[0]}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-heading">{content.testimonial.name}</p>
                  <p className="text-[12px] text-muted">{content.testimonial.role}, {content.testimonial.company}</p>
                </div>
              </div>
            </div>

            {/* ROI card */}
            <div className="card overflow-hidden">
              <div className="p-8">
                <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest" style={{ color: vConfig.color }}>
                  Le calcul est simple
                </p>
                <h3 className="font-display text-[1.6rem] leading-tight text-heading">
                  {content.roiExample.payback}.
                </h3>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-surface p-4">
                    <span className="text-[14px] text-muted">Abonnement Pro</span>
                    <span className="font-mono text-lg font-bold text-heading">499€/mois</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl p-4" style={{ background: `${vConfig.color}08` }}>
                    <div>
                      <span className="text-[14px] text-heading font-medium">{content.roiExample.label}</span>
                    </div>
                    <span className="font-mono text-lg font-bold" style={{ color: vConfig.color }}>{content.roiExample.revenue}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border bg-bg/50 px-8 py-4">
                <p className="text-[13px] text-muted">
                  <span className="font-semibold text-heading">180+ professionnels</span> utilisent déjà NewCo Intel en France.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ─────────────────── */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-widest" style={{ color: vConfig.color }}>
                Aperçu de votre dashboard
              </p>
              <h2 className="font-display text-[2rem] text-heading">
                Voici ce que vous recevez chaque matin.
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-[13px] font-semibold text-heading transition-all hover:border-heading hover:shadow-sm"
            >
              <Download className="h-4 w-4" />
              Voir le dashboard complet
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
                <div className="hidden h-10 w-1 flex-shrink-0 rounded-full sm:block" style={{ background: vConfig.color }} />
                <div className="flex-shrink-0">
                  <ScoreBadge score={lead.aiScore} size="sm" />
                </div>
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
                <div className="hidden flex-wrap gap-1.5 lg:flex">
                  {lead.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-lg border border-border px-2 py-0.5 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
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
          <h2 className="font-display text-[2.2rem] text-white sm:text-[3rem] leading-[1.1]">
            {content.ctaFinal}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-white/60">
            Inscription en 5 minutes. Sans carte bancaire. Premiers leads qualifiés dès demain matin.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-heading shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Démarrer l'essai gratuit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <p className="mt-6 text-[13px] text-white/30">
            180+ professionnels nous font confiance en France
          </p>
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
