export interface BattlePassTier {
  level: number
  xpRequired: number
  freeReward: BattlePassReward
  premiumReward: BattlePassReward
}

export interface BattlePassReward {
  type: 'shards' | 'energy' | 'gear' | 'hero' | 'cosmetic'
  amount: number
  label: string
  icon: string
}

export interface BattlePassState {
  seasonId: string
  isPremium: boolean
  xp: number
  claimedFree: number[]
  claimedPremium: number[]
}

export const BATTLE_PASS_PREMIUM_COST = 1500
export const CURRENT_SEASON = 'season-1'
export const SEASON_NAME = 'Season 1: Dawn of Echoes'
export const SEASON_END_DATE = new Date('2026-04-01T00:00:00Z').getTime()

export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  { level: 1, xpRequired: 100, freeReward: { type: 'shards', amount: 50, label: '50 Shards', icon: '💎' }, premiumReward: { type: 'shards', amount: 200, label: '200 Shards', icon: '💎' } },
  { level: 2, xpRequired: 200, freeReward: { type: 'energy', amount: 30, label: '30 Energy', icon: '⚡' }, premiumReward: { type: 'gear', amount: 2, label: 'Rare Gear', icon: '🗡️' } },
  { level: 3, xpRequired: 300, freeReward: { type: 'shards', amount: 100, label: '100 Shards', icon: '💎' }, premiumReward: { type: 'shards', amount: 500, label: '500 Shards', icon: '💎' } },
  { level: 4, xpRequired: 400, freeReward: { type: 'energy', amount: 50, label: '50 Energy', icon: '⚡' }, premiumReward: { type: 'gear', amount: 3, label: 'Epic Gear', icon: '🗡️' } },
  { level: 5, xpRequired: 500, freeReward: { type: 'shards', amount: 150, label: '150 Shards', icon: '💎' }, premiumReward: { type: 'hero', amount: 1, label: 'Random Hero', icon: '🧬' } },
  { level: 6, xpRequired: 600, freeReward: { type: 'energy', amount: 60, label: '60 Energy', icon: '⚡' }, premiumReward: { type: 'shards', amount: 800, label: '800 Shards', icon: '💎' } },
  { level: 7, xpRequired: 700, freeReward: { type: 'shards', amount: 200, label: '200 Shards', icon: '💎' }, premiumReward: { type: 'gear', amount: 3, label: 'Epic Gear', icon: '🗡️' } },
  { level: 8, xpRequired: 800, freeReward: { type: 'energy', amount: 80, label: '80 Energy', icon: '⚡' }, premiumReward: { type: 'shards', amount: 1000, label: '1000 Shards', icon: '💎' } },
  { level: 9, xpRequired: 900, freeReward: { type: 'shards', amount: 300, label: '300 Shards', icon: '💎' }, premiumReward: { type: 'gear', amount: 4, label: 'Legendary Gear', icon: '🗡️' } },
  { level: 10, xpRequired: 1000, freeReward: { type: 'shards', amount: 500, label: '500 Shards', icon: '💎' }, premiumReward: { type: 'hero', amount: 3, label: 'Epic+ Hero', icon: '👑' } },
  { level: 11, xpRequired: 1100, freeReward: { type: 'energy', amount: 100, label: '100 Energy', icon: '⚡' }, premiumReward: { type: 'shards', amount: 1500, label: '1500 Shards', icon: '💎' } },
  { level: 12, xpRequired: 1200, freeReward: { type: 'shards', amount: 400, label: '400 Shards', icon: '💎' }, premiumReward: { type: 'gear', amount: 5, label: 'Legendary Gear', icon: '🗡️' } },
  { level: 13, xpRequired: 1300, freeReward: { type: 'energy', amount: 120, label: 'Full Energy', icon: '⚡' }, premiumReward: { type: 'shards', amount: 2000, label: '2000 Shards', icon: '💎' } },
  { level: 14, xpRequired: 1400, freeReward: { type: 'shards', amount: 500, label: '500 Shards', icon: '💎' }, premiumReward: { type: 'hero', amount: 3, label: 'Epic+ Hero', icon: '🧬' } },
  { level: 15, xpRequired: 1500, freeReward: { type: 'shards', amount: 1000, label: '1000 Shards', icon: '💎' }, premiumReward: { type: 'cosmetic', amount: 1, label: 'Exclusive Title', icon: '👑' } },
]

export function getTotalXpForLevel(level: number): number {
  let total = 0
  for (let i = 0; i < level && i < BATTLE_PASS_TIERS.length; i++) {
    total += BATTLE_PASS_TIERS[i].xpRequired
  }
  return total
}

export function getCurrentBPLevel(totalXp: number): { level: number; xpIntoLevel: number; xpForLevel: number } {
  let remaining = totalXp
  for (let i = 0; i < BATTLE_PASS_TIERS.length; i++) {
    if (remaining < BATTLE_PASS_TIERS[i].xpRequired) {
      return { level: i, xpIntoLevel: remaining, xpForLevel: BATTLE_PASS_TIERS[i].xpRequired }
    }
    remaining -= BATTLE_PASS_TIERS[i].xpRequired
  }
  return { level: BATTLE_PASS_TIERS.length, xpIntoLevel: 0, xpForLevel: 0 }
}

/** XP rewards for various activities */
export const BP_XP_REWARDS = {
  dailyLogin: 50,
  arenaWin: 30,
  arenaLoss: 10,
  campaignStage: 40,
  dungeonClear: 35,
  guildBossAttack: 25,
  dailyQuestComplete: 20,
  summon: 5,
  heroLevelUp: 10,
}
