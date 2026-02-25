import { Hero } from './store'

export const defaultStarsByRarity: Record<string, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 5,
}

interface AscensionReq {
  fodderCount: number
  shardCost: number
}

const ascensionTable: Record<number, AscensionReq> = {
  1: { fodderCount: 2, shardCost: 500 },
  2: { fodderCount: 2, shardCost: 1000 },
  3: { fodderCount: 3, shardCost: 2000 },
  4: { fodderCount: 3, shardCost: 5000 },
  5: { fodderCount: 4, shardCost: 10000 },
}

export const MAX_STARS = 6

export function getAscensionRequirements(currentStars: number): AscensionReq | null {
  if (currentStars >= MAX_STARS) return null
  return ascensionTable[currentStars] || null
}

/** Each star gives +5% all stats and +5 max level */
export function getAscensionStatBoost(hero: Hero): Partial<Hero> {
  const newStars = (hero.stars || defaultStarsByRarity[hero.rarity] || 1) + 1
  const boost = 1.05 // 5% increase
  const hp = Math.round((hero.hp || 5000) * boost)
  const atk = Math.round((hero.atk || 1000) * boost)
  const def = Math.round((hero.def || 800) * boost)
  const spd = hero.spd || 100
  const rarityBonus: Record<string, number> = { common: 1, rare: 1.2, epic: 1.5, legendary: 2 }
  const bonus = rarityBonus[hero.rarity] || 1
  const power = Math.round((hp * 0.3 + atk * 1.5 + def * 1.2 + spd * 5) * (bonus * 0.6))

  return { stars: newStars, hp, atk, def, power }
}

export function getMaxLevelWithStars(rarity: string, stars: number): number {
  const baseMax: Record<string, number> = { common: 40, rare: 50, epic: 60, legendary: 80 }
  const base = baseMax[rarity] || 40
  const defaultStar = defaultStarsByRarity[rarity] || 1
  const bonusStars = Math.max(0, stars - defaultStar)
  return base + bonusStars * 5
}
