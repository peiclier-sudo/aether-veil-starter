import { useGameStore, Hero } from '@/lib/store'
import HeroCard from './HeroCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { NativeSelect } from '@/components/ui/select'
import { useState } from 'react'

export default function RosterPage() {
  const { heroes } = useGameStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'offensive' | 'defensive' | 'support'>('all')
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')

  const filteredHeroes = heroes
    .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    .filter((h) => roleFilter === 'all' || h.role === roleFilter)
    .filter((h) => rarityFilter === 'all' || h.rarity === rarityFilter)

  const [selectedHero, setSelectedHero] = useState<Hero | null>(null)

  return (
    <div className="min-h-screen bg-[#0a060f] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-serif tracking-[4px] text-yellow-300">THE AETHER ROSTER</h1>
            <p className="mt-2 text-white/60">20 Echoes Awakened • Choose your destiny</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono text-yellow-400">{heroes.length}/20</div>
            <div className="text-xs text-white/50">CHAMPIONS SUMMONED</div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          <Input
            placeholder="Search champion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs border-yellow-400/30 bg-black/70 text-white placeholder:text-white/40"
          />

          <NativeSelect
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="w-48 border-yellow-400/30"
          >
            <option value="all">All Roles</option>
            <option value="offensive">Offensive</option>
            <option value="defensive">Defensive</option>
            <option value="support">Support</option>
          </NativeSelect>

          <NativeSelect
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value as typeof rarityFilter)}
            className="w-48 border-yellow-400/30"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </NativeSelect>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredHeroes.map((hero) => (
            <HeroCard key={hero.id} hero={hero} onClick={() => setSelectedHero(hero)} />
          ))}
        </div>

        {selectedHero && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setSelectedHero(null)}
          >
            <div
              className="w-full max-w-md rounded-xl border-2 border-yellow-400 bg-[#1a1423] p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-2 text-4xl font-serif text-yellow-300">{selectedHero.name}</h2>
              <div className="mb-6 flex gap-3 text-sm">
                <Badge>{selectedHero.faction}</Badge>
                <Badge variant="secondary">{selectedHero.rarity.toUpperCase()}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  HP: <span className="font-mono text-emerald-400">{selectedHero.hp}</span>
                </div>
                <div>
                  ATK: <span className="font-mono text-orange-400">{selectedHero.atk}</span>
                </div>
                <div>
                  DEF: <span className="font-mono text-sky-400">{selectedHero.def}</span>
                </div>
                <div>
                  SPD: <span className="font-mono text-purple-400">{selectedHero.spd}</span>
                </div>
              </div>
              <div className="mt-8 text-center text-xs text-white/50">3D Preview coming in Step 6</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
