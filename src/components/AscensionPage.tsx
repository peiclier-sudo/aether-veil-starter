import { useState, useMemo } from 'react'
import { useGameStore, Hero } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import { getAscensionRequirements, getAscensionStatBoost, MAX_STARS, defaultStarsByRarity } from '@/lib/ascension'
import { useNotifications } from '@/lib/notifications'

const rarityFrame: Record<string, string> = {
  common: 'border-zinc-500/60',
  rare: 'border-blue-400/70',
  epic: 'border-purple-400/70',
  legendary: 'border-yellow-400/80',
}

const rarityGlow: Record<string, string> = {
  common: '',
  rare: 'shadow-blue-500/20',
  epic: 'shadow-purple-500/20',
  legendary: 'shadow-yellow-500/30',
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
      className={`relative overflow-hidden rounded-xl border-2 transition-all ${
        selected
          ? 'ring-2 ring-red-500 border-red-400 scale-95 opacity-60'
          : `${rarityFrame[hero.rarity]} hover:scale-105 hover:shadow-lg ${rarityGlow[hero.rarity]}`
      }`}
    >
      <div className="aspect-square overflow-hidden bg-black">
        <img src={portrait} alt={hero.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-4 pb-1 px-1">
          <p className="text-[9px] font-bold text-white text-center truncate">{hero.name}</p>
          <p className="text-[8px] text-yellow-400 text-center">{'★'.repeat(stars)}</p>
        </div>
        {selected && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-red-400 text-lg font-bold">FODDER</span>
          </div>
        )}
      </div>
    </button>
  )
}

function StarPath({ currentStars, maxStars }: { currentStars: number; maxStars: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {Array.from({ length: maxStars }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
            i < currentStars
              ? 'bg-yellow-500/30 text-yellow-400 shadow-lg shadow-yellow-500/20 animate-[star-glow_2s_ease-in-out_infinite]'
              : i === currentStars
              ? 'bg-white/10 text-white/50 border-2 border-dashed border-yellow-500/40'
              : 'bg-white/5 text-white/15'
          }`}
          style={i < currentStars ? { animationDelay: `${i * 0.2}s` } : undefined}
          >
            ★
          </div>
          {i < maxStars - 1 && (
            <div className={`w-3 h-0.5 mx-0.5 rounded ${i < currentStars - 1 ? 'bg-yellow-500/40' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function StatPreview({ label, current, boosted }: { label: string; current: number; boosted: number }) {
  const diff = boosted - current
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/50 w-10">{label}</span>
      <span className="font-mono text-white/60">{current.toLocaleString()}</span>
      <span className="text-yellow-400 mx-1">→</span>
      <span className="font-mono font-bold text-white">{boosted.toLocaleString()}</span>
      <span className="text-green-400 text-[10px] font-mono ml-1">+{diff.toLocaleString()}</span>
    </div>
  )
}

export default function AscensionPage({ onBack }: { onBack: () => void }) {
  const { heroes, aetherShards, ascendHero } = useGameStore()
  const { addToast } = useNotifications()
  const [selectedHero, setSelectedHero] = useState<string | null>(null)
  const [fodderIds, setFodderIds] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hero = heroes.find(h => h.id === selectedHero)
  const currentStars = hero ? (hero.stars || defaultStarsByRarity[hero.rarity] || 1) : 0
  const req = currentStars > 0 ? getAscensionRequirements(currentStars) : null
  const canAscend = hero && req && fodderIds.length >= req.fodderCount && aetherShards >= req.shardCost

  const previewStats = useMemo(() => {
    if (!hero) return null
    return getAscensionStatBoost(hero)
  }, [hero])

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
    setShowConfirm(false)
    const success = ascendHero(hero.id, fodderIds)
    if (success) {
      setShowResult(true)
      setFodderIds([])
      addToast({ type: 'achievement', title: `${hero.name} Ascended!`, message: `Now at ${'★'.repeat(currentStars + 1)}`, icon: '⭐' })
      setTimeout(() => setShowResult(false), 2500)
    }
  }

  const fodderHeroes = fodderIds.map(id => heroes.find(h => h.id === id)).filter(Boolean) as Hero[]

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Hero Ascension</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400 text-sm">💎</span>
          <span className="text-sm font-mono text-white">{aetherShards.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!selectedHero ? (
          <>
            <div className="text-center mb-4 animate-[fade-up_0.4s_ease-out]">
              <div className="text-4xl mb-2">⭐</div>
              <h2 className="text-lg font-bold text-white mb-1">Select a Hero to Ascend</h2>
              <p className="text-xs text-white/40">Sacrifice heroes to increase star rank and boost stats</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {heroes.filter(h => (h.stars || defaultStarsByRarity[h.rarity] || 1) < MAX_STARS).map((h, i) => (
                <div
                  key={h.id}
                  className="animate-[fade-up_0.3s_ease-out]"
                  style={{ animationDelay: `${0.1 + i * 0.03}s`, animationFillMode: 'backwards' }}
                >
                  <MiniHero hero={h} selected={false} onClick={() => { setSelectedHero(h.id); setFodderIds([]) }} />
                </div>
              ))}
            </div>
            {heroes.every(h => (h.stars || defaultStarsByRarity[h.rarity] || 1) >= MAX_STARS) && (
              <p className="text-center text-white/30 py-8">All heroes are at max stars!</p>
            )}
          </>
        ) : hero ? (
          <>
            <button onClick={() => { setSelectedHero(null); setFodderIds([]) }} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5 animate-[fade-up_0.2s_ease-out]">← Back to selection</button>

            {/* Hero showcase + star path */}
            <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-[#0a060f] to-amber-500/5 p-5 animate-[fade-up_0.4s_ease-out] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
              <div className="relative z-10">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{hero.name}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{hero.rarity} • {hero.faction}</p>
                </div>

                <StarPath currentStars={currentStars} maxStars={MAX_STARS} />

                {req ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-center gap-4 text-xs text-white/60">
                      <span>Requires: <span className="text-white font-bold">{req.fodderCount} heroes</span></span>
                      <span>+</span>
                      <span className="text-yellow-400 font-bold">💎 {req.shardCost.toLocaleString()}</span>
                    </div>

                    {/* Fodder counter */}
                    <div className="flex items-center justify-center gap-2">
                      {Array.from({ length: req.fodderCount }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            i < fodderIds.length
                              ? 'border-red-400 bg-red-500/20'
                              : 'border-dashed border-white/20 bg-white/5'
                          }`}
                        >
                          {fodderHeroes[i] && (
                            <div className="w-full h-full flex items-center justify-center text-xs">💀</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-yellow-400 mt-3 text-center font-bold">Max Stars Reached!</p>
                )}
              </div>
            </div>

            {/* Stat preview */}
            {previewStats && req && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 animate-[fade-up_0.4s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Stat Preview After Ascension</h4>
                <div className="space-y-2">
                  <StatPreview label="HP" current={hero.hp || 0} boosted={previewStats.hp || 0} />
                  <StatPreview label="ATK" current={hero.atk || 0} boosted={previewStats.atk || 0} />
                  <StatPreview label="DEF" current={hero.def || 0} boosted={previewStats.def || 0} />
                  <StatPreview label="PWR" current={hero.power} boosted={previewStats.power || 0} />
                </div>
              </div>
            )}

            {/* Ascend button */}
            {req && (
              <button
                onClick={() => canAscend ? setShowConfirm(true) : null}
                disabled={!canAscend}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all animate-[fade-up_0.4s_ease-out] ${
                  canAscend
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                }`}
                style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}
              >
                {canAscend ? `Ascend to ${'★'.repeat(currentStars + 1)} — 💎 ${req.shardCost.toLocaleString()}` : `Select ${req.fodderCount - fodderIds.length} more fodder`}
              </button>
            )}

            {/* Fodder selection */}
            {req && (
              <>
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider animate-[fade-up_0.3s_ease-out]" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>Select Fodder Heroes</h4>
                <div className="grid grid-cols-4 gap-2">
                  {eligibleFodder.map((h, i) => (
                    <div
                      key={h.id}
                      className="animate-[fade-up_0.3s_ease-out]"
                      style={{ animationDelay: `${0.25 + i * 0.03}s`, animationFillMode: 'backwards' }}
                    >
                      <MiniHero hero={h} selected={fodderIds.includes(h.id)} onClick={() => toggleFodder(h.id)} />
                    </div>
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

      {/* Confirmation dialog */}
      {showConfirm && hero && req && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#1a1028] border border-yellow-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-[scale-in_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-white text-center">Confirm Ascension</h3>
            <div className="text-center">
              <p className="text-sm text-white/60">Ascend <span className="text-yellow-400 font-bold">{hero.name}</span></p>
              <p className="text-yellow-400 mt-1">{'★'.repeat(currentStars)} → {'★'.repeat(currentStars + 1)}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
              <p className="text-xs text-red-400 font-bold">{fodderIds.length} heroes will be consumed</p>
              <p className="text-[10px] text-white/40 mt-1">This action cannot be undone</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAscend}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm hover:brightness-110 transition shadow-lg shadow-amber-500/20"
              >
                Ascend!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ascension result overlay */}
      {showResult && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center animate-[fade-in_0.2s_ease-out]">
          <div className="text-center space-y-4 animate-[ascend-reveal_0.6s_ease-out]">
            <div className="text-7xl animate-[star-spin_1s_ease-out]">⭐</div>
            <h2 className="text-3xl font-bold text-yellow-300 animate-[fade-up_0.5s_ease-out_0.3s_backwards]">ASCENDED!</h2>
            <p className="text-yellow-400 text-2xl animate-[fade-up_0.5s_ease-out_0.5s_backwards]">{'★'.repeat(currentStars + 1)}</p>
            <p className="text-sm text-white/60 animate-[fade-up_0.5s_ease-out_0.7s_backwards]">+5% all stats • +5 max level</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 50%,100% { transform: translateX(100%); } }
        @keyframes star-glow { 0%,100% { opacity: 1; } 50% { opacity: 0.7; filter: brightness(1.3); } }
        @keyframes star-spin { from { transform: rotate(0deg) scale(0.5); opacity: 0; } to { transform: rotate(360deg) scale(1); opacity: 1; } }
        @keyframes ascend-reveal { from { transform: translateY(40px) scale(0.8); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </div>
  )
}
