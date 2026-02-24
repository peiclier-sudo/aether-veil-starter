import { useGameStore, Hero } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import HeroCard from './HeroCard'
import { useMemo, useState } from 'react'

const rarityBadgeColor: Record<string, string> = {
  common:    'bg-zinc-600 text-zinc-200',
  rare:      'bg-blue-600 text-blue-100',
  epic:      'bg-purple-600 text-purple-100',
  legendary: 'bg-yellow-500 text-black font-bold',
}

function HeroDetailModal({ hero, onClose }: { hero: Hero; onClose: () => void }) {
  const portrait = useMemo(
    () => generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role),
    [hero.name, hero.faction, hero.rarity, hero.role]
  )

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-b from-[#1a1028] to-[#0a060f] border border-white/15 max-w-md w-full rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Portrait header */}
        <div className="relative h-52 overflow-hidden">
          <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1028] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white border border-white/10 transition"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6 -mt-6 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${rarityBadgeColor[hero.rarity]}`}>
              {hero.rarity}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">{hero.role}</span>
          </div>
          <h2 className="text-2xl font-bold text-white">{hero.name}</h2>
          <p className="text-sm text-purple-300/70 mb-5">{hero.faction}</p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: 'HP', value: hero.hp, color: 'text-emerald-400' },
              { label: 'ATK', value: hero.atk, color: 'text-red-400' },
              { label: 'DEF', value: hero.def, color: 'text-sky-400' },
              { label: 'SPD', value: hero.spd, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-lg py-2 text-center border border-white/5">
                <p className="text-[10px] text-white/40 uppercase">{s.label}</p>
                <p className={`text-base font-mono font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-2 mb-5">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Skills</p>
            {hero.skills.map(skill => (
              <div key={skill.name} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <span className="text-xs text-white">{skill.name}</span>
                <span className="text-[10px] text-white/40">CD: {skill.cooldown}s</span>
              </div>
            ))}
          </div>

          {/* Power + level */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-white/40">LEVEL</span>
              <span className="ml-2 text-lg font-mono font-bold text-white">{hero.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⚡</span>
              <span className="text-xl font-mono font-bold text-yellow-300">{hero.power}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RosterPage({ onBack }: { onBack: () => void }) {
  const { heroes } = useGameStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'offensive' | 'defensive' | 'support'>('all')
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')
  const [sortBy, setSortBy] = useState<'power' | 'level' | 'name'>('power')
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null)

  const filteredHeroes = heroes
    .filter(h => h.name.toLowerCase().includes(search.toLowerCase()))
    .filter(h => roleFilter === 'all' || h.role === roleFilter)
    .filter(h => rarityFilter === 'all' || h.rarity === rarityFilter)
    .sort((a, b) => {
      if (sortBy === 'power') return b.power - a.power
      if (sortBy === 'level') return b.level - a.level
      return a.name.localeCompare(b.name)
    })

  const counts = {
    all: heroes.length,
    legendary: heroes.filter(h => h.rarity === 'legendary').length,
    epic: heroes.filter(h => h.rarity === 'epic').length,
    rare: heroes.filter(h => h.rarity === 'rare').length,
    common: heroes.filter(h => h.rarity === 'common').length,
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Champions</h1>
        <span className="text-xs text-white/40">{filteredHeroes.length}/{heroes.length}</span>
      </div>

      {/* Rarity tabs */}
      <div className="flex gap-1 px-4 py-2 bg-black/30 border-b border-white/5 overflow-x-auto">
        {(['all', 'legendary', 'epic', 'rare', 'common'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRarityFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              rarityFilter === r
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            <span className="ml-1 text-[10px] text-white/30">{counts[r]}</span>
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex gap-2 px-4 py-2 bg-black/20 border-b border-white/5">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="offensive">Offensive</option>
          <option value="defensive">Defensive</option>
          <option value="support">Support</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="power">Power ↓</option>
          <option value="level">Level ↓</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Hero grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filteredHeroes.map(hero => (
            <HeroCard
              key={hero.id}
              hero={hero}
              onClick={() => setSelectedHero(hero)}
            />
          ))}
        </div>

        {filteredHeroes.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">
            No champions match your filters
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedHero && <HeroDetailModal hero={selectedHero} onClose={() => setSelectedHero(null)} />}
    </div>
  )
}
