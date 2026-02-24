import { useState, useMemo } from 'react'
import { useGameStore, Hero } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'

const MAX_TEAM_SIZE = 5

const rarityBorder: Record<string, string> = {
  common: 'border-zinc-500/60',
  rare: 'border-blue-400/60',
  epic: 'border-purple-400/60',
  legendary: 'border-yellow-400/70',
}

function MiniHeroCard({ hero, selected, onClick }: { hero: Hero; selected: boolean; onClick: () => void }) {
  const portrait = useMemo(
    () => generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role),
    [hero.name, hero.faction, hero.rarity, hero.role]
  )

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg border-2 transition-all
        ${rarityBorder[hero.rarity]}
        ${selected ? 'ring-2 ring-yellow-400 brightness-110 scale-105' : 'opacity-70 hover:opacity-100'}
      `}
    >
      <div className="aspect-square relative">
        <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-3 pb-1 px-1">
          <p className="text-[9px] font-bold text-white text-center truncate">{hero.name}</p>
          <p className="text-[8px] text-white/40 text-center font-mono">{hero.power}</p>
        </div>
        {selected && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-[8px] text-black font-bold">✓</span>
          </div>
        )}
      </div>
    </button>
  )
}

function TeamSlot({ hero, index, onRemove }: { hero: Hero | null; index: number; onRemove: () => void }) {
  const portrait = useMemo(
    () => hero ? generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role) : null,
    [hero]
  )

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        onClick={hero ? onRemove : undefined}
        className={`
          w-16 h-20 rounded-xl border-2 overflow-hidden transition-all
          ${hero
            ? `${rarityBorder[hero.rarity]} cursor-pointer hover:brightness-75`
            : 'border-dashed border-white/20 bg-white/5'
          }
        `}
      >
        {hero && portrait ? (
          <div className="relative w-full h-full">
            <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-lg">+</span>
          </div>
        )}
      </div>
      <span className="text-[9px] text-white/40">
        {hero ? hero.name : `Slot ${index + 1}`}
      </span>
    </div>
  )
}

export default function TeamBuilder({ onBack }: { onBack: () => void }) {
  const { heroes, currentTeam, setCurrentTeam } = useGameStore()
  const [team, setTeam] = useState<string[]>(currentTeam)
  const [filterRole, setFilterRole] = useState<'all' | 'offensive' | 'defensive' | 'support'>('all')

  const teamHeroes = team.map(id => heroes.find(h => h.id === id)).filter(Boolean) as Hero[]
  const totalPower = teamHeroes.reduce((sum, h) => sum + h.power, 0)

  const available = heroes
    .filter(h => filterRole === 'all' || h.role === filterRole)
    .sort((a, b) => b.power - a.power)

  const toggleHero = (heroId: string) => {
    if (team.includes(heroId)) {
      setTeam(team.filter(id => id !== heroId))
    } else if (team.length < MAX_TEAM_SIZE) {
      setTeam([...team, heroId])
    }
  }

  const saveTeam = () => {
    setCurrentTeam(team)
    onBack()
  }

  const autoFill = () => {
    const sorted = [...heroes].sort((a, b) => b.power - a.power)
    setTeam(sorted.slice(0, MAX_TEAM_SIZE).map(h => h.id))
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Team Builder</h1>
        <span className="text-xs text-white/40">{team.length}/{MAX_TEAM_SIZE}</span>
      </div>

      {/* Team slots */}
      <div className="px-4 py-4 bg-black/30 border-b border-white/10">
        <div className="flex items-center justify-center gap-3 mb-3">
          {Array.from({ length: MAX_TEAM_SIZE }).map((_, i) => (
            <TeamSlot
              key={i}
              hero={teamHeroes[i] || null}
              index={i}
              onRemove={() => setTeam(team.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Team Power</span>
            <span className="ml-2 text-lg font-mono font-bold text-yellow-300">{totalPower.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={autoFill} className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white transition">
              Auto-Fill
            </button>
            <button
              onClick={saveTeam}
              className="px-4 py-1.5 text-xs bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-lg hover:brightness-110 transition"
            >
              Save Team
            </button>
          </div>
        </div>
      </div>

      {/* Role filter */}
      <div className="flex gap-1 px-4 py-2 bg-black/20 border-b border-white/5">
        {(['all', 'offensive', 'defensive', 'support'] as const).map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterRole === role ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      {/* Hero grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {available.map(hero => (
            <MiniHeroCard
              key={hero.id}
              hero={hero}
              selected={team.includes(hero.id)}
              onClick={() => toggleHero(hero.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
