import { Hero } from './store'

/** Drop rates by rarity */
export const DROP_RATES = {
  common: 0.50,
  rare: 0.30,
  epic: 0.15,
  legendary: 0.05,
}

export const SUMMON_COST_SINGLE = 150
export const SUMMON_COST_TEN = 1350 // 10% discount

const factions = ['Dawn Sentinels', 'Veil Walkers', 'Obsidian Pact', 'Stormborn']
const roles: Hero['role'][] = ['offensive', 'defensive', 'support']

const namePool: Record<string, string[]> = {
  common: [
    'Ashvane', 'Brindle', 'Coppervine', 'Dustmere', 'Embris',
    'Flintara', 'Gristol', 'Hazewick', 'Ironleaf', 'Jarrah',
    'Kettara', 'Loomis', 'Marrok', 'Netthra', 'Orwick',
  ],
  rare: [
    'Aldric', 'Brynhild', 'Calyndra', 'Dorvain', 'Eryndor',
    'Faelan', 'Gwynneth', 'Halvard', 'Islara', 'Jorveth',
    'Kasmira', 'Lorwyn', 'Morvaine', 'Nyxara', 'Osriel',
  ],
  epic: [
    'Azraeth', 'Belindra', 'Corvaxis', 'Drayven', 'Elowen',
    'Fyraxis', 'Galatheon', 'Hexara', 'Ithrendil', 'Jaelara',
    'Kyranthos', 'Lyrindel', 'Mordaxis', 'Nefariel', 'Oberynn',
  ],
  legendary: [
    'Arcturon', 'Bael\'thazar', 'Celestine', 'Draconis', 'Ethereon',
    'Frostweaver', 'Galaxian', 'Hyperion', 'Ignithos', 'Judgement',
    'Kronaxis', 'Luminarch', 'Mythrandil', 'Nexarion', 'Omnivael',
  ],
}

const skillNames: Record<string, string[]> = {
  offensive: ['Fury Slash', 'Infernal Strike', 'Shadow Pierce', 'Storm Cleave', 'Void Rend', 'Blaze Rush', 'Phantom Edge', 'Deathblow', 'Crimson Arc', 'Thunder Smite'],
  defensive: ['Aegis Wall', 'Iron Bastion', 'Stone Embrace', 'Frost Barrier', 'Void Shell', 'Ward of Light', 'Titan Block', 'Crystal Guard', 'Obsidian Shield', 'Unyielding'],
  support: ['Mending Wave', 'Blessing Aura', 'Revitalize', 'Spirit Link', 'Harmony Pulse', 'Ethereal Mend', 'Dawn Prayer', 'Nature Bond', 'Soul Weave', 'Resonance'],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rollRarity(): Hero['rarity'] {
  const roll = Math.random()
  if (roll < DROP_RATES.legendary) return 'legendary'
  if (roll < DROP_RATES.legendary + DROP_RATES.epic) return 'epic'
  if (roll < DROP_RATES.legendary + DROP_RATES.epic + DROP_RATES.rare) return 'rare'
  return 'common'
}

function generateStats(rarity: Hero['rarity'], role: Hero['role']) {
  const baseMultiplier = { common: 1, rare: 1.4, epic: 1.8, legendary: 2.4 }[rarity]
  const level = { common: 1, rare: 1, epic: 1, legendary: 1 }[rarity]

  const base = {
    offensive:  { hp: 5000, atk: 1800, def: 800,  spd: 140 },
    defensive:  { hp: 8000, atk: 900,  def: 1800, spd: 100 },
    support:    { hp: 6000, atk: 1100, def: 1200, spd: 120 },
  }[role]

  const jitter = () => 0.85 + Math.random() * 0.3
  const hp = Math.round(base.hp * baseMultiplier * jitter())
  const atk = Math.round(base.atk * baseMultiplier * jitter())
  const def = Math.round(base.def * baseMultiplier * jitter())
  const spd = Math.round(base.spd * (0.9 + Math.random() * 0.2))
  const power = Math.round((hp * 0.3 + atk * 1.5 + def * 1.2 + spd * 5) * (baseMultiplier * 0.6))

  return { level, power, hp, atk, def, spd }
}

let summonCounter = 0

export function summonHero(): Hero {
  const rarity = rollRarity()
  const role = pick(roles)
  const faction = pick(factions)
  const name = pick(namePool[rarity])
  const stats = generateStats(rarity, role)
  const skillCount = rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : 1
  const heroSkills = Array.from({ length: skillCount }, () => ({
    name: pick(skillNames[role]),
    cooldown: Math.floor(Math.random() * 5) + 2,
    level: 1,
  }))

  const starsByRarity: Record<string, number> = { common: 1, rare: 2, epic: 3, legendary: 5 }
  summonCounter++
  return {
    id: `summon-${Date.now()}-${summonCounter}`,
    name,
    faction,
    rarity,
    role,
    ...stats,
    stars: starsByRarity[rarity] || 1,
    glbUrl: '',
    equippedGear: {},
    skills: heroSkills,
  }
}

export function summonMultiple(count: number): Hero[] {
  const heroes: Hero[] = []
  for (let i = 0; i < count; i++) {
    heroes.push(summonHero())
  }
  // Guarantee at least one rare+ in a 10-pull
  if (count >= 10 && heroes.every(h => h.rarity === 'common')) {
    const idx = Math.floor(Math.random() * count)
    const rarity = Math.random() < 0.7 ? 'rare' : 'epic'
    const role = pick(roles)
    const faction = pick(factions)
    const name = pick(namePool[rarity])
    const stats = generateStats(rarity as Hero['rarity'], role)
    heroes[idx] = {
      ...heroes[idx],
      name,
      faction,
      rarity: rarity as Hero['rarity'],
      role,
      ...stats,
      stars: rarity === 'epic' ? 3 : 2,
      skills: [{ name: pick(skillNames[role]), cooldown: Math.floor(Math.random() * 5) + 2, level: 1 }],
    }
  }
  return heroes
}
