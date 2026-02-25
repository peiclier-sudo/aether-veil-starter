export interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  category: 'daily' | 'fixed' | 'premium'
  cost: number
  rewardType: 'energy' | 'shards' | 'gear' | 'hero'
  rewardValue: number // energy amount, shard amount, gear difficulty, or hero rarity multiplier
  stock: number // -1 = unlimited
}

export const GEAR_SELL_VALUES: Record<string, number> = {
  common: 10,
  rare: 30,
  epic: 80,
  legendary: 200,
}

const fixedItems: ShopItem[] = [
  { id: 'energy-refill', name: 'Energy Refill', description: '+60 Energy', icon: '⚡', category: 'fixed', cost: 50, rewardType: 'energy', rewardValue: 60, stock: -1 },
  { id: 'gear-chest', name: 'Gear Chest', description: '1 Random Epic+ Gear', icon: '📦', category: 'fixed', cost: 200, rewardType: 'gear', rewardValue: 3, stock: -1 },
  { id: 'hero-fragment', name: 'Hero Fragment', description: '1 Random Rare+ Hero', icon: '🧬', category: 'fixed', cost: 500, rewardType: 'hero', rewardValue: 2, stock: -1 },
]

const premiumItems: ShopItem[] = [
  { id: 'legendary-chest', name: 'Legendary Chest', description: 'Guaranteed Legendary Gear', icon: '🏆', category: 'premium', cost: 800, rewardType: 'gear', rewardValue: 5, stock: -1 },
  { id: 'energy-bundle', name: 'Energy Bundle', description: 'Full Energy + 50 Bonus', icon: '🔋', category: 'premium', cost: 300, rewardType: 'energy', rewardValue: 170, stock: -1 },
  { id: 'shard-vault', name: 'Shard Vault', description: '+2000 Aether Shards', icon: '💰', category: 'premium', cost: 1500, rewardType: 'shards', rewardValue: 2000, stock: -1 },
]

const dailyPool: Omit<ShopItem, 'id'>[] = [
  { name: 'Lucky Pouch', description: '+500 Shards', icon: '🎁', category: 'daily', cost: 100, rewardType: 'shards', rewardValue: 500, stock: 1 },
  { name: 'Quick Energy', description: '+30 Energy', icon: '⚡', category: 'daily', cost: 20, rewardType: 'energy', rewardValue: 30, stock: 1 },
  { name: 'Rare Gear Box', description: '1 Random Rare+ Gear', icon: '🎲', category: 'daily', cost: 80, rewardType: 'gear', rewardValue: 2, stock: 1 },
  { name: 'Aether Boost', description: '+800 Shards', icon: '💎', category: 'daily', cost: 200, rewardType: 'shards', rewardValue: 800, stock: 1 },
  { name: 'Gear Surprise', description: '1 Random Epic+ Gear', icon: '✨', category: 'daily', cost: 150, rewardType: 'gear', rewardValue: 3, stock: 1 },
  { name: 'Hero Scroll', description: '1 Random Common+ Hero', icon: '📜', category: 'daily', cost: 250, rewardType: 'hero', rewardValue: 1, stock: 1 },
  { name: 'Energy Elixir', description: '+80 Energy', icon: '🧪', category: 'daily', cost: 80, rewardType: 'energy', rewardValue: 80, stock: 1 },
  { name: 'Grand Shard Pack', description: '+1200 Shards', icon: '💰', category: 'daily', cost: 350, rewardType: 'shards', rewardValue: 1200, stock: 1 },
]

/** Seeded random based on date so daily deals are consistent per day */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

export function generateDailyShop(timestamp: number): ShopItem[] {
  const day = Math.floor(timestamp / (24 * 60 * 60 * 1000))
  const rng = seededRandom(day)
  const shuffled = [...dailyPool].sort(() => rng() - 0.5)
  return shuffled.slice(0, 4).map((item, i) => ({
    ...item,
    id: `daily-${day}-${i}`,
  }))
}

export function getFixedItems(): ShopItem[] {
  return fixedItems
}

export function getPremiumItems(): ShopItem[] {
  return premiumItems
}
