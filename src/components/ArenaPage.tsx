import { useState, useMemo } from 'react'
import { useGameStore, Gear } from '@/lib/store'
import { generateGear } from '@/lib/gear-generator'
import { heroToBattleUnit } from '@/lib/battle-engine'
import { generateArenaEnemies } from '@/lib/enemy-data'
import { useNotifications } from '@/lib/notifications'
import { BP_XP_REWARDS } from '@/lib/battle-pass-data'
import BattlePage from './BattlePage'

interface ArenaOpponent {
  id: string
  name: string
  rank: number
  teamPower: number
  teamComp: string
  winRate: string
}

const rankTiers = [
  { name: 'Bronze', min: 0, max: 999, color: 'text-amber-700', bg: 'from-amber-900/30 to-amber-700/10', border: 'border-amber-700/30', icon: '🥉' },
  { name: 'Silver', min: 1000, max: 1499, color: 'text-zinc-300', bg: 'from-zinc-600/30 to-zinc-400/10', border: 'border-zinc-400/30', icon: '🥈' },
  { name: 'Gold', min: 1500, max: 1999, color: 'text-yellow-400', bg: 'from-yellow-600/30 to-yellow-400/10', border: 'border-yellow-500/30', icon: '🥇' },
  { name: 'Diamond', min: 2000, max: 2499, color: 'text-cyan-300', bg: 'from-cyan-600/30 to-cyan-300/10', border: 'border-cyan-400/30', icon: '💎' },
  { name: 'Legend', min: 2500, max: 99999, color: 'text-purple-300', bg: 'from-purple-600/30 to-pink-400/10', border: 'border-purple-400/30', icon: '👑' },
]

function getRankTier(rating: number) {
  return rankTiers.find(t => rating >= t.min && rating <= t.max) || rankTiers[0]
}

function generateOpponents(teamPower: number, arenaRating: number): ArenaOpponent[] {
  const comps = ['3 Off / 1 Def / 1 Sup', '2 Off / 2 Def / 1 Sup', '2 Off / 1 Def / 2 Sup', '1 Off / 3 Def / 1 Sup', '4 Off / 1 Sup']
  const names = [
    'ShadowLord', 'VoidHunter', 'AetherKing', 'StormRider', 'DawnBreaker',
    'NightFury', 'IronGuard', 'FlameWitch', 'FrostGiant', 'LunarKnight',
    'DarkSeer', 'WindRunner', 'StarForge', 'BloodRaven', 'GhostWalker',
  ]

  const opponents: ArenaOpponent[] = []
  for (let i = 0; i < 5; i++) {
    const powerVariance = 0.7 + Math.random() * 0.6
    const ratingVariance = -200 + Math.random() * 400
    opponents.push({
      id: `opp-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      rank: Math.max(0, Math.round(arenaRating + ratingVariance)),
      teamPower: Math.round(teamPower * powerVariance),
      teamComp: comps[Math.floor(Math.random() * comps.length)],
      winRate: `${(40 + Math.random() * 30).toFixed(0)}%`,
    })
  }
  return opponents.sort((a, b) => a.teamPower - b.teamPower)
}

function DifficultyBadge({ teamPower, opponentPower }: { teamPower: number; opponentPower: number }) {
  if (teamPower === 0) return null
  const ratio = opponentPower / teamPower
  const label = ratio < 0.7 ? 'Easy' : ratio < 0.9 ? 'Fair' : ratio < 1.1 ? 'Hard' : 'Extreme'
  const color = ratio < 0.7 ? 'text-green-400 bg-green-400/10 border-green-400/30' : ratio < 0.9 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' : ratio < 1.1 ? 'text-orange-400 bg-orange-400/10 border-orange-400/30' : 'text-red-400 bg-red-400/10 border-red-400/30'
  return <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${color}`}>{label}</span>
}

function ArenaBattle({
  opponent,
  teamHeroes,
  teamPower,
  arenaRating,
  onResult,
}: {
  opponent: ArenaOpponent
  teamHeroes: any[]
  teamPower: number
  arenaRating: number
  onResult: (won: boolean, ratingChange: number, gear: Gear[]) => void
}) {
  const playerUnits = teamHeroes.map(h => heroToBattleUnit(h))
  const enemyUnits = generateArenaEnemies(opponent.teamPower, arenaRating)

  const handleResult = (won: boolean) => {
    let change = 0
    const drops: Gear[] = []
    if (won) {
      const underdog = opponent.teamPower > teamPower ? 1.5 : 1
      change = Math.round((15 + Math.random() * 15) * underdog)
      if (Math.random() < 0.3) drops.push(generateGear(3))
    } else {
      change = -Math.round(8 + Math.random() * 12)
    }
    onResult(won, change, drops)
  }

  return (
    <BattlePage
      playerTeam={playerUnits}
      enemyTeam={enemyUnits}
      title={`Arena: vs ${opponent.name}`}
      onResult={handleResult}
    />
  )
}

export default function ArenaPage({ onBack, onTeamBuilder }: { onBack: () => void; onTeamBuilder: () => void }) {
  const { currentTeam, heroes, arenaRating, arenaWins, arenaLosses, updateArenaRating, addShards, addToInventory, incrementBattlesWon, trackDailyQuest, addBattlePassXp } = useGameStore()
  const { addToast } = useNotifications()
  const [battleOpponent, setBattleOpponent] = useState<ArenaOpponent | null>(null)

  const teamHeroes = currentTeam.map(id => heroes.find(h => h.id === id)).filter(Boolean)
  const teamPower = teamHeroes.reduce((sum, h) => sum + (h?.power || 0), 0)
  const tier = getRankTier(arenaRating)

  const opponents = useMemo(
    () => generateOpponents(teamPower || 5000, arenaRating),
    [teamPower, arenaRating]
  )

  const startBattle = (opp: ArenaOpponent) => {
    if (currentTeam.length === 0) {
      onTeamBuilder()
      return
    }
    setBattleOpponent(opp)
  }

  const handleBattleResult = (won: boolean, ratingChange: number, gear: Gear[]) => {
    updateArenaRating(ratingChange, won)
    if (won) {
      const shardReward = 30 + Math.round(arenaRating * 0.02)
      addShards(shardReward)
      gear.forEach(g => addToInventory(g))
      incrementBattlesWon()
      trackDailyQuest('arenaWinsToday')
      addBattlePassXp(BP_XP_REWARDS.arenaWin)
      addToast({ type: 'reward', title: 'Arena Victory!', message: `+${ratingChange} rating, +${shardReward} shards`, icon: '🏟️' })
    } else {
      addBattlePassXp(BP_XP_REWARDS.arenaLoss)
    }
    setBattleOpponent(null)
  }

  const totalBattles = arenaWins + arenaLosses
  const winRate = totalBattles > 0 ? ((arenaWins / totalBattles) * 100).toFixed(1) : '0.0'
  const progressPct = tier.max < 99999 ? Math.min(100, ((arenaRating - tier.min) / (tier.max - tier.min + 1)) * 100) : 100

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Arena</h1>
        <button
          onClick={onTeamBuilder}
          className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          Edit Team
        </button>
      </div>

      {/* Rank card */}
      <div className={`mx-4 mt-4 rounded-2xl border ${tier.border} bg-gradient-to-r ${tier.bg} p-5 overflow-hidden relative animate-[fade-up_0.4s_ease-out]`}>
        <div className="absolute -top-6 -right-6 text-8xl opacity-10">{tier.icon}</div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{tier.icon}</span>
                <span className={`text-xl font-bold ${tier.color}`}>{tier.name}</span>
              </div>
              <p className="text-3xl font-mono font-bold text-white">{arenaRating}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Rating</p>
            </div>
            <div className="text-right space-y-1.5">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-mono text-green-400 font-bold">{arenaWins}W</span>
                <span className="text-white/20">/</span>
                <span className="text-sm font-mono text-red-400 font-bold">{arenaLosses}L</span>
              </div>
              <p className="text-xs text-white/50 font-mono">{winRate}% Win Rate</p>
              <p className="text-[10px] text-white/30">{totalBattles} battles</p>
            </div>
          </div>

          {/* Rank progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-white/30 mb-1">
              <span>{tier.name} {tier.min}</span>
              <span>{tier.max < 99999 ? `Next: ${tier.max + 1}` : 'Max Rank'}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards info */}
      <div className="mx-4 mt-3 rounded-xl bg-white/[0.03] border border-white/10 p-3 flex items-center justify-between animate-[fade-up_0.4s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Win Reward</p>
          <p className="text-xs text-yellow-400 mt-0.5">💎 {30 + Math.round(arenaRating * 0.02)} shards + 30% gear</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Team Power</p>
          <p className="text-sm font-mono font-bold text-yellow-300">
            {teamPower > 0 ? teamPower.toLocaleString() : 'No team'}
          </p>
        </div>
      </div>

      {/* Opponents */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 animate-[fade-up_0.3s_ease-out]" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>Opponents</h3>
        {opponents.map((opp, i) => {
          const oppTier = getRankTier(opp.rank)
          const harder = opp.teamPower > teamPower

          return (
            <div
              key={opp.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06] hover:border-white/20 group animate-[fade-up_0.3s_ease-out]"
              style={{ animationDelay: `${0.2 + i * 0.06}s`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{oppTier.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{opp.name}</p>
                      <DifficultyBadge teamPower={teamPower} opponentPower={opp.teamPower} />
                    </div>
                    <p className={`text-[10px] ${oppTier.color}`}>{oppTier.name} • {opp.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-bold ${harder ? 'text-red-400' : 'text-green-400'}`}>
                    {opp.teamPower.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-white/30">{opp.winRate} WR</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/25">{opp.teamComp}</p>
                <button
                  onClick={() => startBattle(opp)}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20 group-hover:shadow-red-500/30"
                >
                  Challenge
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Battle overlay */}
      {battleOpponent && (
        <ArenaBattle
          opponent={battleOpponent}
          teamHeroes={teamHeroes}
          teamPower={teamPower}
          arenaRating={arenaRating}
          onResult={handleBattleResult}
        />
      )}

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 50%,100% { transform: translateX(100%); } }
      `}</style>
    </div>
  )
}
