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

function parseCapital(raw?: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned) || 0);
}

function extractSiren(registre?: string): string {
  if (!registre) return "";
  // Pattern: "RCS Paris 123 456 789" or "RCS Paris B 123456789"
  const match = registre.match(/(\d[\d\s]{8,})/);
  if (!match) return "";
  return match[1].replace(/\s/g, "").slice(0, 9);
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
    // V2.1 API with SQL-like where clause
    const where = encodeURIComponent(
      `dateparution='${date}' AND familleavis_lib='Immatriculation'`
    );
    const url = `${BASE_URL}?where=${where}&limit=${limit}&offset=${offset}&order_by=dateparution%20DESC`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`BODACC API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const records = data.results || [];

    for (const record of records) {
      const companyName = record.denomination || record.commercant || "";
      if (!companyName) continue;

      const postalCode = record.cp || record.numerodepartement || "";
      const siren = extractSiren(record.registre);

      allLeads.push({
        bodaccId: record.id || `bodacc-${offset}`,
        companyName: companyName.trim(),
        legalForm: record.formejuridique || "",
        capital: parseCapital(record.montantcapital),
        activity: record.activite || "",
        city: record.ville || "",
        postalCode,
        region: getRegion(postalCode),
        address: record.adresse || "",
        bodaccDate: date,
        siren,
      });
    }

    hasMore = records.length === limit;
    offset += limit;

    // Safety: max 2000 records per day
    if (offset > 2000) break;
  }

  return allLeads;
}
