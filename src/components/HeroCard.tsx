import { Hero } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import { useMemo } from 'react'

const rarityFrame: Record<string, string> = {
  common:    'border-zinc-500/60 shadow-[0_0_12px_#71717a40]',
  rare:      'border-blue-400/70 shadow-[0_0_20px_#60a5fa50]',
  epic:      'border-purple-400/70 shadow-[0_0_25px_#c084fc60]',
  legendary: 'border-yellow-400/80 shadow-[0_0_35px_#fcd34d70] ring-1 ring-yellow-400/40',
}

const rarityBadgeColor: Record<string, string> = {
  common:    'bg-zinc-600 text-zinc-200',
  rare:      'bg-blue-600 text-blue-100',
  epic:      'bg-purple-600 text-purple-100',
  legendary: 'bg-yellow-500 text-black font-bold',
}

const rarityStars: Record<string, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 5,
}

const roleIcon: Record<string, string> = {
  offensive: '⚔️',
  defensive: '🛡️',
  support: '✨',
}

export default function HeroCard({ hero, onClick, compact }: { hero: Hero; onClick: () => void; compact?: boolean }) {
  const portrait = useMemo(
    () => generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role),
    [hero.name, hero.faction, hero.rarity, hero.role]
  )

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`group relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${rarityFrame[hero.rarity] || rarityFrame.common}`}
      >
        <div className="relative aspect-square overflow-hidden bg-black">
          <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-4 pb-1 px-1.5">
            <p className="text-[10px] font-bold text-white text-center truncate">{hero.name}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-xl border-2 cursor-pointer
        transition-all duration-300 hover:scale-105 hover:-translate-y-2
        ${rarityFrame[hero.rarity] || rarityFrame.common}
      `}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        <img
          src={portrait}
          alt={hero.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Stars + role */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-2 z-10">
          <div className="flex gap-0.5">
            {Array.from({ length: rarityStars[hero.rarity] || 1 }).map((_, i) => (
              <span key={i} className="text-yellow-400 text-[10px] drop-shadow-[0_0_4px_#fcd34d]">★</span>
            ))}
          </div>
          <span className="text-lg drop-shadow-lg">{roleIcon[hero.role] || '⚔️'}</span>
        </div>

        {/* Level badge */}
        <div className="absolute top-7 left-1.5 z-10">
          <div className="bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-white/20">
            <span className="text-[9px] text-white/60">LV</span>
            <span className="text-xs font-mono text-white font-bold ml-0.5">{hero.level}</span>
          </div>
        </div>

        {/* Bottom overlay with name */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-2 px-2.5 z-10">
          <h3 className="text-sm font-bold text-white tracking-wide truncate drop-shadow-lg">
            {hero.name}
          </h3>
          <p className="text-[10px] text-white/50 tracking-wider truncate">{hero.faction}</p>

          <div className="flex items-center justify-between mt-1.5">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${rarityBadgeColor[hero.rarity] || rarityBadgeColor.common}`}>
              {hero.rarity}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-yellow-400/80">⚡</span>
              <span className="text-xs font-mono font-bold text-yellow-300 drop-shadow-[0_0_8px_#fcd34d]">{hero.power}</span>
            </div>
          </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[5]" />
      </div>
    </div>
  )
}
