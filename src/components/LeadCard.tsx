import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Calendar,
  Mail,
  MailCheck,
  MailX,
  Phone,
  ArrowUpRight,
  Globe,
  User,
} from "lucide-react";
import type { Lead } from "@/lib/types";
import { relativeDate } from "@/lib/utils";

const vertColors: Record<string, string> = {
  "agence-web": "var(--color-vert-web)",
  "expert-comptable": "var(--color-vert-compta)",
  assureur: "var(--color-vert-assur)",
};

export default function LeadCard({ lead }: { lead: Lead }) {
  const vColor = vertColors[lead.vertical] || "var(--color-muted)";
  const scoreColor =
    lead.aiScore >= 75
      ? "text-score-high"
      : lead.aiScore >= 50
        ? "text-score-mid"
        : "text-score-low";

  return (
    <Link
      to={`/lead/${lead.id}`}
      className="card-interactive group relative block overflow-hidden p-5"
    >
      {/* Left accent */}
      <div
        className="absolute inset-y-0 left-0 w-[3px] transition-all group-hover:w-1"
        style={{ background: vColor }}
      />

      <div className="flex items-start gap-3">
        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="mb-1.5 flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-heading transition-colors group-hover:text-accent">
              {lead.companyName}
            </h3>
            <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-muted transition-all group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {lead.legalForm}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {lead.city}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {relativeDate(lead.bodaccDate)}
            </span>
          </div>

          {/* Activity */}
          <p className="mt-2 text-[13px] text-sub">{lead.activity}</p>

          {/* Tags */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-md border px-2 py-0.5 text-[11px] font-semibold"
              style={{ borderColor: vColor, color: vColor }}
            >
              {lead.verticalLabel}
            </span>
            {lead.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted">
                {tag}
              </span>
            ))}
            {lead.enrichment.hasDomain && (
              <span className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px] text-sub">
                <Globe className="h-2.5 w-2.5" />
                web
              </span>
            )}
            {lead.enrichment.mxValid !== undefined && (
              <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] ${
                lead.enrichment.mxValid
                  ? "border-score-high/30 text-score-high"
                  : "border-score-low/30 text-score-low"
              }`}>
                {lead.enrichment.mxValid
                  ? <><MailCheck className="h-2.5 w-2.5" />MX ✓</>
                  : <><MailX className="h-2.5 w-2.5" />MX ✗</>}
              </span>
            )}
          </div>

          {/* Contact */}
          {lead.contact && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-[12px]">
              <span className="flex items-center gap-1 text-heading">
                <User className="h-3 w-3 text-muted" />
                {lead.contact.firstName} {lead.contact.lastName}
              </span>
              <span className="flex items-center gap-1 text-muted">
                <Mail className="h-3 w-3" />
                {lead.contact.email}
              </span>
              {lead.contact.phone && (
                <span className="flex items-center gap-1 text-muted">
                  <Phone className="h-3 w-3" />
                  {lead.contact.phone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1">
          <span className={`font-mono text-lg font-bold ${scoreColor}`}>
            {lead.aiScore}
          </span>
          <div
            className="h-1 w-6 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${
                lead.aiScore >= 75 ? "#16a34a" : lead.aiScore >= 50 ? "#d97706" : "#dc2626"
              } ${lead.aiScore}%, var(--color-surface) ${lead.aiScore}%)`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
