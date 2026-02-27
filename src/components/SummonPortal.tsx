import { useState, useCallback, useEffect } from 'react'
import { useGameStore, Hero } from '@/lib/store'
import { summonHero, summonMultiple, SUMMON_COST_SINGLE, SUMMON_COST_TEN, DROP_RATES } from '@/lib/summon-pool'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import { BP_XP_REWARDS } from '@/lib/battle-pass-data'

const rarityColor: Record<string, string> = {
  common: 'text-zinc-400 border-zinc-500',
  rare: 'text-blue-400 border-blue-400',
  epic: 'text-purple-400 border-purple-400',
  legendary: 'text-yellow-400 border-yellow-400',
}

const rarityBg: Record<string, string> = {
  common: 'from-zinc-800/50 to-zinc-900/50',
  rare: 'from-blue-900/40 to-blue-950/40',
  epic: 'from-purple-900/40 to-purple-950/40',
  legendary: 'from-yellow-900/30 to-amber-950/30',
}

const rarityShadow: Record<string, string> = {
  common: 'shadow-[0_0_20px_#71717a40]',
  rare: 'shadow-[0_0_30px_#60a5fa50]',
  epic: 'shadow-[0_0_40px_#c084fc60]',
  legendary: 'shadow-[0_0_60px_#fcd34d80]',
}

const rarityGlowColor: Record<string, string> = {
  common: '#71717a',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#fcd34d',
}

function RevealCard({ hero, delay, onClick }: { hero: Hero; delay: number; onClick: () => void }) {
  const [phase, setPhase] = useState<'hidden' | 'flipping' | 'revealed'>('hidden')
  const portrait = generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flipping'), delay)
    const t2 = setTimeout(() => setPhase('revealed'), delay + 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [delay])

  return (
    <div
      onClick={() => { setPhase('revealed'); onClick() }}
      className="relative cursor-pointer"
      style={{ perspective: '600px' }}
    >
      <div
        className="relative transition-all duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: phase === 'hidden' ? 'rotateY(180deg) scale(0.7)'
            : phase === 'flipping' ? 'rotateY(90deg) scale(0.9)'
            : 'rotateY(0deg) scale(1)',
          opacity: phase === 'hidden' ? 0.3 : 1,
        }}
      >
        <div className={`
          relative overflow-hidden rounded-xl border-2 aspect-[3/4]
          ${phase === 'revealed' ? rarityColor[hero.rarity] : 'border-white/20'}
          ${phase === 'revealed' ? rarityShadow[hero.rarity] : ''}
          transition-all duration-300
        `}>
          {phase === 'revealed' ? (
            <>
              <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-2 px-2">
                <p className="text-xs font-bold text-white truncate">{hero.name}</p>
                <p className={`text-[10px] font-bold uppercase ${rarityColor[hero.rarity].split(' ')[0]}`}>{hero.rarity}</p>
              </div>
              {/* Rarity glow burst on reveal */}
              <div
                className="absolute inset-0 pointer-events-none animate-[reveal-burst_0.8s_ease-out_forwards]"
                style={{ background: `radial-gradient(circle at 50% 50%, ${rarityGlowColor[hero.rarity]}40, transparent 70%)` }}
              />
              {hero.rarity === 'legendary' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/10 via-transparent to-yellow-400/5 animate-pulse" />
                  {/* Sparkle particles for legendary */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-[sparkle_1.5s_ease-in-out_infinite]"
                        style={{
                          left: `${15 + (i * 14)}%`,
                          top: `${10 + (i * 13) % 70}%`,
                          animationDelay: `${i * 0.25}s`,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
              {hero.rarity === 'epic' && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-400/10 via-transparent to-purple-400/5 animate-pulse" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-black flex items-center justify-center">
              <span className="text-3xl animate-pulse">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummonResults({ heroes, onClose }: { heroes: Hero[]; onClose: () => void }) {
  const bestRarity = heroes.reduce((best, h) => {
    const order: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 }
    return (order[h.rarity] || 0) > (order[best] || 0) ? h.rarity : best
  }, 'common' as string)

  const hasLegendary = heroes.some(h => h.rarity === 'legendary')

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
      {/* Glow background based on best pull */}
      <div className={`absolute inset-0 bg-gradient-to-b ${rarityBg[bestRarity]} opacity-50 animate-[fade-in_0.5s_ease-out]`} />

      {/* Legendary burst effect */}
      {hasLegendary && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-[legendary-burst_1s_ease-out]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-300/15 rounded-full blur-2xl animate-[legendary-burst_1.2s_ease-out_0.2s]" />
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl">
        <h2 className="text-center text-lg font-bold text-white/80 mb-6 animate-[fade-in_0.4s_ease-out]">
          {heroes.length === 1 ? 'Summoned!' : `${heroes.length}x Summon Results`}
        </h2>

        <div className={`grid gap-3 mb-8 ${
          heroes.length === 1
            ? 'grid-cols-1 max-w-[160px] mx-auto'
            : 'grid-cols-5'
        }`}>
          {heroes.map((hero, i) => (
            <RevealCard key={hero.id} hero={hero} delay={300 + i * 200} onClick={() => {}} />
          ))}
        </div>

        <div className="flex justify-center animate-[fade-up_0.4s_ease-out_1.5s_backwards]">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm rounded-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SummonPortal({ onBack }: { onBack: () => void }) {
  const { aetherShards, addHero, spendShards, incrementSummons, totalSummons, trackDailyQuest, addBattlePassXp } = useGameStore()
  const [results, setResults] = useState<Hero[] | null>(null)
  const [showRates, setShowRates] = useState(false)
  const [summoning, setSummoning] = useState(false)

  const handleSingleSummon = useCallback(() => {
    if (!spendShards(SUMMON_COST_SINGLE) || summoning) return
    setSummoning(true)
    // Brief charging delay before reveal
    setTimeout(() => {
      const hero = summonHero()
      addHero(hero)
      incrementSummons(1)
      trackDailyQuest('summonsToday')
      addBattlePassXp(BP_XP_REWARDS.summon)
      setResults([hero])
      setSummoning(false)
    }, 600)
  }, [spendShards, addHero, incrementSummons, summoning])

  const handleTenSummon = useCallback(() => {
    if (!spendShards(SUMMON_COST_TEN) || summoning) return
    setSummoning(true)
    setTimeout(() => {
      const heroes = summonMultiple(10)
      heroes.forEach(h => addHero(h))
      incrementSummons(10)
      trackDailyQuest('summonsToday', 10)
      addBattlePassXp(BP_XP_REWARDS.summon * 10)
      setResults(heroes)
      setSummoning(false)
    }, 800)
  }, [spendShards, addHero, incrementSummons, summoning])

  const canAffordSingle = aetherShards >= SUMMON_COST_SINGLE
  const canAffordTen = aetherShards >= SUMMON_COST_TEN

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Summon Portal</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400 text-sm">💎</span>
          <span className="text-sm font-mono text-white">{aetherShards.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
          {/* Portal visual — animated rings */}
          <div className="relative flex items-center justify-center py-16 animate-[fade-in_0.5s_ease-out]">
            {/* Outer glow pulses */}
            <div className="absolute w-56 h-56 rounded-full bg-purple-500/15 blur-3xl animate-[portal-pulse_3s_ease-in-out_infinite]" />
            <div className="absolute w-40 h-40 rounded-full bg-yellow-400/10 blur-2xl animate-[portal-pulse_3s_ease-in-out_infinite_1s]" />

            {/* Rotating outer ring */}
            <div
              className={`absolute w-48 h-48 rounded-full border-2 border-dashed border-purple-400/30 ${
                summoning ? 'animate-[spin_0.5s_linear_infinite]' : 'animate-[spin_8s_linear_infinite]'
              }`}
            />

            {/* Counter-rotating middle ring */}
            <div
              className={`absolute w-36 h-36 rounded-full border border-yellow-400/20 ${
                summoning ? 'animate-[reverse-spin_0.4s_linear_infinite]' : 'animate-[reverse-spin_6s_linear_infinite]'
              }`}
            />

            {/* Core portal */}
            <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
              summoning
                ? 'bg-gradient-to-br from-yellow-500/40 to-purple-600/40 scale-110 shadow-[0_0_40px_rgba(168,85,247,0.5)]'
                : 'bg-gradient-to-br from-purple-900/40 to-black shadow-[0_0_20px_rgba(168,85,247,0.2)]'
            }`}>
              <span className={`text-5xl transition-transform duration-300 ${summoning ? 'scale-125 animate-pulse' : ''}`}>🌟</span>
            </div>

            {/* Floating orbs */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-purple-400/60 animate-[orbit_4s_linear_infinite]"
                style={{
                  animationDelay: `${i * 0.8}s`,
                  transformOrigin: '0 0',
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </div>

          {/* Summon buttons */}
          <div className="space-y-3 animate-[fade-up_0.4s_ease-out_0.2s_backwards]">
            <button
              onClick={handleSingleSummon}
              disabled={!canAffordSingle || summoning}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all border relative overflow-hidden group ${
                canAffordSingle && !summoning
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-400/50 text-white hover:brightness-110 hover:scale-[1.02] active:scale-95'
                  : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {canAffordSingle && !summoning && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
              <div className="relative flex items-center justify-center gap-3">
                <span>{summoning ? 'Summoning...' : 'Summon x1'}</span>
                <span className="flex items-center gap-1 text-yellow-300">
                  <span className="text-xs">💎</span> {SUMMON_COST_SINGLE}
                </span>
              </div>
            </button>

            <button
              onClick={handleTenSummon}
              disabled={!canAffordTen || summoning}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all border relative overflow-hidden group ${
                canAffordTen && !summoning
                  ? 'bg-gradient-to-r from-yellow-600 to-amber-600 border-yellow-400/60 text-black hover:brightness-110 hover:scale-[1.02] active:scale-95'
                  : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {canAffordTen && !summoning && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
              <div className="relative flex items-center justify-center gap-3">
                <span>{summoning ? 'Summoning...' : 'Summon x10'}</span>
                <span className="flex items-center gap-1">
                  <span className="text-xs">💎</span> {SUMMON_COST_TEN}
                </span>
                {canAffordTen && !summoning && (
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">SAVE 10%</span>
                )}
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="text-center text-xs text-white/30 animate-[fade-in_0.4s_ease-out_0.4s_backwards]">
            Total summons: {totalSummons}
          </div>

          {/* Drop rates */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden animate-[fade-up_0.4s_ease-out_0.5s_backwards]">
            <button
              onClick={() => setShowRates(!showRates)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs text-white/60 hover:text-white/80 transition"
            >
              <span className="uppercase tracking-wider font-medium">Drop Rates</span>
              <span className={`transition-transform duration-200 ${showRates ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showRates && (
              <div className="px-4 pb-4 space-y-2 animate-[fade-in_0.2s_ease-out]">
                {Object.entries(DROP_RATES).reverse().map(([rarity, rate]) => (
                  <div key={rarity} className="flex items-center justify-between">
                    <span className={`text-xs font-medium capitalize ${rarityColor[rarity].split(' ')[0]}`}>
                      {rarity}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-yellow-400 transition-all duration-700"
                          style={{ width: `${rate * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/50 font-mono w-12 text-right">{(rate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-white/30 mt-2">10x summon guarantees at least one Rare or higher</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results overlay */}
      {results && <SummonResults heroes={results} onClose={() => setResults(null)} />}

      {/* Summon portal animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes portal-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
          to { transform: rotate(-360deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) translateX(80px) rotate(-180deg) scale(1.5); }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg) scale(1); }
        }
        @keyframes reveal-burst {
          0% { opacity: 0.8; transform: scale(0.5); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes legendary-burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
