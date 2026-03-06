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
  hasWebsite: boolean;
  websiteStack: string[];
  socialPresence: string[];

  // Contact (pattern-based)
  guessedEmail?: string;
}

/**
 * Fetch company data from INSEE Sirene API
 * Free tier: needs a token from https://portail-api.insee.fr (register → create app → subscribe to API Sirene)
 */
export async function enrichFromInsee(
  siren: string,
  token?: string
): Promise<InseeData> {
  if (!siren || siren.length !== 9 || !token) return {};

  try {
    const res = await fetch(
      `https://api.insee.fr/entreprises/sirene/V3.11/siren/${siren}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return {};

    const data = await res.json();
    const unit = data.uniteLegale;
    if (!unit) return {};

    const period = unit.periodesUniteLegale?.[0];
    const nafCode = period?.activitePrincipaleUniteLegale || "";

    // Get the establishment (siège)
    const siegeRes = await fetch(
      `https://api.insee.fr/entreprises/sirene/V3.11/siret?q=siren:${siren} AND etablissementSiege:true`,
      {
        headers: { Authorization: `Bearer ${token}` },
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

  for (const domain of candidates) {
    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
        {
          headers: { Accept: "application/dns-json" },
        }
      );
      if (!res.ok) continue;

      const data = await res.json();
      if (data.Answer && data.Answer.length > 0) {
        return { hasDomain: true, domain };
      }
    } catch {
      continue;
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
    const timeout = setTimeout(() => controller.abort(), 5000);

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
  inseeToken?: string
): Promise<EnrichmentResult> {
  // Run INSEE + DNS in parallel
  const [inseeData, domainResult] = await Promise.all([
    enrichFromInsee(siren, inseeToken),
    checkDomain(companyName),
  ]);

  // If domain found, probe the website
  let hasWebsite = false;
  let websiteStack: string[] = [];

  if (domainResult.hasDomain && domainResult.domain) {
    const probe = await probeWebsite(domainResult.domain);
    hasWebsite = probe.hasWebsite;
    websiteStack = probe.stack;
  }

  return {
    nafCode: inseeData.nafCode,
    activityLabel: inseeData.activity,
    employeeEstimate: inseeData.employeeRange,
    creationDate: inseeData.creationDate,
    hasDomain: domainResult.hasDomain,
    domain: domainResult.domain,
    hasWebsite,
    websiteStack,
    socialPresence: [],
  };
}
