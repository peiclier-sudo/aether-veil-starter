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
  FileText,
  Server,
  Users,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { mockLeads } from "@/lib/mock-data";
import { formatCurrency, relativeDate } from "@/lib/utils";
import ScoreBadge from "@/components/ScoreBadge";

const verticalStyles: Record<string, { bg: string; text: string; dot: string }> = {
  "agence-web": { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  "expert-comptable": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  assureur: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const lead = mockLeads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <X className="h-7 w-7 text-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Lead introuvable</h1>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au dashboard
        </Link>
      </div>
    );
  }

  const vs = verticalStyles[lead.vertical] || verticalStyles["agence-web"];

  const scoreBreakdown = [
    { label: "Pertinence verticale", value: Math.min(100, lead.aiScore + 5) },
    { label: "Potentiel commercial", value: Math.max(0, lead.aiScore - 8) },
    { label: "Maturité digitale", value: lead.enrichment.hasWebsite ? 30 : 85 },
    { label: "Accessibilité contact", value: lead.contact ? 90 : 20 },
  ];

  return (
    <div className="page-enter mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dashboard
      </Link>

      {/* ── Header card ── */}
      <div className="surface-elevated mb-6 overflow-hidden rounded-2xl">
        {/* Accent bar */}
        <div
          className="h-1"
          style={{
            background:
              lead.aiScore >= 75
                ? "linear-gradient(90deg, #10b981, #059669)"
                : lead.aiScore >= 50
                  ? "linear-gradient(90deg, #f59e0b, #d97706)"
                  : "linear-gradient(90deg, #ef4444, #dc2626)",
          }}
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  {lead.companyName}
                </h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${vs.bg} ${vs.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
                  {lead.verticalLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {lead.legalForm}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {lead.city} ({lead.postalCode}) · {lead.region}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Créée {relativeDate(lead.creationDate)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <ScoreBadge score={lead.aiScore} size="lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Main column ── */}
        <div className="space-y-5 lg:col-span-2">
          {/* Outreach angle */}
          <div className="relative overflow-hidden rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50 to-white p-6">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-100/50 blur-2xl" />
            <h2 className="relative mb-3 flex items-center gap-2 text-sm font-bold text-primary-700">
              <Sparkles className="h-4 w-4" />
              Angle d'accroche IA
            </h2>
            <p className="relative text-[15px] leading-relaxed text-primary-900/80">
              « {lead.outreachAngle} »
            </p>
            <button className="relative mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-200">
              <Copy className="h-3.5 w-3.5" />
              Copier le message
            </button>
          </div>

          {/* Legal info */}
          <div className="surface-elevated rounded-2xl p-6">
            <h2 className="mb-5 text-sm font-bold text-gray-900">
              Informations légales
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                { label: "SIREN", value: lead.siren, mono: true },
                { label: "SIRET", value: lead.siret, mono: true },
                { label: "Forme juridique", value: lead.legalForm },
                { label: "Capital social", value: formatCurrency(lead.capital) },
                { label: "Code NAF", value: lead.naf, mono: true },
                { label: "Activité", value: lead.activity },
                { label: "Date BODACC", value: lead.bodaccDate },
                { label: "Effectif estimé", value: lead.enrichment.employeeEstimate || "N/A" },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="mb-0.5 text-xs font-medium text-gray-400">
                    {item.label}
                  </dt>
                  <dd className={`font-semibold text-gray-900 ${item.mono ? "font-mono text-[13px]" : ""}`}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Enrichment */}
          <div className="surface-elevated rounded-2xl p-6">
            <h2 className="mb-5 text-sm font-bold text-gray-900">
              Enrichissement
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Web presence */}
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Globe className="h-4 w-4 text-gray-400" />
                  Présence web
                </div>
                {lead.enrichment.hasDomain ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Domaine</span>
                      <span className="font-medium text-gray-900">{lead.enrichment.domain}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Site web</span>
                      {lead.enrichment.hasWebsite ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <Check className="h-3.5 w-3.5" /> Détecté
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <X className="h-3.5 w-3.5" /> Non
                        </span>
                      )}
                    </div>
                    {lead.enrichment.websiteStack && lead.enrichment.websiteStack.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Stack</span>
                        <span className="font-medium text-gray-700">
                          {lead.enrichment.websiteStack.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm text-red-400">
                    <X className="h-3.5 w-3.5" />
                    Aucun domaine détecté
                  </p>
                )}
              </div>

              {/* Social */}
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Server className="h-4 w-4 text-gray-400" />
                  Réseaux sociaux
                </div>
                {lead.enrichment.socialPresence.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.enrichment.socialPresence.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200"
                      >
                        <Check className="h-3 w-3 text-emerald-500" />
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucune présence détectée</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Contact */}
          <div className="surface-elevated rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Users className="h-4 w-4 text-gray-400" />
              Contact principal
            </h2>
            {lead.contact ? (
              <div className="space-y-4">
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {lead.contact.firstName} {lead.contact.lastName}
                  </p>
                  <p className="text-xs font-medium text-gray-400">
                    {lead.contact.role}
                  </p>
                </div>
                <div className="space-y-2">
                  <a
                    href={`mailto:${lead.contact.email}`}
                    className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{lead.contact.email}</span>
                  </a>
                  {lead.contact.phone && (
                    <a
                      href={`tel:${lead.contact.phone}`}
                      className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <Phone className="h-4 w-4 text-gray-400" />
                      {lead.contact.phone}
                    </a>
                  )}
                  {lead.contact.linkedin && (
                    <span className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{lead.contact.linkedin}</span>
                    </span>
                  )}
                </div>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-md">
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir dans le CRM
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Users className="h-5 w-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">Contact non enrichi</p>
                <button className="mt-2 text-xs font-semibold text-primary-600 hover:underline">
                  Lancer l'enrichissement
                </button>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="surface-elevated rounded-2xl p-6">
            <h2 className="mb-5 text-sm font-bold text-gray-900">
              Détail du score IA
            </h2>
            <div className="space-y-4">
              {scoreBreakdown.map((item) => {
                const barColor =
                  item.value >= 75
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : item.value >= 50
                      ? "bg-gradient-to-r from-amber-400 to-amber-500"
                      : "bg-gradient-to-r from-red-400 to-red-500";
                return (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-500">{item.label}</span>
                      <span className="font-bold text-gray-700">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-700`}
                        style={{ width: `${item.value}%` }}
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
