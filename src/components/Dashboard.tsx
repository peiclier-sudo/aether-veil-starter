import { useGameStore } from '@/lib/store'
import { generateHeroPortrait } from '@/lib/hero-portraits'
import HeroCard from './HeroCard'
import { useMemo } from 'react'

function PlayerTopBar() {
  const { playerName, level, aetherShards, energy } = useGameStore()
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.4s_ease-out]">
      {/* Player info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm border-2 border-yellow-300/60 shadow-lg shadow-yellow-500/20">
          {level}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{playerName}</p>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-[grow-width_1s_ease-out]" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 group">
          <span className="text-green-400 text-sm group-hover:animate-pulse">⚡</span>
          <span className="text-sm font-mono text-white">{energy}</span>
          <span className="text-[10px] text-white/40">/120</span>
        </div>
        <div className="flex items-center gap-1.5 group">
          <span className="text-purple-400 text-sm group-hover:animate-pulse">💎</span>
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
    <div
      className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1028] to-[#0a060f] animate-[fade-up_0.5s_ease-out]"
      style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Hero portrait */}
        <div className="relative w-full md:w-80 h-72 md:h-auto overflow-hidden group">
          <img src={portrait} alt={hero.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1028]/80 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1028] to-transparent md:hidden" />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
        </div>

        {/* Hero details */}
        <div className="flex-1 p-6 md:p-8 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500 text-black font-bold uppercase tracking-wider shadow-sm shadow-yellow-500/30">
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
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center animate-[fade-up_0.4s_ease-out]"
                style={{ animationDelay: `${0.3 + i * 0.08}s`, animationFillMode: 'backwards' }}
              >
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="flex gap-2 mb-6">
            {hero.skills.map((skill: any, i: number) => (
              <div
                key={skill.name}
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all animate-[fade-up_0.4s_ease-out]"
                style={{ animationDelay: `${0.5 + i * 0.08}s`, animationFillMode: 'backwards' }}
              >
                <p className="text-xs font-medium text-white">{skill.name}</p>
                <p className="text-[10px] text-white/40">CD: {skill.cooldown}s</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onViewRoster}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm rounded-lg hover:brightness-110 hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-amber-500/20"
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
    { label: 'Campaign', icon: '⚔️', desc: 'Story battles', page: 'campaign', glow: 'hover:shadow-red-500/20' },
    { label: 'Arena', icon: '🏟️', desc: 'PvP combat', page: 'arena', glow: 'hover:shadow-orange-500/20' },
    { label: 'Summon', icon: '🌟', desc: 'Summon heroes', page: 'summon', glow: 'hover:shadow-yellow-500/20' },
    { label: 'Dungeons', icon: '🌀', desc: 'Loot & gear', page: 'dungeons', glow: 'hover:shadow-purple-500/20' },
    { label: 'Shop', icon: '🛒', desc: 'Buy items', page: 'shop', glow: 'hover:shadow-green-500/20' },
    { label: 'Ascend', icon: '⭐', desc: 'Power up', page: 'ascension', glow: 'hover:shadow-amber-500/20' },
    { label: 'Guild', icon: '🏰', desc: 'Boss raids', page: 'guild', glow: 'hover:shadow-cyan-500/20' },
    { label: 'Trophies', icon: '🏆', desc: 'Achievements', page: 'achievements', glow: 'hover:shadow-yellow-500/20' },
    { label: 'Champions', icon: '👥', desc: 'View roster', page: 'roster', glow: 'hover:shadow-blue-500/20' },
    { label: 'Team', icon: '🛡️', desc: 'Build team', page: 'team', glow: 'hover:shadow-sky-500/20' },
    { label: 'Inventory', icon: '📦', desc: 'Manage gear', page: 'inventory', glow: 'hover:shadow-zinc-400/20' },
    { label: 'Bonds', icon: '🔗', desc: 'Faction synergy', page: 'resonance', glow: 'hover:shadow-pink-500/20' },
  ]
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((a, i) => (
        <button
          key={a.label}
          onClick={() => onNavigate(a.page)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg ${a.glow} hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all group animate-[fade-up_0.3s_ease-out]`}
          style={{ animationDelay: `${0.2 + i * 0.04}s`, animationFillMode: 'backwards' }}
        >
          <span className="text-2xl group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-200">{a.icon}</span>
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
          <div
            className="animate-[fade-up_0.4s_ease-out]"
            style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">Top Champions</h3>
              <button onClick={() => onNavigate('roster')} className="text-xs text-yellow-400 hover:text-yellow-300 hover:translate-x-0.5 transition-all">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {topHeroes.map((hero, i) => (
                <div
                  key={hero.id}
                  className="animate-[fade-up_0.3s_ease-out]"
                  style={{ animationDelay: `${0.8 + i * 0.05}s`, animationFillMode: 'backwards' }}
                >
                  <HeroCard hero={hero} onClick={() => {}} compact />
                </div>
              ))}
            </div>
          </div>

          {/* Daily quests / events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors animate-[fade-up_0.4s_ease-out]"
              style={{ animationDelay: '1s', animationFillMode: 'backwards' }}
            >
              <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Daily Quests</h4>
              <div className="space-y-2">
                {[
                  { quest: 'Win 3 Arena battles', progress: 1, total: 3, reward: '50 💎' },
                  { quest: 'Complete Campaign 5-3', progress: 0, total: 1, reward: '100 ⚡' },
                  { quest: 'Level up a champion', progress: 1, total: 1, reward: '200 💎' },
                ].map(q => (
                  <div key={q.quest} className="flex items-center justify-between group">
                    <div className="flex-1">
                      <p className="text-xs text-white/70">{q.quest}</p>
                      <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${(q.progress / q.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-[10px] ml-3 whitespace-nowrap transition-colors ${
                      q.progress >= q.total ? 'text-green-400 font-bold' : 'text-yellow-400'
                    }`}>
                      {q.progress >= q.total ? 'Claim!' : q.reward}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors animate-[fade-up_0.4s_ease-out]"
              style={{ animationDelay: '1.1s', animationFillMode: 'backwards' }}
            >
              <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">Events</h4>
              <div className="space-y-3">
                <div className="rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 p-3 hover:from-purple-500/25 hover:to-pink-500/25 transition-all cursor-pointer group">
                  <p className="text-xs font-bold text-purple-200 group-hover:text-purple-100 transition-colors">Void Rift Invasion</p>
                  <p className="text-[10px] text-white/50 mt-0.5">Double rewards for 48h</p>
                  <p className="text-[10px] text-yellow-400 mt-1 font-mono">23:45:12 remaining</p>
                </div>
                <div className="rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 p-3 hover:from-yellow-500/25 hover:to-amber-500/25 transition-all cursor-pointer group">
                  <p className="text-xs font-bold text-yellow-200 group-hover:text-yellow-100 transition-colors">Legendary Summon Festival</p>
                  <p className="text-[10px] text-white/50 mt-0.5">2x legendary drop rate</p>
                  <p className="text-[10px] text-yellow-400 mt-1 font-mono">3d 12:00:00 remaining</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global keyframe animations */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
        @keyframes grow-width {
          from { width: 0%; }
        }
      `}</style>
    </div>
  )
}
