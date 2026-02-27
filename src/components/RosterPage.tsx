import { useGameStore, Hero } from '@/lib/store'
import HeroCard from './HeroCard'
import HeroDetail from './HeroDetail'
import { useState } from 'react'

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
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Champions</h1>
        <span className="text-xs text-white/40">{filteredHeroes.length}/{heroes.length}</span>
      </div>

      {/* Rarity tabs */}
      <div className="flex gap-1 px-4 py-2 bg-black/30 border-b border-white/5 overflow-x-auto animate-[fade-up_0.2s_ease-out]">
        {(['all', 'legendary', 'epic', 'rare', 'common'] as const).map(r => {
          const tabColors: Record<string, string> = {
            all: 'bg-white/15 text-white',
            legendary: 'bg-yellow-500/20 text-yellow-400',
            epic: 'bg-purple-500/20 text-purple-400',
            rare: 'bg-blue-500/20 text-blue-400',
            common: 'bg-zinc-500/20 text-zinc-400',
          }
          return (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                rarityFilter === r
                  ? tabColors[r]
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
              <span className="ml-1 text-[10px] text-white/30">{counts[r]}</span>
            </button>
          )
        })}
      </div>

      {/* Filters row */}
      <div className="flex gap-2 px-4 py-2 bg-black/20 border-b border-white/5 animate-[fade-up_0.25s_ease-out]">
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
          {filteredHeroes.map((hero, i) => (
            <div
              key={hero.id}
              className="animate-[fade-up_0.3s_ease-out]"
              style={{ animationDelay: `${0.05 + i * 0.03}s`, animationFillMode: 'backwards' }}
            >
              <HeroCard
                hero={hero}
                onClick={() => setSelectedHero(hero)}
              />
            </div>
          ))}
        </div>

        {filteredHeroes.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">
            No champions match your filters
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedHero && <HeroDetail hero={selectedHero} onClose={() => setSelectedHero(null)} />}

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
