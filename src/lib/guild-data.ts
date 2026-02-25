export interface GuildMember {
  name: string
  power: number
  donated: number
}

export interface GuildBoss {
  name: string
  hp: number
  maxHp: number
  reward: { shards: number }
}

export interface GuildPerk {
  level: number
  name: string
  description: string
  icon: string
}

export interface Guild {
  id: string
  name: string
  level: number
  xp: number
  xpToNext: number
  members: GuildMember[]
  boss: GuildBoss
  totalDonated: number
}

export const GUILD_CREATION_COST = 500

const aiNames = [
  'StormBlade', 'NightWhisper', 'IronHeart', 'SkyWarden', 'DarkStar',
  'FlameKeeper', 'FrostQueen', 'VoidStalker', 'LightBringer', 'ShadowMend',
]

const bossNames = [
  'Voidlord Malachar', 'Ancient Golem Arxis', 'Shadow Dragon Neth', 'Storm Titan Zephyros',
  'The Corrupted Sentinel', 'Obsidian Wyrm', 'Aether Devourer', 'Echo of Luminara',
]

export const GUILD_PERKS: GuildPerk[] = [
  { level: 2, name: '+5% All Stats', description: 'All heroes gain 5% bonus to all stats', icon: '💪' },
  { level: 3, name: '+10 Max Energy', description: 'Energy cap increased to 130', icon: '⚡' },
  { level: 4, name: '+10% Shard Gains', description: 'All shard rewards increased by 10%', icon: '💎' },
  { level: 5, name: '+10% All Stats', description: 'All heroes gain 10% bonus to all stats', icon: '🔥' },
  { level: 6, name: '+20 Max Energy', description: 'Energy cap increased to 140', icon: '⚡' },
  { level: 7, name: '+20% Shard Gains', description: 'All shard rewards increased by 20%', icon: '💰' },
  { level: 8, name: '+15% All Stats', description: 'All heroes gain 15% bonus to all stats', icon: '👑' },
]

export function getGuildXpToNext(level: number): number {
  return 500 * level * level
}

function generateBoss(guildLevel: number): GuildBoss {
  const hp = 50000 + guildLevel * 25000
  return {
    name: bossNames[Math.floor(Math.random() * bossNames.length)],
    hp,
    maxHp: hp,
    reward: { shards: 500 + guildLevel * 200 },
  }
}

function generateAiMembers(): GuildMember[] {
  const shuffled = [...aiNames].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5).map(name => ({
    name,
    power: 5000 + Math.floor(Math.random() * 30000),
    donated: Math.floor(Math.random() * 2000),
  }))
}

export function createNewGuild(name: string): Guild {
  return {
    id: `guild-${Date.now()}`,
    name,
    level: 1,
    xp: 0,
    xpToNext: getGuildXpToNext(1),
    members: generateAiMembers(),
    boss: generateBoss(1),
    totalDonated: 0,
  }
}

export function regenerateBoss(guild: Guild): GuildBoss {
  return generateBoss(guild.level)
}
