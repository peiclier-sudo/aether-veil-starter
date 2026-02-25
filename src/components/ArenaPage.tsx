import { useState, useMemo } from 'react'
import { useGameStore, Gear } from '@/lib/store'
import { generateGear } from '@/lib/gear-generator'

interface ArenaOpponent {
  id: string
  name: string
  rank: number
  teamPower: number
  teamComp: string
  winRate: string
}

const rankTiers = [
  { name: 'Bronze', min: 0, max: 999, color: 'text-amber-700', bg: 'from-amber-900/30 to-amber-700/10', icon: '🥉' },
  { name: 'Silver', min: 1000, max: 1499, color: 'text-zinc-300', bg: 'from-zinc-600/30 to-zinc-400/10', icon: '🥈' },
  { name: 'Gold', min: 1500, max: 1999, color: 'text-yellow-400', bg: 'from-yellow-600/30 to-yellow-400/10', icon: '🥇' },
  { name: 'Diamond', min: 2000, max: 2499, color: 'text-cyan-300', bg: 'from-cyan-600/30 to-cyan-300/10', icon: '💎' },
  { name: 'Legend', min: 2500, max: 99999, color: 'text-purple-300', bg: 'from-purple-600/30 to-pink-400/10', icon: '👑' },
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

function ArenaBattle({
  opponent,
  teamPower,
  onResult,
}: {
  opponent: ArenaOpponent
  teamPower: number
  onResult: (won: boolean, ratingChange: number, gear: Gear[]) => void
}) {
  const [phase, setPhase] = useState<'prep' | 'fighting' | 'result'>('prep')
  const [won, setWon] = useState(false)
  const [ratingChange, setRatingChange] = useState(0)
  const [gearDrops, setGearDrops] = useState<Gear[]>([])

  const startBattle = () => {
    setPhase('fighting')
    setTimeout(() => {
      const ratio = teamPower / opponent.teamPower
      const luck = 0.8 + Math.random() * 0.4
      const effective = ratio * luck
      const battleWon = effective >= 0.85

      let change = 0
      const drops: Gear[] = []
      if (battleWon) {
        const underdog = opponent.teamPower > teamPower ? 1.5 : 1
        change = Math.round((15 + Math.random() * 15) * underdog)
        if (Math.random() < 0.3) {
          drops.push(generateGear(3))
        }
      } else {
        change = -Math.round(8 + Math.random() * 12)
      }

      setWon(battleWon)
      setRatingChange(change)
      setGearDrops(drops)
      setPhase('result')
    }, 2500)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
      {phase === 'prep' && (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">Arena Challenge</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">You</p>
              <p className="text-3xl font-mono font-bold text-yellow-300">{teamPower.toLocaleString()}</p>
            </div>
            <span className="text-2xl text-white/30">VS</span>
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{opponent.name}</p>
              <p className="text-3xl font-mono font-bold text-red-400">{opponent.teamPower.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={startBattle}
            className="px-10 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:brightness-110 transition text-sm"
          >
            FIGHT!
          </button>
        </div>
      )}

      {phase === 'fighting' && (
        <div className="text-center space-y-6">
          <div className="text-5xl animate-bounce">🏟️</div>
          <p className="text-lg font-bold text-white animate-pulse">Arena battle in progress...</p>
          <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-red-500 to-yellow-500 rounded-full animate-[loading_2.5s_ease-in-out]" />
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="text-center space-y-6">
          <div className="text-6xl">{won ? '🏆' : '💀'}</div>
          <h2 className={`text-3xl font-bold ${won ? 'text-yellow-300' : 'text-red-400'}`}>
            {won ? 'VICTORY!' : 'DEFEATED'}
          </h2>

          <div className={`text-lg font-mono font-bold ${ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {ratingChange >= 0 ? '+' : ''}{ratingChange} Rating
          </div>

          {won && gearDrops.length > 0 && (
            <div className="space-y-1.5 max-w-xs mx-auto">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Bonus Gear Drop</p>
              {gearDrops.map(g => (
                <div key={g.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-xs font-medium text-purple-400">{g.name}</span>
                  <span className="text-[10px] text-white/40">{g.mainStat.type.toUpperCase()} +{g.mainStat.value}</span>
                </div>
              ))}
            </div>
          )}

          {!won && (
            <p className="text-sm text-white/40">Strengthen your team and try again</p>
          )}

          <button
            onClick={() => onResult(won, ratingChange, gearDrops)}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-xl hover:brightness-110 transition text-sm"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

export default function ArenaPage({ onBack, onTeamBuilder }: { onBack: () => void; onTeamBuilder: () => void }) {
  const { currentTeam, heroes, arenaRating, arenaWins, arenaLosses, updateArenaRating, addShards, addToInventory } = useGameStore()
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
    }
    setBattleOpponent(null)
  }

  const totalBattles = arenaWins + arenaLosses
  const winRate = totalBattles > 0 ? ((arenaWins / totalBattles) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Arena</h1>
        <button
          onClick={onTeamBuilder}
          className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white transition"
        >
          Edit Team
        </button>
      </div>

      {/* Rank card */}
      <div className={`mx-4 mt-4 rounded-xl border border-white/10 bg-gradient-to-r ${tier.bg} p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{tier.icon}</span>
              <span className={`text-lg font-bold ${tier.color}`}>{tier.name}</span>
            </div>
            <p className="text-2xl font-mono font-bold text-white">{arenaRating}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Rating</p>
          </div>
          <div className="text-right space-y-1">
            <div>
              <p className="text-sm font-mono text-green-400">{arenaWins}W</p>
            </div>
            <div>
              <p className="text-sm font-mono text-red-400">{arenaLosses}L</p>
            </div>
            <div>
              <p className="text-xs text-white/40">{winRate}% WR</p>
            </div>
          </div>
        </div>

        {/* Rank progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-white/30 mb-1">
            <span>{tier.name} {tier.min}</span>
            <span>{tier.max < 99999 ? `Next: ${tier.max + 1}` : 'Max Rank'}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((arenaRating - tier.min) / (tier.max - tier.min + 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rewards info */}
      <div className="mx-4 mt-3 rounded-lg bg-white/5 border border-white/10 p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Win Reward</p>
          <p className="text-xs text-yellow-400">💎 {30 + Math.round(arenaRating * 0.02)} shards + 30% gear drop</p>
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
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Opponents</h3>
        {opponents.map(opp => {
          const oppTier = getRankTier(opp.rank)
          const harder = opp.teamPower > teamPower
          return (
            <div key={opp.id} className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{oppTier.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{opp.name}</p>
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
                <p className="text-[10px] text-white/30">{opp.teamComp}</p>
                <button
                  onClick={() => startBattle(opp)}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:brightness-110 transition"
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
          teamPower={teamPower}
          onResult={handleBattleResult}
        />
      )}
    </div>
  )
}
