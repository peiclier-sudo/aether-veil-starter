import { useState } from 'react'
import { useGameStore } from '@/lib/store'
import { GUILD_PERKS, GUILD_CREATION_COST } from '@/lib/guild-data'

export default function GuildPage({ onBack }: { onBack: () => void }) {
  const { guild, aetherShards, createGuild, donateToGuild, attackGuildBoss, heroes, currentTeam } = useGameStore()
  const [guildName, setGuildName] = useState('')
  const [donateAmount, setDonateAmount] = useState(100)
  const [attackResult, setAttackResult] = useState<{ killed: boolean; reward: number; damage: number } | null>(null)

  const teamPower = currentTeam.reduce((sum, id) => {
    const h = heroes.find(hero => hero.id === id)
    return sum + (h?.power || 0)
  }, 0)

  const handleCreate = () => {
    if (guildName.trim().length < 2) return
    createGuild(guildName.trim())
  }

  const handleDonate = () => {
    if (donateAmount > 0) donateToGuild(donateAmount)
  }

  const handleAttack = () => {
    if (!guild || teamPower === 0) return
    const damage = Math.round(teamPower * (0.8 + Math.random() * 0.4))
    const result = attackGuildBoss(damage)
    setAttackResult({ ...result, damage })
    setTimeout(() => setAttackResult(null), 2500)
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
        <div className="flex items-center px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
          <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
          <h1 className="text-sm font-bold uppercase tracking-wider ml-4">Guild</h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm w-full space-y-6">
            <div className="text-5xl">🏰</div>
            <h2 className="text-2xl font-bold text-white">Create a Guild</h2>
            <p className="text-sm text-white/40">Lead your own guild, fight bosses, and earn perks</p>

            <input
              type="text"
              value={guildName}
              onChange={e => setGuildName(e.target.value)}
              placeholder="Guild name..."
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50"
            />

            <button
              onClick={handleCreate}
              disabled={guildName.trim().length < 2 || aetherShards < GUILD_CREATION_COST}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                guildName.trim().length >= 2 && aetherShards >= GUILD_CREATION_COST
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              Create Guild — 💎 {GUILD_CREATION_COST}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const bossHpPct = (guild.boss.hp / guild.boss.maxHp) * 100
  const xpPct = (guild.xp / guild.xpToNext) * 100

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Guild</h1>
        <span className="text-xs text-white/40">Lv.{guild.level}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Guild info */}
        <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏰</span>
              <div>
                <h3 className="text-lg font-bold text-yellow-300">{guild.name}</h3>
                <p className="text-[10px] text-white/40">Level {guild.level} • {guild.members.length + 1} members</p>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-white/30 mb-1">
              <span>XP</span>
              <span>{guild.xp}/{guild.xpToNext}</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        {/* Boss raid */}
        <div className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-orange-500/5 p-4">
          <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Guild Boss</h4>
          <div className="text-center mb-3">
            <p className="text-lg font-bold text-white">{guild.boss.name}</p>
            <p className="text-xs text-white/40">Reward: 💎 {guild.boss.reward.shards}</p>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-white/30 mb-1">
              <span>HP</span>
              <span>{guild.boss.hp.toLocaleString()}/{guild.boss.maxHp.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${bossHpPct > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' : bossHpPct > 20 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
                style={{ width: `${bossHpPct}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleAttack}
            disabled={teamPower === 0}
            className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
              teamPower > 0
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:brightness-110'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            {teamPower > 0 ? `Attack! (Team: ${teamPower.toLocaleString()})` : 'Set a team first'}
          </button>
        </div>

        {/* Donate */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Donate Shards</h4>
          <div className="flex items-center gap-2 mb-3">
            {[50, 100, 250, 500].map(amt => (
              <button
                key={amt}
                onClick={() => setDonateAmount(amt)}
                className={`flex-1 py-2 text-xs rounded-lg border transition ${
                  donateAmount === amt ? 'border-yellow-400/60 bg-yellow-500/10 text-yellow-400' : 'border-white/10 bg-white/[0.02] text-white/40'
                }`}
              >
                💎 {amt}
              </button>
            ))}
          </div>
          <button
            onClick={handleDonate}
            disabled={aetherShards < donateAmount}
            className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
              aetherShards >= donateAmount
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            Donate 💎 {donateAmount}
          </button>
          <p className="text-[10px] text-white/30 text-center mt-2">Total donated: 💎 {guild.totalDonated.toLocaleString()}</p>
        </div>

        {/* Members */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Members</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-yellow-500/10 rounded-lg px-3 py-2 border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs">👑</span>
                <span className="text-xs font-bold text-yellow-300">You (Leader)</span>
              </div>
              <span className="text-[10px] text-white/40">{teamPower.toLocaleString()} power</span>
            </div>
            {guild.members.map(m => (
              <div key={m.name} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                <span className="text-xs text-white/60">{m.name}</span>
                <span className="text-[10px] text-white/30">{m.power.toLocaleString()} power</span>
              </div>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Guild Perks</h4>
          <div className="space-y-2">
            {GUILD_PERKS.map(perk => {
              const unlocked = guild.level >= perk.level
              return (
                <div key={perk.level} className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  unlocked ? 'bg-green-500/10' : 'bg-white/[0.02]'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{perk.icon}</span>
                    <div>
                      <p className={`text-xs font-medium ${unlocked ? 'text-white' : 'text-white/30'}`}>{perk.name}</p>
                      <p className={`text-[10px] ${unlocked ? 'text-green-400/80' : 'text-white/20'}`}>{perk.description}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] ${unlocked ? 'text-green-400' : 'text-white/20'}`}>
                    {unlocked ? '✓' : `Lv.${perk.level}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Attack result overlay */}
      {attackResult && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-5xl">{attackResult.killed ? '🏆' : '💥'}</div>
            <p className="text-xl font-bold text-white">
              {attackResult.killed ? 'BOSS DEFEATED!' : `${attackResult.damage.toLocaleString()} DMG!`}
            </p>
            {attackResult.killed && (
              <p className="text-lg text-yellow-400">💎 +{attackResult.reward.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
