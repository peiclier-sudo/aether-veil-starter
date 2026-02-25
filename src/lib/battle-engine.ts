/**
 * Turn-based Battle Engine
 * Based on docs/combat-system.md v1.1 — Cooldown-based, turn-meter initiative
 */

export type Faction = 'Dawn Sentinels' | 'Veil Walkers' | 'Obsidian Pact' | 'Stormborn'
export type StatusType = 'poison' | 'burn' | 'stun' | 'shield' | 'atk_up' | 'atk_down' | 'def_up' | 'def_down' | 'regen' | 'speed_up'

export interface StatusEffect {
  type: StatusType
  duration: number // turns remaining
  value: number // damage for DoT, % for buffs/debuffs, flat for shield
  source: string // who applied it
}

export interface BattleSkill {
  name: string
  cooldown: number // base cooldown in turns
  currentCd: number // turns until available (0 = ready)
  level: number
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'aoe_damage' | 'aoe_heal'
  multiplier: number // skill multiplier applied to ATK
  statusEffect?: { type: StatusType; chance: number; duration: number; value: number }
  targetType: 'enemy' | 'ally' | 'self' | 'all_enemies' | 'all_allies'
  description: string
}

export interface BattleUnit {
  id: string
  name: string
  faction: string
  role: string
  isEnemy: boolean
  // Stats — per combat-system.md §1
  maxHp: number
  currentHp: number
  atk: number
  def: number
  spd: number
  critRate: number // 0-100 (percentage)
  critDmg: number // percentage, e.g. 150 = 1.5× — per doc table
  acc: number // accuracy stat — per doc
  res: number // resistance stat — per doc
  turnMeter: number // 0-100, acts at 100 — per doc §2
  // Combat state
  skills: BattleSkill[]
  statusEffects: StatusEffect[]
  isAlive: boolean
  // Visual
  modelId: string // PLACEHOLDER — replace with actual 3D model path
  portraitId: string // PLACEHOLDER — replace with actual portrait path
  rarity: string
}

export interface BattleAction {
  type: 'skill' | 'basic_attack' | 'status_tick' | 'death' | 'turn_start'
  actorId: string
  actorName: string
  targetId?: string
  targetName?: string
  skillName?: string
  damage?: number
  healing?: number
  isCrit?: boolean
  statusApplied?: StatusType
  statusRemoved?: StatusType
  message: string
}

export interface BattleState {
  turn: number
  turnOrder: string[] // unit IDs in turn order for current round
  currentUnitIndex: number
  playerTeam: BattleUnit[]
  enemyTeam: BattleUnit[]
  log: BattleAction[]
  phase: 'active' | 'victory' | 'defeat'
  autoMode: boolean
}

// ------------------------------------------------------------------
// Faction affinity — per doc §3: 1.3 advantage, 0.7 disadvantage, 1.0 neutral
// ------------------------------------------------------------------
const FACTION_ADVANTAGE: Record<string, Record<string, number>> = {
  'Dawn Sentinels': { 'Veil Walkers': 1.3, 'Obsidian Pact': 0.7, 'Stormborn': 1.0, 'Dawn Sentinels': 1.0 },
  'Veil Walkers': { 'Obsidian Pact': 1.3, 'Dawn Sentinels': 0.7, 'Stormborn': 1.0, 'Veil Walkers': 1.0 },
  'Obsidian Pact': { 'Stormborn': 1.3, 'Veil Walkers': 0.7, 'Dawn Sentinels': 1.0, 'Obsidian Pact': 1.0 },
  'Stormborn': { 'Dawn Sentinels': 1.3, 'Obsidian Pact': 0.7, 'Veil Walkers': 1.0, 'Stormborn': 1.0 },
}

function getAffinityMultiplier(attackerFaction: string, defenderFaction: string): number {
  return FACTION_ADVANTAGE[attackerFaction]?.[defenderFaction] ?? 1.0
}

// ------------------------------------------------------------------
// Role modifiers — per doc §1
// ------------------------------------------------------------------
const ROLE_MODIFIERS: Record<string, { hp: number; atk: number; def: number; spd: number; acc: number; res: number }> = {
  offensive: { hp: 1.0, atk: 1.15, def: 0.9, spd: 1.08, acc: 1.0, res: 1.0 },
  defensive: { hp: 1.25, atk: 0.9, def: 1.2, spd: 1.0, acc: 1.0, res: 1.0 },
  support:   { hp: 1.15, atk: 1.0, def: 1.0, spd: 1.0, acc: 1.12, res: 1.18 },
}

export function applyRoleModifiers(
  role: string,
  stats: { hp: number; atk: number; def: number; spd: number; acc: number; res: number }
) {
  const mod = ROLE_MODIFIERS[role] || ROLE_MODIFIERS.offensive
  return {
    hp: Math.round(stats.hp * mod.hp),
    atk: Math.round(stats.atk * mod.atk),
    def: Math.round(stats.def * mod.def),
    spd: Math.round(stats.spd * mod.spd),
    acc: Math.round(stats.acc * mod.acc),
    res: Math.round(stats.res * mod.res),
  }
}

// ------------------------------------------------------------------
// Per-rarity crit stats — per doc §1
// ------------------------------------------------------------------
const RARITY_CRIT: Record<string, { rate: number; dmg: number }> = {
  common:    { rate: 15, dmg: 150 },
  rare:      { rate: 18, dmg: 160 },
  epic:      { rate: 22, dmg: 172 },
  legendary: { rate: 26, dmg: 185 },
}

export function getCritForRarity(rarity: string): { rate: number; dmg: number } {
  return RARITY_CRIT[rarity] || RARITY_CRIT.common
}

// ------------------------------------------------------------------
// Stat helpers
// ------------------------------------------------------------------
function getBuffedStat(unit: BattleUnit, stat: 'atk' | 'def' | 'spd'): number {
  let base = unit[stat]
  for (const effect of unit.statusEffects) {
    if (effect.type === `${stat}_up`) base = Math.round(base * (1 + effect.value / 100))
    if (effect.type === `${stat}_down`) base = Math.round(base * (1 - effect.value / 100))
  }
  return base
}

function isStunned(unit: BattleUnit): boolean {
  return unit.statusEffects.some(e => e.type === 'stun')
}

// ------------------------------------------------------------------
// Damage formula — per doc §3 (copy-paste ready from spec)
// baseDamage = ATK * skillMultiplier
// defReduction = DEF / (DEF + 600)   — soft cap
// affinityMod = 1.3 / 0.7 / 1.0
// variance = 0.92 … 1.08
// finalDamage = floor(baseDamage * critMult * (1 - defReduction) * affinityMod * variance)
// ------------------------------------------------------------------
function calculateDamage(
  attacker: BattleUnit,
  defender: BattleUnit,
  multiplier: number
): { damage: number; isCrit: boolean } {
  const atk = getBuffedStat(attacker, 'atk')
  const def = getBuffedStat(defender, 'def')

  const baseDamage = atk * multiplier
  const isCrit = Math.random() * 100 < attacker.critRate
  const critMult = isCrit ? (attacker.critDmg / 100) : 1.0
  const defReduction = def / (def + 600) // soft cap per doc
  const affinityMod = getAffinityMultiplier(attacker.faction, defender.faction)
  const variance = 0.92 + Math.random() * 0.16

  const finalDamage = Math.max(1, Math.floor(baseDamage * critMult * (1 - defReduction) * affinityMod * variance))
  return { damage: finalDamage, isCrit }
}

function applyDamage(unit: BattleUnit, damage: number): number {
  // Shield absorbs first
  let remaining = damage
  const shields = unit.statusEffects.filter(e => e.type === 'shield')
  for (const shield of shields) {
    if (remaining <= 0) break
    const absorbed = Math.min(shield.value, remaining)
    shield.value -= absorbed
    remaining -= absorbed
  }
  // Remove depleted shields
  unit.statusEffects = unit.statusEffects.filter(e => e.type !== 'shield' || e.value > 0)
  // Apply remaining to HP
  unit.currentHp = Math.max(0, unit.currentHp - remaining)
  if (unit.currentHp <= 0) unit.isAlive = false
  return damage
}

function applyHealing(unit: BattleUnit, amount: number): number {
  const actual = Math.min(amount, unit.maxHp - unit.currentHp)
  unit.currentHp += actual
  return actual
}

/** Process status effect ticks (DoTs, regen, duration countdown) */
function processStatusTicks(unit: BattleUnit, log: BattleAction[]): void {
  const toRemove: StatusType[] = []

  for (const effect of unit.statusEffects) {
    if (effect.type === 'poison' || effect.type === 'burn') {
      const dmg = effect.value
      unit.currentHp = Math.max(0, unit.currentHp - dmg)
      if (unit.currentHp <= 0) unit.isAlive = false
      log.push({
        type: 'status_tick',
        actorId: unit.id,
        actorName: unit.name,
        damage: dmg,
        message: `${unit.name} takes ${dmg} ${effect.type} damage`,
      })
    }
    if (effect.type === 'regen') {
      const heal = Math.min(effect.value, unit.maxHp - unit.currentHp)
      unit.currentHp += heal
      if (heal > 0) {
        log.push({
          type: 'status_tick',
          actorId: unit.id,
          actorName: unit.name,
          healing: heal,
          message: `${unit.name} regenerates ${heal} HP`,
        })
      }
    }

    effect.duration -= 1
    if (effect.duration <= 0) toRemove.push(effect.type)
  }

  for (const type of toRemove) {
    unit.statusEffects = unit.statusEffects.filter(e => e.type !== type || e.duration > 0)
    log.push({
      type: 'status_tick',
      actorId: unit.id,
      actorName: unit.name,
      statusRemoved: type,
      message: `${unit.name}'s ${type.replace('_', ' ')} wore off`,
    })
  }
}

/**
 * Turn Meter system — per doc §2
 * SPD / 100 fill per tick. When a unit reaches 100 → they act, meter resets to 0.
 * We simulate ticks to find the next acting order for the round.
 */
function computeTurnOrder(state: BattleState): string[] {
  const all = [...state.playerTeam, ...state.enemyTeam].filter(u => u.isAlive)
  // Simulate turn meter fills to produce a round order
  // Clone meters so we don't mutate real state during ordering
  const meters = new Map<string, number>()
  for (const u of all) meters.set(u.id, u.turnMeter)

  const order: string[] = []
  const maxTicks = all.length * 3 // safety cap

  for (let i = 0; i < maxTicks && order.length < all.length; i++) {
    // Tick all meters
    for (const u of all) {
      if (order.includes(u.id)) continue
      const spd = getBuffedStat(u, 'spd')
      meters.set(u.id, (meters.get(u.id) || 0) + spd / 100)
    }
    // Check who reached 100
    const ready = all
      .filter(u => !order.includes(u.id) && (meters.get(u.id) || 0) >= 100)
      .sort((a, b) => (meters.get(b.id) || 0) - (meters.get(a.id) || 0)) // highest meter first
    for (const u of ready) {
      order.push(u.id)
      meters.set(u.id, 0) // reset on action — per doc §2
    }
  }

  // Fallback: add any remaining units sorted by SPD
  for (const u of all.sort((a, b) => getBuffedStat(b, 'spd') - getBuffedStat(a, 'spd'))) {
    if (!order.includes(u.id)) order.push(u.id)
  }

  return order
}

function getUnit(state: BattleState, id: string): BattleUnit | undefined {
  return [...state.playerTeam, ...state.enemyTeam].find(u => u.id === id)
}

function getAliveEnemiesOf(state: BattleState, isEnemy: boolean): BattleUnit[] {
  const team = isEnemy ? state.playerTeam : state.enemyTeam
  return team.filter(u => u.isAlive)
}

function getAliveAlliesOf(state: BattleState, isEnemy: boolean): BattleUnit[] {
  const team = isEnemy ? state.enemyTeam : state.playerTeam
  return team.filter(u => u.isAlive)
}

/** AI picks a skill and target */
function aiChooseAction(unit: BattleUnit, state: BattleState): { skillIndex: number; targetId: string } {
  const readySkills = unit.skills.map((s, i) => ({ skill: s, index: i })).filter(s => s.skill.currentCd === 0)
  const enemies = getAliveEnemiesOf(state, unit.isEnemy)
  const allies = getAliveAlliesOf(state, unit.isEnemy)

  // Priority: heal low ally > use strongest ready skill > basic attack
  for (const s of readySkills) {
    if ((s.skill.type === 'heal' || s.skill.type === 'aoe_heal') && allies.some(a => a.currentHp < a.maxHp * 0.5)) {
      const target = allies.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0]
      return { skillIndex: s.index, targetId: target.id }
    }
  }

  // Use highest multiplier damage skill
  const damageSkills = readySkills.filter(s => s.skill.type === 'damage' || s.skill.type === 'aoe_damage' || s.skill.type === 'debuff')
  if (damageSkills.length > 0) {
    const best = damageSkills.sort((a, b) => b.skill.multiplier - a.skill.multiplier)[0]
    const target = enemies.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0] || enemies[0]
    return { skillIndex: best.index, targetId: target?.id || '' }
  }

  // Basic attack (index -1)
  const target = enemies.sort((a, b) => a.currentHp - b.currentHp)[0]
  return { skillIndex: -1, targetId: target?.id || '' }
}

/** Execute a single unit's turn */
export function executeTurn(
  state: BattleState,
  actorId: string,
  skillIndex: number, // -1 = basic attack
  targetId: string
): BattleAction[] {
  const actions: BattleAction[] = []
  const actor = getUnit(state, actorId)
  if (!actor || !actor.isAlive) return actions

  // Process status ticks at start of turn
  processStatusTicks(actor, actions)
  if (!actor.isAlive) {
    actions.push({ type: 'death', actorId: actor.id, actorName: actor.name, message: `${actor.name} has fallen!` })
    return actions
  }

  // Stunned: skip turn
  if (isStunned(actor)) {
    actions.push({ type: 'turn_start', actorId: actor.id, actorName: actor.name, message: `${actor.name} is stunned!` })
    return actions
  }

  // Basic attack
  if (skillIndex === -1) {
    const target = getUnit(state, targetId)
    if (!target || !target.isAlive) return actions
    const { damage, isCrit } = calculateDamage(actor, target, 1.0)
    applyDamage(target, damage)
    actions.push({
      type: 'basic_attack',
      actorId: actor.id,
      actorName: actor.name,
      targetId: target.id,
      targetName: target.name,
      damage,
      isCrit,
      message: `${actor.name} attacks ${target.name} for ${damage}${isCrit ? ' CRIT!' : ''}`,
    })
    if (!target.isAlive) {
      actions.push({ type: 'death', actorId: target.id, actorName: target.name, message: `${target.name} has fallen!` })
    }
    return actions
  }

  // Skill use
  const skill = actor.skills[skillIndex]
  if (!skill || skill.currentCd > 0) return actions
  skill.currentCd = skill.cooldown

  switch (skill.type) {
    case 'damage': {
      const target = getUnit(state, targetId)
      if (!target || !target.isAlive) break
      const { damage, isCrit } = calculateDamage(actor, target, skill.multiplier)
      applyDamage(target, damage)
      actions.push({
        type: 'skill', actorId: actor.id, actorName: actor.name,
        targetId: target.id, targetName: target.name,
        skillName: skill.name, damage, isCrit,
        message: `${actor.name} uses ${skill.name} on ${target.name} for ${damage}${isCrit ? ' CRIT!' : ''}`,
      })
      if (skill.statusEffect && Math.random() < skill.statusEffect.chance) {
        target.statusEffects.push({ type: skill.statusEffect.type, duration: skill.statusEffect.duration, value: skill.statusEffect.value, source: actor.id })
        actions.push({
          type: 'skill', actorId: actor.id, actorName: actor.name,
          targetId: target.id, targetName: target.name,
          statusApplied: skill.statusEffect.type,
          message: `${target.name} is afflicted with ${skill.statusEffect.type.replace('_', ' ')}!`,
        })
      }
      if (!target.isAlive) {
        actions.push({ type: 'death', actorId: target.id, actorName: target.name, message: `${target.name} has fallen!` })
      }
      break
    }
    case 'aoe_damage': {
      const targets = getAliveEnemiesOf(state, actor.isEnemy)
      for (const target of targets) {
        const { damage, isCrit } = calculateDamage(actor, target, skill.multiplier * 0.7)
        applyDamage(target, damage)
        actions.push({
          type: 'skill', actorId: actor.id, actorName: actor.name,
          targetId: target.id, targetName: target.name,
          skillName: skill.name, damage, isCrit,
          message: `${actor.name}'s ${skill.name} hits ${target.name} for ${damage}`,
        })
        if (!target.isAlive) {
          actions.push({ type: 'death', actorId: target.id, actorName: target.name, message: `${target.name} has fallen!` })
        }
      }
      break
    }
    case 'heal': {
      const target = getUnit(state, targetId) || actor
      const heal = Math.round(getBuffedStat(actor, 'atk') * skill.multiplier * 0.8)
      const actual = applyHealing(target, heal)
      actions.push({
        type: 'skill', actorId: actor.id, actorName: actor.name,
        targetId: target.id, targetName: target.name,
        skillName: skill.name, healing: actual,
        message: `${actor.name} uses ${skill.name} on ${target.name}, healing ${actual} HP`,
      })
      break
    }
    case 'aoe_heal': {
      const allies = getAliveAlliesOf(state, !actor.isEnemy)
      for (const ally of allies) {
        const heal = Math.round(getBuffedStat(actor, 'atk') * skill.multiplier * 0.5)
        const actual = applyHealing(ally, heal)
        if (actual > 0) {
          actions.push({
            type: 'skill', actorId: actor.id, actorName: actor.name,
            targetId: ally.id, targetName: ally.name,
            skillName: skill.name, healing: actual,
            message: `${actor.name}'s ${skill.name} heals ${ally.name} for ${actual}`,
          })
        }
      }
      break
    }
    case 'buff': {
      const target = getUnit(state, targetId) || actor
      if (skill.statusEffect) {
        target.statusEffects.push({ type: skill.statusEffect.type, duration: skill.statusEffect.duration, value: skill.statusEffect.value, source: actor.id })
        actions.push({
          type: 'skill', actorId: actor.id, actorName: actor.name,
          targetId: target.id, targetName: target.name,
          skillName: skill.name, statusApplied: skill.statusEffect.type,
          message: `${actor.name} uses ${skill.name} on ${target.name}`,
        })
      }
      break
    }
    case 'debuff': {
      const target = getUnit(state, targetId)
      if (!target || !target.isAlive) break
      const { damage, isCrit } = calculateDamage(actor, target, skill.multiplier * 0.6)
      applyDamage(target, damage)
      actions.push({
        type: 'skill', actorId: actor.id, actorName: actor.name,
        targetId: target.id, targetName: target.name,
        skillName: skill.name, damage, isCrit,
        message: `${actor.name} uses ${skill.name} on ${target.name} for ${damage}`,
      })
      if (skill.statusEffect && Math.random() < skill.statusEffect.chance) {
        target.statusEffects.push({ type: skill.statusEffect.type, duration: skill.statusEffect.duration, value: skill.statusEffect.value, source: actor.id })
        actions.push({
          type: 'skill', actorId: actor.id, actorName: actor.name,
          targetId: target.id, targetName: target.name,
          statusApplied: skill.statusEffect.type,
          message: `${target.name}'s ${skill.statusEffect.type.replace('_', ' ')} applied!`,
        })
      }
      if (!target.isAlive) {
        actions.push({ type: 'death', actorId: target.id, actorName: target.name, message: `${target.name} has fallen!` })
      }
      break
    }
  }

  return actions
}

/** Tick all cooldowns down by 1 at end of turn */
export function tickCooldowns(unit: BattleUnit): void {
  for (const skill of unit.skills) {
    if (skill.currentCd > 0) skill.currentCd -= 1
  }
}

/** Check if battle is over */
export function checkBattleEnd(state: BattleState): 'victory' | 'defeat' | null {
  if (state.enemyTeam.every(u => !u.isAlive)) return 'victory'
  if (state.playerTeam.every(u => !u.isAlive)) return 'defeat'
  return null
}

/** Create initial battle state — meters start at 0, first order computed via tick sim */
export function initBattle(playerTeam: BattleUnit[], enemyTeam: BattleUnit[]): BattleState {
  // Ensure all units start with turnMeter = 0
  for (const u of [...playerTeam, ...enemyTeam]) {
    u.turnMeter = 0
  }
  const state: BattleState = {
    turn: 1,
    turnOrder: [],
    currentUnitIndex: 0,
    playerTeam,
    enemyTeam,
    log: [],
    phase: 'active',
    autoMode: false,
  }
  state.turnOrder = computeTurnOrder(state)
  return state
}

/** Advance to next turn, returns actions for the current unit */
export function advanceTurn(state: BattleState, skillIndex: number, targetId: string): BattleAction[] {
  if (state.phase !== 'active') return []

  const currentId = state.turnOrder[state.currentUnitIndex]
  const unit = getUnit(state, currentId)
  if (!unit) return []

  const actions = executeTurn(state, currentId, skillIndex, targetId)
  state.log.push(...actions)

  // Tick cooldowns
  tickCooldowns(unit)

  // Reset turn meter to 0 after acting — per doc §2
  unit.turnMeter = 0

  // Advance index
  state.currentUnitIndex += 1

  // Check battle end
  const result = checkBattleEnd(state)
  if (result) {
    state.phase = result
    return actions
  }

  // If we've gone through all units, start new round
  if (state.currentUnitIndex >= state.turnOrder.length) {
    state.turn += 1
    state.turnOrder = computeTurnOrder(state)
    state.currentUnitIndex = 0
  }

  return actions
}

/** Get the current acting unit */
export function getCurrentUnit(state: BattleState): BattleUnit | undefined {
  const id = state.turnOrder[state.currentUnitIndex]
  return getUnit(state, id)
}

/** Auto-battle: AI picks action for the current unit */
export function autoAction(state: BattleState): { skillIndex: number; targetId: string } {
  const unit = getCurrentUnit(state)
  if (!unit) return { skillIndex: -1, targetId: '' }
  return aiChooseAction(unit, state)
}

/** Convert a Hero from the store into a BattleUnit — applies role modifiers & rarity crit per doc */
export function heroToBattleUnit(hero: {
  id: string; name: string; faction: string; role: string; rarity: string;
  hp?: number; atk?: number; def?: number; spd?: number;
  skills: Array<{ name: string; cooldown: number; level?: number }>
}): BattleUnit {
  const skillTypeMap: Record<string, BattleSkill['type']> = {
    // Offensive skills
    'Solar Flare': 'aoe_damage', 'Corona Burst': 'damage', 'Shadow Rend': 'damage', 'Void Eclipse': 'aoe_damage',
    'Gale Strike': 'damage', 'Tempest Fury': 'aoe_damage', 'Flame Lash': 'damage', 'Inferno Wave': 'aoe_damage',
    'Shadow Slash': 'damage', 'Phase Blade': 'damage', 'Night Cut': 'damage', 'Spark Jab': 'damage',
    // Defensive skills
    'Stone Wall': 'buff', 'Titan Guard': 'buff', 'Dark Barrier': 'buff', 'Iron Fortress': 'buff',
    'Phase Shield': 'buff', 'Void Anchor': 'debuff', 'Thunder Guard': 'buff', 'Rock Stance': 'buff',
    // Support skills
    'Healing Light': 'heal', 'Aurora Shield': 'buff', 'Radiant Mend': 'heal', 'Veil of Grace': 'aoe_heal',
    'Holy Chant': 'heal', 'Wings of Dawn': 'aoe_heal', 'Gentle Glow': 'heal', 'Wind Hymn': 'aoe_heal',
    'Soft Light': 'heal', 'Mist Wrap': 'heal',
    // Generic summoned hero skills
    'Fury Slash': 'damage', 'Infernal Strike': 'damage', 'Shadow Pierce': 'damage', 'Storm Cleave': 'aoe_damage',
    'Void Rend': 'damage', 'Blaze Rush': 'damage', 'Phantom Edge': 'damage', 'Deathblow': 'damage',
    'Crimson Arc': 'aoe_damage', 'Thunder Smite': 'damage',
    'Aegis Wall': 'buff', 'Iron Bastion': 'buff', 'Stone Embrace': 'buff', 'Frost Barrier': 'buff',
    'Void Shell': 'buff', 'Ward of Light': 'buff', 'Titan Block': 'buff', 'Crystal Guard': 'buff',
    'Obsidian Shield': 'buff', 'Unyielding': 'buff',
    'Mending Wave': 'heal', 'Blessing Aura': 'aoe_heal', 'Revitalize': 'heal', 'Spirit Link': 'heal',
    'Harmony Pulse': 'aoe_heal', 'Ethereal Mend': 'heal', 'Dawn Prayer': 'aoe_heal', 'Nature Bond': 'heal',
    'Soul Weave': 'heal', 'Resonance': 'aoe_heal',
  }

  const skills: BattleSkill[] = hero.skills.map(s => {
    const type = skillTypeMap[s.name] || (hero.role === 'support' ? 'heal' : hero.role === 'defensive' ? 'buff' : 'damage')
    const level = s.level || 1
    const mult = type === 'damage' || type === 'debuff' ? 1.2 + level * 0.1
      : type === 'aoe_damage' ? 1.0 + level * 0.08
      : type === 'heal' ? 0.8 + level * 0.1
      : type === 'aoe_heal' ? 0.5 + level * 0.06
      : 1.0

    const targetType = type === 'damage' || type === 'debuff' ? 'enemy'
      : type === 'aoe_damage' ? 'all_enemies'
      : type === 'heal' ? 'ally'
      : type === 'aoe_heal' ? 'all_allies'
      : 'self'

    return {
      name: s.name,
      cooldown: Math.max(1, Math.round(s.cooldown)),
      currentCd: 0,
      level,
      type,
      multiplier: mult,
      statusEffect: type === 'buff' ? { type: 'def_up' as StatusType, chance: 1, duration: 2, value: 25 + level * 3 } :
        type === 'damage' && Math.random() < 0.3
          ? { type: 'burn' as StatusType, chance: 0.2, duration: 2, value: Math.round((hero.atk || 1000) * 0.1) }
          : undefined,
      targetType,
      description: `${type} skill (Lv.${level})`,
    }
  })

  // Apply role modifiers per doc §1
  const baseAcc = 85 + (hero.rarity === 'rare' ? 10 : hero.rarity === 'epic' ? 20 : hero.rarity === 'legendary' ? 30 : 0)
  const baseRes = baseAcc
  const modded = applyRoleModifiers(hero.role, {
    hp: hero.hp || 5000,
    atk: hero.atk || 1000,
    def: hero.def || 800,
    spd: hero.spd || 100,
    acc: baseAcc,
    res: baseRes,
  })

  // Per-rarity crit per doc §1
  const crit = getCritForRarity(hero.rarity)

  return {
    id: hero.id,
    name: hero.name,
    faction: hero.faction,
    role: hero.role,
    isEnemy: false,
    maxHp: modded.hp,
    currentHp: modded.hp,
    atk: modded.atk,
    def: modded.def,
    spd: modded.spd,
    critRate: crit.rate,
    critDmg: crit.dmg, // stored as percentage (e.g. 150 = 1.5×)
    acc: modded.acc,
    res: modded.res,
    turnMeter: 0,
    skills,
    statusEffects: [],
    isAlive: true,
    modelId: `model_${hero.id}`, // PLACEHOLDER — replace with actual model path when uploaded
    portraitId: `portrait_${hero.id}`, // PLACEHOLDER — replace with actual portrait path when uploaded
    rarity: hero.rarity,
  }
}
