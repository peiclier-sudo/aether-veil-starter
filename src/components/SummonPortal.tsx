import { useState, useCallback } from 'react'
import { useGameStore, Hero } from '@/lib/store'
import { summonHero, summonMultiple, SUMMON_COST_SINGLE, SUMMON_COST_TEN, DROP_RATES } from '@/lib/summon-pool'
import { generateHeroPortrait } from '@/lib/hero-portraits'

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

function RevealCard({ hero, delay, onClick }: { hero: Hero; delay: number; onClick: () => void }) {
  const [revealed, setRevealed] = useState(false)
  const portrait = generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role)

  // Auto-reveal with delay
  useState(() => {
    const timer = setTimeout(() => setRevealed(true), delay)
    return () => clearTimeout(timer)
  })

  return (
    <div
      onClick={() => { setRevealed(true); onClick() }}
      className={`
        relative cursor-pointer transition-all duration-700
        ${revealed ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
      `}
    >
      <div className={`
        relative overflow-hidden rounded-xl border-2 aspect-[3/4]
        ${revealed ? rarityColor[hero.rarity] : 'border-white/20'}
        ${revealed ? rarityShadow[hero.rarity] : ''}
        transition-all duration-500
      `}>
        {revealed ? (
          <>
            <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-2 px-2">
              <p className="text-xs font-bold text-white truncate">{hero.name}</p>
              <p className={`text-[10px] font-bold uppercase ${rarityColor[hero.rarity].split(' ')[0]}`}>{hero.rarity}</p>
            </div>
            {hero.rarity === 'legendary' && (
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/10 via-transparent to-yellow-400/5 animate-pulse" />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-black flex items-center justify-center">
            <span className="text-3xl animate-pulse">?</span>
          </div>
        )}
      </div>
    </div>
  )
}

function SummonResults({ heroes, onClose }: { heroes: Hero[]; onClose: () => void }) {
  const bestRarity = heroes.reduce((best, h) => {
    const order: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 }
    return (order[h.rarity] || 0) > (order[best] || 0) ? h.rarity : best
  }, 'common' as string)

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
      {/* Glow background based on best pull */}
      <div className={`absolute inset-0 bg-gradient-to-b ${rarityBg[bestRarity]} opacity-50`} />

      <div className="relative z-10 w-full max-w-2xl">
        <h2 className="text-center text-lg font-bold text-white/80 mb-6">
          {heroes.length === 1 ? 'Summoned!' : `${heroes.length}x Summon Results`}
        </h2>

        <div className={`grid gap-3 mb-8 ${
          heroes.length === 1
            ? 'grid-cols-1 max-w-[160px] mx-auto'
            : 'grid-cols-5'
        }`}>
          {heroes.map((hero, i) => (
            <RevealCard key={hero.id} hero={hero} delay={i * 200} onClick={() => {}} />
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm rounded-xl hover:brightness-110 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SummonPortal({ onBack }: { onBack: () => void }) {
  const { aetherShards, addHero, spendShards, incrementSummons, totalSummons } = useGameStore()
  const [results, setResults] = useState<Hero[] | null>(null)
  const [showRates, setShowRates] = useState(false)

  const handleSingleSummon = useCallback(() => {
    if (!spendShards(SUMMON_COST_SINGLE)) return
    const hero = summonHero()
    addHero(hero)
    incrementSummons(1)
    setResults([hero])
  }, [spendShards, addHero, incrementSummons])

  const handleTenSummon = useCallback(() => {
    if (!spendShards(SUMMON_COST_TEN)) return
    const heroes = summonMultiple(10)
    heroes.forEach(h => addHero(h))
    incrementSummons(10)
    setResults(heroes)
  }, [spendShards, addHero, incrementSummons])

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
          {/* Portal visual */}
          <div className="relative flex items-center justify-center py-16">
            <div className="absolute w-48 h-48 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
            <div className="absolute w-32 h-32 rounded-full bg-yellow-400/15 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="relative w-40 h-40 rounded-full border-2 border-purple-400/50 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-black">
              <div className="w-28 h-28 rounded-full border border-yellow-400/30 flex items-center justify-center bg-gradient-to-br from-yellow-900/20 to-transparent">
                <span className="text-5xl">🌟</span>
              </div>
            </div>
          </div>

          {/* Summon buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSingleSummon}
              disabled={!canAffordSingle}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all border ${
                canAffordSingle
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-400/50 text-white hover:brightness-110'
                  : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <span>Summon x1</span>
                <span className="flex items-center gap-1 text-yellow-300">
                  <span className="text-xs">💎</span> {SUMMON_COST_SINGLE}
                </span>
              </div>
            </button>

            <button
              onClick={handleTenSummon}
              disabled={!canAffordTen}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all border relative overflow-hidden ${
                canAffordTen
                  ? 'bg-gradient-to-r from-yellow-600 to-amber-600 border-yellow-400/60 text-black hover:brightness-110'
                  : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <span>Summon x10</span>
                <span className="flex items-center gap-1">
                  <span className="text-xs">💎</span> {SUMMON_COST_TEN}
                </span>
                {canAffordTen && (
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">SAVE 10%</span>
                )}
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="text-center text-xs text-white/30">
            Total summons: {totalSummons}
          </div>

          {/* Drop rates */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowRates(!showRates)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs text-white/60 hover:text-white/80 transition"
            >
              <span className="uppercase tracking-wider font-medium">Drop Rates</span>
              <span>{showRates ? '▲' : '▼'}</span>
            </button>
            {showRates && (
              <div className="px-4 pb-4 space-y-2">
                {Object.entries(DROP_RATES).reverse().map(([rarity, rate]) => (
                  <div key={rarity} className="flex items-center justify-between">
                    <span className={`text-xs font-medium capitalize ${rarityColor[rarity].split(' ')[0]}`}>
                      {rarity}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-yellow-400"
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
    </div>
  )
}
