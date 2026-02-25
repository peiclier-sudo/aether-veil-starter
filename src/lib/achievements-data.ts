export interface AchievementTier {
  threshold: number
  reward: { shards: number; energy?: number }
}

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'combat' | 'collection' | 'progression' | 'economy'
  icon: string
  tiers: AchievementTier[]
}

export const ACHIEVEMENTS: Achievement[] = [
  // Combat
  { id: 'arena-victor', name: 'Arena Victor', description: 'Win arena battles', icon: '🏟️', category: 'combat', tiers: [
    { threshold: 10, reward: { shards: 200 } }, { threshold: 50, reward: { shards: 500 } }, { threshold: 200, reward: { shards: 2000 } },
  ]},
  { id: 'campaign-conqueror', name: 'Campaign Conqueror', description: 'Complete campaign stages', icon: '⚔️', category: 'combat', tiers: [
    { threshold: 4, reward: { shards: 300 } }, { threshold: 8, reward: { shards: 800 } }, { threshold: 12, reward: { shards: 2000 } },
  ]},
  { id: 'dungeon-delver', name: 'Dungeon Delver', description: 'Clear dungeon floors', icon: '🌀', category: 'combat', tiers: [
    { threshold: 5, reward: { shards: 200 } }, { threshold: 25, reward: { shards: 600 } }, { threshold: 100, reward: { shards: 2500 } },
  ]},

  // Collection
  { id: 'hero-collector', name: 'Hero Collector', description: 'Own heroes in roster', icon: '👥', category: 'collection', tiers: [
    { threshold: 10, reward: { shards: 300 } }, { threshold: 25, reward: { shards: 800 } }, { threshold: 50, reward: { shards: 2000 } },
  ]},
  { id: 'legendary-hunter', name: 'Legendary Hunter', description: 'Own legendary heroes', icon: '👑', category: 'collection', tiers: [
    { threshold: 1, reward: { shards: 500 } }, { threshold: 3, reward: { shards: 1500 } }, { threshold: 5, reward: { shards: 3000 } },
  ]},
  { id: 'gear-hoarder', name: 'Gear Hoarder', description: 'Have gear in inventory', icon: '🗡️', category: 'collection', tiers: [
    { threshold: 20, reward: { shards: 200 } }, { threshold: 50, reward: { shards: 600 } }, { threshold: 100, reward: { shards: 1500 } },
  ]},

  // Progression
  { id: 'summoner', name: 'Summoner', description: 'Summon heroes', icon: '🌟', category: 'progression', tiers: [
    { threshold: 10, reward: { shards: 200 } }, { threshold: 50, reward: { shards: 800 } }, { threshold: 200, reward: { shards: 3000 } },
  ]},
  { id: 'ascended-power', name: 'Ascended Power', description: 'Ascend heroes', icon: '⭐', category: 'progression', tiers: [
    { threshold: 1, reward: { shards: 300 } }, { threshold: 5, reward: { shards: 1000 } }, { threshold: 10, reward: { shards: 2500 } },
  ]},
  { id: 'skill-master', name: 'Skill Master', description: 'Upgrade skills', icon: '📖', category: 'progression', tiers: [
    { threshold: 5, reward: { shards: 200 } }, { threshold: 20, reward: { shards: 600 } }, { threshold: 50, reward: { shards: 1500 } },
  ]},

  // Economy
  { id: 'shard-spender', name: 'Shard Spender', description: 'Spend Aether Shards', icon: '💎', category: 'economy', tiers: [
    { threshold: 5000, reward: { shards: 500 } }, { threshold: 25000, reward: { shards: 1500 } }, { threshold: 100000, reward: { shards: 5000 } },
  ]},
  { id: 'merchant', name: 'Merchant', description: 'Sell gear pieces', icon: '🏪', category: 'economy', tiers: [
    { threshold: 10, reward: { shards: 200 } }, { threshold: 50, reward: { shards: 600 } }, { threshold: 200, reward: { shards: 2000 } },
  ]},
  { id: 'patron', name: 'Patron', description: 'Purchase shop items', icon: '🛒', category: 'economy', tiers: [
    { threshold: 10, reward: { shards: 300 } }, { threshold: 50, reward: { shards: 800 } }, { threshold: 200, reward: { shards: 2500 } },
  ]},
]

export function seedAchievementProgress(): Array<{ id: string; progress: number; claimedTier: number }> {
  return ACHIEVEMENTS.map(a => ({ id: a.id, progress: 0, claimedTier: -1 }))
}
