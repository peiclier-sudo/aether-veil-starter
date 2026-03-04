export type Vertical = "agence-web" | "expert-comptable" | "assureur" | "all";

export interface Lead {
  id: string;
  companyName: string;
  siren: string;
  siret: string;
  legalForm: string;
  activity: string;
  naf: string;
  capital: number;
  city: string;
  postalCode: string;
  region: string;
  creationDate: string;
  bodaccDate: string;
  aiScore: number;
  vertical: Vertical;
  verticalLabel: string;
  tags: string[];
  outreachAngle: string;
  contact?: ContactInfo;
  enrichment: EnrichmentData;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  role: string;
}

export interface EnrichmentData {
  hasDomain: boolean;
  domain?: string;
  hasWebsite: boolean;
  websiteStack?: string[];
  socialPresence: string[];
  employeeEstimate?: string;
  revenue?: string;
}

export interface DailyStats {
  date: string;
  totalCreations: number;
  qualified: number;
  highScore: number;
  mediumScore: number;
  lowScore: number;
}

export interface VerticalConfig {
  id: Vertical;
  label: string;
  description: string;
  icon: string;
  color: string;
  criteria: string[];
}

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
  verticals: number;
  leadsPerDay: string;
}
