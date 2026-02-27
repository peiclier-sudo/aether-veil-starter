import { useGameStore, MAX_ENERGY, getPlayerLevel } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import { useNotifications } from '@/lib/notifications'
import { getDailyQuests, DailyQuest } from '@/lib/daily-quests'
import { getCurrentBPLevel } from '@/lib/battle-pass-data'
import HeroCard from './HeroCard'
import { useMemo, useState } from 'react'

function PlayerTopBar({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { playerName, level, playerXp, aetherShards, energy } = useGameStore()
  const { progress } = getPlayerLevel(playerXp)
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.4s_ease-out]">
      {/* Player info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm border-2 border-yellow-300/60 shadow-lg shadow-yellow-500/20">
          {level}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{playerName}</p>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Resources + Settings */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 group">
          <span className="text-green-400 text-sm group-hover:animate-pulse">⚡</span>
          <span className="text-sm font-mono text-white">{energy}</span>
          <span className="text-[10px] text-white/40">/{MAX_ENERGY}</span>
        </div>
        <div className="flex items-center gap-1.5 group">
          <span className="text-purple-400 text-sm group-hover:animate-pulse">💎</span>
          <span className="text-sm font-mono text-white">{aetherShards.toLocaleString()}</span>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('settings')}
            className="text-white/30 hover:text-white/60 transition-colors text-lg"
            aria-label="Settings"
          >
            ⚙️
          </button>
        )}
      </div>
    </div>
  )
}

function DailyLoginBanner() {
  const { loginStreak, dailyRewardClaimed, claimDailyReward } = useGameStore()
  const { addToast } = useNotifications()
  const [claimed, setClaimed] = useState(false)

  if (dailyRewardClaimed || claimed) return null

  const handleClaim = () => {
    const reward = claimDailyReward()
    if (reward > 0) {
      setClaimed(true)
      addToast({ type: 'reward', title: `Day ${loginStreak} Reward!`, message: `+${reward} shards`, icon: '🔥' })
    }
  }

  const streakBonus = Math.min(loginStreak, 7) * 25
  const totalReward = 100 + streakBonus

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/15 to-yellow-500/10 p-4 animate-[fade-up_0.5s_ease-out] overflow-hidden relative">
      <div className="absolute -right-4 -top-4 text-6xl opacity-10">🔥</div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔥</span>
            <h3 className="text-sm font-bold text-orange-300">Day {loginStreak} Login Streak!</h3>
          </div>
          <p className="text-[10px] text-white/40">Claim your daily reward: 💎 {totalReward} shards</p>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold ${
                  i < loginStreak ? 'bg-orange-500/30 text-orange-300' : 'bg-white/5 text-white/20'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleClaim}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold text-sm rounded-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/30"
        >
          Claim!
        </button>
      </div>
    </div>
  )
}

function FeaturedHero({ hero, onViewRoster }: { hero: any; onViewRoster: () => void }) {
  const portrait = useMemo(
    () => generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role),
    [hero.name, hero.faction, hero.rarity, hero.role]
  )

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1028] to-[#0a060f] animate-[fade-up_0.5s_ease-out]"
      style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Hero portrait */}
        <div className="relative w-full md:w-80 h-72 md:h-auto overflow-hidden group">
          <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1028]/80 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1028] to-transparent md:hidden" />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
        </div>

        {/* Hero details */}
        <div className="flex-1 p-6 md:p-8 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500 text-black font-bold uppercase tracking-wider shadow-sm shadow-yellow-500/30">
              {hero.rarity}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">{hero.role}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">{hero.name}</h2>
          <p className="text-sm text-purple-300/80 mb-6">{hero.faction}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'HP', value: hero.hp, color: 'text-emerald-400' },
              { label: 'ATK', value: hero.atk, color: 'text-red-400' },
              { label: 'DEF', value: hero.def, color: 'text-sky-400' },
              { label: 'SPD', value: hero.spd, color: 'text-purple-400' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center animate-[fade-up_0.4s_ease-out]"
                style={{ animationDelay: `${0.3 + i * 0.08}s`, animationFillMode: 'backwards' }}
              >
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="flex gap-2 mb-6">
            {hero.skills.map((skill: any, i: number) => (
              <div
                key={skill.name}
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all animate-[fade-up_0.4s_ease-out]"
                style={{ animationDelay: `${0.5 + i * 0.08}s`, animationFillMode: 'backwards' }}
              >
                <p className="text-xs font-medium text-white">{skill.name}</p>
                <p className="text-[10px] text-white/40">CD: {skill.cooldown}s</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onViewRoster}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm rounded-lg hover:brightness-110 hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActions({ onNavigate }: { onNavigate: (page: string) => void }) {
  const actions = [
    { label: 'Campaign', icon: '⚔️', desc: 'Story battles', page: 'campaign', glow: 'hover:shadow-red-500/20' },
    { label: 'Arena', icon: '🏟️', desc: 'PvP combat', page: 'arena', glow: 'hover:shadow-orange-500/20' },
    { label: 'Summon', icon: '🌟', desc: 'Summon heroes', page: 'summon', glow: 'hover:shadow-yellow-500/20' },
    { label: 'Dungeons', icon: '🌀', desc: 'Loot & gear', page: 'dungeons', glow: 'hover:shadow-purple-500/20' },
    { label: 'Shop', icon: '🛒', desc: 'Buy items', page: 'shop', glow: 'hover:shadow-green-500/20' },
    { label: 'Ascend', icon: '⭐', desc: 'Power up', page: 'ascension', glow: 'hover:shadow-amber-500/20' },
    { label: 'Guild', icon: '🏰', desc: 'Boss raids', page: 'guild', glow: 'hover:shadow-cyan-500/20' },
    { label: 'Trophies', icon: '🏆', desc: 'Achievements', page: 'achievements', glow: 'hover:shadow-yellow-500/20' },
    { label: 'Champions', icon: '👥', desc: 'View roster', page: 'roster', glow: 'hover:shadow-blue-500/20' },
    { label: 'Team', icon: '🛡️', desc: 'Build team', page: 'team', glow: 'hover:shadow-sky-500/20' },
    { label: 'Inventory', icon: '📦', desc: 'Manage gear', page: 'inventory', glow: 'hover:shadow-zinc-400/20' },
    { label: 'Bonds', icon: '🔗', desc: 'Faction synergy', page: 'resonance', glow: 'hover:shadow-pink-500/20' },
  ]
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((a, i) => (
        <button
          key={a.label}
          onClick={() => onNavigate(a.page)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg ${a.glow} hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all group animate-[fade-up_0.3s_ease-out]`}
          style={{ animationDelay: `${0.2 + i * 0.04}s`, animationFillMode: 'backwards' }}
        >
          <span className="text-2xl group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-200">{a.icon}</span>
          <span className="text-xs font-medium text-white">{a.label}</span>
          <span className="text-[10px] text-white/40">{a.desc}</span>
        </button>
      ))}
    </div>
  )
}

function DailyQuestsCard() {
  const { dailyQuestProgress, claimDailyQuestReward } = useGameStore()
  const { addToast } = useNotifications()
  const today = new Date().toISOString().slice(0, 10)
  const quests = useMemo(() => getDailyQuests(today), [today])

  const handleClaim = (quest: DailyQuest) => {
    const success = claimDailyQuestReward(quest.id, quest.reward)
    if (success) {
      addToast({ type: 'reward', title: quest.name, message: `+${quest.reward.shards} shards +${quest.reward.bpXp} BP XP`, icon: quest.icon })
    }
  }

  return (
    <div
      className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors animate-[fade-up_0.4s_ease-out]"
      style={{ animationDelay: '1s', animationFillMode: 'backwards' }}
    >
      <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Daily Quests</h4>
      <div className="space-y-2.5">
        {quests.map(q => {
          const progress = dailyQuestProgress.date === today ? (dailyQuestProgress.progress[q.trackingKey] || 0) : 0
          const done = progress >= q.target
          const claimed = dailyQuestProgress.claimed.includes(q.id)
          const pct = Math.min(100, (progress / q.target) * 100)

          return (
            <div key={q.id} className="flex items-center gap-3 group">
              <span className="text-lg w-6 text-center">{q.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-xs truncate ${claimed ? 'text-white/30 line-through' : 'text-white/70'}`}>{q.description}</p>
                  <span className="text-[10px] font-mono text-white/30 ml-2 shrink-0">{Math.min(progress, q.target)}/{q.target}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${claimed ? 'bg-white/20' : 'bg-gradient-to-r from-green-400 to-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0">
                {claimed ? (
                  <span className="text-green-400 text-xs">✓</span>
                ) : done ? (
                  <button
                    onClick={() => handleClaim(q)}
                    className="px-3 py-1 text-[10px] font-bold rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
                  >
                    Claim
                  </button>
                ) : (
                  <span className="text-[10px] text-yellow-400/70">💎{q.reward.shards}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BattlePassPreview({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { battlePass } = useGameStore()
  const { level } = getCurrentBPLevel(battlePass.xp)

  return (
    <button
      onClick={() => onNavigate('battlepass')}
      className="rounded-xl bg-gradient-to-r from-purple-500/15 to-pink-500/10 border border-purple-500/20 p-4 text-left hover:brightness-110 transition-all group animate-[fade-up_0.4s_ease-out]"
      style={{ animationDelay: '1.1s', animationFillMode: 'backwards' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-purple-200 uppercase tracking-wider">Battle Pass</h4>
        {battlePass.isPremium && <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">PREMIUM</span>}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">👑</div>
        <div>
          <p className="text-lg font-mono font-bold text-white">Level {level}</p>
          <p className="text-[10px] text-white/40">Season 1: Dawn of Echoes</p>
        </div>
      </div>
      <p className="text-[10px] text-purple-300/60 mt-2 group-hover:text-purple-300/80 transition">Tap to view rewards →</p>
    </button>
  )
}

function StarterPackCard() {
  const { starterPackPurchased, aetherShards, purchaseStarterPack } = useGameStore()
  const { addToast } = useNotifications()

  const handlePurchase = () => {
    if (purchaseStarterPack()) {
      addToast({ type: 'reward', title: 'Starter Pack Purchased!', message: '+3000 shards, full energy, 5 heroes', icon: '🎁', duration: 5000 })
    }
  }

  if (starterPackPurchased) {
    return (
      <div
        className="rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 p-4 animate-[fade-up_0.4s_ease-out] opacity-50"
        style={{ animationDelay: '1.2s', animationFillMode: 'backwards' }}
      >
        <h4 className="text-sm font-bold text-yellow-300/60 uppercase tracking-wider mb-2">Starter Pack</h4>
        <p className="text-xs text-white/30">Already claimed! ✓</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl bg-gradient-to-r from-yellow-500/15 to-orange-500/10 border border-yellow-500/30 p-4 animate-[fade-up_0.4s_ease-out] overflow-hidden relative"
      style={{ animationDelay: '1.2s', animationFillMode: 'backwards' }}
    >
      <div className="absolute -right-4 -top-4 text-6xl opacity-10">🎁</div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold animate-pulse">LIMITED</span>
          <h4 className="text-sm font-bold text-yellow-300 uppercase tracking-wider">Starter Pack</h4>
        </div>
        <p className="text-[10px] text-white/50 mb-3">3000 shards + full energy + 5 heroes</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white/30 line-through text-xs">💎 2000</span>
            <span className="text-yellow-400 font-bold text-sm ml-2">💎 500</span>
            <span className="text-[9px] text-green-400 ml-1">75% OFF</span>
          </div>
          <button
            onClick={handlePurchase}
            disabled={aetherShards < 500}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              aetherShards >= 500
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:brightness-110 hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            Buy Now!
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { heroes } = useGameStore()
  const legendaries = heroes.filter(h => h.rarity === 'legendary')
  const featured = legendaries[0] || heroes[0]
  const topHeroes = [...heroes].sort((a, b) => b.power - a.power).slice(0, 8)

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <PlayerTopBar onNavigate={onNavigate} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Daily login banner */}
          <DailyLoginBanner />

          {/* Featured hero showcase */}
          {featured && (
            <FeaturedHero hero={featured} onViewRoster={() => onNavigate('roster')} />
          )}

          {/* Quick actions */}
          <QuickActions onNavigate={onNavigate} />

          {/* Top champions strip */}
          <div
            className="animate-[fade-up_0.4s_ease-out]"
            style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">Top Champions</h3>
              <button onClick={() => onNavigate('roster')} className="text-xs text-yellow-400 hover:text-yellow-300 hover:translate-x-0.5 transition-all">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {topHeroes.map((hero, i) => (
                <div
                  key={hero.id}
                  className="animate-[fade-up_0.3s_ease-out]"
                  style={{ animationDelay: `${0.8 + i * 0.05}s`, animationFillMode: 'backwards' }}
                >
                  <HeroCard hero={hero} onClick={() => {}} compact />
                </div>
              ))}
            </div>
          </div>

          {/* Daily quests + Battle Pass + Starter Pack */}
          <DailyQuestsCard />

          {/* Battle Pass preview + Starter Pack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BattlePassPreview onNavigate={onNavigate} />
            <StarterPackCard />
          </div>
        </div>
      </div>

      {/* Global keyframe animations */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
        @keyframes grow-width {
          from { width: 0%; }
        }
      `}</style>
    </div>
  )
}
