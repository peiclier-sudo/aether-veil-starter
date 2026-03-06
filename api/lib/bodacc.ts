/**
 * BODACC data fetching via the official API
 *
 * Source: https://bodacc-datadila.opendatasoft.com
 * Free, no auth required, returns JSON.
 *
 * We fetch "immatriculations" (business creations) from the BODACC-A bulletin.
 */

interface BodaccRecord {
  id: string;
  registreducommerceetdessocietes: string; // "Immatriculation principale au RCS"
  commercant: string;
  denomination?: string;
  formeJuridique?: string;
  montantCapital?: string;
  deviseCapital?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  activite?: string;
  registre?: string; // "RCS Paris" etc.
  dateparution?: string;
  numerodepartement?: string;
}

export interface BodaccDirigeant {
  firstName: string;
  lastName: string;
  role: string;
}

export interface BodaccLead {
  bodaccId: string;
  companyName: string;
  legalForm: string;
  capital: number;
  activity: string;
  city: string;
  postalCode: string;
  region: string;
  address: string;
  bodaccDate: string;
  siren: string;
  dirigeant?: BodaccDirigeant;
}

const BASE_URL =
  "https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records";

const REGION_MAP: Record<string, string> = {
  "75": "Île-de-France", "77": "Île-de-France", "78": "Île-de-France",
  "91": "Île-de-France", "92": "Île-de-France", "93": "Île-de-France",
  "94": "Île-de-France", "95": "Île-de-France",
  "13": "Provence-Alpes-Côte d'Azur", "83": "Provence-Alpes-Côte d'Azur",
  "84": "Provence-Alpes-Côte d'Azur", "04": "Provence-Alpes-Côte d'Azur",
  "05": "Provence-Alpes-Côte d'Azur", "06": "Provence-Alpes-Côte d'Azur",
  "69": "Auvergne-Rhône-Alpes", "01": "Auvergne-Rhône-Alpes",
  "03": "Auvergne-Rhône-Alpes", "07": "Auvergne-Rhône-Alpes",
  "15": "Auvergne-Rhône-Alpes", "26": "Auvergne-Rhône-Alpes",
  "38": "Auvergne-Rhône-Alpes", "42": "Auvergne-Rhône-Alpes",
  "43": "Auvergne-Rhône-Alpes", "63": "Auvergne-Rhône-Alpes",
  "73": "Auvergne-Rhône-Alpes", "74": "Auvergne-Rhône-Alpes",
  "31": "Occitanie", "09": "Occitanie", "11": "Occitanie",
  "12": "Occitanie", "30": "Occitanie", "32": "Occitanie",
  "34": "Occitanie", "46": "Occitanie", "48": "Occitanie",
  "65": "Occitanie", "66": "Occitanie", "81": "Occitanie", "82": "Occitanie",
  "33": "Nouvelle-Aquitaine", "16": "Nouvelle-Aquitaine",
  "17": "Nouvelle-Aquitaine", "19": "Nouvelle-Aquitaine",
  "23": "Nouvelle-Aquitaine", "24": "Nouvelle-Aquitaine",
  "40": "Nouvelle-Aquitaine", "47": "Nouvelle-Aquitaine",
  "64": "Nouvelle-Aquitaine", "79": "Nouvelle-Aquitaine",
  "86": "Nouvelle-Aquitaine", "87": "Nouvelle-Aquitaine",
  "44": "Pays de la Loire", "49": "Pays de la Loire",
  "53": "Pays de la Loire", "72": "Pays de la Loire", "85": "Pays de la Loire",
  "59": "Hauts-de-France", "02": "Hauts-de-France",
  "60": "Hauts-de-France", "62": "Hauts-de-France", "80": "Hauts-de-France",
  "35": "Bretagne", "22": "Bretagne", "29": "Bretagne", "56": "Bretagne",
  "67": "Grand Est", "68": "Grand Est", "08": "Grand Est",
  "10": "Grand Est", "51": "Grand Est", "52": "Grand Est",
  "54": "Grand Est", "55": "Grand Est", "57": "Grand Est",
  "88": "Grand Est",
  "76": "Normandie", "14": "Normandie", "27": "Normandie",
  "50": "Normandie", "61": "Normandie",
  "21": "Bourgogne-Franche-Comté", "25": "Bourgogne-Franche-Comté",
  "39": "Bourgogne-Franche-Comté", "58": "Bourgogne-Franche-Comté",
  "70": "Bourgogne-Franche-Comté", "71": "Bourgogne-Franche-Comté",
  "89": "Bourgogne-Franche-Comté", "90": "Bourgogne-Franche-Comté",
  "45": "Centre-Val de Loire", "18": "Centre-Val de Loire",
  "28": "Centre-Val de Loire", "36": "Centre-Val de Loire",
  "37": "Centre-Val de Loire", "41": "Centre-Val de Loire",
  "20": "Corse",
};

function getRegion(postalCode: string): string {
  const dept = postalCode.slice(0, 2);
  return REGION_MAP[dept] || "Autre";
}

function parseCapital(raw?: unknown): number {
  if (!raw) return 0;
  const str = String(raw);
  const cleaned = str.replace(/[^\d.,]/g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned) || 0);
}

function extractSiren(registre?: unknown): string {
  if (!registre) return "";
  // Coerce to string — the API may return an object or array
  const str = typeof registre === "string" ? registre : JSON.stringify(registre);
  // Pattern: "RCS Paris 123 456 789" or "RCS Paris B 123456789"
  const match = str.match(/(\d[\d\s]{8,})/);
  if (!match) return "";
  return match[1].replace(/\s/g, "").slice(0, 9);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Extract dirigeant (gérant/président) from BODACC record.
 *
 * The BODACC API may provide person data in several ways:
 * 1. `listepersonnes` — structured person list (JSON string or object)
 * 2. `commercant` — for personnes physiques, contains "Nom, Prénoms"
 * 3. Raw text fields like `descriptif` containing "Gérant : Nom, Prénoms"
 *
 * We try all available sources.
 */
function extractDirigeant(record: Record<string, unknown>): BodaccDirigeant | undefined {
  // ── Source 1: listepersonnes field (structured data) ──
  const lp = record.listepersonnes;
  if (lp) {
    const parsed = typeof lp === "string" ? tryParseJson(lp) : lp;
    const person = extractPersonFromList(parsed);
    if (person) return person;
  }

  // ── Source 2: Parse "Gérant : Nom, Prénoms" from descriptif or text fields ──
  for (const field of ["descriptif", "description", "texte", "contenu"]) {
    const text = record[field];
    if (typeof text === "string") {
      const person = extractDirigeantFromText(text);
      if (person) return person;
    }
  }

  // ── Source 3: commercant field for personnes physiques ──
  // Format is typically "NOM, Prénom1 Prénom2" (e.g., "HENNI, Yhaniss Rani Mohammed")
  // Only use this if denomination exists (meaning commercant is the person, not the company)
  if (record.denomination && record.commercant) {
    const commercant = String(record.commercant).trim();
    const person = parseNameString(commercant, "Dirigeant");
    if (person) return person;
  }

  return undefined;
}

/**
 * Parse "Gérant : Nom, Prénoms" or "Président : Nom, Prénoms" from free text.
 * Also handles "Mandataires sociaux : Gérant : Nom, Prénoms"
 */
function extractDirigeantFromText(text: string): BodaccDirigeant | undefined {
  // Patterns like "Gérant : HENNI, Yhaniss" or "Président : DUPONT, Jean Pierre"
  const rolePatterns = [
    /(?:Mandataires?\s+sociaux\s*:\s*)?(?:G[ée]rant|Pr[ée]sident(?:\s+du\s+conseil\s+d'administration)?|Directeur\s+g[ée]n[ée]ral|Pr[ée]sident\s+directeur\s+g[ée]n[ée]ral)\s*:\s*([^;.\n]+)/i,
  ];

  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract the role from the matched text
      const roleMatch = text.match(/(G[ée]rant|Pr[ée]sident(?:\s+du\s+conseil\s+d'administration)?|Directeur\s+g[ée]n[ée]ral|Pr[ée]sident\s+directeur\s+g[ée]n[ée]ral)/i);
      const role = roleMatch ? capitalizeRole(roleMatch[1]) : "Dirigeant";
      const nameStr = match[1].trim();
      const person = parseNameString(nameStr, role);
      if (person) return person;
    }
  }

  return undefined;
}

/**
 * Parse a name string like "HENNI, Yhaniss Rani Mohammed" or "Nom Prénom"
 */
function parseNameString(nameStr: string, role: string): BodaccDirigeant | undefined {
  if (!nameStr || nameStr.length < 2) return undefined;

  // Format: "NOM, Prénom1 Prénom2..."
  if (nameStr.includes(",")) {
    const parts = nameStr.split(",").map((s) => s.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const firstName = capitalize(parts[1].split(/\s+/)[0]);
      const lastName = capitalize(parts[0]);
      return { firstName, lastName, role };
    }
  }

  // Format: "Prénom NOM" (less common but possible)
  const words = nameStr.trim().split(/\s+/);
  if (words.length >= 2) {
    // Heuristic: if last word is all uppercase, it's the last name
    const lastWord = words[words.length - 1];
    if (lastWord === lastWord.toUpperCase() && lastWord.length > 1) {
      return {
        firstName: capitalize(words[0]),
        lastName: capitalize(lastWord),
        role,
      };
    }
    // Otherwise assume "FIRSTNAME LASTNAME"
    return {
      firstName: capitalize(words[0]),
      lastName: capitalize(words[words.length - 1]),
      role,
    };
  }

  return undefined;
}

function capitalizeRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    .replace(/président/i, "Président")
    .replace(/gérant/i, "Gérant")
    .replace(/directeur/i, "Directeur");
}

/**
 * Extract person info from the listepersonnes structure.
 * The structure varies but commonly looks like:
 * - Array of objects with nom, prenom, qualite/role
 * - Object with personnePhysique/personneMorale entries
 */
function extractPersonFromList(data: unknown): BodaccDirigeant | undefined {
  if (!data) return undefined;

  // If it's an array, iterate to find a physical person
  if (Array.isArray(data)) {
    for (const item of data) {
      const person = extractSinglePerson(item);
      if (person) return person;
    }
    return undefined;
  }

  // If it's an object, check common structures
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;

    // Check for nested person arrays
    for (const key of ["personnePhysique", "personne_physique", "personnes", "personne"]) {
      if (obj[key]) {
        const items = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
        for (const item of items as unknown[]) {
          const person = extractSinglePerson(item);
          if (person) return person;
        }
      }
    }

    // Try the object itself as a person
    return extractSinglePerson(obj);
  }

  return undefined;
}

function extractSinglePerson(item: unknown): BodaccDirigeant | undefined {
  if (!item || typeof item !== "object") return undefined;
  const obj = item as Record<string, unknown>;

  const nom = obj.nom || obj.Nom || obj.name || obj.lastName;
  const prenom = obj.prenom || obj.Prenom || obj.prenoms || obj.Prenoms || obj.firstName;
  const role = obj.qualite || obj.Qualite || obj.role || obj.fonction || obj.Fonction || "Dirigeant";

  if (typeof nom === "string" && nom.length > 0) {
    return {
      firstName: typeof prenom === "string" ? capitalize(prenom.split(/[\s,]+/)[0]) : "",
      lastName: capitalize(nom),
      role: typeof role === "string" ? role : "Dirigeant",
    };
  }

  return undefined;
}

function tryParseJson(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Fetch BODACC immatriculations for a given date
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Array of parsed leads
 */
export async function fetchBodaccCreations(date: string): Promise<BodaccLead[]> {
  const allLeads: BodaccLead[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    // V2.1 API with ODSQL where clause + refine facet
    const where = encodeURIComponent(`dateparution=date'${date}'`);
    const refine = encodeURIComponent("familleavis:immatriculation");
    const url = `${BASE_URL}?where=${where}&refine=${refine}&limit=${limit}&offset=${offset}&order_by=dateparution%20DESC`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`BODACC API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const records = data.results || [];

    // Log first record fields for diagnostics (helps discover new API fields)
    if (offset === 0 && records.length > 0) {
      console.log("[BODACC] Sample record fields:", Object.keys(records[0]).join(", "));
    }

    for (const record of records) {
      const companyName = String(record.denomination || record.commercant || "");
      if (!companyName) continue;

      const postalCode = String(record.cp || record.numerodepartement || "");
      const siren = extractSiren(record.registre);

      // Build full address from available fields
      const addressParts = [
        record.adresse,
        record.cp,
        record.ville,
      ].filter(Boolean).map(String);
      const fullAddress = addressParts.join(" ").trim() || String(record.adresse || "");

      // Extract dirigeant directly from BODACC data
      const dirigeant = extractDirigeant(record as Record<string, unknown>);

      allLeads.push({
        bodaccId: String(record.id || `bodacc-${offset}`),
        companyName: companyName.trim(),
        legalForm: String(record.formejuridique || ""),
        capital: parseCapital(record.montantcapital),
        activity: String(record.activite || ""),
        city: String(record.ville || ""),
        postalCode,
        region: getRegion(postalCode),
        address: fullAddress,
        bodaccDate: date,
        siren,
        dirigeant,
      });
    }

    hasMore = records.length === limit;
    offset += limit;

    // Safety: max 2000 records per day
    if (offset > 2000) break;
  }

  return allLeads;
}
