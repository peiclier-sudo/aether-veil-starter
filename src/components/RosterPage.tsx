import { useGameStore } from '@/lib/store'
import HeroCard from './HeroCard'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function RosterPage() {
  const { heroes } = useGameStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'offensive' | 'defensive' | 'support'>('all')
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')

  const filteredHeroes = heroes
    .filter(h => h.name.toLowerCase().includes(search.toLowerCase()))
    .filter(h => roleFilter === 'all' || h.role === roleFilter)
    .filter(h => rarityFilter === 'all' || h.rarity === rarityFilter)

  const [selectedHero, setSelectedHero] = useState<any>(null)

  return (
    <div className="min-h-screen bg-[#0a060f] relative overflow-hidden text-white">
      {/* Animated cosmic + aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:50px_50px] animate-[twinkle_12s_infinite]" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-rose-900/30 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,#facc1520_0%,transparent_50%,#a5b4fc20_100%)] animate-[aurora_25s_infinite]" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col items-center mb-20">
          <div className="text-[88px] font-serif tracking-[8px] text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-100 to-rose-200 drop-shadow-2xl">
            AETHER VEIL
          </div>
          <div className="text-3xl text-rose-200/90 tracking-[6px] -mt-6">LUMINARA ECHOES</div>
          <div className="mt-6 text-white/50 text-sm tracking-widest">20 AWAKENED ECHOES OF LIGHT</div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-6 justify-center mb-16">
          <Input
            placeholder="Search champion name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs bg-black/60 border border-yellow-300/50 focus:border-yellow-300 text-white placeholder:text-white/50 rounded-2xl"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-56 bg-black/60 border border-yellow-300/50 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-yellow-300 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="offensive">Offensive</option>
            <option value="defensive">Defensive</option>
            <option value="support">Support</option>
          </select>

          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value as any)}
            className="w-56 bg-black/60 border border-yellow-300/50 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-yellow-300 text-sm"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredHeroes.map(hero => (
            <HeroCard
              key={hero.id}
              hero={hero}
              onClick={() => setSelectedHero(hero)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedHero && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6" onClick={() => setSelectedHero(null)}>
          <div className="bg-gradient-to-b from-[#1a1423] to-black border-2 border-yellow-400/80 max-w-lg w-full rounded-3xl p-12" onClick={e => e.stopPropagation()}>
            <h2 className="text-6xl font-serif text-yellow-200 mb-3 tracking-wide">{selectedHero.name}</h2>
            <p className="text-rose-200/90 text-2xl mb-10">{selectedHero.faction}</p>

            <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-xl">
              <div><span className="text-white/60">HP</span> <span className="font-mono text-emerald-400">{selectedHero.hp}</span></div>
              <div><span className="text-white/60">ATK</span> <span className="font-mono text-orange-400">{selectedHero.atk}</span></div>
              <div><span className="text-white/60">DEF</span> <span className="font-mono text-sky-400">{selectedHero.def}</span></div>
              <div><span className="text-white/60">SPD</span> <span className="font-mono text-purple-400">{selectedHero.spd}</span></div>
            </div>

            <div className="mt-16 text-center text-xs text-white/40 tracking-widest">FULL 3D PREVIEW + SKILLS IN STEP 6</div>
          </div>
        </div>
      )}
    </div>
  )
}
