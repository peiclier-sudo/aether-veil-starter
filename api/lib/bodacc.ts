/**
 * BODACC data fetching via the official API
 *
 * Source: https://bodacc-datadila.opendatasoft.com
 * Free, no auth required, returns JSON.
 *
 * We fetch "immatriculations" (business creations) from the BODACC-A bulletin.
 */

/**
 * Actual top-level fields returned by the BODACC V2.1 API.
 * Nested data lives inside acte, listepersonnes, listeetablissements.
 */
interface BodaccApiRecord {
  id: string;
  dateparution?: string;
  numerodepartement?: string;
  tribunal?: string;
  commercant?: string;
  ville?: string;
  cp?: string;
  registre?: string;
  // Nested structured fields (objects or JSON strings)
  acte?: Record<string, unknown>;
  listepersonnes?: unknown;
  listeetablissements?: unknown;
  modificationsgenerales?: Record<string, unknown>;
  [key: string]: unknown;
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

  // ── Source 2: acte field may contain mandataires / administration info ──
  if (record.acte && typeof record.acte === "object") {
    const acteFlat = flattenObject(record.acte as Record<string, unknown>);
    // Look for administration/mandataire text in the acte
    const adminText = findString(acteFlat, [
      "administration", "mandataires", "mandatairesSociaux",
      "listeGerant", "gerant", "president",
    ]);
    if (adminText) {
      const person = extractDirigeantFromText(adminText);
      if (person) return person;
      // Also try as a direct name string
      const p2 = parseNameString(adminText, "Dirigeant");
      if (p2) return p2;
    }
  }

  // ── Source 3: commercant field for personnes physiques ──
  // When both denomination (company name) and commercant (person name) exist,
  // commercant is the dirigeant of the société.
  // When only commercant exists, it's an entreprise individuelle (person IS the company).
  if (record.commercant) {
    const commercant = String(record.commercant).trim();
    // Only parse as dirigeant if there's a comma (NOM, Prénoms format)
    // or if there's also a denomination (meaning commercant is the person)
    const acte = parseActe(record.acte);
    if (acte.denomination || commercant.includes(",")) {
      const person = parseNameString(commercant, "Dirigeant");
      if (person) return person;
    }
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

// ── Helpers to extract data from nested BODACC structures ──

interface ParsedActe {
  denomination?: string;
  formeJuridique?: string;
  capital?: number;
  activite?: string;
  adresse?: string;
}

/**
 * Parse the `acte` field which contains denomination, forme juridique,
 * capital, activité, and sometimes address info.
 * The structure can vary but commonly looks like:
 * { creation: { denomination, formeJuridique, ... }, descriptionEtablissement: { ... } }
 * or flattened: { denomination, formeJuridique, capitalActe: { montantCapital, devise }, ... }
 */
function parseActe(acte: unknown): ParsedActe {
  const result: ParsedActe = {};
  if (!acte || typeof acte !== "object") return result;
  const obj = acte as Record<string, unknown>;

  // Walk the object tree to find known keys at any depth
  const flat = flattenObject(obj);

  result.denomination = findString(flat, [
    "denomination", "denominationSuite", "nomCommercial",
    "denomination.denomination",
  ]);

  result.formeJuridique = findString(flat, [
    "formeJuridique", "formesjuridiques", "forme_juridique",
  ]);

  result.activite = findString(flat, [
    "activite", "activitePrincipale", "descriptif",
  ]);

  // Capital parsing: look for montantCapital or capitalActe.montantCapital
  const capitalStr = findString(flat, [
    "montantCapital", "capital", "capitalActe",
  ]);
  if (capitalStr) {
    result.capital = parseCapital(capitalStr);
  }

  // Address from acte (less common, usually in listeetablissements)
  const adresseStr = findString(flat, [
    "adresse", "numeroVoie", "typeVoie", "nomVoie",
  ]);
  if (adresseStr) {
    result.adresse = adresseStr;
  }

  return result;
}

interface ParsedEtablissement {
  adresse: string;
  codePostal?: string;
  ville?: string;
}

/**
 * Parse `listeetablissements` to get the full address.
 * Can be an array of establishments or a single object.
 */
function parseEtablissements(data: unknown): ParsedEtablissement | undefined {
  if (!data) return undefined;
  const parsed = typeof data === "string" ? tryParseJson(data) : data;
  if (!parsed) return undefined;

  // Get first establishment
  const items = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const flat = flattenObject(item as Record<string, unknown>);

    // Build full address from parts
    const parts: string[] = [];
    const numVoie = findString(flat, ["numeroVoie", "numero_voie", "numVoie"]);
    const typeVoie = findString(flat, ["typeVoie", "type_voie"]);
    const nomVoie = findString(flat, ["nomVoie", "nom_voie", "voie"]);
    const complement = findString(flat, ["complementAdresse", "complement", "lieuDit"]);
    const cp = findString(flat, ["codePostal", "code_postal", "cp"]);
    const ville = findString(flat, ["ville", "commune", "localite"]);

    if (numVoie) parts.push(numVoie);
    if (typeVoie) parts.push(typeVoie);
    if (nomVoie) parts.push(nomVoie);
    if (complement) parts.push(complement);

    // Also try a direct "adresse" field
    const directAddr = findString(flat, ["adresse", "adresseComplete"]);
    const addressLine = parts.length > 0 ? parts.join(" ") : (directAddr || "");

    if (addressLine || cp || ville) {
      return {
        adresse: [addressLine, cp, ville].filter(Boolean).join(" ").trim(),
        codePostal: cp,
        ville: ville,
      };
    }
  }

  return undefined;
}

/**
 * Flatten a nested object into dot-separated keys for easy lookup.
 * E.g. { a: { b: "c" } } -> { "a.b": "c" }
 * Stops at depth 4 to avoid infinite recursion.
 */
function flattenObject(obj: Record<string, unknown>, prefix = "", depth = 0): Record<string, unknown> {
  if (depth > 4) return {};
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    result[fullKey] = value;
    // Also store under just the leaf key for convenience
    result[key] = result[key] ?? value;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey, depth + 1));
    }
  }

  return result;
}

/**
 * Find the first non-empty string value matching any of the candidate keys.
 */
function findString(flat: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const val = flat[key];
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
    if (typeof val === "number") return String(val);
  }
  return undefined;
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

    // Log first record's nested structures for diagnostics
    if (offset === 0 && records.length > 0) {
      const r = records[0];
      console.log("[BODACC] Sample record fields:", Object.keys(r).join(", "));
      if (r.acte) console.log("[BODACC] Sample acte:", JSON.stringify(r.acte).slice(0, 500));
      if (r.listepersonnes) console.log("[BODACC] Sample listepersonnes:", JSON.stringify(r.listepersonnes).slice(0, 500));
      if (r.listeetablissements) console.log("[BODACC] Sample listeetablissements:", JSON.stringify(r.listeetablissements).slice(0, 500));
    }

    for (const record of records) {
      // Parse nested structures
      const acte = parseActe(record.acte);
      const etablissement = parseEtablissements(record.listeetablissements);

      // Company name: acte.denomination > commercant
      const companyName = acte.denomination || String(record.commercant || "");
      if (!companyName) continue;

      // Postal code: etablissement > top-level cp > departement
      const postalCode = etablissement?.codePostal || String(record.cp || record.numerodepartement || "");
      const siren = extractSiren(record.registre);

      // City: etablissement > top-level ville
      const city = etablissement?.ville || String(record.ville || "");

      // Full address: etablissement > fallback to "cp ville"
      const fullAddress = etablissement?.adresse
        || [record.cp, record.ville].filter(Boolean).map(String).join(" ").trim()
        || "";

      // Extract dirigeant directly from BODACC data
      const dirigeant = extractDirigeant(record as Record<string, unknown>);

      allLeads.push({
        bodaccId: String(record.id || `bodacc-${offset}`),
        companyName: companyName.trim(),
        legalForm: acte.formeJuridique || "",
        capital: acte.capital || 0,
        activity: acte.activite || "",
        city,
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
