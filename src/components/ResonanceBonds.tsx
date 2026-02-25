import { useMemo } from 'react'
import { useGameStore } from '@/lib/store'

interface FactionBonus {
  count: number
  label: string
  effect: string
  statBoost: Record<string, number>
}

const factionBonuses: Record<string, FactionBonus[]> = {
  'Dawn Sentinels': [
    { count: 2, label: 'Dawn\'s Light', effect: '+10% HP, +5% DEF', statBoost: { hp: 0.10, def: 0.05 } },
    { count: 3, label: 'Radiant Aura', effect: '+20% HP, +10% DEF, +8% ATK', statBoost: { hp: 0.20, def: 0.10, atk: 0.08 } },
    { count: 4, label: 'Dawn\'s Blessing', effect: '+30% HP, +15% DEF, +15% ATK', statBoost: { hp: 0.30, def: 0.15, atk: 0.15 } },
  ],
  'Veil Walkers': [
    { count: 2, label: 'Shadow Step', effect: '+15% SPD, +5% ATK', statBoost: { spd: 0.15, atk: 0.05 } },
    { count: 3, label: 'Phantom Dance', effect: '+25% SPD, +12% ATK', statBoost: { spd: 0.25, atk: 0.12 } },
    { count: 4, label: 'Void Mastery', effect: '+35% SPD, +20% ATK, +10% HP', statBoost: { spd: 0.35, atk: 0.20, hp: 0.10 } },
  ],
  'Obsidian Pact': [
    { count: 2, label: 'Stone Skin', effect: '+15% DEF, +5% HP', statBoost: { def: 0.15, hp: 0.05 } },
    { count: 3, label: 'Iron Will', effect: '+25% DEF, +12% HP', statBoost: { def: 0.25, hp: 0.12 } },
    { count: 4, label: 'Obsidian Fortress', effect: '+35% DEF, +20% HP, +10% ATK', statBoost: { def: 0.35, hp: 0.20, atk: 0.10 } },
  ],
  'Stormborn': [
    { count: 2, label: 'Static Charge', effect: '+12% ATK, +8% SPD', statBoost: { atk: 0.12, spd: 0.08 } },
    { count: 3, label: 'Thunder Fury', effect: '+22% ATK, +15% SPD', statBoost: { atk: 0.22, spd: 0.15 } },
    { count: 4, label: 'Storm Lord', effect: '+35% ATK, +20% SPD, +10% HP', statBoost: { atk: 0.35, spd: 0.20, hp: 0.10 } },
  ],
}

const factionColors: Record<string, { text: string; bg: string; border: string; icon: string }> = {
  'Dawn Sentinels':  { text: 'text-yellow-300', bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30', icon: '☀️' },
  'Veil Walkers':    { text: 'text-purple-300', bg: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/30', icon: '🌙' },
  'Obsidian Pact':   { text: 'text-zinc-300',   bg: 'from-zinc-500/20 to-stone-500/10',   border: 'border-zinc-500/30',   icon: '🪨' },
  'Stormborn':       { text: 'text-cyan-300',    bg: 'from-cyan-500/20 to-blue-500/10',    border: 'border-cyan-500/30',    icon: '⚡' },
}

export function getActiveResonanceBonuses(teamHeroFactions: string[]): Record<string, FactionBonus> {
  const factionCounts: Record<string, number> = {}
  for (const f of teamHeroFactions) {
    factionCounts[f] = (factionCounts[f] || 0) + 1
  }

  const active: Record<string, FactionBonus> = {}
  for (const [faction, count] of Object.entries(factionCounts)) {
    const bonuses = factionBonuses[faction]
    if (!bonuses) continue
    // Get highest qualifying bonus
    const qualifying = bonuses.filter(b => count >= b.count)
    if (qualifying.length > 0) {
      active[faction] = qualifying[qualifying.length - 1]
    }
  }
  return active
}

export default function ResonanceBonds({ onBack }: { onBack: () => void }) {
  const { heroes, currentTeam } = useGameStore()

  const teamHeroes = currentTeam.map(id => heroes.find(h => h.id === id)).filter(Boolean)
  const teamFactions = teamHeroes.map(h => h!.faction)

  const factionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const f of teamFactions) {
      counts[f] = (counts[f] || 0) + 1
    }
    return counts
  }, [teamFactions.join(',')])

  const activeBonuses = useMemo(
    () => getActiveResonanceBonuses(teamFactions),
    [teamFactions.join(',')]
  )

  const allFactions = Object.keys(factionBonuses)

  // Count heroes per faction (total roster)
  const rosterFactionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const h of heroes) {
      counts[h.faction] = (counts[h.faction] || 0) + 1
    }
    return counts
  }, [heroes])

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Resonance Bonds</h1>
        <span className="text-xs text-white/40">{Object.keys(activeBonuses).length} active</span>
      </div>

      {/* Active bonds summary */}
      {Object.keys(activeBonuses).length > 0 && (
        <div className="mx-4 mt-4 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 p-4">
          <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-3">Active Resonance Bonuses</h3>
          <div className="space-y-2">
            {Object.entries(activeBonuses).map(([faction, bonus]) => {
              const fc = factionColors[faction]
              return (
                <div key={faction} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{fc?.icon}</span>
                    <span className={`text-xs font-bold ${fc?.text}`}>{bonus.label}</span>
                  </div>
                  <span className="text-[10px] text-green-400">{bonus.effect}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {Object.keys(activeBonuses).length === 0 && currentTeam.length > 0 && (
        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-sm text-white/40">No active resonance bonds</p>
          <p className="text-[10px] text-white/30 mt-1">Add multiple heroes from the same faction to your team</p>
        </div>
      )}

      {currentTeam.length === 0 && (
        <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-sm text-white/40">Set up a team first</p>
          <p className="text-[10px] text-white/30 mt-1">Go to Team Builder to select your champions</p>
        </div>
      )}

      {/* Current team factions */}
      {currentTeam.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Your Team Composition</h3>
          <div className="flex gap-2 flex-wrap">
            {teamHeroes.map(h => {
              const fc = factionColors[h!.faction]
              return (
                <div key={h!.id} className={`px-3 py-1.5 rounded-lg border ${fc?.border} bg-gradient-to-r ${fc?.bg}`}>
                  <p className="text-xs font-medium text-white">{h!.name}</p>
                  <p className={`text-[10px] ${fc?.text}`}>{h!.faction}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All faction bonuses */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">All Faction Synergies</h3>
        {allFactions.map(faction => {
          const fc = factionColors[faction]
          const bonuses = factionBonuses[faction]
          const teamCount = factionCounts[faction] || 0
          const rosterCount = rosterFactionCounts[faction] || 0
          const isActive = !!activeBonuses[faction]

          return (
            <div
              key={faction}
              className={`rounded-xl border p-4 transition-all ${
                isActive
                  ? `${fc.border} bg-gradient-to-r ${fc.bg}`
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{fc.icon}</span>
                  <div>
                    <h4 className={`text-sm font-bold ${isActive ? fc.text : 'text-white/60'}`}>{faction}</h4>
                    <p className="text-[10px] text-white/30">
                      {teamCount} in team • {rosterCount} in roster
                    </p>
                  </div>
                </div>
                {isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 font-bold uppercase">
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {bonuses.map(bonus => {
                  const met = teamCount >= bonus.count
                  return (
                    <div
                      key={bonus.count}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                        met ? 'bg-white/10' : 'bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          met ? 'bg-green-500/30 text-green-400' : 'bg-white/5 text-white/20'
                        }`}>
                          {bonus.count}
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${met ? 'text-white' : 'text-white/30'}`}>{bonus.label}</p>
                          <p className={`text-[10px] ${met ? 'text-green-400/80' : 'text-white/20'}`}>{bonus.effect}</p>
                        </div>
                      </div>
                      {met && <span className="text-green-400 text-xs">✓</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
