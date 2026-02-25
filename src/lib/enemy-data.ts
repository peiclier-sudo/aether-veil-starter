/**
 * Enemy Templates with placeholder names/models
 * Replace model IDs and portrait IDs with actual assets when uploaded
 */

import type { BattleUnit, BattleSkill, StatusType } from './battle-engine'

export interface EnemyTemplate {
  id: string
  name: string // PLACEHOLDER — replace with final enemy name
  faction: string
  role: 'offensive' | 'defensive' | 'support'
  rarity: string
  modelId: string // PLACEHOLDER — replace with actual 3D model path
  portraitId: string // PLACEHOLDER — replace with actual portrait path
  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpd: number
  critRate: number
  critDmg: number
  skills: Omit<BattleSkill, 'currentCd'>[]
}

// ----- Campaign Enemies -----

const campaignEnemies: EnemyTemplate[] = [
  // Chapter 1 — low tier
  {
    id: 'enemy_shade_grunt',
    name: 'Shade Grunt', // PLACEHOLDER
    faction: 'Veil Walkers',
    role: 'offensive',
    rarity: 'common',
    modelId: 'model_enemy_shade_grunt', // PLACEHOLDER
    portraitId: 'portrait_enemy_shade_grunt', // PLACEHOLDER
    baseHp: 3000, baseAtk: 800, baseDef: 400, baseSpd: 100,
    critRate: 5, critDmg: 1.3,
    skills: [{
      name: 'Dark Swipe', cooldown: 3, level: 1, type: 'damage', multiplier: 1.3,
      targetType: 'enemy', description: 'Basic shadow attack',
    }],
  },
  {
    id: 'enemy_ember_imp',
    name: 'Ember Imp', // PLACEHOLDER
    faction: 'Stormborn',
    role: 'offensive',
    rarity: 'common',
    modelId: 'model_enemy_ember_imp', // PLACEHOLDER
    portraitId: 'portrait_enemy_ember_imp', // PLACEHOLDER
    baseHp: 2500, baseAtk: 900, baseDef: 350, baseSpd: 120,
    critRate: 8, critDmg: 1.4,
    skills: [{
      name: 'Flame Spit', cooldown: 2, level: 1, type: 'damage', multiplier: 1.2,
      statusEffect: { type: 'burn' as StatusType, chance: 0.3, duration: 2, value: 80 },
      targetType: 'enemy', description: 'Fire attack with burn chance',
    }],
  },
  {
    id: 'enemy_stone_sentry',
    name: 'Stone Sentry', // PLACEHOLDER
    faction: 'Obsidian Pact',
    role: 'defensive',
    rarity: 'common',
    modelId: 'model_enemy_stone_sentry', // PLACEHOLDER
    portraitId: 'portrait_enemy_stone_sentry', // PLACEHOLDER
    baseHp: 5000, baseAtk: 500, baseDef: 800, baseSpd: 70,
    critRate: 3, critDmg: 1.2,
    skills: [{
      name: 'Fortify', cooldown: 4, level: 1, type: 'buff', multiplier: 1.0,
      statusEffect: { type: 'def_up' as StatusType, chance: 1.0, duration: 3, value: 30 },
      targetType: 'self', description: 'Raise defenses',
    }],
  },
  // Chapter 2 — mid tier
  {
    id: 'enemy_void_stalker',
    name: 'Void Stalker', // PLACEHOLDER
    faction: 'Veil Walkers',
    role: 'offensive',
    rarity: 'rare',
    modelId: 'model_enemy_void_stalker', // PLACEHOLDER
    portraitId: 'portrait_enemy_void_stalker', // PLACEHOLDER
    baseHp: 5500, baseAtk: 1400, baseDef: 700, baseSpd: 140,
    critRate: 15, critDmg: 1.5,
    skills: [
      { name: 'Void Slash', cooldown: 3, level: 1, type: 'damage', multiplier: 1.5, targetType: 'enemy', description: 'Powerful void strike' },
      { name: 'Shadow Step', cooldown: 5, level: 1, type: 'buff', multiplier: 1.0, statusEffect: { type: 'speed_up' as StatusType, chance: 1.0, duration: 2, value: 30 }, targetType: 'self', description: 'Boost own speed' },
    ],
  },
  {
    id: 'enemy_thunder_brute',
    name: 'Thunder Brute', // PLACEHOLDER
    faction: 'Stormborn',
    role: 'offensive',
    rarity: 'rare',
    modelId: 'model_enemy_thunder_brute', // PLACEHOLDER
    portraitId: 'portrait_enemy_thunder_brute', // PLACEHOLDER
    baseHp: 7000, baseAtk: 1200, baseDef: 900, baseSpd: 110,
    critRate: 10, critDmg: 1.5,
    skills: [
      { name: 'Thunder Smash', cooldown: 4, level: 1, type: 'aoe_damage', multiplier: 1.0, targetType: 'all_enemies', description: 'AoE thunder damage' },
      { name: 'War Cry', cooldown: 5, level: 1, type: 'buff', multiplier: 1.0, statusEffect: { type: 'atk_up' as StatusType, chance: 1.0, duration: 2, value: 25 }, targetType: 'self', description: 'Boost own attack' },
    ],
  },
  {
    id: 'enemy_crystal_shaman',
    name: 'Crystal Shaman', // PLACEHOLDER
    faction: 'Dawn Sentinels',
    role: 'support',
    rarity: 'rare',
    modelId: 'model_enemy_crystal_shaman', // PLACEHOLDER
    portraitId: 'portrait_enemy_crystal_shaman', // PLACEHOLDER
    baseHp: 6000, baseAtk: 1000, baseDef: 800, baseSpd: 125,
    critRate: 5, critDmg: 1.3,
    skills: [
      { name: 'Crystal Mend', cooldown: 3, level: 1, type: 'heal', multiplier: 1.0, targetType: 'ally', description: 'Heal an ally' },
      { name: 'Shatter Bolt', cooldown: 4, level: 1, type: 'debuff', multiplier: 1.0, statusEffect: { type: 'def_down' as StatusType, chance: 0.6, duration: 2, value: 20 }, targetType: 'enemy', description: 'Attack that lowers DEF' },
    ],
  },
  // Chapter 3 — high tier
  {
    id: 'enemy_abyss_knight',
    name: 'Abyss Knight', // PLACEHOLDER
    faction: 'Obsidian Pact',
    role: 'offensive',
    rarity: 'epic',
    modelId: 'model_enemy_abyss_knight', // PLACEHOLDER
    portraitId: 'portrait_enemy_abyss_knight', // PLACEHOLDER
    baseHp: 10000, baseAtk: 2200, baseDef: 1400, baseSpd: 130,
    critRate: 20, critDmg: 1.6,
    skills: [
      { name: 'Abyssal Cleave', cooldown: 3, level: 1, type: 'damage', multiplier: 1.8, targetType: 'enemy', description: 'Devastating single-target strike' },
      { name: 'Dark Tide', cooldown: 6, level: 1, type: 'aoe_damage', multiplier: 1.2, targetType: 'all_enemies', description: 'AoE dark damage' },
    ],
  },
  {
    id: 'enemy_lich_warden',
    name: 'Lich Warden', // PLACEHOLDER
    faction: 'Veil Walkers',
    role: 'support',
    rarity: 'epic',
    modelId: 'model_enemy_lich_warden', // PLACEHOLDER
    portraitId: 'portrait_enemy_lich_warden', // PLACEHOLDER
    baseHp: 8500, baseAtk: 1600, baseDef: 1200, baseSpd: 135,
    critRate: 12, critDmg: 1.4,
    skills: [
      { name: 'Soul Drain', cooldown: 3, level: 1, type: 'damage', multiplier: 1.4, statusEffect: { type: 'poison' as StatusType, chance: 0.5, duration: 3, value: 120 }, targetType: 'enemy', description: 'Poison damage' },
      { name: 'Dark Renewal', cooldown: 5, level: 1, type: 'aoe_heal', multiplier: 0.8, targetType: 'all_allies', description: 'Heal all allies' },
    ],
  },
  {
    id: 'enemy_storm_colossus',
    name: 'Storm Colossus', // PLACEHOLDER
    faction: 'Stormborn',
    role: 'defensive',
    rarity: 'epic',
    modelId: 'model_enemy_storm_colossus', // PLACEHOLDER
    portraitId: 'portrait_enemy_storm_colossus', // PLACEHOLDER
    baseHp: 16000, baseAtk: 1400, baseDef: 2200, baseSpd: 90,
    critRate: 8, critDmg: 1.3,
    skills: [
      { name: 'Colossal Slam', cooldown: 4, level: 1, type: 'aoe_damage', multiplier: 0.9, statusEffect: { type: 'stun' as StatusType, chance: 0.25, duration: 1, value: 0 }, targetType: 'all_enemies', description: 'AoE with stun chance' },
      { name: 'Iron Will', cooldown: 5, level: 1, type: 'buff', multiplier: 1.0, statusEffect: { type: 'shield' as StatusType, chance: 1.0, duration: 3, value: 3000 }, targetType: 'self', description: 'Massive shield' },
    ],
  },
]

// ----- Dungeon Enemies -----

const dungeonEnemies: EnemyTemplate[] = [
  {
    id: 'enemy_cavern_golem',
    name: 'Cavern Golem', // PLACEHOLDER
    faction: 'Obsidian Pact',
    role: 'defensive',
    rarity: 'rare',
    modelId: 'model_enemy_cavern_golem', // PLACEHOLDER
    portraitId: 'portrait_enemy_cavern_golem', // PLACEHOLDER
    baseHp: 8000, baseAtk: 900, baseDef: 1200, baseSpd: 80,
    critRate: 5, critDmg: 1.2,
    skills: [
      { name: 'Rock Crush', cooldown: 3, level: 1, type: 'damage', multiplier: 1.4, targetType: 'enemy', description: 'Heavy rock attack' },
    ],
  },
  {
    id: 'enemy_shard_wraith',
    name: 'Shard Wraith', // PLACEHOLDER
    faction: 'Veil Walkers',
    role: 'offensive',
    rarity: 'rare',
    modelId: 'model_enemy_shard_wraith', // PLACEHOLDER
    portraitId: 'portrait_enemy_shard_wraith', // PLACEHOLDER
    baseHp: 4500, baseAtk: 1500, baseDef: 600, baseSpd: 150,
    critRate: 18, critDmg: 1.6,
    skills: [
      { name: 'Phase Strike', cooldown: 2, level: 1, type: 'damage', multiplier: 1.5, targetType: 'enemy', description: 'Fast phase attack' },
      { name: 'Spectral Drain', cooldown: 5, level: 1, type: 'damage', multiplier: 1.2, statusEffect: { type: 'atk_down' as StatusType, chance: 0.5, duration: 2, value: 20 }, targetType: 'enemy', description: 'Attack debuff' },
    ],
  },
  {
    id: 'enemy_void_herald',
    name: 'Void Herald', // PLACEHOLDER
    faction: 'Veil Walkers',
    role: 'offensive',
    rarity: 'epic',
    modelId: 'model_enemy_void_herald', // PLACEHOLDER
    portraitId: 'portrait_enemy_void_herald', // PLACEHOLDER
    baseHp: 12000, baseAtk: 2000, baseDef: 1100, baseSpd: 145,
    critRate: 22, critDmg: 1.7,
    skills: [
      { name: 'Void Rend', cooldown: 3, level: 1, type: 'damage', multiplier: 1.8, targetType: 'enemy', description: 'Devastating void attack' },
      { name: 'Entropy Wave', cooldown: 6, level: 1, type: 'aoe_damage', multiplier: 1.1, statusEffect: { type: 'poison' as StatusType, chance: 0.4, duration: 2, value: 150 }, targetType: 'all_enemies', description: 'AoE with poison' },
    ],
  },
]

// ----- Arena Enemies (procedural from templates) -----

const arenaTemplates: EnemyTemplate[] = [
  {
    id: 'arena_berserker',
    name: 'Arena Berserker', // PLACEHOLDER
    faction: 'Stormborn',
    role: 'offensive',
    rarity: 'epic',
    modelId: 'model_arena_berserker', // PLACEHOLDER
    portraitId: 'portrait_arena_berserker', // PLACEHOLDER
    baseHp: 8000, baseAtk: 2000, baseDef: 1000, baseSpd: 140,
    critRate: 20, critDmg: 1.6,
    skills: [
      { name: 'Frenzy Slash', cooldown: 3, level: 1, type: 'damage', multiplier: 1.6, targetType: 'enemy', description: 'Berserk strike' },
      { name: 'Bloodlust', cooldown: 5, level: 1, type: 'buff', multiplier: 1.0, statusEffect: { type: 'atk_up' as StatusType, chance: 1.0, duration: 3, value: 35 }, targetType: 'self', description: 'Massive ATK boost' },
    ],
  },
  {
    id: 'arena_sentinel',
    name: 'Arena Sentinel', // PLACEHOLDER
    faction: 'Dawn Sentinels',
    role: 'defensive',
    rarity: 'epic',
    modelId: 'model_arena_sentinel', // PLACEHOLDER
    portraitId: 'portrait_arena_sentinel', // PLACEHOLDER
    baseHp: 14000, baseAtk: 1200, baseDef: 2000, baseSpd: 105,
    critRate: 8, critDmg: 1.3,
    skills: [
      { name: 'Shield Bash', cooldown: 3, level: 1, type: 'damage', multiplier: 1.2, statusEffect: { type: 'stun' as StatusType, chance: 0.3, duration: 1, value: 0 }, targetType: 'enemy', description: 'Stun attack' },
      { name: 'Bastion', cooldown: 5, level: 1, type: 'buff', multiplier: 1.0, statusEffect: { type: 'shield' as StatusType, chance: 1.0, duration: 3, value: 2500 }, targetType: 'self', description: 'Self shield' },
    ],
  },
  {
    id: 'arena_oracle',
    name: 'Arena Oracle', // PLACEHOLDER
    faction: 'Dawn Sentinels',
    role: 'support',
    rarity: 'epic',
    modelId: 'model_arena_oracle', // PLACEHOLDER
    portraitId: 'portrait_arena_oracle', // PLACEHOLDER
    baseHp: 9000, baseAtk: 1400, baseDef: 1200, baseSpd: 130,
    critRate: 10, critDmg: 1.4,
    skills: [
      { name: 'Radiant Heal', cooldown: 3, level: 1, type: 'heal', multiplier: 1.2, targetType: 'ally', description: 'Strong heal' },
      { name: 'Purifying Light', cooldown: 5, level: 1, type: 'aoe_heal', multiplier: 0.6, targetType: 'all_allies', description: 'AoE heal' },
    ],
  },
  {
    id: 'arena_assassin',
    name: 'Arena Assassin', // PLACEHOLDER
    faction: 'Veil Walkers',
    role: 'offensive',
    rarity: 'epic',
    modelId: 'model_arena_assassin', // PLACEHOLDER
    portraitId: 'portrait_arena_assassin', // PLACEHOLDER
    baseHp: 6500, baseAtk: 2400, baseDef: 800, baseSpd: 170,
    critRate: 30, critDmg: 1.8,
    skills: [
      { name: 'Backstab', cooldown: 2, level: 1, type: 'damage', multiplier: 2.0, targetType: 'enemy', description: 'High crit damage' },
      { name: 'Smoke Bomb', cooldown: 6, level: 1, type: 'debuff', multiplier: 0.5, statusEffect: { type: 'atk_down' as StatusType, chance: 0.8, duration: 2, value: 30 }, targetType: 'enemy', description: 'Reduce enemy ATK' },
    ],
  },
  {
    id: 'arena_warlord',
    name: 'Arena Warlord', // PLACEHOLDER
    faction: 'Obsidian Pact',
    role: 'offensive',
    rarity: 'epic',
    modelId: 'model_arena_warlord', // PLACEHOLDER
    portraitId: 'portrait_arena_warlord', // PLACEHOLDER
    baseHp: 11000, baseAtk: 1800, baseDef: 1500, baseSpd: 120,
    critRate: 15, critDmg: 1.5,
    skills: [
      { name: 'Warlord Cleave', cooldown: 3, level: 1, type: 'aoe_damage', multiplier: 1.1, targetType: 'all_enemies', description: 'AoE slash' },
      { name: 'Battle Standard', cooldown: 6, level: 1, type: 'buff', multiplier: 1.0, statusEffect: { type: 'atk_up' as StatusType, chance: 1.0, duration: 2, value: 20 }, targetType: 'self', description: 'ATK boost' },
    ],
  },
]

/** Scale an enemy template to a target power level */
function scaleTemplate(template: EnemyTemplate, targetPower: number): BattleUnit {
  const basePower = template.baseHp * 0.3 + template.baseAtk * 1.5 + template.baseDef * 1.0 + template.baseSpd * 2
  const scale = Math.max(0.3, targetPower / basePower)

  const skills: BattleSkill[] = template.skills.map(s => ({
    ...s,
    currentCd: 0,
    multiplier: s.multiplier * (1 + scale * 0.1),
  }))

  return {
    id: `${template.id}_${Math.random().toString(36).slice(2, 8)}`,
    name: template.name,
    faction: template.faction,
    role: template.role,
    isEnemy: true,
    maxHp: Math.round(template.baseHp * scale),
    currentHp: Math.round(template.baseHp * scale),
    atk: Math.round(template.baseAtk * scale),
    def: Math.round(template.baseDef * scale),
    spd: Math.round(template.baseSpd * (0.9 + scale * 0.1)),
    critRate: template.critRate,
    critDmg: template.critDmg,
    skills,
    statusEffects: [],
    isAlive: true,
    modelId: template.modelId,
    portraitId: template.portraitId,
    rarity: template.rarity,
  }
}

/** Generate campaign enemies for a given stage power */
export function generateCampaignEnemies(stagePower: number, chapter: number): BattleUnit[] {
  const count = chapter === 1 ? 3 : chapter === 2 ? 4 : 5
  const pool = chapter === 1
    ? campaignEnemies.filter(e => e.rarity === 'common')
    : chapter === 2
    ? campaignEnemies.filter(e => e.rarity === 'common' || e.rarity === 'rare')
    : campaignEnemies

  const enemies: BattleUnit[] = []
  const perEnemyPower = stagePower / count
  for (let i = 0; i < count; i++) {
    const template = pool[i % pool.length]
    enemies.push(scaleTemplate(template, perEnemyPower))
  }
  return enemies
}

/** Generate dungeon enemies for a given floor power */
export function generateDungeonEnemies(floorPower: number, floor: number): BattleUnit[] {
  const count = Math.min(3 + Math.floor(floor / 2), 5)
  const pool = floor <= 2 ? dungeonEnemies.filter(e => e.rarity !== 'epic') : dungeonEnemies
  const perEnemyPower = floorPower / count
  const enemies: BattleUnit[] = []
  for (let i = 0; i < count; i++) {
    const template = pool[i % pool.length]
    enemies.push(scaleTemplate(template, perEnemyPower))
  }
  return enemies
}

/** Generate arena enemies scaled to player power */
export function generateArenaEnemies(teamPower: number, arenaRating: number): BattleUnit[] {
  const count = Math.min(3 + Math.floor(arenaRating / 500), 5)
  const variance = 0.85 + Math.random() * 0.3
  const targetPower = (teamPower * variance) / count

  const enemies: BattleUnit[] = []
  const shuffled = [...arenaTemplates].sort(() => Math.random() - 0.5)
  for (let i = 0; i < count; i++) {
    const template = shuffled[i % shuffled.length]
    enemies.push(scaleTemplate(template, targetPower))
  }
  return enemies
}

/** Generate guild boss as a single powerful enemy */
export function generateGuildBossUnit(bossName: string, bossHp: number, bossMaxHp: number): BattleUnit[] {
  const template: EnemyTemplate = {
    id: 'guild_boss',
    name: bossName,
    faction: ['Dawn Sentinels', 'Veil Walkers', 'Obsidian Pact', 'Stormborn'][Math.floor(Math.random() * 4)],
    role: 'offensive',
    rarity: 'legendary',
    modelId: 'model_guild_boss', // PLACEHOLDER
    portraitId: 'portrait_guild_boss', // PLACEHOLDER
    baseHp: bossMaxHp,
    baseAtk: Math.round(bossMaxHp * 0.08),
    baseDef: Math.round(bossMaxHp * 0.04),
    baseSpd: 120,
    critRate: 15,
    critDmg: 1.5,
    skills: [
      { name: 'Annihilate', cooldown: 3, level: 1, type: 'damage', multiplier: 2.0, targetType: 'enemy', description: 'Devastating single hit' },
      { name: 'Cataclysm', cooldown: 6, level: 1, type: 'aoe_damage', multiplier: 1.3, statusEffect: { type: 'burn' as StatusType, chance: 0.4, duration: 2, value: 200 }, targetType: 'all_enemies', description: 'AoE with burn' },
      { name: 'Boss Fury', cooldown: 5, level: 1, type: 'buff', multiplier: 1.0, statusEffect: { type: 'atk_up' as StatusType, chance: 1.0, duration: 3, value: 40 }, targetType: 'self', description: 'Massive ATK boost' },
    ],
  }

  const boss: BattleUnit = {
    id: 'guild_boss_unit',
    name: bossName,
    faction: template.faction,
    role: template.role,
    isEnemy: true,
    maxHp: bossMaxHp,
    currentHp: bossHp,
    atk: template.baseAtk,
    def: template.baseDef,
    spd: template.baseSpd,
    critRate: template.critRate,
    critDmg: template.critDmg,
    skills: template.skills.map(s => ({ ...s, currentCd: 0 })),
    statusEffects: [],
    isAlive: true,
    modelId: template.modelId,
    portraitId: template.portraitId,
    rarity: template.rarity,
  }

  return [boss]
}
