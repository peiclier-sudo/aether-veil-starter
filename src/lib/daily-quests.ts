export interface DailyQuest {
  id: string
  name: string
  description: string
  icon: string
  target: number
  trackingKey: string
  reward: { shards: number; energy?: number; bpXp: number }
}

export const DAILY_QUESTS: DailyQuest[] = [
  { id: 'dq-arena', name: 'Arena Challenger', description: 'Win 3 Arena battles', icon: '🏟️', target: 3, trackingKey: 'arenaWinsToday', reward: { shards: 50, bpXp: 20 } },
  { id: 'dq-campaign', name: 'Campaign Push', description: 'Complete 2 Campaign stages', icon: '⚔️', target: 2, trackingKey: 'campaignClearsToday', reward: { shards: 40, bpXp: 20 } },
  { id: 'dq-dungeon', name: 'Dungeon Runner', description: 'Clear 2 Dungeon floors', icon: '🌀', target: 2, trackingKey: 'dungeonClearsToday', reward: { shards: 40, bpXp: 20 } },
  { id: 'dq-summon', name: 'Portal Seeker', description: 'Summon 3 heroes', icon: '🌟', target: 3, trackingKey: 'summonsToday', reward: { shards: 30, bpXp: 15 } },
  { id: 'dq-levelup', name: 'Trainer', description: 'Level up a hero', icon: '⬆️', target: 1, trackingKey: 'levelUpsToday', reward: { shards: 30, bpXp: 15 } },
  { id: 'dq-gear', name: 'Gear Collector', description: 'Equip 2 gear pieces', icon: '🗡️', target: 2, trackingKey: 'gearsEquippedToday', reward: { shards: 30, bpXp: 15 } },
  { id: 'dq-spend', name: 'Big Spender', description: 'Spend 500 Shards', icon: '💎', target: 500, trackingKey: 'shardsSpentToday', reward: { shards: 80, bpXp: 25 } },
  { id: 'dq-login', name: 'Daily Check-in', description: 'Log in today', icon: '🔥', target: 1, trackingKey: 'loginToday', reward: { shards: 20, bpXp: 10 } },
]

/** Pick 4 quests for the day using seeded random */
export function getDailyQuests(dateStr: string): DailyQuest[] {
  let seed = 0
  for (let i = 0; i < dateStr.length; i++) seed = ((seed << 5) - seed + dateStr.charCodeAt(i)) | 0
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff }
  // Always include login quest + 3 random others
  const others = DAILY_QUESTS.filter(q => q.id !== 'dq-login').sort(() => rng() - 0.5)
  return [DAILY_QUESTS.find(q => q.id === 'dq-login')!, ...others.slice(0, 3)]
}

export interface DailyQuestProgress {
  date: string
  progress: Record<string, number>
  claimed: string[]
}
