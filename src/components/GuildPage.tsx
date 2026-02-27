import { useState } from 'react'
import { useGameStore } from '@/lib/store'
import { GUILD_PERKS, GUILD_CREATION_COST } from '@/lib/guild-data'
import { heroToBattleUnit } from '@/lib/battle-engine'
import { generateGuildBossUnit } from '@/lib/enemy-data'
import { useNotifications } from '@/lib/notifications'
import BattlePage from './BattlePage'

export default function GuildPage({ onBack }: { onBack: () => void }) {
  const { guild, aetherShards, createGuild, donateToGuild, attackGuildBoss, heroes, currentTeam } = useGameStore()
  const { addToast } = useNotifications()
  const [guildName, setGuildName] = useState('')
  const [donateAmount, setDonateAmount] = useState(100)
  const [attackResult, setAttackResult] = useState<{ killed: boolean; reward: number; damage: number } | null>(null)
  const [bossBattle, setBossBattle] = useState(false)

  const teamHeroes = currentTeam.map(id => heroes.find(hero => hero.id === id)).filter(Boolean)
  const teamPower = teamHeroes.reduce((sum, h) => sum + (h?.power || 0), 0)

  const handleCreate = () => {
    if (guildName.trim().length < 2) return
    createGuild(guildName.trim())
    addToast({ type: 'achievement', title: 'Guild Created!', message: guildName.trim(), icon: '🏰' })
  }

  const handleDonate = () => {
    if (donateAmount > 0 && donateToGuild(donateAmount)) {
      addToast({ type: 'reward', title: 'Donated!', message: `+${donateAmount} guild XP`, icon: '💎' })
    }
  }

  const handleAttack = () => {
    if (!guild || teamPower === 0 || currentTeam.length === 0) return
    setBossBattle(true)
  }

  const handleBossResult = (won: boolean) => {
    setBossBattle(false)
    if (!guild) return
    if (won) {
      const damage = guild.boss.hp
      const result = attackGuildBoss(damage)
      setAttackResult({ ...result, damage })
      if (result.killed) {
        addToast({ type: 'achievement', title: 'Boss Defeated!', message: `+${result.reward} shards`, icon: '🏆' })
      }
    } else {
      const damage = Math.round(guild.boss.maxHp * 0.15)
      const result = attackGuildBoss(damage)
      setAttackResult({ ...result, damage })
    }
    setTimeout(() => setAttackResult(null), 2500)
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
        <div className="flex items-center px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
          <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
          <h1 className="text-sm font-bold uppercase tracking-wider ml-4">Guild</h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm w-full space-y-6 animate-[fade-up_0.5s_ease-out]">
            <div className="text-6xl animate-[float_3s_ease-in-out_infinite]">🏰</div>
            <h2 className="text-2xl font-bold text-white">Create a Guild</h2>
            <p className="text-sm text-white/40">Lead your own guild, fight bosses, and earn perks</p>

            <input
              type="text"
              value={guildName}
              onChange={e => setGuildName(e.target.value)}
              placeholder="Guild name..."
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors"
            />

            <button
              onClick={handleCreate}
              disabled={guildName.trim().length < 2 || aetherShards < GUILD_CREATION_COST}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                guildName.trim().length >= 2 && aetherShards >= GUILD_CREATION_COST
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/30'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              Create Guild — 💎 {GUILD_CREATION_COST}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        `}</style>
      </div>
    )
  }

  const bossHpPct = (guild.boss.hp / guild.boss.maxHp) * 100
  const xpPct = (guild.xp / guild.xpToNext) * 100

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Guild</h1>
        <span className="text-xs text-white/40 font-mono">Lv.{guild.level}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Guild info */}
        <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-500/5 p-5 overflow-hidden relative animate-[fade-up_0.3s_ease-out]">
          <div className="absolute -top-4 -right-4 text-7xl opacity-10">🏰</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏰</span>
              <div>
                <h3 className="text-lg font-bold text-yellow-300">{guild.name}</h3>
                <p className="text-[10px] text-white/40">Level {guild.level} • {guild.members.length + 1} members</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-white/30 mb-1">
                <span>Guild XP</span>
                <span className="font-mono">{guild.xp}/{guild.xpToNext}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Boss raid */}
        <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-orange-500/5 p-5 overflow-hidden relative animate-[fade-up_0.4s_ease-out]" style={{ animationDelay: '0.05s', animationFillMode: 'backwards' }}>
          <div className="absolute -top-2 -right-2 text-6xl opacity-10">👹</div>
          <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">Guild Boss</h4>

          <div className="text-center mb-4">
            <div className="text-4xl mb-2 animate-[boss-idle_2s_ease-in-out_infinite]">👹</div>
            <p className="text-lg font-bold text-white">{guild.boss.name}</p>
            <p className="text-xs text-yellow-400/80">Reward: 💎 {guild.boss.reward.shards}</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-white/30 mb-1">
              <span>HP</span>
              <span className="font-mono">{guild.boss.hp.toLocaleString()}/{guild.boss.maxHp.toLocaleString()}</span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 relative ${
                  bossHpPct > 50 ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : bossHpPct > 20 ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400 animate-pulse'
                }`}
                style={{ width: `${bossHpPct}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>

          <button
            onClick={handleAttack}
            disabled={teamPower === 0}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              teamPower > 0
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:brightness-110 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/20'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            {teamPower > 0 ? `Attack! (Team: ${teamPower.toLocaleString()})` : 'Set a team first'}
          </button>
        </div>

        {/* Donate */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 animate-[fade-up_0.4s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Donate Shards</h4>
          <div className="flex items-center gap-2 mb-3">
            {[50, 100, 250, 500].map(amt => (
              <button
                key={amt}
                onClick={() => setDonateAmount(amt)}
                className={`flex-1 py-2.5 text-xs rounded-xl border transition-all ${
                  donateAmount === amt
                    ? 'border-yellow-400/60 bg-yellow-500/15 text-yellow-400 shadow-lg shadow-yellow-500/10'
                    : 'border-white/10 bg-white/[0.02] text-white/40 hover:bg-white/[0.05]'
                }`}
              >
                💎 {amt}
              </button>
            ))}
          </div>
          <button
            onClick={handleDonate}
            disabled={aetherShards < donateAmount}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
              aetherShards >= donateAmount
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 hover:scale-[1.02] active:scale-95'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            Donate 💎 {donateAmount}
          </button>
          <p className="text-[10px] text-white/30 text-center mt-2">Total donated: 💎 {guild.totalDonated.toLocaleString()}</p>
        </div>

        {/* Members */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 animate-[fade-up_0.4s_ease-out]" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
          <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Members</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-yellow-500/10 rounded-xl px-4 py-3 border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm">👑</span>
                <span className="text-xs font-bold text-yellow-300">You (Leader)</span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">{teamPower.toLocaleString()} pwr</span>
            </div>
            {guild.members.map((m, i) => (
              <div
                key={m.name}
                className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-3 animate-[fade-up_0.2s_ease-out]"
                style={{ animationDelay: `${0.2 + i * 0.04}s`, animationFillMode: 'backwards' }}
              >
                <span className="text-xs text-white/60">{m.name}</span>
                <span className="text-[10px] text-white/30 font-mono">{m.power.toLocaleString()} pwr</span>
              </div>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 animate-[fade-up_0.4s_ease-out]" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
          <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Guild Perks</h4>
          <div className="space-y-2">
            {GUILD_PERKS.map(perk => {
              const unlocked = guild.level >= perk.level
              return (
                <div key={perk.level} className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
                  unlocked ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/[0.02] border border-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{perk.icon}</span>
                    <div>
                      <p className={`text-xs font-bold ${unlocked ? 'text-white' : 'text-white/30'}`}>{perk.name}</p>
                      <p className={`text-[10px] ${unlocked ? 'text-green-400/80' : 'text-white/20'}`}>{perk.description}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold ${unlocked ? 'text-green-400' : 'text-white/20'}`}>
                    {unlocked ? '✓' : `Lv.${perk.level}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Boss battle overlay */}
      {bossBattle && guild && (
        <BattlePage
          playerTeam={teamHeroes.map(h => heroToBattleUnit(h as any))}
          enemyTeam={generateGuildBossUnit(guild.boss.name, guild.boss.hp, guild.boss.maxHp)}
          title={`Guild Boss: ${guild.boss.name}`}
          onResult={handleBossResult}
        />
      )}

      {/* Attack result overlay */}
      {attackResult && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-[fade-in_0.2s_ease-out]">
          <div className="text-center space-y-3 animate-[scale-in_0.3s_ease-out]">
            <div className="text-6xl">{attackResult.killed ? '🏆' : '💥'}</div>
            <p className="text-2xl font-bold text-white">
              {attackResult.killed ? 'BOSS DEFEATED!' : `${attackResult.damage.toLocaleString()} DMG!`}
            </p>
            {attackResult.killed && (
              <p className="text-lg text-yellow-400 animate-[fade-up_0.3s_ease-out_0.2s_backwards]">💎 +{attackResult.reward.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 50%,100% { transform: translateX(100%); } }
        @keyframes boss-idle { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-5px) scale(1.05); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  )
}
