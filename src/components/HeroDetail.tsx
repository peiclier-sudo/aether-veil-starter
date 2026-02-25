import { useState, useMemo } from 'react'
import { useGameStore, Hero, Gear } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import { getLevelUpCost, getMaxLevel, computeLevelUpStats } from '@/lib/leveling'
import { getGearStatBonuses } from '@/lib/gear-generator'
import { getSkillUpgradeCost, MAX_SKILL_LEVEL, getUpgradedCooldown } from '@/lib/skill-upgrades'
import { defaultStarsByRarity } from '@/lib/ascension'

const rarityBadgeColor: Record<string, string> = {
  common:    'bg-zinc-600 text-zinc-200',
  rare:      'bg-blue-600 text-blue-100',
  epic:      'bg-purple-600 text-purple-100',
  legendary: 'bg-yellow-500 text-black font-bold',
}

const gearRarityColor: Record<string, string> = {
  common:    'border-zinc-500/50 bg-zinc-900/50',
  rare:      'border-blue-400/50 bg-blue-950/50',
  epic:      'border-purple-400/50 bg-purple-950/50',
  legendary: 'border-yellow-400/50 bg-yellow-950/50',
}

const slotLabels: Record<string, string> = {
  weapon: '⚔️ Weapon',
  head: '🪖 Head',
  chest: '🛡️ Chest',
  arms: '🧤 Arms',
  legs: '👖 Legs',
  boots: '👢 Boots',
  core1: '💎 Core 1',
  core2: '💎 Core 2',
}

const GEAR_SLOTS: Gear['slot'][] = ['weapon', 'head', 'chest', 'arms', 'legs', 'boots', 'core1', 'core2']

function GearSlot({
  slot,
  gear,
  onEquip,
  onUnequip,
}: {
  slot: Gear['slot']
  gear: Gear | undefined
  onEquip: () => void
  onUnequip: () => void
}) {
  return (
    <div
      className={`rounded-lg border p-2.5 transition-all ${
        gear
          ? `${gearRarityColor[gear.rarity]} hover:brightness-110 cursor-pointer`
          : 'border-dashed border-white/15 bg-white/[0.02] hover:bg-white/5 cursor-pointer'
      }`}
      onClick={gear ? onUnequip : onEquip}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40">{slotLabels[slot]}</span>
        {gear && (
          <span className={`text-[8px] px-1 py-0.5 rounded uppercase ${rarityBadgeColor[gear.rarity]}`}>
            {gear.rarity[0]}
          </span>
        )}
      </div>
      {gear ? (
        <div className="mt-1">
          <p className="text-xs font-medium text-white truncate">{gear.name}</p>
          <p className="text-[10px] text-white/50 mt-0.5">
            {gear.mainStat.type.toUpperCase()} +{gear.mainStat.value}
          </p>
        </div>
      ) : (
        <p className="text-[10px] text-white/20 mt-1">Empty</p>
      )}
    </div>
  )
}

function GearPickerModal({
  slot,
  heroId,
  onClose,
}: {
  slot: Gear['slot']
  heroId: string
  onClose: () => void
}) {
  const { inventory, equipGear } = useGameStore()
  const matching = inventory
    .filter(g => g.slot === slot)
    .sort((a, b) => {
      const order: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 }
      return (order[b.rarity] || 0) - (order[a.rarity] || 0)
    })

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1a1028] border border-white/15 rounded-2xl w-full max-w-sm max-h-[70vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{slotLabels[slot]}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-sm">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {matching.length === 0 ? (
            <p className="text-center text-white/30 text-xs py-8">No gear for this slot. Win battles to get gear drops!</p>
          ) : (
            matching.map(gear => (
              <button
                key={gear.id}
                onClick={() => { equipGear(heroId, gear); onClose() }}
                className={`w-full text-left rounded-lg border p-3 transition-all hover:brightness-110 ${gearRarityColor[gear.rarity]}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">{gear.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase ${rarityBadgeColor[gear.rarity]}`}>
                    {gear.rarity}
                  </span>
                </div>
                <p className="text-[10px] text-white/60">
                  {gear.mainStat.type.toUpperCase()} +{gear.mainStat.value}
                </p>
                {gear.subStats.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {gear.subStats.map((s, i) => (
                      <span key={i} className="text-[9px] text-white/35">
                        {s.type.toUpperCase()} +{s.value}
                      </span>
                    ))}
                  </div>
                )}
                {gear.setBonus && (
                  <p className="text-[9px] text-yellow-400/70 mt-1">Set: {gear.setBonus}</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function HeroDetail({ hero: initialHero, onClose }: { hero: Hero; onClose: () => void }) {
  const { heroes, aetherShards, spendShards, levelUpHero, unequipGear, upgradeSkill } = useGameStore()
  const hero = heroes.find(h => h.id === initialHero.id) || initialHero

  const [tab, setTab] = useState<'stats' | 'gear' | 'skills'>('stats')
  const [gearPickerSlot, setGearPickerSlot] = useState<Gear['slot'] | null>(null)

  const portrait = useMemo(
    () => generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role),
    [hero.name, hero.faction, hero.rarity, hero.role]
  )

  const heroStars = hero.stars || defaultStarsByRarity[hero.rarity] || 1
  const maxLevel = getMaxLevel(hero.rarity, heroStars)
  const isMaxLevel = hero.level >= maxLevel
  const levelCost = getLevelUpCost(hero.level, hero.rarity)
  const canAfford = aetherShards >= levelCost

  const handleLevelUp = () => {
    if (isMaxLevel || !canAfford) return
    if (!spendShards(levelCost)) return
    const newStats = computeLevelUpStats(hero)
    levelUpHero(hero.id, newStats)
  }

  const gearBonuses = getGearStatBonuses(hero.equippedGear)
  const equippedCount = Object.values(hero.equippedGear).filter(Boolean).length

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-b from-[#1a1028] to-[#0a060f] border border-white/15 max-w-md w-full rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Portrait header */}
        <div className="relative h-44 overflow-hidden shrink-0">
          <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1028] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white border border-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Hero info */}
        <div className="px-5 -mt-5 relative z-10 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${rarityBadgeColor[hero.rarity]}`}>
              {hero.rarity}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">{hero.role}</span>
            <span className="text-yellow-400 text-xs drop-shadow-[0_0_4px_#fcd34d]">
              {'★'.repeat(heroStars)}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">{hero.name}</h2>
          <p className="text-sm text-purple-300/70">{hero.faction}</p>
        </div>

        {/* Level Up bar */}
        <div className="px-5 py-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40">LEVEL</span>
              <span className="text-lg font-mono font-bold text-white">{hero.level}</span>
              <span className="text-[10px] text-white/20">/ {maxLevel}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">⚡</span>
              <span className="text-base font-mono font-bold text-yellow-300">{hero.power}</span>
            </div>
          </div>
          <button
            onClick={handleLevelUp}
            disabled={isMaxLevel || !canAfford}
            className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
              isMaxLevel
                ? 'bg-white/5 text-white/30 cursor-default'
                : canAfford
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110'
                  : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {isMaxLevel ? 'MAX LEVEL' : `Level Up — 💎 ${levelCost}`}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-5 shrink-0">
          <button
            onClick={() => setTab('stats')}
            className={`flex-1 py-2 text-xs font-medium transition border-b-2 ${
              tab === 'stats' ? 'text-white border-yellow-400' : 'text-white/40 border-transparent'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setTab('gear')}
            className={`flex-1 py-2 text-xs font-medium transition border-b-2 ${
              tab === 'gear' ? 'text-white border-yellow-400' : 'text-white/40 border-transparent'
            }`}
          >
            Gear ({equippedCount}/8)
          </button>
          <button
            onClick={() => setTab('skills')}
            className={`flex-1 py-2 text-xs font-medium transition border-b-2 ${
              tab === 'skills' ? 'text-white border-yellow-400' : 'text-white/40 border-transparent'
            }`}
          >
            Skills
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'stats' && (
            <div className="space-y-4">
              {/* Base stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'HP', value: hero.hp, bonus: gearBonuses.hp, color: 'text-emerald-400' },
                  { label: 'ATK', value: hero.atk, bonus: gearBonuses.atk, color: 'text-red-400' },
                  { label: 'DEF', value: hero.def, bonus: gearBonuses.def, color: 'text-sky-400' },
                  { label: 'SPD', value: hero.spd, bonus: gearBonuses.spd, color: 'text-purple-400' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-lg py-2.5 px-3 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase">{s.label}</p>
                    <div className="flex items-baseline gap-1">
                      <p className={`text-base font-mono font-bold ${s.color}`}>{s.value}</p>
                      {s.bonus ? (
                        <span className="text-[10px] text-green-400">+{s.bonus}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Gear bonus stats */}
              {Object.keys(gearBonuses).filter(k => !['hp','atk','def','spd'].includes(k)).length > 0 && (
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Gear Bonuses</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(gearBonuses)
                      .filter(([k]) => !['hp','atk','def','spd'].includes(k))
                      .map(([type, value]) => (
                        <span key={type} className="text-[10px] bg-white/5 border border-white/10 rounded px-2 py-1 text-green-400">
                          {type.toUpperCase()} +{value}
                        </span>
                      ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {tab === 'gear' && (
            <div className="grid grid-cols-2 gap-2">
              {GEAR_SLOTS.map(slot => (
                <GearSlot
                  key={slot}
                  slot={slot}
                  gear={hero.equippedGear[slot]}
                  onEquip={() => setGearPickerSlot(slot)}
                  onUnequip={() => unequipGear(hero.id, slot)}
                />
              ))}
            </div>
          )}

          {tab === 'skills' && (
            <div className="space-y-3">
              {hero.skills.map((skill, idx) => {
                const skillLevel = skill.level || 1
                const isMax = skillLevel >= MAX_SKILL_LEVEL
                const cost = getSkillUpgradeCost(skillLevel, hero.rarity)
                const canAfford = aetherShards >= cost
                const baseCd = skill.cooldown + (skillLevel - 1) * 0.5
                const nextCd = isMax ? skill.cooldown : getUpgradedCooldown(baseCd, skillLevel + 1)
                return (
                  <div key={skill.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{skill.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60">
                        Lv.{skillLevel}/{MAX_SKILL_LEVEL}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-3 text-xs text-white/50">
                      <span>CD: {skill.cooldown.toFixed(1)}s</span>
                      {!isMax && (
                        <span className="text-green-400">→ {nextCd.toFixed(1)}s</span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                        style={{ width: `${(skillLevel / MAX_SKILL_LEVEL) * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={() => upgradeSkill(hero.id, idx)}
                      disabled={isMax || !canAfford}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                        isMax
                          ? 'bg-white/5 text-white/30 cursor-default'
                          : canAfford
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:brightness-110'
                            : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? 'MAX LEVEL' : `Upgrade — 💎 ${cost}`}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Gear picker sub-modal */}
      {gearPickerSlot && (
        <GearPickerModal
          slot={gearPickerSlot}
          heroId={hero.id}
          onClose={() => setGearPickerSlot(null)}
        />
      )}
    </div>
  )
}
