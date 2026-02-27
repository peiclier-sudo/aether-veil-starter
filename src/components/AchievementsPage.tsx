import { useMemo, useState, useEffect } from 'react'
import { useGameStore } from '@/lib/store'
import { ACHIEVEMENTS } from '@/lib/achievements-data'
import { useNotifications } from '@/lib/notifications'

type Category = 'combat' | 'collection' | 'progression' | 'economy'
const categories: { key: Category; label: string; icon: string; gradient: string }[] = [
  { key: 'combat', label: 'Combat', icon: '⚔️', gradient: 'from-red-500/20 to-orange-500/10' },
  { key: 'collection', label: 'Collection', icon: '📦', gradient: 'from-blue-500/20 to-cyan-500/10' },
  { key: 'progression', label: 'Progress', icon: '📈', gradient: 'from-green-500/20 to-emerald-500/10' },
  { key: 'economy', label: 'Economy', icon: '💎', gradient: 'from-purple-500/20 to-pink-500/10' },
]

const tierColors = ['text-amber-600', 'text-zinc-300', 'text-yellow-400']
const tierBg = ['bg-amber-900/20 border-amber-700/30', 'bg-zinc-600/20 border-zinc-400/30', 'bg-yellow-500/20 border-yellow-400/30']
const tierLabels = ['Bronze', 'Silver', 'Gold']
const tierIcons = ['🥉', '🥈', '🥇']

export default function AchievementsPage({ onBack }: { onBack: () => void }) {
  const {
    achievementProgress, claimAchievementReward, updateAchievementProgress,
    heroes, inventory, arenaWins, totalSummons, dungeonClears, campaignStages,
    totalAscensions, totalSkillUpgrades, totalShardsSpent, totalGearSold, totalShopPurchases,
  } = useGameStore()
  const { addToast } = useNotifications()
  const [category, setCategory] = useState<Category>('combat')
  const [claimedId, setClaimedId] = useState<string | null>(null)

  const liveProgress = useMemo(() => {
    const completedStages = campaignStages.filter(s => s.completed).length
    const legendaryCount = heroes.filter(h => h.rarity === 'legendary').length
    const map: Record<string, number> = {
      'arena-victor': arenaWins,
      'campaign-conqueror': completedStages,
      'dungeon-delver': dungeonClears,
      'hero-collector': heroes.length,
      'legendary-hunter': legendaryCount,
      'gear-hoarder': inventory.length,
      'summoner': totalSummons,
      'ascended-power': totalAscensions,
      'skill-master': totalSkillUpgrades,
      'shard-spender': totalShardsSpent,
      'merchant': totalGearSold,
      'patron': totalShopPurchases,
    }
    return map
  }, [arenaWins, campaignStages, heroes, inventory, totalSummons, dungeonClears, totalAscensions, totalSkillUpgrades, totalShardsSpent, totalGearSold, totalShopPurchases])

  useEffect(() => {
    for (const [id, progress] of Object.entries(liveProgress)) {
      updateAchievementProgress(id, progress)
    }
  }, [liveProgress, updateAchievementProgress])

  const filtered = ACHIEVEMENTS.filter(a => a.category === category)
  const totalClaimed = achievementProgress.reduce((sum, a) => sum + Math.max(0, a.claimedTier + 1), 0)
  const totalTiers = ACHIEVEMENTS.reduce((sum, a) => sum + a.tiers.length, 0)
  const overallPct = totalTiers > 0 ? Math.round((totalClaimed / totalTiers) * 100) : 0

  const handleClaim = (achievementId: string, tierIdx: number, reward: { shards: number; energy?: number }, achievementName: string) => {
    claimAchievementReward(achievementId, tierIdx, reward)
    setClaimedId(`${achievementId}-${tierIdx}`)
    addToast({ type: 'achievement', title: `${achievementName} — ${tierLabels[tierIdx]}!`, message: `+${reward.shards} shards${reward.energy ? ` +${reward.energy} energy` : ''}`, icon: tierIcons[tierIdx] })
    setTimeout(() => setClaimedId(null), 600)
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Achievements</h1>
        <span className="text-xs text-yellow-400 font-mono">{totalClaimed}/{totalTiers}</span>
      </div>

      {/* Overall progress */}
      <div className="px-4 py-4 bg-gradient-to-b from-purple-900/20 to-transparent animate-[fade-up_0.4s_ease-out]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/50 uppercase tracking-wider">Overall Completion</p>
          <p className="text-sm font-mono font-bold text-yellow-400">{overallPct}%</p>
        </div>
        <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${overallPct}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-white/10 px-2">
        {categories.map((c, i) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 ${
              category === c.key
                ? 'text-white border-yellow-400 bg-white/5'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="mr-1">{c.icon}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Achievement list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {filtered.map((achievement, idx) => {
          const progress = achievementProgress.find(a => a.id === achievement.id)
          const currentProgress = liveProgress[achievement.id] || 0
          const claimedTier = progress?.claimedTier ?? -1
          const nextTier = achievement.tiers.find((_, i) => i > claimedTier)
          const nextTierIdx = nextTier ? achievement.tiers.indexOf(nextTier) : -1
          const pct = nextTier ? Math.min(100, (currentProgress / nextTier.threshold) * 100) : 100
          const isComplete = claimedTier >= achievement.tiers.length - 1

          return (
            <div
              key={achievement.id}
              className={`rounded-2xl border overflow-hidden transition-all animate-[fade-up_0.4s_ease-out] ${
                isComplete
                  ? 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-amber-500/5'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
              style={{ animationDelay: `${0.1 + idx * 0.06}s`, animationFillMode: 'backwards' }}
            >
              {/* Achievement header */}
              <div className={`p-4 bg-gradient-to-r ${categories.find(c => c.key === category)?.gradient || ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    isComplete ? 'bg-yellow-500/20 shadow-lg shadow-yellow-500/10' : 'bg-white/10'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{achievement.name}</h4>
                      {isComplete && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">COMPLETE</span>}
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5">{achievement.description}</p>
                  </div>
                </div>

                {/* Progress bar for next tier */}
                {nextTier && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                      <span>Progress to {tierLabels[nextTierIdx]}</span>
                      <span className="font-mono">{currentProgress.toLocaleString()}/{nextTier.threshold.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tier list */}
              <div className="px-4 py-3 space-y-2">
                {achievement.tiers.map((tier, idx2) => {
                  const met = currentProgress >= tier.threshold
                  const claimed = idx2 <= claimedTier
                  const canClaim = met && !claimed
                  const justClaimed = claimedId === `${achievement.id}-${idx2}`

                  return (
                    <div
                      key={idx2}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 border transition-all ${
                        justClaimed
                          ? 'bg-yellow-500/30 border-yellow-400/50 scale-[1.02]'
                          : claimed
                          ? 'bg-green-500/10 border-green-500/20'
                          : canClaim
                          ? `${tierBg[idx2]} animate-pulse`
                          : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{tierIcons[idx2]}</span>
                        <div>
                          <span className={`text-xs font-bold ${tierColors[idx2]}`}>{tierLabels[idx2]}</span>
                          <span className={`text-[10px] ml-2 ${met ? 'text-white/60' : 'text-white/25'}`}>
                            {currentProgress.toLocaleString()}/{tier.threshold.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-yellow-400/80 font-mono">💎{tier.reward.shards}</span>
                        {claimed ? (
                          <span className="text-green-400 text-sm font-bold">✓</span>
                        ) : canClaim ? (
                          <button
                            onClick={() => handleClaim(achievement.id, idx2, tier.reward, achievement.name)}
                            className="px-4 py-1.5 text-[10px] font-bold rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                          >
                            Claim!
                          </button>
                        ) : (
                          <span className="text-[10px] text-white/15">🔒</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 50%,100% { transform: translateX(100%); } }
      `}</style>
    </div>
  )
}
