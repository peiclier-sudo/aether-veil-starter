import { useState } from 'react'
import { useGameStore, CampaignStage, Gear } from '@/lib/store'
import { generateGear } from '@/lib/gear-generator'

const difficultyColor: Record<string, string> = {
  normal: 'text-green-400 bg-green-400/10 border-green-400/30',
  hard: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  nightmare: 'text-red-400 bg-red-400/10 border-red-400/30',
}

function StageCard({
  stage,
  unlocked,
  onBattle,
}: {
  stage: CampaignStage
  unlocked: boolean
  onBattle: () => void
}) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${
      unlocked
        ? 'bg-white/5 border-white/10 hover:bg-white/8'
        : 'bg-white/[0.02] border-white/5 opacity-40'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/40">{stage.chapter}-{stage.stage}</span>
          <h3 className="text-sm font-bold text-white">{stage.name}</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border capitalize ${difficultyColor[stage.difficulty]}`}>
          {stage.difficulty}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span>⚡ {stage.enemyPower.toLocaleString()} power</span>
          <span>🔋 {stage.energyCost} energy</span>
        </div>
        {stage.completed && (
          <div className="flex gap-0.5">
            {[1, 2, 3].map(s => (
              <span key={s} className={`text-xs ${s <= stage.stars ? 'text-yellow-400' : 'text-white/15'}`}>★</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] text-white/30">
          Rewards: 💎{stage.rewards.shards} • +{stage.rewards.xp}XP
        </div>
        {unlocked && (
          <button
            onClick={onBattle}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              stage.completed
                ? 'bg-white/10 border border-white/20 text-white/60 hover:text-white'
                : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110'
            }`}
          >
            {stage.completed ? 'Replay' : 'Battle'}
          </button>
        )}
      </div>
    </div>
  )
}

const gearRarityLabel: Record<string, string> = {
  common: 'text-zinc-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
}

function BattleScreen({
  stage,
  teamPower,
  onResult,
}: {
  stage: CampaignStage
  teamPower: number
  onResult: (won: boolean, stars: number, gearDrops: Gear[]) => void
}) {
  const [phase, setPhase] = useState<'prep' | 'fighting' | 'result'>('prep')
  const [won, setWon] = useState(false)
  const [stars, setStars] = useState(0)
  const [gearDrops, setGearDrops] = useState<Gear[]>([])

  const startBattle = () => {
    setPhase('fighting')

    // Simulate battle after delay
    setTimeout(() => {
      const ratio = teamPower / stage.enemyPower
      const luck = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
      const effective = ratio * luck

      const battleWon = effective >= 0.7
      let battleStars = 0
      if (battleWon) {
        if (effective >= 1.5) battleStars = 3
        else if (effective >= 1.1) battleStars = 2
        else battleStars = 1
      }

      // Generate gear drops on win
      const drops: Gear[] = []
      if (battleWon) {
        const dropCount = battleStars >= 3 ? 2 : 1
        for (let i = 0; i < dropCount; i++) {
          drops.push(generateGear(stage.chapter))
        }
      }

      setWon(battleWon)
      setStars(battleStars)
      setGearDrops(drops)
      setPhase('result')
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
      {phase === 'prep' && (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">{stage.name}</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Your Team</p>
              <p className="text-3xl font-mono font-bold text-yellow-300">{teamPower.toLocaleString()}</p>
            </div>
            <span className="text-2xl text-white/30">VS</span>
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Enemy</p>
              <p className="text-3xl font-mono font-bold text-red-400">{stage.enemyPower.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-white/30">🔋 {stage.energyCost} energy will be consumed</p>
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
          <div className="text-5xl animate-bounce">⚔️</div>
          <p className="text-lg font-bold text-white animate-pulse">Battle in progress...</p>
          <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-red-500 to-yellow-500 rounded-full animate-[loading_2s_ease-in-out]" />
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="text-center space-y-6">
          <div className="text-6xl">{won ? '🏆' : '💀'}</div>
          <h2 className={`text-3xl font-bold ${won ? 'text-yellow-300' : 'text-red-400'}`}>
            {won ? 'VICTORY!' : 'DEFEATED'}
          </h2>

          {won && (
            <>
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map(s => (
                  <span key={s} className={`text-3xl ${s <= stars ? 'text-yellow-400' : 'text-white/15'}`}>★</span>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                <span>💎 +{stage.rewards.shards} shards</span>
                <span>✨ +{stage.rewards.xp} XP</span>
              </div>
              {gearDrops.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Gear Drops</p>
                  {gearDrops.map(g => (
                    <div key={g.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                      <span className={`text-xs font-medium ${gearRarityLabel[g.rarity]}`}>{g.name}</span>
                      <span className="text-[10px] text-white/40">{g.mainStat.type.toUpperCase()} +{g.mainStat.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!won && (
            <p className="text-sm text-white/40">Upgrade your team and try again</p>
          )}

          <button
            onClick={() => onResult(won, stars, gearDrops)}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-xl hover:brightness-110 transition text-sm"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

export default function CampaignPage({ onBack, onTeamBuilder }: { onBack: () => void; onTeamBuilder: () => void }) {
  const { campaignStages, currentTeam, heroes, energy, spendEnergy, addShards, completeCampaignStage, addToInventory } = useGameStore()
  const [battleStage, setBattleStage] = useState<CampaignStage | null>(null)

  const teamHeroes = currentTeam.map(id => heroes.find(h => h.id === id)).filter(Boolean)
  const teamPower = teamHeroes.reduce((sum, h) => sum + (h?.power || 0), 0)

  const chapters = [
    { num: 1, name: 'The Awakening', stages: campaignStages.filter(s => s.chapter === 1) },
    { num: 2, name: 'Veil of Shadows', stages: campaignStages.filter(s => s.chapter === 2) },
    { num: 3, name: 'Aether\'s Edge', stages: campaignStages.filter(s => s.chapter === 3) },
  ]

  const isStageUnlocked = (stage: CampaignStage) => {
    if (stage.chapter === 1 && stage.stage === 1) return true
    // Previous stage in same chapter must be completed
    const prev = campaignStages.find(
      s => s.chapter === stage.chapter && s.stage === stage.stage - 1
    )
    if (prev?.completed) return true
    // First stage of next chapter requires last stage of previous chapter
    if (stage.stage === 1 && stage.chapter > 1) {
      const lastPrev = campaignStages.find(
        s => s.chapter === stage.chapter - 1 && s.stage === 4
      )
      return !!lastPrev?.completed
    }
    return false
  }

  const startBattle = (stage: CampaignStage) => {
    if (currentTeam.length === 0) {
      onTeamBuilder()
      return
    }
    if (energy < stage.energyCost) return
    setBattleStage(stage)
  }

  const handleBattleResult = (won: boolean, stars: number, gearDrops: Gear[]) => {
    if (battleStage) {
      spendEnergy(battleStage.energyCost)
      if (won) {
        completeCampaignStage(battleStage.id, stars)
        addShards(battleStage.rewards.shards)
        gearDrops.forEach(g => addToInventory(g))
      }
    }
    setBattleStage(null)
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Campaign</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-green-400 text-sm">⚡</span>
          <span className="text-sm font-mono text-white">{energy}</span>
        </div>
      </div>

      {/* Team bar */}
      <div className="px-4 py-3 bg-black/30 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Team Power</span>
          <span className="ml-2 text-sm font-mono font-bold text-yellow-300">
            {teamPower > 0 ? teamPower.toLocaleString() : 'No team set'}
          </span>
        </div>
        <button
          onClick={onTeamBuilder}
          className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white transition"
        >
          Edit Team
        </button>
      </div>

      {/* Chapters */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {chapters.map(ch => (
          <div key={ch.num}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono text-white/30">CH.{ch.num}</span>
              <h2 className="text-sm font-bold text-white/80">{ch.name}</h2>
              <span className="text-[10px] text-white/30">
                {ch.stages.filter(s => s.completed).length}/{ch.stages.length}
              </span>
            </div>
            <div className="space-y-2">
              {ch.stages.map(stage => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  unlocked={isStageUnlocked(stage)}
                  onBattle={() => startBattle(stage)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Battle overlay */}
      {battleStage && (
        <BattleScreen
          stage={battleStage}
          teamPower={teamPower}
          onResult={handleBattleResult}
        />
      )}
    </div>
  )
}
