import { useMemo } from 'react'
import { useGameStore } from '@/lib/store'
import { ACHIEVEMENTS } from '@/lib/achievements-data'
import { useState } from 'react'

type Category = 'combat' | 'collection' | 'progression' | 'economy'
const categories: { key: Category; label: string; icon: string }[] = [
  { key: 'combat', label: 'Combat', icon: '⚔️' },
  { key: 'collection', label: 'Collection', icon: '📦' },
  { key: 'progression', label: 'Progress', icon: '📈' },
  { key: 'economy', label: 'Economy', icon: '💎' },
]

const tierColors = ['text-amber-700', 'text-zinc-300', 'text-yellow-400']
const tierLabels = ['Bronze', 'Silver', 'Gold']

export default function AchievementsPage({ onBack }: { onBack: () => void }) {
  const {
    achievementProgress, claimAchievementReward, updateAchievementProgress,
    heroes, inventory, arenaWins, totalSummons, dungeonClears, campaignStages,
    totalAscensions, totalSkillUpgrades, totalShardsSpent, totalGearSold, totalShopPurchases,
  } = useGameStore()
  const [category, setCategory] = useState<Category>('combat')

  // Compute live progress
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

  // Sync progress
  useMemo(() => {
    for (const [id, progress] of Object.entries(liveProgress)) {
      updateAchievementProgress(id, progress)
    }
  }, [liveProgress, updateAchievementProgress])

  const filtered = ACHIEVEMENTS.filter(a => a.category === category)
  const totalClaimed = achievementProgress.reduce((sum, a) => sum + Math.max(0, a.claimedTier + 1), 0)
  const totalTiers = ACHIEVEMENTS.reduce((sum, a) => sum + a.tiers.length, 0)

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Achievements</h1>
        <span className="text-xs text-yellow-400">{totalClaimed}/{totalTiers}</span>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-white/10 px-2">
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex-1 py-3 text-xs font-medium transition border-b-2 ${
              category === c.key ? 'text-white border-yellow-400' : 'text-white/40 border-transparent'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filtered.map(achievement => {
          const progress = achievementProgress.find(a => a.id === achievement.id)
          const currentProgress = liveProgress[achievement.id] || 0
          const claimedTier = progress?.claimedTier ?? -1

          return (
            <div key={achievement.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{achievement.name}</h4>
                  <p className="text-[10px] text-white/40">{achievement.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                {achievement.tiers.map((tier, idx) => {
                  const met = currentProgress >= tier.threshold
                  const claimed = idx <= claimedTier
                  const canClaim = met && !claimed

                  return (
                    <div key={idx} className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                      claimed ? 'bg-green-500/10' : met ? 'bg-yellow-500/10' : 'bg-white/[0.02]'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${tierColors[idx]}`}>{tierLabels[idx]}</span>
                        <span className={`text-[10px] ${met ? 'text-white/60' : 'text-white/30'}`}>
                          {currentProgress.toLocaleString()}/{tier.threshold.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-yellow-400">💎 {tier.reward.shards}</span>
                        {claimed ? (
                          <span className="text-green-400 text-xs">✓</span>
                        ) : canClaim ? (
                          <button
                            onClick={() => claimAchievementReward(achievement.id, idx, tier.reward)}
                            className="px-3 py-1 text-[10px] font-bold rounded bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 transition"
                          >
                            Claim
                          </button>
                        ) : (
                          <span className="text-[10px] text-white/20">Locked</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress bar for highest unclaimed tier */}
              {(() => {
                const nextTier = achievement.tiers.find((_, idx) => idx > claimedTier)
                if (!nextTier) return null
                const pct = Math.min(100, (currentProgress / nextTier.threshold) * 100)
                return (
                  <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
