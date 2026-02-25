import { useState, useMemo } from 'react'
import { useGameStore, Hero } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import { getAscensionRequirements, MAX_STARS, defaultStarsByRarity } from '@/lib/ascension'

const rarityFrame: Record<string, string> = {
  common: 'border-zinc-500/60',
  rare: 'border-blue-400/70',
  epic: 'border-purple-400/70',
  legendary: 'border-yellow-400/80',
}

function MiniHero({ hero, selected, onClick }: { hero: Hero; selected: boolean; onClick: () => void }) {
  const portrait = useMemo(
    () => generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role),
    [hero.name, hero.faction, hero.rarity, hero.role]
  )
  const stars = hero.stars || defaultStarsByRarity[hero.rarity] || 1

  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg border-2 transition-all ${
        selected ? 'ring-2 ring-red-500 border-red-400 scale-95 opacity-60' : rarityFrame[hero.rarity]
      }`}
    >
      <div className="aspect-square overflow-hidden bg-black">
        <img src={portrait} alt={hero.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-4 pb-1 px-1">
          <p className="text-[9px] font-bold text-white text-center truncate">{hero.name}</p>
          <p className="text-[8px] text-yellow-400 text-center">{'★'.repeat(stars)}</p>
        </div>
        {selected && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-xl font-bold">FODDER</span>
          </div>
        )}
      </div>
    </button>
  )
}

export default function AscensionPage({ onBack }: { onBack: () => void }) {
  const { heroes, aetherShards, ascendHero } = useGameStore()
  const [selectedHero, setSelectedHero] = useState<string | null>(null)
  const [fodderIds, setFodderIds] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)

  const hero = heroes.find(h => h.id === selectedHero)
  const currentStars = hero ? (hero.stars || defaultStarsByRarity[hero.rarity] || 1) : 0
  const req = currentStars > 0 ? getAscensionRequirements(currentStars) : null
  const canAscend = hero && req && fodderIds.length >= req.fodderCount && aetherShards >= req.shardCost

  const eligibleFodder = useMemo(() => {
    if (!hero) return []
    return heroes.filter(h => h.id !== hero.id && !fodderIds.includes(h.id))
  }, [hero, heroes, fodderIds])

  const toggleFodder = (id: string) => {
    if (fodderIds.includes(id)) {
      setFodderIds(fodderIds.filter(f => f !== id))
    } else if (req && fodderIds.length < req.fodderCount) {
      setFodderIds([...fodderIds, id])
    }
  }

  const handleAscend = () => {
    if (!hero || !canAscend) return
    const success = ascendHero(hero.id, fodderIds)
    if (success) {
      setShowResult(true)
      setFodderIds([])
      setTimeout(() => setShowResult(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Hero Ascension</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400 text-sm">💎</span>
          <span className="text-sm font-mono text-white">{aetherShards.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!selectedHero ? (
          <>
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-1">Select a Hero to Ascend</h2>
              <p className="text-xs text-white/40">Sacrifice heroes to increase star rank</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {heroes.filter(h => (h.stars || defaultStarsByRarity[h.rarity] || 1) < MAX_STARS).map(h => (
                <MiniHero key={h.id} hero={h} selected={false} onClick={() => { setSelectedHero(h.id); setFodderIds([]) }} />
              ))}
            </div>
            {heroes.every(h => (h.stars || defaultStarsByRarity[h.rarity] || 1) >= MAX_STARS) && (
              <p className="text-center text-white/30 py-8">All heroes are at max stars!</p>
            )}
          </>
        ) : hero ? (
          <>
            <button onClick={() => { setSelectedHero(null); setFodderIds([]) }} className="text-white/60 hover:text-white text-sm transition">← Back to selection</button>

            {/* Selected hero card */}
            <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 p-4 text-center">
              <h3 className="text-lg font-bold text-white">{hero.name}</h3>
              <p className="text-yellow-400 text-lg">{'★'.repeat(currentStars)}{currentStars < MAX_STARS && <span className="text-white/20">{'★'.repeat(MAX_STARS - currentStars)}</span>}</p>
              <p className="text-xs text-white/40 mt-1">{hero.rarity} • {hero.faction}</p>

              {req ? (
                <div className="mt-3 space-y-1 text-xs text-white/60">
                  <p>Next: <span className="text-yellow-400">{'★'.repeat(currentStars + 1)}</span></p>
                  <p>Requires: <span className="text-white">{req.fodderCount} heroes</span> + <span className="text-yellow-400">💎 {req.shardCost.toLocaleString()}</span></p>
                  <p>Selected: <span className={fodderIds.length >= req.fodderCount ? 'text-green-400' : 'text-red-400'}>{fodderIds.length}/{req.fodderCount}</span></p>
                </div>
              ) : (
                <p className="text-xs text-yellow-400 mt-3">Max Stars Reached!</p>
              )}
            </div>

            {/* Ascend button */}
            {req && (
              <button
                onClick={handleAscend}
                disabled={!canAscend}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  canAscend
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110'
                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Ascend — 💎 {req.shardCost.toLocaleString()}
              </button>
            )}

            {/* Fodder selection */}
            {req && (
              <>
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">Select Fodder Heroes</h4>
                <div className="grid grid-cols-4 gap-2">
                  {eligibleFodder.map(h => (
                    <MiniHero key={h.id} hero={h} selected={fodderIds.includes(h.id)} onClick={() => toggleFodder(h.id)} />
                  ))}
                </div>
                {eligibleFodder.length === 0 && (
                  <p className="text-center text-white/30 py-4 text-xs">No eligible heroes. Summon more!</p>
                )}
              </>
            )}
          </>
        ) : null}
      </div>

      {/* Ascension result overlay */}
      {showResult && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">⭐</div>
            <h2 className="text-3xl font-bold text-yellow-300">ASCENDED!</h2>
            <p className="text-yellow-400 text-2xl">{'★'.repeat(currentStars + 1)}</p>
            <p className="text-sm text-white/60">+5% all stats, +5 max level</p>
          </div>
        </div>
      )}
    </div>
  )
}
