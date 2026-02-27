import { useState } from 'react'
import { useGameStore, Gear } from '@/lib/store'
import { generateGear } from '@/lib/gear-generator'
import { heroToBattleUnit } from '@/lib/battle-engine'
import { generateDungeonEnemies } from '@/lib/enemy-data'
import { useNotifications } from '@/lib/notifications'
import { BP_XP_REWARDS } from '@/lib/battle-pass-data'
import BattlePage from './BattlePage'

interface Dungeon {
  id: string
  name: string
  icon: string
  description: string
  energyCost: number
  minPower: number
  floors: DungeonFloor[]
  color: string
  gradient: string
  borderColor: string
  atmosphere: string
}

interface DungeonFloor {
  floor: number
  enemyPower: number
  rewards: { shards: number; gearDrops: number; bonusGearChance: number }
}

const dungeons: Dungeon[] = [
  {
    id: 'gear-cavern',
    name: 'Gear Cavern',
    icon: '🗡️',
    description: 'Farm powerful equipment for your champions',
    energyCost: 10,
    minPower: 2000,
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    atmosphere: 'Molten forges echo within...',
    floors: [
      { floor: 1, enemyPower: 2000, rewards: { shards: 20, gearDrops: 1, bonusGearChance: 0.2 } },
      { floor: 2, enemyPower: 3500, rewards: { shards: 30, gearDrops: 1, bonusGearChance: 0.3 } },
      { floor: 3, enemyPower: 5000, rewards: { shards: 40, gearDrops: 2, bonusGearChance: 0.3 } },
      { floor: 4, enemyPower: 7000, rewards: { shards: 50, gearDrops: 2, bonusGearChance: 0.4 } },
      { floor: 5, enemyPower: 10000, rewards: { shards: 80, gearDrops: 3, bonusGearChance: 0.5 } },
    ],
  },
  {
    id: 'shard-mine',
    name: 'Shard Mine',
    icon: '💎',
    description: 'Mine Aether Shards to power up your heroes',
    energyCost: 8,
    minPower: 1500,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/10',
    borderColor: 'border-purple-500/30',
    atmosphere: 'Crystals hum with raw energy...',
    floors: [
      { floor: 1, enemyPower: 1500, rewards: { shards: 80, gearDrops: 0, bonusGearChance: 0.1 } },
      { floor: 2, enemyPower: 3000, rewards: { shards: 150, gearDrops: 0, bonusGearChance: 0.15 } },
      { floor: 3, enemyPower: 4500, rewards: { shards: 250, gearDrops: 1, bonusGearChance: 0.2 } },
      { floor: 4, enemyPower: 6500, rewards: { shards: 400, gearDrops: 1, bonusGearChance: 0.25 } },
      { floor: 5, enemyPower: 9000, rewards: { shards: 600, gearDrops: 1, bonusGearChance: 0.3 } },
    ],
  },
  {
    id: 'void-rift',
    name: 'Void Rift',
    icon: '🌀',
    description: 'Challenge the void for legendary treasures',
    energyCost: 15,
    minPower: 5000,
    color: 'text-red-400',
    gradient: 'from-red-500/20 to-violet-500/10',
    borderColor: 'border-red-500/30',
    atmosphere: 'Reality fractures at the edges...',
    floors: [
      { floor: 1, enemyPower: 5000, rewards: { shards: 60, gearDrops: 2, bonusGearChance: 0.4 } },
      { floor: 2, enemyPower: 7500, rewards: { shards: 90, gearDrops: 2, bonusGearChance: 0.5 } },
      { floor: 3, enemyPower: 10000, rewards: { shards: 120, gearDrops: 3, bonusGearChance: 0.5 } },
      { floor: 4, enemyPower: 13000, rewards: { shards: 160, gearDrops: 3, bonusGearChance: 0.6 } },
      { floor: 5, enemyPower: 16000, rewards: { shards: 250, gearDrops: 4, bonusGearChance: 0.7 } },
    ],
  },
]

function DungeonCard({ dungeon, teamPower, onSelect, index }: { dungeon: Dungeon; teamPower: number; onSelect: () => void; index: number }) {
  const canEnter = teamPower >= dungeon.minPower

  return (
    <button
      onClick={onSelect}
      disabled={!canEnter}
      className={`w-full rounded-2xl border overflow-hidden text-left transition-all group animate-[fade-up_0.4s_ease-out] ${
        canEnter
          ? `bg-gradient-to-br ${dungeon.gradient} ${dungeon.borderColor} hover:brightness-110 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]`
          : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
      }`}
      style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: 'backwards' }}
    >
      {/* Icon and atmosphere */}
      <div className="relative p-5 pb-3">
        <div className="absolute top-3 right-3 opacity-10 text-6xl group-hover:opacity-20 transition-opacity">{dungeon.icon}</div>
        <span className="text-4xl relative z-10">{dungeon.icon}</span>
        <p className="text-[10px] text-white/30 italic mt-2">{dungeon.atmosphere}</p>
      </div>

      <div className="px-5 pb-5">
        <h3 className={`text-lg font-bold mb-1 ${dungeon.color}`}>{dungeon.name}</h3>
        <p className="text-xs text-white/40 mb-4">{dungeon.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1">⚡ {dungeon.energyCost}</span>
            <span className="flex items-center gap-1">💪 {dungeon.minPower.toLocaleString()}+</span>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full border ${dungeon.borderColor} bg-white/5`}>
            {dungeon.floors.length} floors
          </span>
        </div>
      </div>
    </button>
  )
}

function FloorSelect({
  dungeon,
  teamPower,
  energy,
  onBattle,
  onBack,
}: {
  dungeon: Dungeon
  teamPower: number
  energy: number
  onBattle: (floor: DungeonFloor) => void
  onBack: () => void
}) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5 animate-[fade-up_0.2s_ease-out]">← Back to Dungeons</button>

      <div className={`rounded-2xl border ${dungeon.borderColor} bg-gradient-to-r ${dungeon.gradient} p-5 animate-[fade-up_0.3s_ease-out]`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{dungeon.icon}</span>
          <div>
            <h2 className={`text-xl font-bold ${dungeon.color}`}>{dungeon.name}</h2>
            <p className="text-xs text-white/40">{dungeon.description}</p>
            <p className="text-[10px] text-white/25 italic mt-1">{dungeon.atmosphere}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {dungeon.floors.map((floor, i) => {
          const canBattle = teamPower >= floor.enemyPower * 0.5 && energy >= dungeon.energyCost
          const difficulty = teamPower > 0 ? floor.enemyPower / teamPower : 999
          const diffLabel = difficulty < 0.5 ? 'Easy' : difficulty < 0.8 ? 'Medium' : difficulty < 1.2 ? 'Hard' : 'Extreme'
          const diffColor = difficulty < 0.5 ? 'text-green-400' : difficulty < 0.8 ? 'text-yellow-400' : difficulty < 1.2 ? 'text-orange-400' : 'text-red-400'

          return (
            <div
              key={floor.floor}
              className={`rounded-xl border p-4 transition-all animate-[fade-up_0.3s_ease-out] ${
                canBattle
                  ? `bg-white/[0.03] ${dungeon.borderColor} hover:bg-white/[0.06]`
                  : 'bg-white/[0.01] border-white/5 opacity-40'
              }`}
              style={{ animationDelay: `${0.15 + i * 0.06}s`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${dungeon.gradient.replace('from-', 'bg-').split(' ')[0]}  flex items-center justify-center`}>
                    <span className="text-xs font-mono font-bold text-white/60">F{floor.floor}</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">Floor {floor.floor}</span>
                    <span className={`text-[10px] ml-2 ${diffColor}`}>{diffLabel}</span>
                  </div>
                </div>
                <span className="text-xs text-red-400/60 font-mono">⚡{floor.enemyPower.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  <span>💎 {floor.rewards.shards}</span>
                  <span>🗡️ {floor.rewards.gearDrops} gear</span>
                  {floor.rewards.bonusGearChance > 0 && (
                    <span className="text-yellow-400/50">✨ {Math.round(floor.rewards.bonusGearChance * 100)}%</span>
                  )}
                </div>
                {canBattle && (
                  <button
                    onClick={() => onBattle(floor)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20`}
                  >
                    Enter
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DungeonBattle({
  dungeon,
  floor,
  teamHeroes,
  onResult,
}: {
  dungeon: Dungeon
  floor: DungeonFloor
  teamHeroes: any[]
  onResult: (won: boolean, shards: number, gear: Gear[]) => void
}) {
  const playerUnits = teamHeroes.map(h => heroToBattleUnit(h))
  const enemyUnits = generateDungeonEnemies(floor.enemyPower, floor.floor)

  const handleResult = (won: boolean) => {
    const drops: Gear[] = []
    let shards = 0
    if (won) {
      shards = floor.rewards.shards
      const difficulty = dungeon.id === 'void-rift' ? 4 : dungeon.id === 'gear-cavern' ? 3 : 2
      for (let i = 0; i < floor.rewards.gearDrops; i++) {
        drops.push(generateGear(difficulty))
      }
      if (Math.random() < floor.rewards.bonusGearChance) {
        drops.push(generateGear(difficulty + 1))
      }
    }
    onResult(won, shards, drops)
  }

  return (
    <BattlePage
      playerTeam={playerUnits}
      enemyTeam={enemyUnits}
      title={`${dungeon.name} — Floor ${floor.floor}`}
      onResult={handleResult}
    />
  )
}

export default function DungeonsPage({ onBack, onTeamBuilder }: { onBack: () => void; onTeamBuilder: () => void }) {
  const { currentTeam, heroes, energy, spendEnergy, addShards, addToInventory, incrementDungeonClears, trackDailyQuest, addBattlePassXp, incrementBattlesWon } = useGameStore()
  const { addToast } = useNotifications()
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null)
  const [battleFloor, setBattleFloor] = useState<{ dungeon: Dungeon; floor: DungeonFloor } | null>(null)

  const teamHeroes = currentTeam.map(id => heroes.find(h => h.id === id)).filter(Boolean)
  const teamPower = teamHeroes.reduce((sum, h) => sum + (h?.power || 0), 0)

  const startBattle = (dungeon: Dungeon, floor: DungeonFloor) => {
    if (currentTeam.length === 0) {
      onTeamBuilder()
      return
    }
    if (energy < dungeon.energyCost) return
    setBattleFloor({ dungeon, floor })
  }

  const handleBattleResult = (won: boolean, shards: number, gear: Gear[]) => {
    if (battleFloor) {
      spendEnergy(battleFloor.dungeon.energyCost)
      if (won) {
        addShards(shards)
        gear.forEach(g => addToInventory(g))
        incrementDungeonClears()
        incrementBattlesWon()
        trackDailyQuest('dungeonClearsToday')
        addBattlePassXp(BP_XP_REWARDS.dungeonClear)
        addToast({ type: 'reward', title: 'Dungeon Cleared!', message: `+${shards} shards, ${gear.length} gear`, icon: '🌀' })
      }
    }
    setBattleFloor(null)
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Dungeons</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-green-400 text-sm">⚡</span>
          <span className="text-sm font-mono text-white">{energy}</span>
        </div>
      </div>

      {/* Team bar */}
      <div className="px-4 py-3 bg-black/30 border-b border-white/5 flex items-center justify-between animate-[fade-up_0.2s_ease-out]">
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!selectedDungeon ? (
          <div className="space-y-4">
            <div className="text-center mb-6 animate-[fade-up_0.3s_ease-out]">
              <h2 className="text-lg font-bold text-white mb-1">Choose a Dungeon</h2>
              <p className="text-xs text-white/40">Repeatable runs for gear, shards, and more</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dungeons.map((d, i) => (
                <DungeonCard key={d.id} dungeon={d} teamPower={teamPower} onSelect={() => setSelectedDungeon(d)} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <FloorSelect
            dungeon={selectedDungeon}
            teamPower={teamPower}
            energy={energy}
            onBattle={(floor) => startBattle(selectedDungeon, floor)}
            onBack={() => setSelectedDungeon(null)}
          />
        )}
      </div>

      {/* Battle overlay */}
      {battleFloor && (
        <DungeonBattle
          dungeon={battleFloor.dungeon}
          floor={battleFloor.floor}
          teamHeroes={teamHeroes}
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
