import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import type { Lead } from "@/lib/types";
import { relativeDate } from "@/lib/utils";
import ScoreBadge from "./ScoreBadge";

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  return (
    <Link
      to={`/lead/${lead.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-primary-700">
              {lead.companyName}
            </h3>
            <ExternalLink className="hidden h-3.5 w-3.5 text-gray-400 group-hover:block" />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {lead.legalForm}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {lead.city} ({lead.postalCode})
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {relativeDate(lead.bodaccDate)}
            </span>
          </div>
        </div>
        <ScoreBadge score={lead.aiScore} size="sm" />
      </div>

      <p className="mt-3 text-sm text-gray-600">{lead.activity}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
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
        {lead.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {lead.contact && (
        <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span className="font-medium text-gray-700">
            {lead.contact.firstName} {lead.contact.lastName}
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {lead.contact.email}
          </span>
          {lead.contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {lead.contact.phone}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
