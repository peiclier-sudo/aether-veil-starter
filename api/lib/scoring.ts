/**
 * Lead scoring and outreach generation
 *
 * Two modes:
 * 1. Rule-based scoring (free, instant) — default
 * 2. DeepSeek AI scoring (ultra-cheap, smarter) — when API key is set
 */

interface LeadForScoring {
  companyName: string;
  legalForm: string;
  capital: number;
  activity: string;
  nafCode?: string;
  city: string;
  region: string;
  hasDomain: boolean;
  hasWebsite: boolean;
  websiteStack: string[];
  employeeEstimate?: string;
}

interface ScoringResult {
  vertical: "agence-web" | "expert-comptable" | "assureur";
  score: number;
  reasons: string[];
  tags: string[];
  outreachAngle: string;
}

/* ── NAF codes that signal specific verticals ─── */

const B2C_NAF_PREFIXES = [
  "47", // Retail
  "56", // Food & drink
  "96", // Personal services
  "55", // Hotels
  "93", // Sports
  "86", // Health
  "85", // Education
];

const RISK_NAF_PREFIXES = [
  "41",
  "42",
  "43", // Construction/BTP
  "49",
  "50",
  "51",
  "52", // Transport
  "56", // Restaurants
  "80", // Security
  "81", // Building services
];

const COMPLEX_LEGAL_FORMS = ["SAS", "SARL", "SA", "SCA", "SNC"];
const SIMPLE_LEGAL_FORMS = ["EURL", "SASU", "EI", "EIRL"];

/* ── Rule-based scoring per vertical ──────────── */

function scoreForWebAgency(lead: LeadForScoring): {
  score: number;
  reasons: string[];
  tags: string[];
} {
  let score = 30; // Base
  const reasons: string[] = [];
  const tags: string[] = [];

  // No website = high-value prospect
  if (!lead.hasDomain) {
    score += 25;
    reasons.push("Aucun domaine détecté");
    tags.push("Pas de site web");
  } else if (!lead.hasWebsite) {
    score += 15;
    reasons.push("Domaine enregistré mais pas de site");
    tags.push("Domaine sans site");
  } else if (lead.websiteStack.includes("Wix") || lead.websiteStack.includes("WordPress")) {
    score += 10;
    reasons.push(`Site ${lead.websiteStack[0]} — potentiel refonte`);
    tags.push("Refonte potentielle");
  }

  // B2C activity = needs customer-facing website
  const naf2 = (lead.nafCode || "").slice(0, 2);
  if (B2C_NAF_PREFIXES.includes(naf2)) {
    score += 15;
    reasons.push("Activité B2C — besoin de visibilité en ligne");
    tags.push("B2C");
  }

  // Higher capital = more serious business
  if (lead.capital >= 10000) {
    score += 10;
    reasons.push("Capital significatif (> 10 000€)");
    tags.push("Fort potentiel digital");
  } else if (lead.capital >= 2000) {
    score += 5;
  }

  // Urban area = more competition = more need for digital
  const urbanRegions = ["Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur"];
  if (urbanRegions.includes(lead.region)) {
    score += 5;
    tags.push("Zone urbaine");
  }

  return { score: Math.min(score, 98), reasons, tags };
}

function scoreForAccountant(lead: LeadForScoring): {
  score: number;
  reasons: string[];
  tags: string[];
} {
  let score = 25;
  const reasons: string[] = [];
  const tags: string[] = [];

  // Complex legal forms need accountants
  if (COMPLEX_LEGAL_FORMS.some((f) => lead.legalForm.toUpperCase().includes(f))) {
    score += 20;
    reasons.push(`${lead.legalForm} — structure nécessitant un EC`);
    tags.push("Structure complexe");
  }

  // High capital = complex accounting
  if (lead.capital >= 50000) {
    score += 20;
    reasons.push("Capital > 50 000€ — comptabilité complexe");
    tags.push("Capital élevé");
  } else if (lead.capital >= 10000) {
    score += 10;
    reasons.push("Capital significatif");
  }

  // Regulated activities
  const regulated = ["Agence immobilière", "Architecture", "Formation", "Sécurité"];
  if (regulated.some((r) => lead.activity.toLowerCase().includes(r.toLowerCase()))) {
    score += 15;
    reasons.push("Activité réglementée — obligations comptables renforcées");
    tags.push("Activité réglementée");
  }

  // Multi-employee signals
  if (lead.employeeEstimate && lead.employeeEstimate !== "0" && lead.employeeEstimate !== "Non estimé") {
    score += 10;
    reasons.push("Salariés probables — paie à gérer");
    tags.push("Paie à gérer");
  }

  return { score: Math.min(score, 98), reasons, tags };
}

function scoreForInsurer(lead: LeadForScoring): {
  score: number;
  reasons: string[];
  tags: string[];
} {
  let score = 30;
  const reasons: string[] = [];
  const tags: string[] = [];

  // Risk activities
  const naf2 = (lead.nafCode || "").slice(0, 2);
  if (RISK_NAF_PREFIXES.includes(naf2)) {
    score += 25;
    reasons.push("Secteur à risque — assurance obligatoire/critique");
    tags.push("Risque métier");
    tags.push("RC Pro requise");
  }

  // All businesses need RC Pro
  score += 10;
  reasons.push("RC Pro nécessaire pour toute activité");

  // Physical premises likely
  const physicalActivities = ["Restauration", "Commerce", "Boulangerie", "Coiffure"];
  if (physicalActivities.some((a) => lead.activity.toLowerCase().includes(a.toLowerCase()))) {
    score += 15;
    reasons.push("Local commercial probable — multirisque recommandé");
    tags.push("Local commercial");
  }

  // Higher capital = more to insure
  if (lead.capital >= 20000) {
    score += 10;
    reasons.push("Capital élevé — actifs à protéger");
    tags.push("Stock marchandises");
  }

  // Transport = vehicles
  if (lead.activity.toLowerCase().includes("transport")) {
    score += 10;
    tags.push("Véhicules pro");
  }

  return { score: Math.min(score, 98), reasons, tags };
}

/**
 * Determine best vertical for a lead and score it
 */
export function ruleBasedScore(lead: LeadForScoring): ScoringResult {
  const webScore = scoreForWebAgency(lead);
  const acctScore = scoreForAccountant(lead);
  const insScore = scoreForInsurer(lead);

  // Pick the highest-scoring vertical
  const scores = [
    { vertical: "agence-web" as const, ...webScore },
    { vertical: "expert-comptable" as const, ...acctScore },
    { vertical: "assureur" as const, ...insScore },
  ];

  const best = scores.sort((a, b) => b.score - a.score)[0];

  return {
    vertical: best.vertical,
    score: best.score,
    reasons: best.reasons,
    tags: best.tags,
    outreachAngle: generateRuleBasedOutreach(lead, best.vertical),
  };
}

function generateRuleBasedOutreach(
  lead: LeadForScoring,
  vertical: string
): string {
  const name = lead.companyName;
  const city = lead.city;

  switch (vertical) {
    case "agence-web":
      if (!lead.hasDomain) {
        return `Félicitations pour la création de ${name} ! Votre activité de ${lead.activity.toLowerCase()} à ${city} mérite une présence en ligne professionnelle. Nous créons des sites web performants pour les jeunes entreprises — parlons de votre projet.`;
      }
      return `${name} vient d'être créée — c'est le moment idéal pour construire votre stratégie digitale. En tant que nouvelle entreprise à ${city}, un site web professionnel vous donnera un avantage décisif.`;

    case "expert-comptable":
      return `Félicitations pour la création de votre ${lead.legalForm} ! Les obligations comptables et fiscales démarrent dès J1. Notre cabinet accompagne les entreprises de ${city} dans leurs premiers exercices — un premier échange de 15 minutes ?`;

    case "assureur":
      return `Votre nouvelle activité de ${lead.activity.toLowerCase()} à ${city} nécessite une couverture adaptée : RC Pro, multirisque local, protection du dirigeant. Obtenez un devis comparatif en 24h — sans engagement.`;

    default:
      return `Félicitations pour la création de ${name} à ${city} !`;
  }
}

/* ── DeepSeek AI scoring (optional upgrade) ────── */

export async function deepseekScore(
  lead: LeadForScoring,
  vertical: "agence-web" | "expert-comptable" | "assureur",
  apiKey: string
): Promise<{ score: number; reasons: string[]; outreachAngle: string } | null> {
  const verticalLabels = {
    "agence-web": "agence web (création de sites, SEO, marketing digital)",
    "expert-comptable": "cabinet d'expert-comptable",
    assureur: "courtier en assurance ou assureur",
  };

  const prompt = `Tu es un expert en qualification de leads B2B en France.

Voici une entreprise nouvellement créée :
- Nom : ${lead.companyName}
- Forme juridique : ${lead.legalForm}
- Capital : ${lead.capital}€
- Activité : ${lead.activity}
- Code NAF : ${lead.nafCode || "inconnu"}
- Ville : ${lead.city} (${lead.region})
- A un site web : ${lead.hasWebsite ? "oui" : "non"}
- A un domaine : ${lead.hasDomain ? "oui" : "non"}
- Stack web : ${lead.websiteStack.join(", ") || "aucune"}

Tu dois la qualifier pour un(e) ${verticalLabels[vertical]}.

Réponds en JSON strict :
{
  "score": <nombre 0-100>,
  "reasons": ["raison 1", "raison 2", "raison 3"],
  "outreach": "<message d'accroche commercial personnalisé de 2 phrases max>"
}

Critères de scoring :
- 80-100 : prospect très chaud, besoin évident et urgent
- 60-79 : bon prospect, besoin probable
- 40-59 : prospect moyen, besoin possible
- 0-39 : prospect froid, peu pertinent

Sois concis et précis.`;

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      reasons: parsed.reasons || [],
      outreachAngle: parsed.outreach || "",
    };
  } catch {
    return null;
  }
}
