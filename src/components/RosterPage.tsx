import { useGameStore } from '@/lib/store'
import HeroCard from './HeroCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[length:60px_60px]" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="text-[72px] font-serif tracking-[6px] text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
            AETHER VEIL
          </div>
          <div className="text-xl text-white/60 tracking-widest mt-1">LUMINARA ECHOES</div>
          <div className="mt-4 text-white/40 text-sm">20 LEGENDARY ECHOES AWAKENED</div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Input 
            placeholder="Search champion..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs bg-black/70 border border-yellow-400/30 focus:border-yellow-400 text-white placeholder:text-white/40"
          />
          
          <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
            <SelectTrigger className="w-52 bg-black/70 border border-yellow-400/30">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="offensive">Offensive</SelectItem>
              <SelectItem value="defensive">Defensive</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rarityFilter} onValueChange={(v: any) => setRarityFilter(v)}>
            <SelectTrigger className="w-52 bg-black/70 border border-yellow-400/30">
              <SelectValue placeholder="All Rarities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Roster Grid */}
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
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={() => setSelectedHero(null)}>
          <div className="bg-gradient-to-b from-[#1a1423] to-black border-2 border-yellow-400/70 max-w-lg w-full rounded-2xl p-10" onClick={e => e.stopPropagation()}>
            <h2 className="text-5xl font-serif text-yellow-300 mb-2">{selectedHero.name}</h2>
            <p className="text-white/70 text-xl mb-8">{selectedHero.faction}</p>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-lg">
              <div><span className="text-white/50">HP</span> <span className="font-mono text-emerald-400">{selectedHero.hp}</span></div>
              <div><span className="text-white/50">ATK</span> <span className="font-mono text-orange-400">{selectedHero.atk}</span></div>
              <div><span className="text-white/50">DEF</span> <span className="font-mono text-sky-400">{selectedHero.def}</span></div>
              <div><span className="text-white/50">SPD</span> <span className="font-mono text-purple-400">{selectedHero.spd}</span></div>
            </div>

            <div className="mt-12 text-center text-xs text-white/40">Full 3D preview + skills coming in Step 6</div>
          </div>
        </div>
      )}
    </div>
  )
}
