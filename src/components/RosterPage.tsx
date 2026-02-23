import { useGameStore, Hero } from '@/lib/store'
import HeroCard from './HeroCard'
import { Button } from '@/components/ui/button'
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

  const [selectedHero, setSelectedHero] = useState<Hero | null>(null)

  return (
    <div className="min-h-screen bg-[#0a060f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-serif tracking-[4px] text-yellow-300">THE AETHER ROSTER</h1>
            <p className="text-white/60 mt-2">20 Echoes Awakened • Choose your destiny</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono text-yellow-400">{heroes.length}/20</div>
            <div className="text-xs text-white/50">CHAMPIONS SUMMONED</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Input 
            placeholder="Search champion..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs bg-black/70 border-yellow-400/30 text-white placeholder:text-white/40"
          />
          
          <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
            <SelectTrigger className="w-48 bg-black/70 border-yellow-400/30">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="offensive">Offensive</SelectItem>
              <SelectItem value="defensive">Defensive</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>

          <Select value={rarityFilter} onValueChange={(v: any) => setRarityFilter(v)}>
            <SelectTrigger className="w-48 bg-black/70 border-yellow-400/30">
              <SelectValue placeholder="Rarity" />
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

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredHeroes.map(hero => (
            <HeroCard 
              key={hero.id} 
              hero={hero} 
              onClick={() => setSelectedHero(hero)} 
            />
          ))}
        </div>

        {selectedHero && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setSelectedHero(null)}>
            <div className="bg-[#1a1423] border-2 border-yellow-400 p-8 max-w-md w-full rounded-xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-4xl font-serif text-yellow-300 mb-2">{selectedHero.name}</h2>
              <div className="flex gap-3 text-sm mb-6">
                <Badge>{selectedHero.faction}</Badge>
                <Badge variant="secondary">{selectedHero.rarity.toUpperCase()}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>HP: <span className="font-mono text-emerald-400">{selectedHero.hp}</span></div>
                <div>ATK: <span className="font-mono text-orange-400">{selectedHero.atk}</span></div>
                <div>DEF: <span className="font-mono text-sky-400">{selectedHero.def}</span></div>
                <div>SPD: <span className="font-mono text-purple-400">{selectedHero.spd}</span></div>
              </div>
              <div className="mt-8 text-center text-xs text-white/50">3D Preview coming in Step 6</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
