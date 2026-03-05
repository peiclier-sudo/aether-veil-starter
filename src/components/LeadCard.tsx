import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ArrowUpRight,
  Globe,
  User,
} from "lucide-react";
import type { Lead } from "@/lib/types";
import { relativeDate, getScoreColor } from "@/lib/utils";
import ScoreBadge from "./ScoreBadge";

const verticalStyles: Record<string, { bg: string; text: string; dot: string }> = {
  "agence-web": { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  "expert-comptable": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  assureur: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

export default function LeadCard({ lead }: { lead: Lead }) {
  const vs = verticalStyles[lead.vertical] || verticalStyles["agence-web"];
  const scoreColor = getScoreColor(lead.aiScore);

  return (
    <Link
      to={`/lead/${lead.id}`}
      className="surface-interactive group relative block overflow-hidden rounded-2xl p-5"
    >
      {/* Score accent bar */}
      <div
        className={`absolute inset-y-0 left-0 w-1 transition-all duration-300 group-hover:w-1.5 ${
          lead.aiScore >= 75
            ? "bg-emerald-500"
            : lead.aiScore >= 50
              ? "bg-amber-500"
              : "bg-red-400"
        }`}
      />

      <div className="flex items-start gap-4">
        {/* Left content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <h3 className="truncate text-[15px] font-bold text-gray-900 transition-colors group-hover:text-primary-700">
              {lead.companyName}
            </h3>
            <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 transition-all group-hover:text-primary-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
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
          <p className="mt-2.5 text-sm text-gray-600">{lead.activity}</p>

          {/* Tags row */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${vs.bg} ${vs.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${vs.dot}`} />
              {lead.verticalLabel}
            </span>
            {lead.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >
                {tag}
              </span>
            ))}
            {lead.enrichment.hasDomain && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                <Globe className="h-3 w-3" />
                Web
              </span>
            )}
          </div>

          {/* Contact strip */}
          {lead.contact && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <User className="h-3 w-3 text-gray-400" />
                {lead.contact.firstName} {lead.contact.lastName}
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <Mail className="h-3 w-3" />
                {lead.contact.email}
              </span>
              {lead.contact.phone && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Phone className="h-3 w-3" />
                  {lead.contact.phone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Score badge */}
        <ScoreBadge score={lead.aiScore} size="sm" />
      </div>
    </Link>
  );
}
