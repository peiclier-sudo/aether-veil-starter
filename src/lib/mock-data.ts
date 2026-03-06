import type { Lead, DailyStats, VerticalConfig, PricingPlan } from "./types";

export const verticals: VerticalConfig[] = [
  {
    id: "agence-web",
    label: "Agences Web",
    description:
      "Nouvelles entreprises ayant besoin de site web, branding ou présence digitale",
    icon: "Globe",
    color: "#6366f1",
    criteria: [
      "Pas de site web détecté",
      "Secteur B2C ou services",
      "Capital > 1 000 €",
      "Zone urbaine",
    ],
  },
  {
    id: "expert-comptable",
    label: "Experts-Comptables",
    description:
      "Nouvelles structures nécessitant un accompagnement comptable et fiscal",
    icon: "Calculator",
    color: "#10b981",
    criteria: [
      "Forme juridique SAS/SARL/EURL",
      "Capital social significatif",
      "Activité réglementée",
      "Multi-associés",
    ],
  },
  {
    id: "assureur",
    label: "Assureurs",
    description:
      "Entreprises nouvellement créées nécessitant des assurances professionnelles",
    icon: "Shield",
    color: "#f59e0b",
    criteria: [
      "Activité à risque identifié",
      "Local commercial probable",
      "Employés estimés",
      "Véhicules professionnels",
    ],
  },
];

const firstNames = [
  "Thomas",
  "Marie",
  "Pierre",
  "Sophie",
  "Jean",
  "Camille",
  "Nicolas",
  "Julie",
  "François",
  "Claire",
  "Alexandre",
  "Isabelle",
  "Laurent",
  "Nathalie",
  "David",
  "Stéphanie",
  "Julien",
  "Céline",
  "Romain",
  "Émilie",
];
const lastNames = [
  "Martin",
  "Bernard",
  "Dubois",
  "Thomas",
  "Robert",
  "Richard",
  "Petit",
  "Durand",
  "Leroy",
  "Moreau",
  "Simon",
  "Laurent",
  "Lefebvre",
  "Michel",
  "Garcia",
  "Roux",
  "Fontaine",
  "Blanc",
  "Girard",
  "André",
];
const cities = [
  { name: "Paris", postal: "75001", region: "Île-de-France" },
  { name: "Lyon", postal: "69001", region: "Auvergne-Rhône-Alpes" },
  { name: "Marseille", postal: "13001", region: "Provence-Alpes-Côte d'Azur" },
  { name: "Toulouse", postal: "31000", region: "Occitanie" },
  { name: "Bordeaux", postal: "33000", region: "Nouvelle-Aquitaine" },
  { name: "Nantes", postal: "44000", region: "Pays de la Loire" },
  { name: "Lille", postal: "59000", region: "Hauts-de-France" },
  { name: "Strasbourg", postal: "67000", region: "Grand Est" },
  { name: "Rennes", postal: "35000", region: "Bretagne" },
  { name: "Montpellier", postal: "34000", region: "Occitanie" },
];
const activities = [
  { name: "Conseil en informatique", naf: "6202A" },
  { name: "Restauration traditionnelle", naf: "5610A" },
  { name: "Commerce de détail", naf: "4711B" },
  { name: "Agence immobilière", naf: "6831Z" },
  { name: "Formation professionnelle", naf: "8559A" },
  { name: "Travaux de maçonnerie", naf: "4399C" },
  { name: "Transport routier", naf: "4941A" },
  { name: "Coiffure", naf: "9602A" },
  { name: "Boulangerie-pâtisserie", naf: "1071C" },
  { name: "Architecture", naf: "7111Z" },
  { name: "Conseil en gestion", naf: "7022Z" },
  { name: "E-commerce", naf: "4791A" },
  { name: "Développement web", naf: "6201Z" },
  { name: "Marketing digital", naf: "7311Z" },
  { name: "Sécurité privée", naf: "8010Z" },
];
const legalForms = ["SAS", "SARL", "EURL", "SAS à capital variable", "SASU"];
const tags: Record<string, string[]> = {
  "agence-web": [
    "Pas de site web",
    "B2C",
    "Nouveau marché",
    "Fort potentiel digital",
    "SEO urgent",
    "E-commerce potentiel",
  ],
  "expert-comptable": [
    "Multi-associés",
    "Capital élevé",
    "Besoin TVA",
    "Activité réglementée",
    "Paie à gérer",
    "SCI détectée",
  ],
  assureur: [
    "RC Pro requise",
    "Local commercial",
    "Véhicules pro",
    "Stock marchandises",
    "Risque métier",
    "Multi-risques",
  ],
};
const outreachAngles: Record<string, string[]> = {
  "agence-web": [
    "Votre nouvelle entreprise mérite une vitrine digitale à la hauteur de vos ambitions. Nous créons des sites web performants pour les jeunes entreprises.",
    "Félicitations pour la création de votre société ! Saviez-vous que 80% des clients recherchent en ligne avant d'acheter ? Parlons de votre stratégie digitale.",
    "En tant que nouvelle entreprise, votre présence en ligne est cruciale. Nous pouvons vous aider à vous démarquer dès le départ.",
  ],
  "expert-comptable": [
    "La création de votre entreprise implique de nombreuses obligations comptables et fiscales. Notre cabinet vous accompagne dès le premier jour.",
    "Félicitations ! Pour bien démarrer, un expert-comptable est votre meilleur allié. Nous simplifions la comptabilité des jeunes entreprises.",
    "Votre structure multi-associés nécessite un suivi comptable rigoureux. Nous sommes spécialisés dans l'accompagnement des nouvelles sociétés.",
  ],
  assureur: [
    "Votre nouvelle activité comporte des risques spécifiques qui nécessitent une couverture adaptée. Protégez votre entreprise dès sa création.",
    "En tant que nouvel entrepreneur, votre responsabilité civile professionnelle est essentielle. Découvrez nos offres dédiées aux créateurs.",
    "Félicitations pour cette création ! Avez-vous pensé à protéger votre local, vos équipements et votre activité ? Parlons assurance.",
  ],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSiren(): string {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

function generateLead(index: number): Lead {
  const vertical = randomItem(verticals);
  const city = randomItem(cities);
  const activity = randomItem(activities);
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const legalForm = randomItem(legalForms);
  const siren = generateSiren();
  const score = randomInt(15, 98);
  const daysAgo = randomInt(0, 6);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const hasDomain = Math.random() > 0.4;
  const domain = hasDomain
    ? `${activity.name.toLowerCase().replace(/\s+/g, "-")}-${lastName.toLowerCase()}.fr`
    : undefined;
  const mxValid = hasDomain ? Math.random() > 0.25 : false;

  return {
    id: `lead-${index.toString().padStart(4, "0")}`,
    companyName: `${activity.name} ${lastName}`,
    siren,
    siret: siren + randomInt(10000, 99999).toString(),
    legalForm,
    activity: activity.name,
    naf: activity.naf,
    capital: randomItem([1000, 2000, 5000, 10000, 20000, 50000, 100000]),
    city: city.name,
    postalCode: city.postal,
    region: city.region,
    creationDate: date.toISOString().split("T")[0],
    bodaccDate: date.toISOString().split("T")[0],
    aiScore: score,
    vertical: vertical.id as Lead["vertical"],
    verticalLabel: vertical.label,
    tags: Array.from(
      { length: randomInt(2, 4) },
      () => randomItem(tags[vertical.id] || [])
    ).filter((v, i, a) => a.indexOf(v) === i),
    outreachAngle: randomItem(outreachAngles[vertical.id] || []),
    contact:
      Math.random() > 0.2
        ? {
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain || "email.com"}`,
            phone:
              Math.random() > 0.3
                ? `06 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`
                : undefined,
            linkedin:
              Math.random() > 0.5
                ? `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
                : undefined,
            role: randomItem([
              "Gérant",
              "Président",
              "Directeur Général",
              "Co-fondateur",
            ]),
          }
        : undefined,
    enrichment: {
      hasDomain,
      domain,
      mxValid,
      mxRecords: mxValid ? [randomItem(["mx1.ovh.net", "alt1.aspmx.l.google.com", "mail.infomaniak.ch", "mx.ionos.fr"])] : [],
      hasWebsite: hasDomain && Math.random() > 0.5,
      websiteStack: hasDomain
        ? randomItem([
            ["WordPress", "PHP"],
            ["Shopify"],
            ["Wix"],
            ["Aucun CMS détecté"],
            [],
          ])
        : [],
      socialPresence: [
        ...(Math.random() > 0.4 ? ["LinkedIn"] : []),
        ...(Math.random() > 0.6 ? ["Facebook"] : []),
        ...(Math.random() > 0.7 ? ["Instagram"] : []),
        ...(Math.random() > 0.8 ? ["Twitter"] : []),
      ],
      employeeEstimate: randomItem([
        "1",
        "1-2",
        "2-5",
        "5-10",
        "Non estimé",
      ]),
      revenue: undefined,
    },
  };
}

export const mockLeads: Lead[] = Array.from({ length: 120 }, (_, i) =>
  generateLead(i)
).sort((a, b) => b.aiScore - a.aiScore);

export const mockDailyStats: DailyStats[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const total = randomInt(80, 200);
    const qualified = randomInt(20, Math.min(60, total));
    const highScore = randomInt(5, 15);
    const mediumScore = randomInt(10, 25);
    return {
      date: date.toISOString().split("T")[0],
      totalCreations: total,
      qualified,
      highScore,
      mediumScore,
      lowScore: qualified - highScore - mediumScore,
    };
  }
);

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: 299,
    period: "/mois",
    features: [
      "1 verticale au choix",
      "Jusqu'à 30 leads/jour",
      "Score IA basique",
      "Export CSV",
      "Support email",
    ],
    highlighted: false,
    verticals: 1,
    leadsPerDay: "30",
  },
  {
    name: "Pro",
    price: 499,
    period: "/mois",
    features: [
      "2 verticales",
      "Leads illimités",
      "Score IA avancé + angle d'accroche",
      "Enrichissement contact complet",
      "API access",
      "Webhook temps réel",
      "Support prioritaire",
    ],
    highlighted: true,
    verticals: 2,
    leadsPerDay: "Illimité",
  },
  {
    name: "Enterprise",
    price: 799,
    period: "/mois",
    features: [
      "Toutes les verticales",
      "Leads illimités",
      "Score IA premium + outreach personnalisé",
      "Enrichissement complet + DNS scraping",
      "API + Webhooks",
      "Intégration CRM (HubSpot, Pipedrive)",
      "Account manager dédié",
      "Verticales sur-mesure",
    ],
    highlighted: false,
    verticals: -1,
    leadsPerDay: "Illimité",
  },
];
