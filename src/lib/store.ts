import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultStarsByRarity, getAscensionRequirements, getAscensionStatBoost } from './ascension'
import { getSkillUpgradeCost, MAX_SKILL_LEVEL, getUpgradedCooldown } from './skill-upgrades'
import { GEAR_SELL_VALUES, ShopItem } from './shop-data'
import { seedAchievementProgress } from './achievements-data'
import { Guild, createNewGuild, getGuildXpToNext, regenerateBoss, GUILD_CREATION_COST } from './guild-data'
import { generateGear } from './gear-generator'
import { summonHero } from './summon-pool'

export interface Gear {
  id: string
  name: string
  slot: 'weapon' | 'head' | 'chest' | 'arms' | 'legs' | 'boots' | 'core1' | 'core2'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  mainStat: { type: string; value: number }
  subStats: Array<{ type: string; value: number }>
  setBonus?: string
}

export interface ResonanceBond {
  id: string
  name: string
  factions: string[]
  effect: string
  power: number
}

export interface Hero {
  id: string
  name: string
  faction: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  role: 'offensive' | 'defensive' | 'support'
  level: number
  power: number
  stars?: number
  hp?: number
  atk?: number
  def?: number
  spd?: number
  imageUrl?: string
  glbUrl: string
  equippedGear: Partial<Record<Gear['slot'], Gear>>
  skills: Array<{ name: string; cooldown: number; level?: number }>
}

export interface CampaignStage {
  id: string
  chapter: number
  stage: number
  name: string
  difficulty: 'normal' | 'hard' | 'nightmare'
  enemyPower: number
  energyCost: number
  completed: boolean
  stars: number // 0-3
  rewards: { shards: number; xp: number }
}

export interface AchievementProgress {
  id: string
  progress: number
  claimedTier: number
}

export const MAX_ENERGY = 120
export const ENERGY_REGEN_INTERVAL_MS = 300000 // 5 minutes per 1 energy

export interface PlayerState {
  playerName: string
  level: number
  aetherShards: number
  energy: number
  lastEnergyUpdate: number
  lastLoginDate: string
  loginStreak: number
  dailyRewardClaimed: boolean
  heroes: Hero[]
  inventory: Gear[]
  activeResonanceBonds: ResonanceBond[]
  currentTeam: Hero['id'][]
  campaignStages: CampaignStage[]
  totalSummons: number
  arenaRating: number
  arenaWins: number
  arenaLosses: number
  achievementProgress: AchievementProgress[]
  guild: Guild | null
  shopLastRefresh: number
  shopPurchasesToday: string[]
  dungeonClears: number
  totalAscensions: number
  totalSkillUpgrades: number
  totalShardsSpent: number
  totalGearSold: number
  totalShopPurchases: number
  totalBattlesWon: number
  addHero: (hero: Hero) => void
  equipGear: (heroId: string, gear: Gear) => void
  unequipGear: (heroId: string, slot: Gear['slot']) => void
  addToInventory: (gear: Gear) => void
  removeFromInventory: (gearId: string) => void
  levelUpHero: (heroId: string, statUpdates: Partial<Hero>) => void
  createResonanceBond: (bond: ResonanceBond) => void
  setCurrentTeam: (teamIds: Hero['id'][]) => void
  updateHeroLevel: (heroId: string, newLevel: number) => void
  spendShards: (amount: number) => boolean
  spendEnergy: (amount: number) => boolean
  addShards: (amount: number) => void
  addEnergy: (amount: number) => void
  incrementSummons: (count: number) => void
  completeCampaignStage: (stageId: string, stars: number) => void
  updateArenaRating: (change: number, won: boolean) => void
  ascendHero: (heroId: string, fodderIds: string[]) => boolean
  upgradeSkill: (heroId: string, skillIndex: number) => boolean
  sellGear: (gearIds: string[]) => number
  purchaseShopItem: (item: ShopItem) => boolean
  refreshDailyShop: () => void
  claimAchievementReward: (achievementId: string, tierIndex: number, reward: { shards: number; energy?: number }) => void
  updateAchievementProgress: (achievementId: string, progress: number) => void
  incrementDungeonClears: () => void
  createGuild: (name: string) => boolean
  donateToGuild: (amount: number) => boolean
  attackGuildBoss: (damage: number) => { killed: boolean; reward: number }
  removeHero: (heroId: string) => void
  tickEnergyRegen: () => void
  checkDailyLogin: () => { isNewDay: boolean; streak: number }
  claimDailyReward: () => number
  incrementBattlesWon: () => void
}

const seedHeroes: Hero[] = [
  { id: 'h1',  name: 'Solaris',    faction: 'Dawn Sentinels',    rarity: 'legendary', role: 'offensive',  level: 60, power: 9800,  stars: 5, hp: 12400, atk: 3200, def: 1800, spd: 145, glbUrl: '', equippedGear: {}, skills: [{ name: 'Solar Flare', cooldown: 4, level: 1 }, { name: 'Corona Burst', cooldown: 6, level: 1 }] },
  { id: 'h2',  name: 'Nyx',        faction: 'Veil Walkers',      rarity: 'legendary', role: 'offensive',  level: 55, power: 9200,  stars: 5, hp: 10800, atk: 3500, def: 1500, spd: 160, glbUrl: '', equippedGear: {}, skills: [{ name: 'Shadow Rend', cooldown: 3, level: 1 }, { name: 'Void Eclipse', cooldown: 7, level: 1 }] },
  { id: 'h3',  name: 'Aurorae',    faction: 'Dawn Sentinels',    rarity: 'legendary', role: 'support',    level: 58, power: 9500,  stars: 5, hp: 14000, atk: 2100, def: 2200, spd: 130, glbUrl: '', equippedGear: {}, skills: [{ name: 'Healing Light', cooldown: 3, level: 1 }, { name: 'Aurora Shield', cooldown: 5, level: 1 }] },
  { id: 'h4',  name: 'Kaelith',    faction: 'Obsidian Pact',     rarity: 'legendary', role: 'defensive',  level: 52, power: 9100,  stars: 5, hp: 18000, atk: 1800, def: 3200, spd: 110, glbUrl: '', equippedGear: {}, skills: [{ name: 'Stone Wall', cooldown: 2, level: 1 }, { name: 'Titan Guard', cooldown: 6, level: 1 }] },
  { id: 'h5',  name: 'Zephyrine',  faction: 'Stormborn',         rarity: 'epic',      role: 'offensive',  level: 48, power: 7600,  stars: 3, hp: 9800,  atk: 2900, def: 1400, spd: 175, glbUrl: '', equippedGear: {}, skills: [{ name: 'Gale Strike', cooldown: 3, level: 1 }, { name: 'Tempest Fury', cooldown: 5, level: 1 }] },
  { id: 'h6',  name: 'Thalor',     faction: 'Obsidian Pact',     rarity: 'epic',      role: 'defensive',  level: 45, power: 7200,  stars: 3, hp: 16000, atk: 1600, def: 2800, spd: 105, glbUrl: '', equippedGear: {}, skills: [{ name: 'Dark Barrier', cooldown: 3, level: 1 }, { name: 'Iron Fortress', cooldown: 6, level: 1 }] },
  { id: 'h7',  name: 'Lumiveil',   faction: 'Dawn Sentinels',    rarity: 'epic',      role: 'support',    level: 46, power: 7400,  stars: 3, hp: 12000, atk: 1900, def: 2000, spd: 135, glbUrl: '', equippedGear: {}, skills: [{ name: 'Radiant Mend', cooldown: 2, level: 1 }, { name: 'Veil of Grace', cooldown: 5, level: 1 }] },
  { id: 'h8',  name: 'Cindra',     faction: 'Stormborn',         rarity: 'epic',      role: 'offensive',  level: 44, power: 7100,  stars: 3, hp: 9500,  atk: 2700, def: 1350, spd: 155, glbUrl: '', equippedGear: {}, skills: [{ name: 'Flame Lash', cooldown: 3, level: 1 }, { name: 'Inferno Wave', cooldown: 6, level: 1 }] },
  { id: 'h9',  name: 'Orinvex',    faction: 'Veil Walkers',      rarity: 'epic',      role: 'defensive',  level: 42, power: 6900,  stars: 3, hp: 15000, atk: 1700, def: 2600, spd: 115, glbUrl: '', equippedGear: {}, skills: [{ name: 'Phase Shield', cooldown: 3, level: 1 }, { name: 'Void Anchor', cooldown: 5, level: 1 }] },
  { id: 'h10', name: 'Seraphyn',   faction: 'Dawn Sentinels',    rarity: 'epic',      role: 'support',    level: 43, power: 7000,  stars: 3, hp: 11500, atk: 2000, def: 1900, spd: 140, glbUrl: '', equippedGear: {}, skills: [{ name: 'Holy Chant', cooldown: 4, level: 1 }, { name: 'Wings of Dawn', cooldown: 7, level: 1 }] },
  { id: 'h11', name: 'Varek',      faction: 'Obsidian Pact',     rarity: 'rare',      role: 'offensive',  level: 35, power: 5200,  stars: 2, hp: 8500,  atk: 2400, def: 1200, spd: 150, glbUrl: '', equippedGear: {}, skills: [{ name: 'Shadow Slash', cooldown: 3, level: 1 }] },
  { id: 'h12', name: 'Mirael',     faction: 'Dawn Sentinels',    rarity: 'rare',      role: 'support',    level: 33, power: 4900,  stars: 2, hp: 10500, atk: 1500, def: 1700, spd: 125, glbUrl: '', equippedGear: {}, skills: [{ name: 'Gentle Glow', cooldown: 2, level: 1 }] },
  { id: 'h13', name: 'Gorrik',     faction: 'Stormborn',         rarity: 'rare',      role: 'defensive',  level: 34, power: 5100,  stars: 2, hp: 13500, atk: 1400, def: 2400, spd: 100, glbUrl: '', equippedGear: {}, skills: [{ name: 'Thunder Guard', cooldown: 4, level: 1 }] },
  { id: 'h14', name: 'Lyswen',     faction: 'Veil Walkers',      rarity: 'rare',      role: 'offensive',  level: 32, power: 4800,  stars: 2, hp: 8200,  atk: 2300, def: 1100, spd: 165, glbUrl: '', equippedGear: {}, skills: [{ name: 'Phase Blade', cooldown: 3, level: 1 }] },
  { id: 'h15', name: 'Fenwick',    faction: 'Stormborn',         rarity: 'rare',      role: 'support',    level: 30, power: 4500,  stars: 2, hp: 10000, atk: 1600, def: 1600, spd: 120, glbUrl: '', equippedGear: {}, skills: [{ name: 'Wind Hymn', cooldown: 3, level: 1 }] },
  { id: 'h16', name: 'Duskara',    faction: 'Veil Walkers',      rarity: 'common',    role: 'offensive',  level: 20, power: 2800,  stars: 1, hp: 6500,  atk: 1800, def: 900,  spd: 140, glbUrl: '', equippedGear: {}, skills: [{ name: 'Night Cut', cooldown: 3, level: 1 }] },
  { id: 'h17', name: 'Bront',      faction: 'Obsidian Pact',     rarity: 'common',    role: 'defensive',  level: 18, power: 2500,  stars: 1, hp: 11000, atk: 1000, def: 2000, spd: 95,  glbUrl: '', equippedGear: {}, skills: [{ name: 'Rock Stance', cooldown: 2, level: 1 }] },
  { id: 'h18', name: 'Ellara',     faction: 'Dawn Sentinels',    rarity: 'common',    role: 'support',    level: 15, power: 2200,  stars: 1, hp: 8000,  atk: 1200, def: 1300, spd: 115, glbUrl: '', equippedGear: {}, skills: [{ name: 'Soft Light', cooldown: 2, level: 1 }] },
  { id: 'h19', name: 'Riven',      faction: 'Stormborn',         rarity: 'common',    role: 'offensive',  level: 12, power: 1900,  stars: 1, hp: 6000,  atk: 1600, def: 800,  spd: 150, glbUrl: '', equippedGear: {}, skills: [{ name: 'Spark Jab', cooldown: 2, level: 1 }] },
  { id: 'h20', name: 'Mossveil',   faction: 'Veil Walkers',      rarity: 'common',    role: 'support',    level: 10, power: 1600,  stars: 1, hp: 7500,  atk: 1100, def: 1100, spd: 110, glbUrl: '', equippedGear: {}, skills: [{ name: 'Mist Wrap', cooldown: 3, level: 1 }] },
]

const seedCampaign: CampaignStage[] = [
  { id: 'c1-1', chapter: 1, stage: 1, name: 'Shattered Dawn',       difficulty: 'normal', enemyPower: 1500,  energyCost: 6,  completed: false, stars: 0, rewards: { shards: 30,  xp: 100 } },
  { id: 'c1-2', chapter: 1, stage: 2, name: 'Whispering Ruins',     difficulty: 'normal', enemyPower: 2000,  energyCost: 6,  completed: false, stars: 0, rewards: { shards: 35,  xp: 120 } },
  { id: 'c1-3', chapter: 1, stage: 3, name: 'Hollow Gate',          difficulty: 'normal', enemyPower: 2500,  energyCost: 8,  completed: false, stars: 0, rewards: { shards: 40,  xp: 150 } },
  { id: 'c1-4', chapter: 1, stage: 4, name: 'The First Echo',       difficulty: 'normal', enemyPower: 3200,  energyCost: 8,  completed: false, stars: 0, rewards: { shards: 60,  xp: 200 } },
  { id: 'c2-1', chapter: 2, stage: 1, name: 'Veil Crossing',        difficulty: 'normal', enemyPower: 3800,  energyCost: 8,  completed: false, stars: 0, rewards: { shards: 45,  xp: 180 } },
  { id: 'c2-2', chapter: 2, stage: 2, name: 'Obsidian Depths',      difficulty: 'normal', enemyPower: 4500,  energyCost: 10, completed: false, stars: 0, rewards: { shards: 50,  xp: 200 } },
  { id: 'c2-3', chapter: 2, stage: 3, name: 'Storm Spire',          difficulty: 'normal', enemyPower: 5200,  energyCost: 10, completed: false, stars: 0, rewards: { shards: 55,  xp: 220 } },
  { id: 'c2-4', chapter: 2, stage: 4, name: 'Resonance Breach',     difficulty: 'normal', enemyPower: 6000,  energyCost: 12, completed: false, stars: 0, rewards: { shards: 80,  xp: 300 } },
  { id: 'c3-1', chapter: 3, stage: 1, name: 'Aether Wastes',        difficulty: 'hard',   enemyPower: 7000,  energyCost: 12, completed: false, stars: 0, rewards: { shards: 70,  xp: 350 } },
  { id: 'c3-2', chapter: 3, stage: 2, name: 'Throne of Echoes',     difficulty: 'hard',   enemyPower: 8500,  energyCost: 14, completed: false, stars: 0, rewards: { shards: 85,  xp: 400 } },
  { id: 'c3-3', chapter: 3, stage: 3, name: 'Luminara\'s Shadow',   difficulty: 'hard',   enemyPower: 10000, energyCost: 14, completed: false, stars: 0, rewards: { shards: 100, xp: 500 } },
  { id: 'c3-4', chapter: 3, stage: 4, name: 'The Veil Unravels',    difficulty: 'hard',   enemyPower: 12000, energyCost: 16, completed: false, stars: 0, rewards: { shards: 150, xp: 600 } },
]

export const useGameStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      playerName: 'Echo Warden',
      level: 1,
      aetherShards: 2500,
      energy: 120,
      lastEnergyUpdate: Date.now(),
      lastLoginDate: new Date().toISOString().slice(0, 10),
      loginStreak: 1,
      dailyRewardClaimed: false,
      heroes: seedHeroes,
      inventory: [],
      activeResonanceBonds: [],
      currentTeam: [],
      campaignStages: seedCampaign,
      totalSummons: 0,
      arenaRating: 500,
      arenaWins: 0,
      arenaLosses: 0,
      achievementProgress: seedAchievementProgress(),
      guild: null,
      shopLastRefresh: 0,
      shopPurchasesToday: [],
      dungeonClears: 0,
      totalAscensions: 0,
      totalSkillUpgrades: 0,
      totalShardsSpent: 0,
      totalGearSold: 0,
      totalShopPurchases: 0,
      totalBattlesWon: 0,

      addHero: (hero) => set((state) => ({ heroes: [...state.heroes, hero] })),
      equipGear: (heroId, gear) =>
        set((state) => ({
          heroes: state.heroes.map((hero) =>
            hero.id === heroId
              ? { ...hero, equippedGear: { ...hero.equippedGear, [gear.slot]: gear } }
              : hero
          ),
          inventory: state.inventory.filter((g) => g.id !== gear.id),
        })),
      unequipGear: (heroId, slot) =>
        set((state) => {
          const hero = state.heroes.find((h) => h.id === heroId)
          const gear = hero?.equippedGear[slot]
          return {
            heroes: state.heroes.map((h) =>
              h.id === heroId ? { ...h, equippedGear: { ...h.equippedGear, [slot]: undefined } } : h
            ),
            inventory: gear ? [...state.inventory, gear] : state.inventory,
          }
        }),
      addToInventory: (gear) => set((state) => ({ inventory: [...state.inventory, gear] })),
      removeFromInventory: (gearId) => set((state) => ({ inventory: state.inventory.filter((g) => g.id !== gearId) })),
      levelUpHero: (heroId, statUpdates) =>
        set((state) => ({
          heroes: state.heroes.map((hero) => hero.id === heroId ? { ...hero, ...statUpdates } : hero),
        })),
      createResonanceBond: (bond) => set((state) => ({ activeResonanceBonds: [...state.activeResonanceBonds, bond] })),
      setCurrentTeam: (teamIds) => set({ currentTeam: teamIds.slice(0, 5) }),
      updateHeroLevel: (heroId, newLevel) =>
        set((state) => ({
          heroes: state.heroes.map((hero) => (hero.id === heroId ? { ...hero, level: newLevel } : hero))
        })),
      spendShards: (amount) => {
        const current = get().aetherShards
        if (current < amount) return false
        set({ aetherShards: current - amount, totalShardsSpent: get().totalShardsSpent + amount })
        return true
      },
      spendEnergy: (amount) => {
        const current = get().energy
        if (current < amount) return false
        set({ energy: current - amount })
        return true
      },
      addShards: (amount) => set((state) => ({ aetherShards: state.aetherShards + amount })),
      addEnergy: (amount) => set((state) => ({ energy: Math.min(state.energy + amount, MAX_ENERGY) })),
      incrementSummons: (count) => set((state) => ({ totalSummons: state.totalSummons + count })),
      completeCampaignStage: (stageId, stars) =>
        set((state) => ({
          campaignStages: state.campaignStages.map((s) =>
            s.id === stageId ? { ...s, completed: true, stars: Math.max(s.stars, stars) } : s
          )
        })),
      updateArenaRating: (change, won) =>
        set((state) => ({
          arenaRating: Math.max(0, state.arenaRating + change),
          arenaWins: won ? state.arenaWins + 1 : state.arenaWins,
          arenaLosses: won ? state.arenaLosses : state.arenaLosses + 1,
        })),

      // New v5 actions
      ascendHero: (heroId, fodderIds) => {
        const state = get()
        const hero = state.heroes.find(h => h.id === heroId)
        if (!hero) return false
        const currentStars = hero.stars || defaultStarsByRarity[hero.rarity] || 1
        const req = getAscensionRequirements(currentStars)
        if (!req || fodderIds.length < req.fodderCount || state.aetherShards < req.shardCost) return false
        const newStats = getAscensionStatBoost(hero)
        set({
          heroes: state.heroes.filter(h => !fodderIds.includes(h.id)).map(h => h.id === heroId ? { ...h, ...newStats } : h),
          aetherShards: state.aetherShards - req.shardCost,
          currentTeam: state.currentTeam.filter(id => !fodderIds.includes(id)),
          totalAscensions: state.totalAscensions + 1,
          totalShardsSpent: state.totalShardsSpent + req.shardCost,
        })
        return true
      },
      upgradeSkill: (heroId, skillIndex) => {
        const state = get()
        const hero = state.heroes.find(h => h.id === heroId)
        if (!hero || !hero.skills[skillIndex]) return false
        const skill = hero.skills[skillIndex]
        const skillLevel = skill.level || 1
        if (skillLevel >= MAX_SKILL_LEVEL) return false
        const cost = getSkillUpgradeCost(skillLevel, hero.rarity)
        if (state.aetherShards < cost) return false
        const baseCooldown = skill.cooldown + (skillLevel - 1) * 0.5
        const newLevel = skillLevel + 1
        const newSkills = hero.skills.map((s, i) =>
          i === skillIndex ? { ...s, level: newLevel, cooldown: getUpgradedCooldown(baseCooldown, newLevel) } : s
        )
        set({
          heroes: state.heroes.map(h => h.id === heroId ? { ...h, skills: newSkills } : h),
          aetherShards: state.aetherShards - cost,
          totalSkillUpgrades: state.totalSkillUpgrades + 1,
          totalShardsSpent: state.totalShardsSpent + cost,
        })
        return true
      },
      sellGear: (gearIds) => {
        const state = get()
        let totalValue = 0
        const toSell = new Set(gearIds)
        for (const g of state.inventory) {
          if (toSell.has(g.id)) totalValue += GEAR_SELL_VALUES[g.rarity] || 10
        }
        set({
          inventory: state.inventory.filter(g => !toSell.has(g.id)),
          aetherShards: state.aetherShards + totalValue,
          totalGearSold: state.totalGearSold + gearIds.length,
        })
        return totalValue
      },
      purchaseShopItem: (item) => {
        const state = get()
        if (state.aetherShards < item.cost) return false
        if (item.category === 'daily' && state.shopPurchasesToday.includes(item.id)) return false
        set({ aetherShards: state.aetherShards - item.cost, totalShopPurchases: state.totalShopPurchases + 1, totalShardsSpent: state.totalShardsSpent + item.cost })
        if (item.rewardType === 'energy') get().addEnergy(item.rewardValue)
        else if (item.rewardType === 'shards') get().addShards(item.rewardValue)
        else if (item.rewardType === 'gear') get().addToInventory(generateGear(item.rewardValue))
        else if (item.rewardType === 'hero') get().addHero(summonHero())
        if (item.category === 'daily') set((s) => ({ shopPurchasesToday: [...s.shopPurchasesToday, item.id] }))
        return true
      },
      refreshDailyShop: () => {
        const now = Date.now()
        const state = get()
        if (now - state.shopLastRefresh >= 86400000) set({ shopLastRefresh: now, shopPurchasesToday: [] })
      },
      claimAchievementReward: (achievementId, tierIndex, reward) => {
        set((state) => ({
          achievementProgress: state.achievementProgress.map(a =>
            a.id === achievementId ? { ...a, claimedTier: Math.max(a.claimedTier, tierIndex) } : a
          ),
          aetherShards: state.aetherShards + reward.shards,
          energy: reward.energy ? Math.min(state.energy + reward.energy, 120) : state.energy,
        }))
      },
      updateAchievementProgress: (achievementId, progress) => {
        set((state) => ({
          achievementProgress: state.achievementProgress.map(a =>
            a.id === achievementId ? { ...a, progress: Math.max(a.progress, progress) } : a
          ),
        }))
      },
      incrementDungeonClears: () => set((state) => ({ dungeonClears: state.dungeonClears + 1 })),
      createGuild: (name) => {
        const state = get()
        if (state.guild || state.aetherShards < GUILD_CREATION_COST) return false
        set({ guild: createNewGuild(name), aetherShards: state.aetherShards - GUILD_CREATION_COST, totalShardsSpent: state.totalShardsSpent + GUILD_CREATION_COST })
        return true
      },
      donateToGuild: (amount) => {
        const state = get()
        if (!state.guild || state.aetherShards < amount) return false
        const guild = { ...state.guild }
        guild.xp += amount
        guild.totalDonated += amount
        while (guild.xp >= guild.xpToNext) { guild.xp -= guild.xpToNext; guild.level += 1; guild.xpToNext = getGuildXpToNext(guild.level) }
        set({ guild, aetherShards: state.aetherShards - amount, totalShardsSpent: state.totalShardsSpent + amount })
        return true
      },
      attackGuildBoss: (damage) => {
        const state = get()
        if (!state.guild) return { killed: false, reward: 0 }
        const guild = { ...state.guild }
        const boss = { ...guild.boss }
        boss.hp = Math.max(0, boss.hp - damage)
        if (boss.hp <= 0) {
          const reward = boss.reward.shards
          guild.boss = regenerateBoss(guild)
          guild.xp += 200
          while (guild.xp >= guild.xpToNext) { guild.xp -= guild.xpToNext; guild.level += 1; guild.xpToNext = getGuildXpToNext(guild.level) }
          set({ guild, aetherShards: state.aetherShards + reward })
          return { killed: true, reward }
        }
        guild.boss = boss
        set({ guild })
        return { killed: false, reward: 0 }
      },
      removeHero: (heroId) => set((state) => ({ heroes: state.heroes.filter(h => h.id !== heroId), currentTeam: state.currentTeam.filter(id => id !== heroId) })),
      tickEnergyRegen: () => {
        const state = get()
        if (state.energy >= MAX_ENERGY) {
          set({ lastEnergyUpdate: Date.now() })
          return
        }
        const now = Date.now()
        const elapsed = now - state.lastEnergyUpdate
        const ticks = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS)
        if (ticks > 0) {
          const newEnergy = Math.min(MAX_ENERGY, state.energy + ticks)
          set({ energy: newEnergy, lastEnergyUpdate: state.lastEnergyUpdate + ticks * ENERGY_REGEN_INTERVAL_MS })
        }
      },
      checkDailyLogin: () => {
        const state = get()
        const today = new Date().toISOString().slice(0, 10)
        if (state.lastLoginDate === today) return { isNewDay: false, streak: state.loginStreak }
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        const newStreak = state.lastLoginDate === yesterday ? state.loginStreak + 1 : 1
        set({ lastLoginDate: today, loginStreak: newStreak, dailyRewardClaimed: false })
        return { isNewDay: true, streak: newStreak }
      },
      claimDailyReward: () => {
        const state = get()
        if (state.dailyRewardClaimed) return 0
        const baseReward = 100
        const streakBonus = Math.min(state.loginStreak, 7) * 25
        const reward = baseReward + streakBonus
        set({ dailyRewardClaimed: true, aetherShards: state.aetherShards + reward })
        return reward
      },
      incrementBattlesWon: () => set((state) => ({ totalBattlesWon: state.totalBattlesWon + 1 })),
    }),
    {
      name: 'aether-veil-storage',
      version: 6,
      migrate: (persisted: any) => {
        const state = persisted || {}
        if (!state.heroes || state.heroes.length === 0) state.heroes = seedHeroes
        if (!state.campaignStages) state.campaignStages = seedCampaign
        if (state.totalSummons === undefined) state.totalSummons = 0
        if (!state.inventory) state.inventory = []
        if (state.arenaRating === undefined) state.arenaRating = 500
        if (state.arenaWins === undefined) state.arenaWins = 0
        if (state.arenaLosses === undefined) state.arenaLosses = 0
        if (!state.achievementProgress) state.achievementProgress = seedAchievementProgress()
        if (state.guild === undefined) state.guild = null
        if (state.shopLastRefresh === undefined) state.shopLastRefresh = 0
        if (!state.shopPurchasesToday) state.shopPurchasesToday = []
        if (state.dungeonClears === undefined) state.dungeonClears = 0
        if (state.totalAscensions === undefined) state.totalAscensions = 0
        if (state.totalSkillUpgrades === undefined) state.totalSkillUpgrades = 0
        if (state.totalShardsSpent === undefined) state.totalShardsSpent = 0
        if (state.totalGearSold === undefined) state.totalGearSold = 0
        if (state.totalShopPurchases === undefined) state.totalShopPurchases = 0
        // v6 fields
        if (state.lastEnergyUpdate === undefined) state.lastEnergyUpdate = Date.now()
        if (state.lastLoginDate === undefined) state.lastLoginDate = new Date().toISOString().slice(0, 10)
        if (state.loginStreak === undefined) state.loginStreak = 1
        if (state.dailyRewardClaimed === undefined) state.dailyRewardClaimed = false
        if (state.totalBattlesWon === undefined) state.totalBattlesWon = 0
        if (state.heroes) {
          state.heroes = state.heroes.map((h: any) => ({
            ...h,
            stars: h.stars || defaultStarsByRarity[h.rarity] || 1,
            skills: (h.skills || []).map((s: any) => ({ ...s, level: s.level || 1 })),
          }))
        }
        return state
      },
    }
  )
)
