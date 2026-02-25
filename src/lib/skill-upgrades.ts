export const MAX_SKILL_LEVEL = 10

const rarityCostMultiplier: Record<string, number> = {
  common: 1,
  rare: 1.5,
  epic: 2.5,
  legendary: 4,
}

export function getSkillUpgradeCost(skillLevel: number, rarity: string): number {
  const base = 50
  const mult = rarityCostMultiplier[rarity] || 1
  return Math.round(base * skillLevel * mult)
}

/** Each upgrade reduces cooldown by 0.5s, minimum 1s */
export function getUpgradedCooldown(baseCooldown: number, level: number): number {
  return Math.max(1, baseCooldown - (level - 1) * 0.5)
}
