import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hero } from '@/lib/store'

const rarityGlow = {
  common: 'shadow-[0_0_15px_#9ca3af]',
  rare: 'shadow-[0_0_25px_#60a5fa]',
  epic: 'shadow-[0_0_35px_#c084fc]',
  legendary: 'shadow-[0_0_45px_#fcd34d] ring-2 ring-yellow-400/70',
}

const roleIcon = {
  offensive: '🔥',
  defensive: '🛡️',
  support: '✨',
}

export default function HeroCard({ hero, onClick }: { hero: Hero; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={`
        group relative overflow-hidden border-2 bg-gradient-to-br from-zinc-950 to-black
        transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer
        ${rarityGlow[hero.rarity as keyof typeof rarityGlow]}
      `}
    >
      {/* Subtle cosmic glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#ffffff08_0%,transparent_70%)]" />

      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-serif tracking-widest text-white group-hover:text-yellow-300 transition-colors">
              {hero.name}
            </h3>
            <p className="text-sm text-white/60 mt-1">{hero.faction}</p>
          </div>
          <div className="text-3xl opacity-80">{roleIcon[hero.role as keyof typeof roleIcon]}</div>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs text-white/50">LVL</span>
            <span className="text-4xl font-mono text-white ml-2">{hero.level}</span>
          </div>
          <div className="text-right">
            <div className="text-4xl font-mono font-bold text-yellow-400 tracking-tighter">{hero.power}</div>
            <div className="text-[10px] text-yellow-400/70 -mt-1">POWER</div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Badge variant="outline" className="border-white/30 text-white/80">
            {hero.role.toUpperCase()}
          </Badge>
          <Badge className={`font-mono text-xs ${hero.rarity === 'legendary' ? 'bg-yellow-400 text-black' : 'bg-white/10'}`}>
            {hero.rarity.toUpperCase()}
          </Badge>
        </div>
      </CardContent>

      {/* Bottom shine line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-30 group-hover:opacity-80 transition-opacity" />
    </Card>
  )
}
