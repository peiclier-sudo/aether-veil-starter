import { useGameStore } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import HeroCard from './HeroCard'
import { useMemo } from 'react'

function PlayerTopBar() {
  const { playerName, level, aetherShards, energy } = useGameStore()
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
      {/* Player info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm border-2 border-yellow-300/60">
          {level}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{playerName}</p>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="text-green-400 text-sm">⚡</span>
          <span className="text-sm font-mono text-white">{energy}</span>
          <span className="text-[10px] text-white/40">/120</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400 text-sm">💎</span>
          <span className="text-sm font-mono text-white">{aetherShards.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

function FeaturedHero({ hero, onViewRoster }: { hero: any; onViewRoster: () => void }) {
  const portrait = useMemo(
    () => generateHeroPortrait(hero.name, hero.faction, hero.rarity, hero.role),
    [hero.name, hero.faction, hero.rarity, hero.role]
  )

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1028] to-[#0a060f]">
      <div className="flex flex-col md:flex-row">
        {/* Hero portrait */}
        <div className="relative w-full md:w-80 h-72 md:h-auto overflow-hidden">
          <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1028]/80 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1028] to-transparent md:hidden" />
        </div>

        {/* Hero details */}
        <div className="flex-1 p-6 md:p-8 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500 text-black font-bold uppercase tracking-wider">
              {hero.rarity}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">{hero.role}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">{hero.name}</h2>
          <p className="text-sm text-purple-300/80 mb-6">{hero.faction}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'HP', value: hero.hp, color: 'text-emerald-400' },
              { label: 'ATK', value: hero.atk, color: 'text-red-400' },
              { label: 'DEF', value: hero.def, color: 'text-sky-400' },
              { label: 'SPD', value: hero.spd, color: 'text-purple-400' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="flex gap-2 mb-6">
            {hero.skills.map((skill: any) => (
              <div key={skill.name} className="flex-1 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <p className="text-xs font-medium text-white">{skill.name}</p>
                <p className="text-[10px] text-white/40">CD: {skill.cooldown}s</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onViewRoster}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm rounded-lg hover:brightness-110 transition"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActions({ onNavigate }: { onNavigate: (page: string) => void }) {
  const actions = [
    { label: 'Campaign', icon: '⚔️', desc: 'Story battles', page: 'campaign' },
    { label: 'Arena', icon: '🏟️', desc: 'PvP combat', page: 'arena' },
    { label: 'Summon', icon: '🌟', desc: 'Summon heroes', page: 'summon' },
    { label: 'Dungeons', icon: '🌀', desc: 'Loot & gear', page: 'dungeons' },
    { label: 'Shop', icon: '🛒', desc: 'Buy items', page: 'shop' },
    { label: 'Ascend', icon: '⭐', desc: 'Power up', page: 'ascension' },
    { label: 'Guild', icon: '🏰', desc: 'Boss raids', page: 'guild' },
    { label: 'Trophies', icon: '🏆', desc: 'Achievements', page: 'achievements' },
    { label: 'Champions', icon: '👥', desc: 'View roster', page: 'roster' },
    { label: 'Team', icon: '🛡️', desc: 'Build team', page: 'team' },
    { label: 'Inventory', icon: '📦', desc: 'Manage gear', page: 'inventory' },
    { label: 'Bonds', icon: '🔗', desc: 'Faction synergy', page: 'resonance' },
  ]
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={() => onNavigate(a.page)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">{a.icon}</span>
          <span className="text-xs font-medium text-white">{a.label}</span>
          <span className="text-[10px] text-white/40">{a.desc}</span>
        </button>
      ))}
    </div>
  )
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { heroes } = useGameStore()
  const legendaries = heroes.filter(h => h.rarity === 'legendary')
  const featured = legendaries[0] || heroes[0]
  const topHeroes = [...heroes].sort((a, b) => b.power - a.power).slice(0, 8)

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <PlayerTopBar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Featured hero showcase */}
          {featured && (
            <FeaturedHero hero={featured} onViewRoster={() => onNavigate('roster')} />
          )}

          {/* Quick actions */}
          <QuickActions onNavigate={onNavigate} />

          {/* Top champions strip */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">Top Champions</h3>
              <button onClick={() => onNavigate('roster')} className="text-xs text-yellow-400 hover:text-yellow-300 transition">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {topHeroes.map(hero => (
                <HeroCard key={hero.id} hero={hero} onClick={() => {}} compact />
              ))}
            </div>
          </div>

          {/* Daily quests / events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Daily Quests</h4>
              <div className="space-y-2">
                {[
                  { quest: 'Win 3 Arena battles', progress: 1, total: 3, reward: '50 💎' },
                  { quest: 'Complete Campaign 5-3', progress: 0, total: 1, reward: '100 ⚡' },
                  { quest: 'Level up a champion', progress: 1, total: 1, reward: '200 💎' },
                ].map(q => (
                  <div key={q.quest} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-white/70">{q.quest}</p>
                      <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${(q.progress / q.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-yellow-400 ml-3 whitespace-nowrap">{q.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Events</h4>
              <div className="space-y-3">
                <div className="rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 p-3">
                  <p className="text-xs font-bold text-purple-200">Void Rift Invasion</p>
                  <p className="text-[10px] text-white/50 mt-0.5">Double rewards for 48h</p>
                  <p className="text-[10px] text-yellow-400 mt-1">23:45:12 remaining</p>
                </div>
                <div className="rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 p-3">
                  <p className="text-xs font-bold text-yellow-200">Legendary Summon Festival</p>
                  <p className="text-[10px] text-white/50 mt-0.5">2x legendary drop rate</p>
                  <p className="text-[10px] text-yellow-400 mt-1">3d 12:00:00 remaining</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
