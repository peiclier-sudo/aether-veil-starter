import { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/store'
import {
  BATTLE_PASS_TIERS, SEASON_NAME, SEASON_END_DATE,
  BATTLE_PASS_PREMIUM_COST, getCurrentBPLevel, BattlePassReward,
} from '@/lib/battle-pass-data'
import { generateGear } from '@/lib/gear-generator'
import { summonHero } from '@/lib/summon-pool'
import { useNotifications } from '@/lib/notifications'

function SeasonTimer() {
  const [remaining, setRemaining] = useState(Math.max(0, SEASON_END_DATE - Date.now()))

  useEffect(() => {
    const timer = setInterval(() => setRemaining(Math.max(0, SEASON_END_DATE - Date.now())), 1000)
    return () => clearInterval(timer)
  }, [])

  const days = Math.floor(remaining / 86400000)
  const hours = Math.floor((remaining % 86400000) / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)

  return (
    <span className="text-xs font-mono text-orange-300 tabular-nums">
      {days}d {String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m
    </span>
  )
}

function RewardCell({
  reward,
  claimed,
  canClaim,
  isPremium,
  locked,
  onClaim,
}: {
  reward: BattlePassReward
  claimed: boolean
  canClaim: boolean
  isPremium: boolean
  locked: boolean
  onClaim: () => void
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center transition-all min-w-[90px] ${
        claimed
          ? 'border-green-500/30 bg-green-500/10 opacity-60'
          : canClaim
          ? isPremium
            ? 'border-purple-400/50 bg-purple-500/20 animate-pulse shadow-lg shadow-purple-500/10'
            : 'border-yellow-400/50 bg-yellow-500/20 animate-pulse shadow-lg shadow-yellow-500/10'
          : locked
          ? 'border-white/5 bg-white/[0.02] opacity-30'
          : isPremium
          ? 'border-purple-500/20 bg-purple-500/5'
          : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <span className="text-xl">{reward.icon}</span>
      <p className="text-[9px] text-white/50 mt-1 leading-tight">{reward.label}</p>
      {claimed ? (
        <span className="text-green-400 text-xs mt-1 block">✓</span>
      ) : canClaim ? (
        <button
          onClick={onClaim}
          className={`mt-1.5 px-3 py-1 text-[9px] font-bold rounded-lg transition-all hover:scale-105 active:scale-95 ${
            isPremium
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black'
          }`}
        >
          Claim
        </button>
      ) : locked ? (
        <span className="text-[9px] text-white/15 mt-1 block">🔒</span>
      ) : null}
    </div>
  )
}

export default function BattlePassPage({ onBack }: { onBack: () => void }) {
  const { battlePass, aetherShards, unlockPremiumPass, claimBattlePassReward, addShards, addEnergy, addToInventory, addHero } = useGameStore()
  const { addToast } = useNotifications()

  const { level: currentLevel, xpIntoLevel, xpForLevel } = getCurrentBPLevel(battlePass.xp)
  const xpPct = xpForLevel > 0 ? (xpIntoLevel / xpForLevel) * 100 : 100

  const grantReward = (reward: BattlePassReward) => {
    if (reward.type === 'shards') addShards(reward.amount)
    else if (reward.type === 'energy') addEnergy(reward.amount)
    else if (reward.type === 'gear') addToInventory(generateGear(reward.amount))
    else if (reward.type === 'hero') addHero(summonHero())
  }

  const handleClaim = (tierLevel: number, track: 'free' | 'premium') => {
    const tier = BATTLE_PASS_TIERS.find(t => t.level === tierLevel)
    if (!tier) return
    const success = claimBattlePassReward(tierLevel, track)
    if (success) {
      const reward = track === 'free' ? tier.freeReward : tier.premiumReward
      grantReward(reward)
      addToast({ type: 'reward', title: `BP Lv.${tierLevel} ${track === 'premium' ? 'Premium' : 'Free'}`, message: reward.label, icon: reward.icon })
    }
  }

  const handleUnlock = () => {
    if (unlockPremiumPass()) {
      addToast({ type: 'achievement', title: 'Premium Pass Unlocked!', message: 'All premium rewards are now available', icon: '👑' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Battle Pass</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400 text-sm">💎</span>
          <span className="text-sm font-mono text-white">{aetherShards.toLocaleString()}</span>
        </div>
      </div>

      {/* Season banner */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden relative animate-[fade-up_0.4s_ease-out]">
        <div className="bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-orange-500/30 border border-purple-500/30 p-5">
          <div className="absolute -right-8 -top-8 text-9xl opacity-5">👑</div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{SEASON_NAME}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Ends in</span>
                  <SeasonTimer />
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-mono font-bold text-white">{currentLevel}</p>
                <p className="text-[10px] text-white/40">/ {BATTLE_PASS_TIERS.length}</p>
              </div>
            </div>

            {/* XP progress */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                <span>Level Progress</span>
                <span className="font-mono">{xpIntoLevel}/{xpForLevel} XP</span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full transition-all duration-500 relative"
                  style={{ width: `${xpPct}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>

            {/* Premium unlock button */}
            {!battlePass.isPremium && (
              <button
                onClick={handleUnlock}
                disabled={aetherShards < BATTLE_PASS_PREMIUM_COST}
                className={`mt-4 w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  aetherShards >= BATTLE_PASS_PREMIUM_COST
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:brightness-110 hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                Unlock Premium Pass — 💎 {BATTLE_PASS_PREMIUM_COST}
              </button>
            )}
            {battlePass.isPremium && (
              <div className="mt-3 flex items-center justify-center gap-2 text-purple-300">
                <span>👑</span>
                <span className="text-sm font-bold">Premium Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Track labels */}
      <div className="px-4 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500/50" />
          <span className="text-[10px] text-white/40">Free Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500/50" />
          <span className="text-[10px] text-white/40">Premium Track</span>
          {!battlePass.isPremium && <span className="text-[9px] text-white/20">🔒</span>}
        </div>
      </div>

      {/* Tier list (horizontal scroll) */}
      <div className="flex-1 overflow-x-auto overflow-y-auto px-4 py-4">
        <div className="flex gap-3" style={{ minWidth: `${BATTLE_PASS_TIERS.length * 110}px` }}>
          {BATTLE_PASS_TIERS.map((tier, i) => {
            const reached = currentLevel >= tier.level
            const freeClaimed = battlePass.claimedFree.includes(tier.level)
            const premClaimed = battlePass.claimedPremium.includes(tier.level)
            const freeCanClaim = reached && !freeClaimed
            const premCanClaim = reached && !premClaimed && battlePass.isPremium

            return (
              <div
                key={tier.level}
                className={`flex flex-col gap-2 animate-[fade-up_0.3s_ease-out] ${
                  reached ? '' : 'opacity-50'
                }`}
                style={{ animationDelay: `${0.1 + i * 0.04}s`, animationFillMode: 'backwards' }}
              >
                {/* Level indicator */}
                <div className={`text-center text-xs font-mono font-bold py-1 rounded-lg ${
                  reached ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-white/30'
                }`}>
                  Lv.{tier.level}
                </div>

                {/* Free reward */}
                <RewardCell
                  reward={tier.freeReward}
                  claimed={freeClaimed}
                  canClaim={freeCanClaim}
                  isPremium={false}
                  locked={false}
                  onClaim={() => handleClaim(tier.level, 'free')}
                />

                {/* Premium reward */}
                <RewardCell
                  reward={tier.premiumReward}
                  claimed={premClaimed}
                  canClaim={premCanClaim}
                  isPremium={true}
                  locked={!battlePass.isPremium}
                  onClaim={() => handleClaim(tier.level, 'premium')}
                />
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 50%,100% { transform: translateX(100%); } }
      `}</style>
    </div>
  )
}
