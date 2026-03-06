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

interface InpiDirigeant {
  firstName: string;
  lastName: string;
  role: string;
}

interface EnrichmentResult {
  // INSEE
  nafCode?: string;
  activityLabel?: string;
  employeeEstimate?: string;
  creationDate?: string;

  // INPI dirigeant
  dirigeant?: InpiDirigeant;

  // Web presence
  hasDomain: boolean;
  domain?: string;
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

// ── INPI RNE API — dirigeant names (free) ──────────────────────

const INPI_API_BASE = "https://registre-national-entreprises.inpi.fr/api";

let inpiToken: string | null = null;
let inpiTokenExpiry = 0;

export let lastInpiError: string | null = null;

/**
 * Authenticate with INPI RNE API and cache the JWT token.
 * Token is refreshed 5 min before expiry.
 */
async function getInpiToken(
  username: string,
  password: string
): Promise<string | null> {
  if (inpiToken && Date.now() < inpiTokenExpiry) return inpiToken;

  try {
    const res = await fetch(`${INPI_API_BASE}/sso/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      lastInpiError = `INPI login failed: ${res.status} ${res.statusText}`;
      console.error(`[INPI] ${lastInpiError}`);
      return null;
    }

    const data = await res.json();
    inpiToken = data.token;
    // Refresh 5 min before expiry (tokens typically last 1h)
    inpiTokenExpiry = Date.now() + 55 * 60 * 1000;
    lastInpiError = null;
    return inpiToken;
  } catch {
    lastInpiError = "INPI login timeout or network error";
    return null;
  }
}

/**
 * Fetch dirigeant (représentant) info from INPI RNE API.
 * Returns the first physical-person dirigeant found (président, gérant, etc.)
 */
export async function enrichFromInpi(
  siren: string,
  username?: string,
  password?: string
): Promise<InpiDirigeant | null> {
  if (!siren || siren.length !== 9 || !username || !password) return null;

  const token = await getInpiToken(username, password);
  if (!token) return null;

  try {
    const res = await fetch(`${INPI_API_BASE}/companies/${siren}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      if (res.status === 404) return null; // Company not yet in RNE
      lastInpiError = `INPI company fetch failed: ${res.status}`;
      console.error(`[INPI] ${lastInpiError}`);
      return null;
    }

    lastInpiError = null;
    const data = await res.json();

    // Navigate the RNE JSON structure to find dirigeants
    // The structure contains formality data with "composition" holding powers/roles
    const compositions =
      data.formality?.content?.personnesMorales?.[0]?.composition?.pouvoirs ??
      data.formality?.content?.personnesPhysiques?.[0]?.composition?.pouvoirs ??
      [];

    // Also check the top-level representants field (varies by API version)
    const representants = data.representants ?? [];

    // Try representants first (cleaner structure)
    for (const rep of representants) {
      if (rep.nom && rep.prenoms) {
        return {
          firstName: capitalize(rep.prenoms.split(/[\s,]+/)[0] || ""),
          lastName: capitalize(rep.nom),
          role: rep.qualite || rep.role || "Dirigeant",
        };
      }
    }

    // Fall back to composition/pouvoirs
    for (const pouvoir of compositions) {
      const individu = pouvoir.individu || pouvoir;
      if (individu.nom && individu.prenoms) {
        return {
          firstName: capitalize(individu.prenoms.split(/[\s,]+/)[0] || ""),
          lastName: capitalize(individu.nom),
          role: pouvoir.roleEnEntreprise || pouvoir.qualite || "Dirigeant",
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Check DNS for a domain derived from the company name
 * Uses DNS-over-HTTPS (Cloudflare) — free, no library needed
 */
export async function checkDomain(
  companyName: string
): Promise<{ hasDomain: boolean; domain?: string }> {
  // Generate candidate domain from company name
  const slug = companyName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const candidates = [`${slug}.fr`, `${slug}.com`];

  // Check both domains in parallel
  const results = await Promise.allSettled(
    candidates.map(async (domain) => {
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

  // Prefer .fr over .com
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      return { hasDomain: true, domain: result.value };
    }
  }

  return { hasDomain: false };
}

/**
 * Probe a website to detect CMS/stack
 * Simple HTTP HEAD + body scan
 */
export async function probeWebsite(
  domain: string
): Promise<{ hasWebsite: boolean; stack: string[] }> {
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

    if (!res.ok) return { hasWebsite: false, stack: [] };

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

    return { hasWebsite: true, stack };
  } catch {
    return { hasWebsite: false, stack: [] };
  }
}

/**
 * Guess email from dirigeant name + domain
 * Returns most common French patterns
 */
export function guessEmail(
  firstName: string,
  lastName: string,
  domain?: string
): string | undefined {
  if (!firstName || !lastName || !domain) return undefined;

  const fn = firstName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const ln = lastName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Most common B2B French pattern
  return `${fn}.${ln}@${domain}`;
}

/**
 * Full enrichment pipeline for a single lead
 */
export async function enrichLead(
  siren: string,
  companyName: string,
  inseeToken?: string,
  skipWebProbe = false,
  inpiCredentials?: { username: string; password: string }
): Promise<EnrichmentResult> {
  // Run INSEE + DNS + INPI in parallel
  const [inseeData, domainResult, dirigeant] = await Promise.all([
    enrichFromInsee(siren, inseeToken),
    checkDomain(companyName),
    inpiCredentials
      ? enrichFromInpi(siren, inpiCredentials.username, inpiCredentials.password)
      : Promise.resolve(null),
  ]);

  // If domain found, probe the website (unless skipped for time budget)
  let hasWebsite = false;
  let websiteStack: string[] = [];

  if (!skipWebProbe && domainResult.hasDomain && domainResult.domain) {
    const probe = await probeWebsite(domainResult.domain);
    hasWebsite = probe.hasWebsite;
    websiteStack = probe.stack;
  }

  // Guess email if we have dirigeant name + domain
  const guessedEmail =
    dirigeant && domainResult.domain
      ? guessEmail(dirigeant.firstName, dirigeant.lastName, domainResult.domain)
      : undefined;

  return {
    nafCode: inseeData.nafCode,
    activityLabel: inseeData.activity,
    employeeEstimate: inseeData.employeeRange,
    creationDate: inseeData.creationDate,
    dirigeant: dirigeant || undefined,
    hasDomain: domainResult.hasDomain,
    domain: domainResult.domain,
    hasWebsite,
    websiteStack,
    socialPresence: [],
    guessedEmail,
  };
}
