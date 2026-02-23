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
  rarity: 'rare' | 'epic' | 'legendary'
  level: number
  power: number
  imageUrl?: string
  glbUrl: string
  equippedGear: Partial<Record<Gear['slot'], Gear>>
  skills: Array<{ name: string; cooldown: number }>
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
  addHero: (hero: Hero) => void
  equipGear: (heroId: string, gear: Gear) => void
  createResonanceBond: (bond: ResonanceBond) => void
  setCurrentTeam: (teamIds: Hero['id'][]) => void
  updateHeroLevel: (heroId: string, newLevel: number) => void
}

export const useGameStore = create<PlayerState>()(
  persist(
    (set) => ({
      playerName: 'Echo Warden',
      level: 1,
      aetherShards: 2500,
      energy: 120,
      heroes: [],
      inventory: [],
      activeResonanceBonds: [],
      currentTeam: [],
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
        }))
    }),
    {
      name: 'aether-veil-storage'
    }
  )
)
