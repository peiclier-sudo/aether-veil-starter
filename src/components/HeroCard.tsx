import { Card, CardContent } from '@/components/ui/card'
import { Hero } from '@/lib/store'

const rarityGlow = {
  common: 'shadow-[0_0_15px_#9ca3af]',
  rare: 'shadow-[0_0_30px_#60a5fa]',
  epic: 'shadow-[0_0_40px_#c084fc]',
  legendary: 'shadow-[0_0_55px_#fcd34d] ring-2 ring-yellow-400/80',
}

const roleIcon = {
  offensive: '🔥',
  defensive: '🛡️',
  support: '🌟',
}

export default function HeroCard({ hero, onClick }: { hero: Hero; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={`
        group relative overflow-hidden border-2 bg-gradient-to-br from-zinc-950/90 to-black/90 backdrop-blur-xl
        transition-all duration-500 hover:scale-105 hover:-translate-y-3 cursor-pointer
        ${rarityGlow[hero.rarity as keyof typeof rarityGlow]}
      `}
    >
      {/* Inner luminous glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />

      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-3xl font-serif tracking-[2px] text-white group-hover:text-yellow-200 transition-colors drop-shadow-[0_0_10px_#fcd34d]">
              {hero.name}
            </h3>
            <p className="text-sm text-rose-200/80 mt-1 tracking-widest">{hero.faction}</p>
          </div>
          <div className="text-4xl opacity-90 transition-transform group-hover:scale-110">{roleIcon[hero.role as keyof typeof roleIcon]}</div>
        </div>

        <div className="flex items-baseline justify-between mt-8">
          <div>
            <span className="text-xs text-white/60 tracking-widest">LEVEL</span>
            <span className="block text-5xl font-mono text-white drop-shadow-lg">{hero.level}</span>
          </div>
          <div className="text-right">
            <div className="text-5xl font-mono font-bold text-yellow-300 tracking-tighter drop-shadow-[0_0_15px_#fcd34d]">
              {hero.power}
            </div>
            <div className="text-[10px] text-yellow-400/80 -mt-1">POWER</div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <div className="px-4 py-1 text-xs font-mono border border-white/30 rounded-full text-white/80">
            {hero.role.toUpperCase()}
          </div>
          <div className={`px-4 py-1 text-xs font-mono rounded-full ${hero.rarity === 'legendary' ? 'bg-yellow-400 text-black font-bold' : 'bg-white/10 text-white/90'}`}>
            {hero.rarity.toUpperCase()}
          </div>
        </div>
      </CardContent>

      {/* Bottom shine */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-40 group-hover:opacity-90 transition-all" />
    </Card>
  )
}
