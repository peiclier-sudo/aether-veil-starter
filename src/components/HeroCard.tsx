import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hero } from '@/lib/store'

const rarityColors = {
  common: 'border-gray-400 bg-gray-900/80',
  rare: 'border-blue-400 bg-blue-950/80 shadow-blue-500/30',
  epic: 'border-purple-400 bg-purple-950/80 shadow-purple-500/40',
  legendary: 'border-yellow-400 bg-yellow-950/90 shadow-[0_0_25px_#facc15] ring-1 ring-yellow-400/60',
}

const roleColors = {
  offensive: 'bg-red-500/20 text-red-400 border-red-400',
  defensive: 'bg-emerald-500/20 text-emerald-400 border-emerald-400',
  support: 'bg-sky-500/20 text-sky-400 border-sky-400',
}

export default function HeroCard({ hero, onClick }: { hero: Hero; onClick: () => void }) {
  return (
    <Card 
      onClick={onClick}
      className={`
        group w-full overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1
        ${rarityColors[hero.rarity as keyof typeof rarityColors]}
      `}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-serif tracking-wider text-white group-hover:text-yellow-300 transition-colors">
              {hero.name}
            </h3>
            <p className="text-sm text-white/70">{hero.faction}</p>
          </div>
          <Badge className={`${roleColors[hero.role as keyof typeof roleColors]} text-xs px-3 py-1`}>
            {hero.role.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-white/90">
            Lv. <span className="font-mono text-lg">{hero.level}</span>
          </div>
          <div className="text-right">
            <span className="text-yellow-400 font-mono text-xl font-bold">{hero.power}</span>
            <span className="text-white/50 text-xs ml-1">PWR</span>
          </div>
        </div>

        <div className="mt-4 h-1 bg-white/10 rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 w-[65%]" />
        </div>
      </CardContent>
    </Card>
  )
}
