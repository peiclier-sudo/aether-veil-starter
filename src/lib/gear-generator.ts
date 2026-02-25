import { Gear } from './store'

const slots: Gear['slot'][] = ['weapon', 'head', 'chest', 'arms', 'legs', 'boots', 'core1', 'core2']
const statTypes = ['hp', 'atk', 'def', 'spd', 'critRate', 'critDmg', 'accuracy', 'resist']

const gearNames: Record<Gear['slot'], string[]> = {
  weapon: ['Phantom Blade', 'Aether Edge', 'Voidcutter', 'Dawn Reaver', 'Storm Fang', 'Shadow Spike', 'Ember Claw', 'Frost Cleaver'],
  head:   ['Crown of Echoes', 'Veil Helm', 'Obsidian Visor', 'Stormcrown', 'Dawnguard Helm', 'Phantom Mask', 'Aether Circlet', 'Void Hood'],
  chest:  ['Resonance Plate', 'Shadowweave', 'Aether Cuirass', 'Stormmail', 'Dawn Breastplate', 'Void Shroud', 'Ember Ward', 'Frost Mantle'],
  arms:   ['Gauntlets of Wrath', 'Veil Bracers', 'Aether Grips', 'Storm Fists', 'Dawn Vambraces', 'Shadow Wraps', 'Void Cuffs', 'Ember Guards'],
  legs:   ['Greaves of Light', 'Shadow Tassets', 'Aether Legplates', 'Storm Leggings', 'Dawn Cuisses', 'Veil Chaps', 'Void Kilt', 'Ember Sabatons'],
  boots:  ['Windstriders', 'Veil Treads', 'Aether Walkers', 'Storm Steps', 'Dawn Runners', 'Shadow Stalkers', 'Void Boots', 'Ember Pace'],
  core1:  ['Prism Core', 'Void Shard', 'Aether Crystal', 'Storm Orb', 'Dawn Gem', 'Shadow Pearl', 'Ember Stone', 'Frost Rune'],
  core2:  ['Echo Fragment', 'Veil Essence', 'Resonance Seed', 'Storm Spark', 'Dawn Mote', 'Shadow Wisp', 'Void Dust', 'Ember Ash'],
}

const setBonuses = ['Aether Fury', 'Veil Guardian', 'Storm Surge', 'Dawn Blessing', 'Shadow Dance', 'Void Embrace', 'Ember Rage', 'Frost Ward']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rollRarity(chapterDifficulty: number): Gear['rarity'] {
  const roll = Math.random()
  const legendaryChance = 0.02 + chapterDifficulty * 0.01
  const epicChance = 0.08 + chapterDifficulty * 0.03
  const rareChance = 0.30 + chapterDifficulty * 0.05

  if (roll < legendaryChance) return 'legendary'
  if (roll < legendaryChance + epicChance) return 'epic'
  if (roll < legendaryChance + epicChance + rareChance) return 'rare'
  return 'common'
}

const rarityStatMultiplier: Record<string, number> = {
  common: 1,
  rare: 1.5,
  epic: 2.2,
  legendary: 3.5,
}

function generateMainStat(slot: Gear['slot'], rarity: Gear['rarity']): { type: string; value: number } {
  const mult = rarityStatMultiplier[rarity] || 1
  const statMap: Record<string, { type: string; base: number }> = {
    weapon: { type: 'atk', base: 120 },
    head:   { type: 'hp', base: 250 },
    chest:  { type: 'def', base: 100 },
    arms:   { type: 'atk', base: 80 },
    legs:   { type: 'def', base: 80 },
    boots:  { type: 'spd', base: 15 },
    core1:  { type: 'critRate', base: 8 },
    core2:  { type: 'critDmg', base: 20 },
  }
  const info = statMap[slot] || { type: 'atk', base: 100 }
  const jitter = 0.85 + Math.random() * 0.3
  return { type: info.type, value: Math.round(info.base * mult * jitter) }
}

function generateSubStats(rarity: Gear['rarity']): Array<{ type: string; value: number }> {
  const count = { common: 1, rare: 2, epic: 3, legendary: 4 }[rarity] || 1
  const mult = rarityStatMultiplier[rarity] || 1
  const used = new Set<string>()
  const subs: Array<{ type: string; value: number }> = []

  for (let i = 0; i < count; i++) {
    let type: string
    do { type = pick(statTypes) } while (used.has(type))
    used.add(type)

    const base = type === 'hp' ? 150 : type === 'spd' ? 8 : type.includes('crit') ? 5 : 60
    const jitter = 0.7 + Math.random() * 0.6
    subs.push({ type, value: Math.round(base * mult * 0.4 * jitter) })
  }
  return subs
}

let gearCounter = 0

export function generateGear(chapterDifficulty: number = 1): Gear {
  const rarity = rollRarity(chapterDifficulty)
  const slot = pick(slots)
  const name = pick(gearNames[slot])

  gearCounter++
  return {
    id: `gear-${Date.now()}-${gearCounter}`,
    name,
    slot,
    rarity,
    mainStat: generateMainStat(slot, rarity),
    subStats: generateSubStats(rarity),
    setBonus: rarity === 'legendary' || (rarity === 'epic' && Math.random() > 0.5) ? pick(setBonuses) : undefined,
  }
}

/** Calculate total stat bonuses from all equipped gear */
export function getGearStatBonuses(equippedGear: Partial<Record<Gear['slot'], Gear>>): Record<string, number> {
  const bonuses: Record<string, number> = {}
  for (const gear of Object.values(equippedGear)) {
    if (!gear) continue
    bonuses[gear.mainStat.type] = (bonuses[gear.mainStat.type] || 0) + gear.mainStat.value
    for (const sub of gear.subStats) {
      bonuses[sub.type] = (bonuses[sub.type] || 0) + sub.value
    }
  }
  return bonuses
}
