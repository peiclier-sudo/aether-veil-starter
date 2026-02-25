import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  hp?: number
  atk?: number
  def?: number
  spd?: number
  imageUrl?: string
  glbUrl: string
  equippedGear: Partial<Record<Gear['slot'], Gear>>
  skills: Array<{ name: string; cooldown: number }>
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

export interface PlayerState {
  playerName: string
  level: number
  aetherShards: number
  energy: number
  heroes: Hero[]
  inventory: Gear[]
  activeResonanceBonds: ResonanceBond[]
  currentTeam: Hero['id'][]
  campaignStages: CampaignStage[]
  totalSummons: number
  addHero: (hero: Hero) => void
  equipGear: (heroId: string, gear: Gear) => void
  createResonanceBond: (bond: ResonanceBond) => void
  setCurrentTeam: (teamIds: Hero['id'][]) => void
  updateHeroLevel: (heroId: string, newLevel: number) => void
  spendShards: (amount: number) => boolean
  spendEnergy: (amount: number) => boolean
  addShards: (amount: number) => void
  addEnergy: (amount: number) => void
  incrementSummons: (count: number) => void
  completeCampaignStage: (stageId: string, stars: number) => void
}

const seedHeroes: Hero[] = [
  { id: 'h1',  name: 'Solaris',    faction: 'Dawn Sentinels',    rarity: 'legendary', role: 'offensive',  level: 60, power: 9800,  hp: 12400, atk: 3200, def: 1800, spd: 145, glbUrl: '', equippedGear: {}, skills: [{ name: 'Solar Flare', cooldown: 4 }, { name: 'Corona Burst', cooldown: 6 }] },
  { id: 'h2',  name: 'Nyx',        faction: 'Veil Walkers',      rarity: 'legendary', role: 'offensive',  level: 55, power: 9200,  hp: 10800, atk: 3500, def: 1500, spd: 160, glbUrl: '', equippedGear: {}, skills: [{ name: 'Shadow Rend', cooldown: 3 }, { name: 'Void Eclipse', cooldown: 7 }] },
  { id: 'h3',  name: 'Aurorae',    faction: 'Dawn Sentinels',    rarity: 'legendary', role: 'support',    level: 58, power: 9500,  hp: 14000, atk: 2100, def: 2200, spd: 130, glbUrl: '', equippedGear: {}, skills: [{ name: 'Healing Light', cooldown: 3 }, { name: 'Aurora Shield', cooldown: 5 }] },
  { id: 'h4',  name: 'Kaelith',    faction: 'Obsidian Pact',     rarity: 'legendary', role: 'defensive',  level: 52, power: 9100,  hp: 18000, atk: 1800, def: 3200, spd: 110, glbUrl: '', equippedGear: {}, skills: [{ name: 'Stone Wall', cooldown: 2 }, { name: 'Titan Guard', cooldown: 6 }] },
  { id: 'h5',  name: 'Zephyrine',  faction: 'Stormborn',         rarity: 'epic',      role: 'offensive',  level: 48, power: 7600,  hp: 9800,  atk: 2900, def: 1400, spd: 175, glbUrl: '', equippedGear: {}, skills: [{ name: 'Gale Strike', cooldown: 3 }, { name: 'Tempest Fury', cooldown: 5 }] },
  { id: 'h6',  name: 'Thalor',     faction: 'Obsidian Pact',     rarity: 'epic',      role: 'defensive',  level: 45, power: 7200,  hp: 16000, atk: 1600, def: 2800, spd: 105, glbUrl: '', equippedGear: {}, skills: [{ name: 'Dark Barrier', cooldown: 3 }, { name: 'Iron Fortress', cooldown: 6 }] },
  { id: 'h7',  name: 'Lumiveil',   faction: 'Dawn Sentinels',    rarity: 'epic',      role: 'support',    level: 46, power: 7400,  hp: 12000, atk: 1900, def: 2000, spd: 135, glbUrl: '', equippedGear: {}, skills: [{ name: 'Radiant Mend', cooldown: 2 }, { name: 'Veil of Grace', cooldown: 5 }] },
  { id: 'h8',  name: 'Cindra',     faction: 'Stormborn',         rarity: 'epic',      role: 'offensive',  level: 44, power: 7100,  hp: 9500,  atk: 2700, def: 1350, spd: 155, glbUrl: '', equippedGear: {}, skills: [{ name: 'Flame Lash', cooldown: 3 }, { name: 'Inferno Wave', cooldown: 6 }] },
  { id: 'h9',  name: 'Orinvex',    faction: 'Veil Walkers',      rarity: 'epic',      role: 'defensive',  level: 42, power: 6900,  hp: 15000, atk: 1700, def: 2600, spd: 115, glbUrl: '', equippedGear: {}, skills: [{ name: 'Phase Shield', cooldown: 3 }, { name: 'Void Anchor', cooldown: 5 }] },
  { id: 'h10', name: 'Seraphyn',   faction: 'Dawn Sentinels',    rarity: 'epic',      role: 'support',    level: 43, power: 7000,  hp: 11500, atk: 2000, def: 1900, spd: 140, glbUrl: '', equippedGear: {}, skills: [{ name: 'Holy Chant', cooldown: 4 }, { name: 'Wings of Dawn', cooldown: 7 }] },
  { id: 'h11', name: 'Varek',      faction: 'Obsidian Pact',     rarity: 'rare',      role: 'offensive',  level: 35, power: 5200,  hp: 8500,  atk: 2400, def: 1200, spd: 150, glbUrl: '', equippedGear: {}, skills: [{ name: 'Shadow Slash', cooldown: 3 }] },
  { id: 'h12', name: 'Mirael',     faction: 'Dawn Sentinels',    rarity: 'rare',      role: 'support',    level: 33, power: 4900,  hp: 10500, atk: 1500, def: 1700, spd: 125, glbUrl: '', equippedGear: {}, skills: [{ name: 'Gentle Glow', cooldown: 2 }] },
  { id: 'h13', name: 'Gorrik',     faction: 'Stormborn',         rarity: 'rare',      role: 'defensive',  level: 34, power: 5100,  hp: 13500, atk: 1400, def: 2400, spd: 100, glbUrl: '', equippedGear: {}, skills: [{ name: 'Thunder Guard', cooldown: 4 }] },
  { id: 'h14', name: 'Lyswen',     faction: 'Veil Walkers',      rarity: 'rare',      role: 'offensive',  level: 32, power: 4800,  hp: 8200,  atk: 2300, def: 1100, spd: 165, glbUrl: '', equippedGear: {}, skills: [{ name: 'Phase Blade', cooldown: 3 }] },
  { id: 'h15', name: 'Fenwick',    faction: 'Stormborn',         rarity: 'rare',      role: 'support',    level: 30, power: 4500,  hp: 10000, atk: 1600, def: 1600, spd: 120, glbUrl: '', equippedGear: {}, skills: [{ name: 'Wind Hymn', cooldown: 3 }] },
  { id: 'h16', name: 'Duskara',    faction: 'Veil Walkers',      rarity: 'common',    role: 'offensive',  level: 20, power: 2800,  hp: 6500,  atk: 1800, def: 900,  spd: 140, glbUrl: '', equippedGear: {}, skills: [{ name: 'Night Cut', cooldown: 3 }] },
  { id: 'h17', name: 'Bront',      faction: 'Obsidian Pact',     rarity: 'common',    role: 'defensive',  level: 18, power: 2500,  hp: 11000, atk: 1000, def: 2000, spd: 95,  glbUrl: '', equippedGear: {}, skills: [{ name: 'Rock Stance', cooldown: 2 }] },
  { id: 'h18', name: 'Ellara',     faction: 'Dawn Sentinels',    rarity: 'common',    role: 'support',    level: 15, power: 2200,  hp: 8000,  atk: 1200, def: 1300, spd: 115, glbUrl: '', equippedGear: {}, skills: [{ name: 'Soft Light', cooldown: 2 }] },
  { id: 'h19', name: 'Riven',      faction: 'Stormborn',         rarity: 'common',    role: 'offensive',  level: 12, power: 1900,  hp: 6000,  atk: 1600, def: 800,  spd: 150, glbUrl: '', equippedGear: {}, skills: [{ name: 'Spark Jab', cooldown: 2 }] },
  { id: 'h20', name: 'Mossveil',   faction: 'Veil Walkers',      rarity: 'common',    role: 'support',    level: 10, power: 1600,  hp: 7500,  atk: 1100, def: 1100, spd: 110, glbUrl: '', equippedGear: {}, skills: [{ name: 'Mist Wrap', cooldown: 3 }] },
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
      heroes: seedHeroes,
      inventory: [],
      activeResonanceBonds: [],
      currentTeam: [],
      campaignStages: seedCampaign,
      totalSummons: 0,
      addHero: (hero) =>
        set((state) => ({
          heroes: [...state.heroes, hero]
        })),
      equipGear: (heroId, gear) =>
        set((state) => ({
          heroes: state.heroes.map((hero) =>
            hero.id === heroId
              ? { ...hero, equippedGear: { ...hero.equippedGear, [gear.slot]: gear } }
              : hero
          )
        })),
      createResonanceBond: (bond) =>
        set((state) => ({
          activeResonanceBonds: [...state.activeResonanceBonds, bond]
        })),
      setCurrentTeam: (teamIds) => set({ currentTeam: teamIds.slice(0, 5) }),
      updateHeroLevel: (heroId, newLevel) =>
        set((state) => ({
          heroes: state.heroes.map((hero) => (hero.id === heroId ? { ...hero, level: newLevel } : hero))
        })),
      spendShards: (amount) => {
        const current = get().aetherShards
        if (current < amount) return false
        set({ aetherShards: current - amount })
        return true
      },
      spendEnergy: (amount) => {
        const current = get().energy
        if (current < amount) return false
        set({ energy: current - amount })
        return true
      },
      addShards: (amount) => set((state) => ({ aetherShards: state.aetherShards + amount })),
      addEnergy: (amount) => set((state) => ({ energy: Math.min(state.energy + amount, 120) })),
      incrementSummons: (count) => set((state) => ({ totalSummons: state.totalSummons + count })),
      completeCampaignStage: (stageId, stars) =>
        set((state) => ({
          campaignStages: state.campaignStages.map((s) =>
            s.id === stageId ? { ...s, completed: true, stars: Math.max(s.stars, stars) } : s
          )
        })),
    }),
    {
      name: 'aether-veil-storage',
      version: 2,
      migrate: (persisted: any) => {
        if (!persisted?.heroes || persisted.heroes.length === 0) {
          return { ...persisted, heroes: seedHeroes, campaignStages: seedCampaign, totalSummons: 0 }
        }
        if (!persisted?.campaignStages) {
          return { ...persisted, campaignStages: seedCampaign, totalSummons: persisted.totalSummons ?? 0 }
        }
        return persisted
      },
    }
  )
)
