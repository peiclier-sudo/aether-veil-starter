/**
 * BODACC data fetching via the official API
 *
 * Source: https://bodacc-datadila.opendatasoft.com
 * Free, no auth required, returns JSON.
 *
 * We fetch "immatriculations" (business creations) from the BODACC-A bulletin.
 *
 * The API returns nested data as JSON *strings* inside three fields:
 *   - listepersonnes: {personne: {typePersonne, denomination, formeJuridique, capital, administration, adresseSiegeSocial, ...}}
 *   - listeetablissements: {etablissement: {activite, adresse: {numeroVoie, typeVoie, nomVoie, codePostal, ville}}}
 *   - acte: {descriptif, dateImmatriculation, immatriculation: {categorieImmatriculation}}
 */

// ── Exported types ──────────────────────────────────

export interface BodaccDirigeant {
  firstName: string;
  lastName: string;
  role: string;
}

export interface BodaccLead {
  bodaccId: string;
  companyName: string;
  nomCommercial?: string;
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
  creationDate?: string;
}

// ── Constants ───────────────────────────────────────

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

// ── Small helpers ───────────────────────────────────

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
  const str = typeof registre === "string" ? registre : JSON.stringify(registre);
  const match = str.match(/(\d[\d\s]{8,})/);
  if (!match) return "";
  return match[1].replace(/\s/g, "").slice(0, 9);
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function tryParse(val: unknown): Record<string, unknown> | null {
  if (!val) return null;
  if (typeof val === "object") return val as Record<string, unknown>;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return null; }
  }
  return null;
}

// ── Address helper ──────────────────────────────────

interface BodaccAddress {
  numeroVoie?: string;
  typeVoie?: string;
  nomVoie?: string;
  complementAdresse?: string;
  codePostal?: string;
  ville?: string;
}

function formatAddress(addr: BodaccAddress): string {
  const street = [addr.numeroVoie, addr.typeVoie, addr.nomVoie]
    .filter(Boolean).join(" ");
  const parts = [street, addr.complementAdresse, addr.codePostal, addr.ville]
    .filter(Boolean);
  return parts.join(" ").trim();
}

// ── Parse listepersonnes ────────────────────────────
// Structure: JSON string -> {personne: {...}} or {personne: [{...}, ...]}
// PM: {typePersonne: "pm", denomination, formeJuridique, capital: {montantCapital, devise},
//      administration: "Gérant : NOM Prénom", adresseSiegeSocial: {...}}
// PP: {typePersonne: "pp", nom, prenom, nomCommercial, nationalite}

interface PersonneData {
  typePersonne?: string;
  // PM fields
  denomination?: string;
  formeJuridique?: string;
  capital?: { montantCapital?: string; devise?: string };
  administration?: string;
  adresseSiegeSocial?: BodaccAddress;
  // PP fields
  nom?: string;
  prenom?: string;
  nomCommercial?: string;
}

function parseListePersonnes(raw: unknown): PersonneData | null {
  const obj = tryParse(raw);
  if (!obj) return null;

  // Can be {personne: {...}} or {personne: [{...}, ...]}
  const personne = obj.personne;
  if (!personne) return null;

  // Take first person if array
  const p = Array.isArray(personne) ? personne[0] : personne;
  if (!p || typeof p !== "object") return null;

  return p as PersonneData;
}

// ── Parse listeetablissements ───────────────────────
// Structure: JSON string -> {etablissement: {activite, qualiteEtablissement, adresse: {...}}}

interface EtablissementData {
  activite?: string;
  adresse?: BodaccAddress;
}

function parseListeEtablissements(raw: unknown): EtablissementData | null {
  const obj = tryParse(raw);
  if (!obj) return null;

  const etab = obj.etablissement;
  if (!etab || typeof etab !== "object") return null;

  const e = (Array.isArray(etab) ? etab[0] : etab) as Record<string, unknown>;
  return {
    activite: typeof e.activite === "string" ? e.activite : undefined,
    adresse: e.adresse && typeof e.adresse === "object" ? e.adresse as BodaccAddress : undefined,
  };
}

// ── Parse acte ──────────────────────────────────────
// Structure: JSON string -> {descriptif, dateImmatriculation, dateCommencementActivite, ...}

interface ActeData {
  dateImmatriculation?: string;
  dateCommencementActivite?: string;
  descriptif?: string;
}

function parseActe(raw: unknown): ActeData {
  const obj = tryParse(raw);
  if (!obj) return {};
  return {
    dateImmatriculation: typeof obj.dateImmatriculation === "string" ? obj.dateImmatriculation : undefined,
    dateCommencementActivite: typeof obj.dateCommencementActivite === "string" ? obj.dateCommencementActivite : undefined,
    descriptif: typeof obj.descriptif === "string" ? obj.descriptif : undefined,
  };
}

// ── Extract dirigeant from administration text ──────
// Format: "Gérant, Associé indéfiniment responsable : MAUPAS Jean-François"
// or: "Gérant : NOM Prénom" / "Président : NOM Prénom"

function extractDirigeantFromAdmin(administration: string): BodaccDirigeant | undefined {
  if (!administration) return undefined;

  // Extract role and name. Format: "Role1, Role2 : NOM Prénom"
  const match = administration.match(
    /(?:G[ée]rant|Pr[ée]sident|Directeur\s+g[ée]n[ée]ral|Associ[ée]\s+g[ée]rant)[^:]*:\s*(.+)/i
  );

  if (!match) return undefined;

  const nameStr = match[0];
  // Extract the specific role
  const roleMatch = nameStr.match(
    /(G[ée]rant|Pr[ée]sident|Directeur\s+g[ée]n[ée]ral|Associ[ée]\s+g[ée]rant)/i
  );
  const role = roleMatch ? capitalize(roleMatch[1]) : "Dirigeant";

  // Name part is after the colon
  const namePart = match[1].trim();
  if (!namePart || namePart.length < 2) return undefined;

  // Format: "MAUPAS Jean-François" (ALLCAPS lastname then firstname)
  const words = namePart.split(/\s+/);
  if (words.length >= 2) {
    // Find where uppercase words end — those are the last name
    let lastNameParts: string[] = [];
    let firstNameParts: string[] = [];
    let foundFirstName = false;

    for (const word of words) {
      if (!foundFirstName && word === word.toUpperCase() && word.length > 1) {
        lastNameParts.push(word);
      } else {
        foundFirstName = true;
        firstNameParts.push(word);
      }
    }

    // If all words were uppercase, treat first as lastname rest as firstname
    if (!foundFirstName && lastNameParts.length >= 2) {
      const last = lastNameParts[0];
      firstNameParts = lastNameParts.slice(1);
      lastNameParts = [last];
    }

    if (lastNameParts.length > 0 && firstNameParts.length > 0) {
      return {
        firstName: capitalize(firstNameParts[0]),
        lastName: capitalize(lastNameParts.join(" ")),
        role,
      };
    }
  }

  // Single word fallback
  if (words.length === 1) {
    return { firstName: "", lastName: capitalize(words[0]), role };
  }

  return undefined;
}

// ── Extract dirigeant from PP (personne physique) ───

function extractDirigeantFromPP(personne: PersonneData): BodaccDirigeant | undefined {
  if (!personne.nom || typeof personne.nom !== "string") return undefined;
  const prenomStr = typeof personne.prenom === "string" ? personne.prenom : String(personne.prenom || "");
  const firstName = prenomStr
    ? capitalize(prenomStr.split(/[,\s]+/)[0])
    : "";
  return {
    firstName,
    lastName: capitalize(personne.nom),
    role: "Dirigeant",
  };
}

// ── Main fetch function ─────────────────────────────

export async function fetchBodaccCreations(date: string): Promise<BodaccLead[]> {
  const allLeads: BodaccLead[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const where = encodeURIComponent(`dateparution=date'${date}'`);
    const refine = encodeURIComponent("familleavis:immatriculation");
    const url = `${BASE_URL}?where=${where}&refine=${refine}&limit=${limit}&offset=${offset}&order_by=dateparution%20DESC`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`BODACC API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const records = data.results || [];

    for (const record of records) {
      // Parse the three nested JSON string fields
      const personne = parseListePersonnes(record.listepersonnes);
      const etab = parseListeEtablissements(record.listeetablissements);
      const acte = parseActe(record.acte);

      // Skip re-registrations due to HQ transfers — these are existing companies, not new ones
      if (acte.descriptif && /transfert\s+(de\s+)?(son\s+)?si[èe]ge/i.test(acte.descriptif)) {
        continue;
      }

      // ── Company name ──
      // PM: personne.denomination, PP: commercant or nomCommercial
      const companyName =
        personne?.denomination ||
        personne?.nomCommercial ||
        String(record.commercant || "");
      if (!companyName) continue;

      // ── Legal form (PM only) ──
      const legalForm = personne?.formeJuridique || "";

      // Skip SCIs — real estate holding companies, not real business leads
      if (/soci[ée]t[ée]\s+civile\s+immobili[eè]re/i.test(legalForm) || /\bSCI\b/.test(legalForm)) {
        continue;
      }

      // ── Capital (PM only) ──
      const capital = parseCapital(personne?.capital?.montantCapital);

      // ── Activity (from etablissement) ──
      const activity = etab?.activite || "";

      // ── Address: prefer adresseSiegeSocial (PM), then etablissement address, then top-level cp/ville ──
      const addr = personne?.adresseSiegeSocial || etab?.adresse;
      const postalCode = addr?.codePostal || String(record.cp || record.numerodepartement || "");
      const city = addr?.ville || String(record.ville || "");
      const fullAddress = addr
        ? formatAddress(addr)
        : [record.cp, record.ville].filter(Boolean).map(String).join(" ").trim();

      // ── SIREN ──
      const siren = extractSiren(record.registre);

      // ── Dirigeant ──
      let dirigeant: BodaccDirigeant | undefined;
      if (personne?.typePersonne === "pm" && personne.administration && typeof personne.administration === "string") {
        // PM: parse "Gérant : NOM Prénom" from administration text
        dirigeant = extractDirigeantFromAdmin(personne.administration);
      } else if (personne?.typePersonne === "pp") {
        // PP: the person IS the dirigeant
        dirigeant = extractDirigeantFromPP(personne);
      }

      // ── Nom commercial (alternative trading name) ──
      const nomCommercial =
        personne?.nomCommercial && personne.nomCommercial !== companyName
          ? personne.nomCommercial.trim()
          : undefined;

      // ── Creation date ──
      const creationDate = acte.dateImmatriculation || acte.dateCommencementActivite;

      allLeads.push({
        bodaccId: String(record.id || `bodacc-${offset}`),
        companyName: companyName.trim(),
        nomCommercial,
        legalForm,
        capital,
        activity,
        city,
        postalCode,
        region: getRegion(postalCode),
        address: fullAddress,
        bodaccDate: date,
        siren,
        dirigeant,
        creationDate,
      });
    }

    hasMore = records.length === limit;
    offset += limit;
    if (offset > 2000) break;
  }

  return allLeads;
}
