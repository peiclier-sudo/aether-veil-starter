/**
 * Enrichment pipeline
 *
 * 1. INSEE Sirene API — NAF code, detailed address, legal info
 * 2. DNS lookup — check if company has a domain
 * 3. HTTP probe — detect website + CMS stack
 * 4. Email pattern guessing from dirigeant name + domain
 */

interface InseeData {
  nafCode?: string;
  activity?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  legalForm?: string;
  employeeRange?: string;
  creationDate?: string;
}

interface EnrichmentResult {
  // INSEE
  nafCode?: string;
  activityLabel?: string;
  employeeEstimate?: string;
  creationDate?: string;

  // Web presence
  hasDomain: boolean;
  domain?: string;
  domainVerified: boolean;
  hasWebsite: boolean;
  websiteStack: string[];
  socialPresence: string[];

  // Contact (pattern-based)
  guessedEmail?: string;
}

// Track last error for diagnostics
export let lastInseeError: string | null = null;

const INSEE_API_BASE = "https://api.insee.fr/api-sirene/3.11";

/**
 * Fetch company data from INSEE Sirene API (new portal)
 * Uses API key auth via X-INSEE-Api-Key-Integration header.
 * Register at https://portail-api.insee.fr → create app → subscribe to API Sirene
 */
export async function enrichFromInsee(
  siren: string,
  apiKey?: string
): Promise<InseeData> {
  if (!siren || siren.length !== 9 || !apiKey) return {};

  const TIMEOUT = 4000;
  const headers = {
    "X-INSEE-Api-Key-Integration": apiKey,
    Accept: "application/json",
  };

  try {
    const res = await fetch(`${INSEE_API_BASE}/siren/${siren}`, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      lastInseeError = `API call failed: ${res.status} ${res.statusText} — ${body.slice(0, 200)}`;
      console.error(`[INSEE] ${lastInseeError}`);
      return {};
    }

    lastInseeError = null;

    const data = await res.json();
    const unit = data.uniteLegale;
    if (!unit) return {};

    const period = unit.periodesUniteLegale?.[0];
    const nafCode = period?.activitePrincipaleUniteLegale || "";

    // Get the establishment (siège)
    const siegeRes = await fetch(
      `${INSEE_API_BASE}/siret?q=siren:${siren} AND etablissementSiege:true`,
      {
        headers,
        signal: AbortSignal.timeout(TIMEOUT),
      }
    );

    let address = "";
    let postalCode = "";
    let city = "";

    if (siegeRes.ok) {
      const siegeData = await siegeRes.json();
      const etab = siegeData.etablissements?.[0];
      if (etab) {
        const addr = etab.adresseEtablissement || {};
        address = [
          addr.numeroVoieEtablissement,
          addr.typeVoieEtablissement,
          addr.libelleVoieEtablissement,
        ]
          .filter(Boolean)
          .join(" ");
        postalCode = addr.codePostalEtablissement || "";
        city = addr.libelleCommuneEtablissement || "";
      }
    }

    return {
      nafCode,
      activity: period?.nomenclatureActivitePrincipaleUniteLegale || "",
      legalForm: period?.categorieJuridiqueUniteLegale || "",
      address,
      postalCode,
      city,
      employeeRange: unit.trancheEffectifsUniteLegale || "",
      creationDate: unit.dateCreationUniteLegale || "",
    };
  } catch {
    return {};
  }
}

/**
 * Slugify a company name for domain candidate generation
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/**
 * Generate multiple slug variants from a company name
 */
function generateSlugs(name: string): string[] {
  const base = slugify(name);
  if (!base) return [];

  const slugs = new Set<string>();

  // 1. Full slug with hyphens (current behavior): "glb-industrie-69"
  slugs.add(base);

  // 2. Without hyphens: "glbindustrie69"
  const noHyphens = base.replace(/-/g, "");
  if (noHyphens !== base) slugs.add(noHyphens);

  // 3. Without trailing numbers: "glb-industrie"
  const noTrailingNums = base.replace(/-?\d+$/, "").replace(/-$/, "");
  if (noTrailingNums && noTrailingNums !== base) {
    slugs.add(noTrailingNums);
    // Also without hyphens: "glbindustrie"
    const noTrailingNumsNoHyphens = noTrailingNums.replace(/-/g, "");
    if (noTrailingNumsNoHyphens !== noTrailingNums) slugs.add(noTrailingNumsNoHyphens);
  }

  // 4. Initials: first letter of each word — "gli" from "glb-industrie"
  const words = base.split("-").filter(Boolean);
  if (words.length >= 2) {
    const initials = words.map((w) => w[0]).join("");
    if (initials.length >= 2) slugs.add(initials);

    // Initials + trailing numbers if any: "gli69"
    const trailingNums = base.match(/(\d+)$/);
    if (trailingNums && initials.length >= 2) {
      slugs.add(initials + trailingNums[1]);
    }
  }

  return [...slugs].filter((s) => s.length >= 2);
}

const TLDS = [".fr", ".com", ".net", ".eu", ".io"];

/**
 * Check DNS for domains derived from company name + optional nomCommercial
 * Tests multiple slug variants × multiple TLDs via Cloudflare DoH (free)
 */
export async function checkDomain(
  companyName: string,
  nomCommercial?: string
): Promise<{ hasDomain: boolean; domain?: string }> {
  // Generate slug variants from company name and nomCommercial
  const slugs = generateSlugs(companyName);
  if (nomCommercial) {
    for (const s of generateSlugs(nomCommercial)) {
      if (!slugs.includes(s)) slugs.push(s);
    }
  }

  // Build candidate domains: slugs × TLDs, ordered by TLD priority
  // Group by TLD priority so .fr domains are checked before .com, etc.
  const candidates: string[] = [];
  for (const tld of TLDS) {
    for (const slug of slugs) {
      candidates.push(`${slug}${tld}`);
    }
  }

  // Cap at 20 to avoid excessive DNS queries
  const capped = candidates.slice(0, 20);

  // Check all domains in parallel
  const results = await Promise.allSettled(
    capped.map(async (domain) => {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
        {
          headers: { Accept: "application/dns-json" },
          signal: AbortSignal.timeout(3000),
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.Answer && data.Answer.length > 0 ? domain : null;
    })
  );

  // Return first resolved domain (ordered by TLD priority: .fr > .com > .net > .eu > .io)
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      return { hasDomain: true, domain: result.value };
    }
  }

  return { hasDomain: false };
}

/**
 * Signals used to verify domain ownership via website content
 */
interface VerificationSignals {
  companyName: string;
  siren?: string;
  city?: string;
  nomCommercial?: string;
}

/**
 * Check if HTML content mentions the company (name, SIREN, or city)
 * Uses normalized comparison to handle accents, case, etc.
 */
function verifyDomainOwnership(html: string, signals: VerificationSignals): boolean {
  const normalizedHtml = html
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Check SIREN (strongest signal — unique identifier)
  if (signals.siren && signals.siren.length === 9) {
    // Match SIREN with or without spaces (e.g. "932 430 598" or "932430598")
    const sirenSpaced = signals.siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
    if (normalizedHtml.includes(signals.siren) || normalizedHtml.includes(sirenSpaced)) {
      return true;
    }
  }

  // Check company name (extract significant words, ignore legal forms)
  const legalForms = ["sas", "sarl", "eurl", "sa", "sasu", "sci", "snc", "auto-entrepreneur", "ei", "eirl", "scp", "selarl"];
  const nameWords = signals.companyName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !legalForms.includes(w));

  // At least 2 significant words must match, or 1 if the name has only 1 word
  const threshold = nameWords.length <= 1 ? 1 : 2;
  const matchedWords = nameWords.filter((w) => normalizedHtml.includes(w));
  if (matchedWords.length >= threshold) return true;

  // Check nomCommercial if available
  if (signals.nomCommercial) {
    const commercialWords = signals.nomCommercial
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3);
    const commercialThreshold = commercialWords.length <= 1 ? 1 : 2;
    const commercialMatched = commercialWords.filter((w) => normalizedHtml.includes(w));
    if (commercialMatched.length >= commercialThreshold) return true;
  }

  // Check city name as weak signal (only if 5+ chars to avoid false positives)
  if (signals.city && signals.city.length >= 5) {
    const normalizedCity = signals.city
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (normalizedHtml.includes(normalizedCity)) return true;
  }

  return false;
}

/**
 * Probe a website to detect CMS/stack + verify domain ownership
 */
export async function probeWebsite(
  domain: string,
  signals?: VerificationSignals
): Promise<{ hasWebsite: boolean; stack: string[]; verified: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://${domain}`, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "NewCoIntel-Bot/1.0" },
    });
    clearTimeout(timeout);

    if (!res.ok) return { hasWebsite: false, stack: [], verified: false };

    const html = await res.text();
    const stack: string[] = [];

    // Detect CMS
    if (html.includes("wp-content") || html.includes("wp-includes"))
      stack.push("WordPress");
    if (html.includes("shopify") || html.includes("Shopify"))
      stack.push("Shopify");
    if (html.includes("wix.com") || html.includes("X-Wix"))
      stack.push("Wix");
    if (html.includes("squarespace")) stack.push("Squarespace");
    if (html.includes("webflow")) stack.push("Webflow");
    if (html.includes("prestashop") || html.includes("PrestaShop"))
      stack.push("PrestaShop");

    if (stack.length === 0) stack.push("Custom / inconnu");

    // Verify domain belongs to company
    const verified = signals ? verifyDomainOwnership(html, signals) : false;

    return { hasWebsite: true, stack, verified };
  } catch {
    return { hasWebsite: false, stack: [], verified: false };
  }
}

/**
 * Normalize a name for email generation (remove accents, lowercase)
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z-]/g, "");
}

/**
 * Check MX records for a domain using Cloudflare DoH (free)
 * Returns true if the domain can receive email
 */
async function hasMxRecords(domain: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      {
        headers: { Accept: "application/dns-json" },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return (data.Answer || []).some((r: { type: number }) => r.type === 15);
  } catch {
    return false;
  }
}

/**
 * Guess email from dirigeant name + domain
 * Validates MX records first, then returns best pattern
 * Patterns tested (French B2B order): prenom.nom, p.nom, prenom, contact, info
 */
export async function guessEmail(
  firstName: string,
  lastName: string,
  domain?: string
): Promise<string | undefined> {
  if (!domain) return undefined;

  // Check MX records — skip if domain can't receive email
  const canReceiveMail = await hasMxRecords(domain);
  if (!canReceiveMail) return undefined;

  const fn = firstName ? normalizeName(firstName) : "";
  const ln = lastName ? normalizeName(lastName) : "";

  // Return best personal pattern if dirigeant data available
  if (fn && ln) return `${fn}.${ln}@${domain}`;
  if (fn) return `${fn}@${domain}`;

  // Fallback to generic contact email
  return `contact@${domain}`;
}

/**
 * Check if domain slug is a close match to company name
 * Used as fallback verification when we can't probe the website
 */
function isDomainSlugClose(domain: string, companyName: string, nomCommercial?: string): boolean {
  // Extract slug from domain (remove TLD)
  const slug = domain.replace(/\.[a-z]+$/, "").replace(/-/g, "");

  // Generate normalized company name (no accents, no spaces, no legal forms)
  const legalForms = ["sas", "sarl", "eurl", "sa", "sasu", "sci", "snc", "ei", "eirl", "scp", "selarl"];
  const normalize = (name: string) =>
    name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .split(/\s+/)
      .filter((w) => !legalForms.includes(w))
      .join("");

  const normalizedName = normalize(companyName);

  // Exact or near-exact slug match (slug contains name or name contains slug)
  if (slug.length >= 4 && normalizedName.length >= 4) {
    if (normalizedName.includes(slug) || slug.includes(normalizedName)) return true;
  }

  // Also check nomCommercial
  if (nomCommercial) {
    const normalizedCommercial = normalize(nomCommercial);
    if (normalizedCommercial.length >= 4) {
      if (normalizedCommercial.includes(slug) || slug.includes(normalizedCommercial)) return true;
    }
  }

  return false;
}

/**
 * Full enrichment pipeline for a single lead
 */
export async function enrichLead(
  siren: string,
  companyName: string,
  inseeToken?: string,
  skipWebProbe = false,
  nomCommercial?: string,
  city?: string,
): Promise<EnrichmentResult> {
  // Run INSEE + DNS in parallel (INPI removed — BODACC provides dirigeant directly)
  const [inseeData, domainResult] = await Promise.all([
    enrichFromInsee(siren, inseeToken),
    checkDomain(companyName, nomCommercial),
  ]);

  // If domain found, probe the website (unless skipped for time budget)
  let hasWebsite = false;
  let websiteStack: string[] = [];
  let domainVerified = false;

  if (domainResult.hasDomain && domainResult.domain) {
    if (!skipWebProbe) {
      const probe = await probeWebsite(domainResult.domain, {
        companyName,
        siren,
        city,
        nomCommercial,
      });
      hasWebsite = probe.hasWebsite;
      websiteStack = probe.stack;
      domainVerified = probe.verified;
    }

    // Fallback: if no web probe or probe didn't verify, check slug proximity
    if (!domainVerified) {
      domainVerified = isDomainSlugClose(domainResult.domain, companyName, nomCommercial);
    }
  }

  return {
    nafCode: inseeData.nafCode,
    activityLabel: inseeData.activity,
    employeeEstimate: inseeData.employeeRange,
    creationDate: inseeData.creationDate,
    hasDomain: domainResult.hasDomain,
    domain: domainResult.domain,
    domainVerified,
    hasWebsite,
    websiteStack,
    socialPresence: [],
    guessedEmail: undefined, // Email now guessed in ingest.ts from BODACC dirigeant
  };
}
