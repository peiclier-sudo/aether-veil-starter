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
} from "lucide-react";
import { mockLeads } from "@/lib/mock-data";
import { formatCurrency, relativeDate } from "@/lib/utils";
import ScoreBadge from "@/components/ScoreBadge";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const lead = mockLeads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Lead introuvable</h1>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dashboard
      </Link>

      {/* Header */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {lead.companyName}
              </h1>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor:
                    lead.vertical === "agence-web"
                      ? "#eef2ff"
                      : lead.vertical === "expert-comptable"
                        ? "#ecfdf5"
                        : "#fffbeb",
                  color:
                    lead.vertical === "agence-web"
                      ? "#4338ca"
                      : lead.vertical === "expert-comptable"
                        ? "#059669"
                        : "#d97706",
                }}
              >
                {lead.verticalLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {lead.legalForm}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {lead.city} ({lead.postalCode}) &middot; {lead.region}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Créée {relativeDate(lead.creationDate)}
              </span>
            </div>
          </div>
          <ScoreBadge score={lead.aiScore} size="lg" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {lead.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Angle d'accroche */}
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FileText className="h-4 w-4" />
              Angle d'accroche IA
            </h2>
            <p className="text-sm leading-relaxed text-primary-900">
              {lead.outreachAngle}
            </p>
            <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800">
              <Copy className="h-3.5 w-3.5" />
              Copier le message
            </button>
          </div>

          {/* Informations légales */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Informations légales
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">SIREN</dt>
                <dd className="font-mono font-medium text-gray-900">
                  {lead.siren}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">SIRET</dt>
                <dd className="font-mono font-medium text-gray-900">
                  {lead.siret}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Forme juridique</dt>
                <dd className="font-medium text-gray-900">{lead.legalForm}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Capital social</dt>
                <dd className="font-medium text-gray-900">
                  {formatCurrency(lead.capital)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Code NAF</dt>
                <dd className="font-mono font-medium text-gray-900">
                  {lead.naf}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Activité</dt>
                <dd className="font-medium text-gray-900">{lead.activity}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Date BODACC</dt>
                <dd className="font-medium text-gray-900">
                  {lead.bodaccDate}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Effectif estimé</dt>
                <dd className="font-medium text-gray-900">
                  {lead.enrichment.employeeEstimate || "N/A"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Enrichissement */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Enrichissement
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4" />
                  Présence web
                </div>
                {lead.enrichment.hasDomain ? (
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      Domaine:{" "}
                      <span className="font-medium">
                        {lead.enrichment.domain}
                      </span>
                    </p>
                    <p>
                      Site web:{" "}
                      <span
                        className={
                          lead.enrichment.hasWebsite
                            ? "text-accent-600"
                            : "text-danger-500"
                        }
                      >
                        {lead.enrichment.hasWebsite ? "Oui" : "Non"}
                      </span>
                    </p>
                    {lead.enrichment.websiteStack &&
                      lead.enrichment.websiteStack.length > 0 && (
                        <p>
                          Stack:{" "}
                          {lead.enrichment.websiteStack.join(", ")}
                        </p>
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-danger-500">
                    Aucun domaine détecté
                  </p>
                )}
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Server className="h-4 w-4" />
                  Réseaux sociaux
                </div>
                {lead.enrichment.socialPresence.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.enrichment.socialPresence.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Aucune présence détectée
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar contact */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Users className="h-4 w-4" />
              Contact principal
            </h2>
            {lead.contact ? (
              <div className="space-y-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {lead.contact.firstName} {lead.contact.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{lead.contact.role}</p>
                </div>
                <div className="space-y-2">
                  <a
                    href={`mailto:${lead.contact.email}`}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    {lead.contact.email}
                  </a>
                  {lead.contact.phone && (
                    <a
                      href={`tel:${lead.contact.phone}`}
                      className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <Phone className="h-4 w-4 text-gray-400" />
                      {lead.contact.phone}
                    </a>
                  )}
                  {lead.contact.linkedin && (
                    <span className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      {lead.contact.linkedin}
                    </span>
                  )}
                </div>
                <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir dans le CRM
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                <p>Contact non enrichi</p>
                <button className="mt-2 text-xs font-medium text-primary-600 hover:underline">
                  Lancer l'enrichissement
                </button>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Détail du score IA
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "Pertinence verticale",
                  value: Math.min(100, lead.aiScore + 5),
                },
                {
                  label: "Potentiel commercial",
                  value: Math.max(0, lead.aiScore - 8),
                },
                {
                  label: "Maturité digitale",
                  value: lead.enrichment.hasWebsite
                    ? 30
                    : 85,
                },
                {
                  label: "Accessibilité contact",
                  value: lead.contact ? 90 : 20,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-700">
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
