/** Database row types matching the Supabase schema */

export interface DbLead {
  id: string;
  siren: string;
  siret: string | null;
  company_name: string;
  legal_form: string | null;
  activity: string | null;
  naf_code: string | null;
  capital: number | null;
  city: string | null;
  postal_code: string | null;
  region: string | null;
  address: string | null;
  bodacc_id: string | null;
  bodacc_date: string;
  creation_date: string | null;
  vertical: "agence-web" | "expert-comptable" | "assureur";
  ai_score: number;
  score_reasons: string[];
  has_domain: boolean;
  domain: string | null;
  mx_valid: boolean | null;
  mx_records: string[];
  has_website: boolean;
  website_stack: string[];
  social_presence: string[];
  employee_estimate: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_linkedin: string | null;
  contact_role: string | null;
  outreach_angle: string | null;
  tags: string[];
  enrichment_status: string;
  scoring_status: string;
  created_at: string;
  updated_at: string;
}

export interface DbDailyStat {
  id: string;
  date: string;
  total_creations: number;
  qualified: number;
  high_score: number;
  medium_score: number;
  low_score: number;
  created_at: string;
}

/** Convert a DB lead to the frontend Lead type */
export function dbLeadToFrontend(db: DbLead) {
  return {
    id: db.id,
    companyName: db.company_name,
    siren: db.siren,
    siret: db.siret || db.siren,
    legalForm: db.legal_form || "",
    activity: db.activity || "",
    naf: db.naf_code || "",
    capital: db.capital || 0,
    city: db.city || "",
    postalCode: db.postal_code || "",
    region: db.region || "",
    creationDate: db.creation_date || db.bodacc_date,
    bodaccDate: db.bodacc_date,
    aiScore: db.ai_score,
    vertical: db.vertical,
    verticalLabel:
      db.vertical === "agence-web"
        ? "Agences Web"
        : db.vertical === "expert-comptable"
          ? "Experts-Comptables"
          : "Assureurs",
    tags: db.tags || [],
    outreachAngle: db.outreach_angle || "",
    contact:
      db.contact_first_name && db.contact_last_name
        ? {
            firstName: db.contact_first_name,
            lastName: db.contact_last_name,
            email: db.contact_email || undefined,
            phone: db.contact_phone || undefined,
            linkedin: db.contact_linkedin || undefined,
            role: db.contact_role || "Dirigeant",
          }
        : undefined,
    enrichment: {
      hasDomain: db.has_domain,
      domain: db.domain || undefined,
      mxValid: db.mx_valid ?? undefined,
      mxRecords: db.mx_records || [],
      hasWebsite: db.has_website,
      websiteStack: db.website_stack || [],
      socialPresence: db.social_presence || [],
      employeeEstimate: db.employee_estimate || "Non estimé",
      revenue: undefined,
    },
  };
}
