import { useState } from 'react'
import { useGameStore, CampaignStage, Gear } from '@/lib/store'
import { generateGear } from '@/lib/gear-generator'
import { heroToBattleUnit } from '@/lib/battle-engine'
import { generateCampaignEnemies } from '@/lib/enemy-data'
import { useNotifications } from '@/lib/notifications'
import BattlePage from './BattlePage'

const difficultyStyle: Record<string, { text: string; bg: string; border: string }> = {
  normal: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  hard: { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  nightmare: { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
}

const chapterThemes = [
  { gradient: 'from-sky-500/15 to-blue-500/5', border: 'border-sky-500/20', icon: '🌅' },
  { gradient: 'from-purple-500/15 to-violet-500/5', border: 'border-purple-500/20', icon: '🌑' },
  { gradient: 'from-red-500/15 to-orange-500/5', border: 'border-red-500/20', icon: '🔥' },
]

function StageCard({
  stage,
  unlocked,
  onBattle,
  index,
  chapterIdx,
}: {
  stage: CampaignStage
  unlocked: boolean
  onBattle: () => void
  index: number
  chapterIdx: number
}) {
  const ds = difficultyStyle[stage.difficulty]
  const theme = chapterThemes[chapterIdx] || chapterThemes[0]

  return (
    <div
      className={`rounded-xl border p-4 transition-all animate-[fade-up_0.3s_ease-out] ${
        unlocked
          ? `bg-gradient-to-r ${theme.gradient} ${theme.border} hover:brightness-110`
          : 'bg-white/[0.01] border-white/5 opacity-40'
      }`}
      style={{ animationDelay: `${0.15 + index * 0.05}s`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/40">{stage.chapter}-{stage.stage}</span>
          <h3 className="text-sm font-bold text-white">{stage.name}</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border capitalize ${ds.text} ${ds.bg} ${ds.border}`}>
          {stage.difficulty}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span>⚡ {stage.enemyPower.toLocaleString()}</span>
          <span>🔋 {stage.energyCost}</span>
        </div>
        {stage.completed && (
          <div className="flex gap-0.5">
            {[1, 2, 3].map(s => (
              <span key={s} className={`text-sm transition-all ${s <= stage.stars ? 'text-yellow-400 drop-shadow-[0_0_3px_rgba(234,179,8,0.5)]' : 'text-white/10'}`}>★</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] text-white/30">
          💎{stage.rewards.shards} • +{stage.rewards.xp}XP
        </div>
        {unlocked && (
          <button
            onClick={onBattle}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 ${
              stage.completed
                ? 'bg-white/10 border border-white/20 text-white/60 hover:text-white'
                : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/20'
            }`}
          >
            {stage.completed ? 'Replay' : 'Battle'}
          </button>
        )}
      </div>
    </div>
  )
}

function CampaignBattle({
  stage,
  teamHeroes,
  teamPower,
  onResult,
}: {
  stage: CampaignStage
  teamHeroes: any[]
  teamPower: number
  onResult: (won: boolean, stars: number, gearDrops: Gear[]) => void
}) {
  const playerUnits = teamHeroes.map(h => heroToBattleUnit(h))
  const enemyUnits = generateCampaignEnemies(stage.enemyPower, stage.chapter)

  const handleResult = (won: boolean) => {
    let stars = 0
    const drops: Gear[] = []
    if (won) {
      const ratio = teamPower / stage.enemyPower
      if (ratio >= 1.3) stars = 3
      else if (ratio >= 0.9) stars = 2
      else stars = 1
      const dropCount = stars >= 3 ? 2 : 1
      for (let i = 0; i < dropCount; i++) {
        drops.push(generateGear(stage.chapter))
      }
    }
    onResult(won, stars, drops)
  }

  return (
    <BattlePage
      playerTeam={playerUnits}
      enemyTeam={enemyUnits}
      title={`Campaign: ${stage.name}`}
      onResult={handleResult}
    />
  )
}

export default function CampaignPage({ onBack, onTeamBuilder }: { onBack: () => void; onTeamBuilder: () => void }) {
  const { campaignStages, currentTeam, heroes, energy, spendEnergy, addShards, completeCampaignStage, addToInventory } = useGameStore()
  const { addToast } = useNotifications()
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
    const prev = campaignStages.find(
      s => s.chapter === stage.chapter && s.stage === stage.stage - 1
    )
    if (prev?.completed) return true
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
        addToast({
          type: 'reward',
          title: `${battleStage.name} Cleared!`,
          message: `${'★'.repeat(stars)} +${battleStage.rewards.shards} shards`,
          icon: stars === 3 ? '🌟' : '⚔️',
        })
      }
    }
    setBattleStage(null)
  }

  const totalStars = campaignStages.reduce((s, st) => s + st.stars, 0)
  const maxStars = campaignStages.length * 3
  const completedCount = campaignStages.filter(s => s.completed).length

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Campaign</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-green-400 text-sm">⚡</span>
          <span className="text-sm font-mono text-white">{energy}</span>
        </div>
      </div>

      {/* Stats + team bar */}
      <div className="px-4 py-3 bg-black/30 border-b border-white/5 animate-[fade-up_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Team Power</span>
            <span className="ml-2 text-sm font-mono font-bold text-yellow-300">
              {teamPower > 0 ? teamPower.toLocaleString() : 'No team set'}
            </span>
          </div>
          <button
            onClick={onTeamBuilder}
            className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            Edit Team
          </button>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-white/40">
          <span>Progress: {completedCount}/{campaignStages.length}</span>
          <span>Stars: ★{totalStars}/{maxStars}</span>
        </div>
      </div>

      {/* Chapters */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {chapters.map((ch, chIdx) => {
          const theme = chapterThemes[chIdx] || chapterThemes[0]
          const chCompleted = ch.stages.filter(s => s.completed).length
          const chStars = ch.stages.reduce((s, st) => s + st.stars, 0)

          return (
            <div key={ch.num} className="animate-[fade-up_0.4s_ease-out]" style={{ animationDelay: `${chIdx * 0.1}s`, animationFillMode: 'backwards' }}>
              <div className={`flex items-center gap-3 mb-3 rounded-xl ${theme.border} bg-gradient-to-r ${theme.gradient} px-4 py-3 border`}>
                <span className="text-2xl">{theme.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/30">CH.{ch.num}</span>
                    <h2 className="text-sm font-bold text-white">{ch.name}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/30 mt-0.5">
                    <span>{chCompleted}/{ch.stages.length} cleared</span>
                    <span>★{chStars}/{ch.stages.length * 3}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {ch.stages.map((stage, i) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    unlocked={isStageUnlocked(stage)}
                    onBattle={() => startBattle(stage)}
                    index={i}
                    chapterIdx={chIdx}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Battle overlay */}
      {battleStage && (
        <CampaignBattle
          stage={battleStage}
          teamHeroes={teamHeroes}
          teamPower={teamPower}
          onResult={handleBattleResult}
        />
      )}

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
