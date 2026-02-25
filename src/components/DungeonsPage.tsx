import { useState } from 'react'
import { useGameStore, Gear } from '@/lib/store'
import { generateGear } from '@/lib/gear-generator'
import { heroToBattleUnit } from '@/lib/battle-engine'
import { generateDungeonEnemies } from '@/lib/enemy-data'
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
    gradient: 'from-amber-500/20 to-orange-500/20',
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
    gradient: 'from-purple-500/20 to-pink-500/20',
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
    gradient: 'from-red-500/20 to-violet-500/20',
    floors: [
      { floor: 1, enemyPower: 5000, rewards: { shards: 60, gearDrops: 2, bonusGearChance: 0.4 } },
      { floor: 2, enemyPower: 7500, rewards: { shards: 90, gearDrops: 2, bonusGearChance: 0.5 } },
      { floor: 3, enemyPower: 10000, rewards: { shards: 120, gearDrops: 3, bonusGearChance: 0.5 } },
      { floor: 4, enemyPower: 13000, rewards: { shards: 160, gearDrops: 3, bonusGearChance: 0.6 } },
      { floor: 5, enemyPower: 16000, rewards: { shards: 250, gearDrops: 4, bonusGearChance: 0.7 } },
    ],
  },
]

function DungeonCard({ dungeon, teamPower, onSelect }: { dungeon: Dungeon; teamPower: number; onSelect: () => void }) {
  const canEnter = teamPower >= dungeon.minPower

  return (
    <button
      onClick={onSelect}
      disabled={!canEnter}
      className={`w-full rounded-xl border p-5 text-left transition-all ${
        canEnter
          ? 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
          : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
      }`}
    >
      <div className={`rounded-lg bg-gradient-to-r ${dungeon.gradient} border border-white/10 p-4 mb-4`}>
        <span className="text-4xl">{dungeon.icon}</span>
      </div>
      <h3 className={`text-lg font-bold mb-1 ${dungeon.color}`}>{dungeon.name}</h3>
      <p className="text-xs text-white/40 mb-3">{dungeon.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-white/30">
          <span>⚡ {dungeon.energyCost}</span>
          <span>💪 {dungeon.minPower.toLocaleString()}+</span>
        </div>
        <span className="text-[10px] text-white/30">{dungeon.floors.length} floors</span>
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
      <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back to Dungeons</button>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{dungeon.icon}</span>
        <div>
          <h2 className={`text-xl font-bold ${dungeon.color}`}>{dungeon.name}</h2>
          <p className="text-xs text-white/40">{dungeon.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {dungeon.floors.map(floor => {
          const canBattle = teamPower >= floor.enemyPower * 0.5 && energy >= dungeon.energyCost
          return (
            <div
              key={floor.floor}
              className={`rounded-xl border p-4 transition-all ${
                canBattle ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/40">F{floor.floor}</span>
                  <span className="text-sm font-bold text-white">Floor {floor.floor}</span>
                </div>
                <span className="text-xs text-red-400/60">⚡ {floor.enemyPower.toLocaleString()} power</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  <span>💎 {floor.rewards.shards}</span>
                  <span>🗡️ {floor.rewards.gearDrops} gear</span>
                  {floor.rewards.bonusGearChance > 0 && (
                    <span>✨ {Math.round(floor.rewards.bonusGearChance * 100)}% bonus</span>
                  )}
                </div>
                {canBattle && (
                  <button
                    onClick={() => onBattle(floor)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 transition"
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
  const { currentTeam, heroes, energy, spendEnergy, addShards, addToInventory } = useGameStore()
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
      }
    }
    setBattleFloor(null)
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Dungeons</h1>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!selectedDungeon ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-white mb-1">Choose a Dungeon</h2>
              <p className="text-xs text-white/40">Repeatable runs for gear, shards, and more</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dungeons.map(d => (
                <DungeonCard key={d.id} dungeon={d} teamPower={teamPower} onSelect={() => setSelectedDungeon(d)} />
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
    </div>
  )
}
