import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Copy,
  ExternalLink,
  Server,
  Users,
  Check,
  X,
} from "lucide-react";
import { mockLeads } from "@/lib/mock-data";
import { formatCurrency, relativeDate } from "@/lib/utils";
import ScoreBadge from "@/components/ScoreBadge";

const vertColors: Record<string, string> = {
  "agence-web": "var(--color-vert-web)",
  "expert-comptable": "var(--color-vert-compta)",
  assureur: "var(--color-vert-assur)",
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const lead = mockLeads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="font-display text-xl font-bold text-heading">Lead introuvable</p>
        <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 text-sm text-accent">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </div>
    );
  }

  const vColor = vertColors[lead.vertical] || "var(--color-muted)";

  const scoreBreakdown = [
    { label: "Pertinence verticale", value: Math.min(100, lead.aiScore + 5) },
    { label: "Potentiel commercial", value: Math.max(0, lead.aiScore - 8) },
    { label: "Maturité digitale", value: lead.enrichment.hasWebsite ? 30 : 85 },
    { label: "Accessibilité contact", value: lead.contact ? 90 : 20 },
  ];

  return (
    <div className="page-in mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-[12px] text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour au dashboard
      </Link>

      {/* Header */}
      <div className="card mb-6 overflow-hidden">
        <div className="h-[2px]" style={{ background: vColor }} />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-extrabold text-heading">
                  {lead.companyName}
                </h1>
                <span
                  className="border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                  style={{ borderColor: vColor, color: vColor }}
                >
                  {lead.verticalLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted">
                <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />{lead.legalForm}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{lead.city} ({lead.postalCode}) · {lead.region}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />Créée {relativeDate(lead.creationDate)}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <span key={tag} className="border border-border px-2 py-0.5 text-[10px] text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <ScoreBadge score={lead.aiScore} size="lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-4 lg:col-span-2">
          {/* Outreach */}
          <div className="card relative overflow-hidden p-6">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5 blur-3xl" />
            <h2 className="relative mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
              ANGLE D'ACCROCHE IA
            </h2>
            <p className="relative text-[14px] italic leading-relaxed text-heading/80">
              « {lead.outreachAngle} »
            </p>
            <button className="relative mt-4 inline-flex items-center gap-1.5 border border-accent/30 px-3 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent/10">
              <Copy className="h-3 w-3" />
              Copier
            </button>
          </div>

          {/* Legal */}
          <div className="card p-6">
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-wider text-muted">Informations légales</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                { l: "SIREN", v: lead.siren, m: true },
                { l: "SIRET", v: lead.siret, m: true },
                { l: "Forme juridique", v: lead.legalForm },
                { l: "Capital social", v: formatCurrency(lead.capital) },
                { l: "Code NAF", v: lead.naf, m: true },
                { l: "Activité", v: lead.activity },
                { l: "Date BODACC", v: lead.bodaccDate },
                { l: "Effectif", v: lead.enrichment.employeeEstimate || "N/A" },
              ].map((item) => (
                <div key={item.l}>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{item.l}</dt>
                  <dd className={`mt-0.5 font-medium text-heading ${item.m ? "font-mono text-[13px]" : "text-[13px]"}`}>
                    {item.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Enrichment */}
          <div className="card p-6">
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-wider text-muted">Enrichissement</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="card-raised p-4">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-heading">
                  <Globe className="h-4 w-4 text-muted" /> Présence web
                </div>
                {lead.enrichment.hasDomain ? (
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between"><span className="text-muted">Domaine</span><span className="text-heading">{lead.enrichment.domain}</span></div>
                    <div className="flex justify-between">
                      <span className="text-muted">Site web</span>
                      {lead.enrichment.hasWebsite
                        ? <span className="flex items-center gap-1 text-score-high"><Check className="h-3 w-3" />Oui</span>
                        : <span className="flex items-center gap-1 text-score-low"><X className="h-3 w-3" />Non</span>}
                    </div>
                    {lead.enrichment.websiteStack && lead.enrichment.websiteStack.length > 0 && (
                      <div className="flex justify-between"><span className="text-muted">Stack</span><span className="text-sub">{lead.enrichment.websiteStack.join(", ")}</span></div>
                    )}
                  </div>
                ) : (
                  <p className="text-[12px] text-score-low">Aucun domaine</p>
                )}
              </div>
              <div className="card-raised p-4">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-heading">
                  <Server className="h-4 w-4 text-muted" /> Réseaux sociaux
                </div>
                {lead.enrichment.socialPresence.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.enrichment.socialPresence.map((s) => (
                      <span key={s} className="border border-border px-2 py-1 font-mono text-[10px] text-sub">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted">Aucune présence</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Users className="h-3.5 w-3.5" /> Contact
            </h2>
            {lead.contact ? (
              <div className="space-y-4">
                <div>
                  <p className="text-base font-bold text-heading">
                    {lead.contact.firstName} {lead.contact.lastName}
                  </p>
                  <p className="font-mono text-[10px] text-muted">{lead.contact.role}</p>
                </div>
                <div className="space-y-2">
                  <a href={`mailto:${lead.contact.email}`} className="card-raised flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-sub transition-colors hover:text-heading">
                    <Mail className="h-3.5 w-3.5 text-muted" /><span className="truncate">{lead.contact.email}</span>
                  </a>
                  {lead.contact.phone && (
                    <a href={`tel:${lead.contact.phone}`} className="card-raised flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-sub transition-colors hover:text-heading">
                      <Phone className="h-3.5 w-3.5 text-muted" />{lead.contact.phone}
                    </a>
                  )}
                  {lead.contact.linkedin && (
                    <div className="card-raised flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-sub">
                      <Linkedin className="h-3.5 w-3.5 text-muted" /><span className="truncate">{lead.contact.linkedin}</span>
                    </div>
                  )}
                </div>
                <button className="flex w-full items-center justify-center gap-2 bg-accent py-2.5 text-[12px] font-bold text-void transition-all hover:bg-accent-dim">
                  <ExternalLink className="h-3.5 w-3.5" /> Ouvrir dans le CRM
                </button>
              </div>
            ) : (
              <div className="card-raised p-5 text-center">
                <Users className="mx-auto mb-2 h-5 w-5 text-border" />
                <p className="text-sm text-muted">Non enrichi</p>
                <button className="mt-2 text-[12px] text-accent hover:underline">ENRICHIR</button>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="card p-6">
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-wider text-muted">Score IA détail</h2>
            <div className="space-y-4">
              {scoreBreakdown.map((item) => {
                const barColor = item.value >= 75 ? "#22c55e" : item.value >= 50 ? "#eab308" : "#ef4444";
                return (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between font-mono text-[10px]">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-bold text-heading">{item.value}</span>
                    </div>
                    <div className="h-[3px] bg-border">
                      <div
                        className="h-full transition-all duration-700"
                        style={{ width: `${item.value}%`, background: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
