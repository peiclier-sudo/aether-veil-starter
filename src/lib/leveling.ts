import { Hero } from './store'

/** Level-up shard cost formula: base * level * rarityMultiplier */
const rarityCostMultiplier: Record<string, number> = {
  common: 1,
  rare: 1.5,
  epic: 2.5,
  legendary: 4,
}

const maxLevelByRarity: Record<string, number> = {
  common: 40,
  rare: 50,
  epic: 60,
  legendary: 80,
}

export function getLevelUpCost(currentLevel: number, rarity: string): number {
  const base = 20
  const mult = rarityCostMultiplier[rarity] || 1
  return Math.round(base * currentLevel * mult)
}

export function getMaxLevel(rarity: string): number {
  return maxLevelByRarity[rarity] || 40
}

/** Compute new stats after leveling up once */
export function computeLevelUpStats(hero: Hero): Partial<Hero> {
  const growthRate: Record<string, { hp: number; atk: number; def: number }> = {
    offensive:  { hp: 80, atk: 45, def: 15 },
    defensive:  { hp: 120, atk: 15, def: 40 },
    support:    { hp: 100, atk: 25, def: 25 },
  }
  const rarityBonus: Record<string, number> = { common: 1, rare: 1.2, epic: 1.5, legendary: 2 }

  const growth = growthRate[hero.role] || growthRate.offensive
  const bonus = rarityBonus[hero.rarity] || 1
  const newLevel = hero.level + 1

  const hp = Math.round((hero.hp || 5000) + growth.hp * bonus)
  const atk = Math.round((hero.atk || 1000) + growth.atk * bonus)
  const def = Math.round((hero.def || 800) + growth.def * bonus)
  const power = Math.round((hp * 0.3 + atk * 1.5 + def * 1.2 + (hero.spd || 100) * 5) * (bonus * 0.6))

  return { level: newLevel, hp, atk, def, power }
}
