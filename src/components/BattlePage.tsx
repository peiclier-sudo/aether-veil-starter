import { useState, useEffect, useCallback, useRef } from 'react'
import {
  BattleState, BattleUnit, BattleAction, StatusType,
  initBattle, advanceTurn, getCurrentUnit, autoAction,
} from '@/lib/battle-engine'

interface BattlePageProps {
  playerTeam: BattleUnit[]
  enemyTeam: BattleUnit[]
  title: string
  onResult: (won: boolean) => void
}

const statusIcons: Record<StatusType, string> = {
  poison: '☠️', burn: '🔥', stun: '⚡', shield: '🛡️',
  atk_up: '⬆️', atk_down: '⬇️', def_up: '🔰', def_down: '💔',
  regen: '💚', speed_up: '💨',
}

const rarityColor: Record<string, string> = {
  common: '#a1a1aa',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#eab308',
}

/* ────── 3D model placeholder — shown from back (player) or front (enemy) ────── */
function ModelSlot({
  unit,
  facing,
  isActive,
  floatingText,
  shakeClass,
}: {
  unit: BattleUnit
  facing: 'back' | 'front'
  isActive: boolean
  floatingText: string | null
  shakeClass: string
}) {
  const glow = isActive ? '0 0 24px rgba(250,204,21,0.5)' : 'none'
  const border = isActive
    ? '2px solid rgba(250,204,21,0.8)'
    : `2px solid ${rarityColor[unit.rarity] || '#555'}44`
  const deadOverlay = !unit.isAlive

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-300 ${shakeClass} ${
        isActive ? 'scale-110 z-20' : 'z-10'
      } ${deadOverlay ? 'opacity-30' : ''}`}
      style={{ filter: isActive ? 'brightness(1.15)' : 'brightness(1)' }}
    >
      {/* Floating text */}
      {floatingText && (
        <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-base font-black z-30 whitespace-nowrap drop-shadow-lg animate-bounce ${
          floatingText.startsWith('+') ? 'text-green-400' : floatingText.includes('CRIT') ? 'text-yellow-300' : 'text-red-400'
        }`}>
          {floatingText}
        </div>
      )}

      {/* 3D Model container */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: 72,
          height: 96,
          border,
          boxShadow: glow,
          background: `linear-gradient(${facing === 'front' ? '180deg' : '0deg'}, rgba(255,255,255,0.08), rgba(0,0,0,0.3))`,
        }}
      >
        {/* Placeholder silhouette — back view for player, front for enemy */}
        <div className="absolute inset-0 flex items-center justify-center">
          {facing === 'back' ? (
            /* Player hero seen from behind — silhouette with back turned */
            <svg viewBox="0 0 64 80" className="w-12 h-16 opacity-30" fill="currentColor">
              <ellipse cx="32" cy="16" rx="10" ry="12" className="text-white" />
              <rect x="20" y="26" width="24" height="32" rx="4" className="text-white" />
              <rect x="14" y="30" width="8" height="20" rx="3" className="text-white" />
              <rect x="42" y="30" width="8" height="20" rx="3" className="text-white" />
              <rect x="22" y="56" width="8" height="18" rx="3" className="text-white" />
              <rect x="34" y="56" width="8" height="18" rx="3" className="text-white" />
            </svg>
          ) : (
            /* Enemy facing camera */
            <svg viewBox="0 0 64 80" className="w-12 h-16 opacity-30" fill="currentColor">
              <ellipse cx="32" cy="16" rx="10" ry="12" className="text-red-400" />
              <circle cx="27" cy="14" r="2" className="text-red-200" />
              <circle cx="37" cy="14" r="2" className="text-red-200" />
              <rect x="20" y="26" width="24" height="32" rx="4" className="text-red-400" />
              <rect x="14" y="30" width="8" height="20" rx="3" className="text-red-400" />
              <rect x="42" y="30" width="8" height="20" rx="3" className="text-red-400" />
              <rect x="22" y="56" width="8" height="18" rx="3" className="text-red-400" />
              <rect x="34" y="56" width="8" height="18" rx="3" className="text-red-400" />
            </svg>
          )}
        </div>

        {/* Role icon overlay */}
        <div className="absolute top-1 right-1 text-sm opacity-60">
          {unit.role === 'offensive' ? '⚔️' : unit.role === 'defensive' ? '🛡️' : '✨'}
        </div>

        {/* Model ID watermark — placeholder for actual 3D model */}
        <div className="absolute bottom-1 left-1 right-1 text-[6px] text-white/15 truncate text-center leading-tight">
          {unit.modelId}
        </div>

        {/* Death overlay */}
        {deadOverlay && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="text-2xl">💀</span>
          </div>
        )}

        {/* Active turn glow ring */}
        {isActive && unit.isAlive && (
          <div className="absolute -inset-1 rounded-xl border-2 border-yellow-400/60 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Name + HP below model */}
      <div className="mt-1 w-20 text-center">
        <p className="text-[9px] font-bold text-white truncate">{unit.name}</p>
        <HpBarCompact current={unit.currentHp} max={unit.maxHp} />
        {/* Status effects */}
        {unit.statusEffects.length > 0 && (
          <div className="flex flex-wrap gap-px mt-0.5 justify-center">
            {unit.statusEffects.map((e, i) => (
              <span key={`${e.type}-${i}`} className="text-[8px]" title={`${e.type} (${e.duration}t)`}>
                {statusIcons[e.type]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HpBarCompact({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, (current / max) * 100)
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden mt-0.5">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function TurnOrderBar({ turnOrder, allUnits, currentIndex }: {
  turnOrder: string[]
  allUnits: BattleUnit[]
  currentIndex: number
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 py-1 bg-black/50 rounded-lg backdrop-blur-sm">
      <span className="text-[8px] text-white/30 mr-1 shrink-0 uppercase tracking-widest">Turn</span>
      {turnOrder.map((id, idx) => {
        const unit = allUnits.find(u => u.id === id)
        if (!unit || !unit.isAlive) return null
        const isCurrent = idx === currentIndex
        return (
          <div
            key={`${id}-${idx}`}
            className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border transition-all ${
              isCurrent
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 scale-125'
                : unit.isEnemy
                ? 'border-red-500/40 bg-red-500/10 text-red-400'
                : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
            }`}
            title={unit.name}
          >
            {unit.name.charAt(0)}
          </div>
        )
      })}
    </div>
  )
}

function BattleLog({ log }: { log: BattleAction[] }) {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log.length])

  const lastEntries = log.slice(-8)

  return (
    <div ref={logRef} className="h-16 overflow-y-auto px-2 py-1 bg-black/40 rounded-lg backdrop-blur-sm space-y-px">
      {lastEntries.map((entry, i) => (
        <p key={i} className={`text-[9px] leading-tight ${
          entry.type === 'death' ? 'text-red-400 font-bold' :
          entry.isCrit ? 'text-yellow-300' :
          entry.healing ? 'text-green-400' :
          entry.statusApplied ? 'text-purple-400' :
          entry.statusRemoved ? 'text-white/30' :
          'text-white/40'
        }`}>
          {entry.message}
        </p>
      ))}
      {lastEntries.length === 0 && (
        <p className="text-[9px] text-white/20 text-center mt-3">Battle begins...</p>
      )}
    </div>
  )
}

/* ────── Ground plane for the 3D arena ────── */
function ArenaGround() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 120% 60% at 50% 85%, rgba(30,15,60,0.9) 0%, transparent 70%),
          radial-gradient(ellipse 80% 30% at 50% 90%, rgba(100,60,200,0.15) 0%, transparent 60%)
        `,
      }}
    >
      {/* Ground grid lines — perspective effect */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 overflow-hidden opacity-20">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-white/10"
            style={{
              bottom: `${i * 12}%`,
              transform: `scaleX(${1 + i * 0.15})`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
/*  MAIN BATTLE PAGE                                            */
/* ══════════════════════════════════════════════════════════════ */

export default function BattlePage({ playerTeam, enemyTeam, title, onResult }: BattlePageProps) {
  const [battleState, setBattleState] = useState<BattleState>(() =>
    initBattle([...playerTeam], [...enemyTeam])
  )
  const [phase, setPhase] = useState<'intro' | 'battle' | 'result'>('intro')
  const [autoMode, setAutoMode] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [floatingTexts, setFloatingTexts] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [shakeUnits, setShakeUnits] = useState<Record<string, boolean>>({})
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allUnits = [...battleState.playerTeam, ...battleState.enemyTeam]
  const currentUnit = getCurrentUnit(battleState)
  const isPlayerTurn = currentUnit && !currentUnit.isEnemy && currentUnit.isAlive

  const showFloatingText = useCallback((unitId: string, text: string) => {
    setFloatingTexts(prev => ({ ...prev, [unitId]: text }))
    // Shake on damage
    if (text.startsWith('-') || text.includes('CRIT')) {
      setShakeUnits(prev => ({ ...prev, [unitId]: true }))
      setTimeout(() => setShakeUnits(prev => { const n = { ...prev }; delete n[unitId]; return n }), 400)
    }
    setTimeout(() => {
      setFloatingTexts(prev => { const next = { ...prev }; delete next[unitId]; return next })
    }, 1200)
  }, [])

  const processActions = useCallback((actions: BattleAction[]) => {
    for (const action of actions) {
      if (action.damage && action.targetId) {
        showFloatingText(action.targetId, `${action.isCrit ? 'CRIT ' : ''}-${action.damage}`)
      }
      if (action.healing && action.targetId) {
        showFloatingText(action.targetId, `+${action.healing}`)
      }
      if (action.type === 'death' && action.actorId) {
        showFloatingText(action.actorId, 'DEFEATED')
      }
    }
  }, [showFloatingText])

  const executeAction = useCallback((skillIndex: number, targetId: string) => {
    if (battleState.phase !== 'active' || isProcessing) return

    setIsProcessing(true)
    const newState = { ...battleState, playerTeam: [...battleState.playerTeam], enemyTeam: [...battleState.enemyTeam], log: [...battleState.log], turnOrder: [...battleState.turnOrder] }
    const actions = advanceTurn(newState, skillIndex, targetId)
    processActions(actions)
    setBattleState(newState)

    if (newState.phase === 'victory' || newState.phase === 'defeat') {
      setTimeout(() => setPhase('result'), 1000)
    }

    setTimeout(() => setIsProcessing(false), 400 / speed)
  }, [battleState, isProcessing, processActions, speed])

  const executeEnemyTurn = useCallback(() => {
    if (battleState.phase !== 'active') return
    const unit = getCurrentUnit(battleState)
    if (!unit || !unit.isEnemy) return

    const { skillIndex, targetId } = autoAction(battleState)
    executeAction(skillIndex, targetId)
  }, [battleState, executeAction])

  // Auto-play enemy turns
  useEffect(() => {
    if (phase !== 'battle' || battleState.phase !== 'active') return
    const unit = getCurrentUnit(battleState)
    if (!unit || !unit.isAlive) return

    if (unit.isEnemy && !isProcessing) {
      const timer = setTimeout(executeEnemyTurn, 600 / speed)
      return () => clearTimeout(timer)
    }
  }, [battleState, phase, isProcessing, executeEnemyTurn, speed])

  // Auto-mode for player turns
  useEffect(() => {
    if (!autoMode || phase !== 'battle' || battleState.phase !== 'active' || isProcessing) return
    const unit = getCurrentUnit(battleState)
    if (!unit || unit.isEnemy || !unit.isAlive) return

    autoTimerRef.current = setTimeout(() => {
      const { skillIndex, targetId } = autoAction(battleState)
      executeAction(skillIndex, targetId)
    }, 800 / speed)

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    }
  }, [autoMode, battleState, phase, isProcessing, executeAction, speed])

  // Skill selection for player
  const handleSkillUse = (skillIndex: number) => {
    if (!isPlayerTurn || autoMode || isProcessing) return
    const unit = currentUnit!
    const skill = skillIndex === -1 ? null : unit.skills[skillIndex]

    if (skill && skill.currentCd > 0) return

    let targetId = ''
    if (skillIndex === -1 || !skill) {
      const enemies = battleState.enemyTeam.filter(u => u.isAlive)
      targetId = enemies.sort((a, b) => a.currentHp - b.currentHp)[0]?.id || ''
    } else if (skill.targetType === 'enemy' || skill.targetType === 'all_enemies') {
      const enemies = battleState.enemyTeam.filter(u => u.isAlive)
      targetId = enemies.sort((a, b) => a.currentHp - b.currentHp)[0]?.id || ''
    } else if (skill.targetType === 'ally' || skill.targetType === 'all_allies') {
      const allies = battleState.playerTeam.filter(u => u.isAlive)
      targetId = allies.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0]?.id || ''
    } else {
      targetId = unit.id
    }

    executeAction(skillIndex, targetId)
  }

  /* ═══════ INTRO SCREEN ═══════ */
  if (phase === 'intro') {
    const playerPower = playerTeam.reduce((s, u) => s + u.atk * 2 + u.maxHp * 0.5 + u.def, 0)
    const enemyPower = enemyTeam.reduce((s, u) => s + u.atk * 2 + u.maxHp * 0.5 + u.def, 0)

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0618] via-[#120826] to-black z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-lg w-full">
          <h2 className="text-2xl font-black text-white tracking-wide uppercase">{title}</h2>

          <div className="flex items-stretch justify-center gap-6">
            {/* Player side — from behind */}
            <div className="flex-1 text-center">
              <p className="text-[10px] text-cyan-400/60 uppercase tracking-widest mb-3 font-bold">Your Champions</p>
              <div className="flex gap-2 justify-center mb-3">
                {playerTeam.map(u => (
                  <div key={u.id} className="flex flex-col items-center">
                    <div className="w-14 h-18 rounded-lg bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
                      <svg viewBox="0 0 64 80" className="w-10 h-13 opacity-25" fill="currentColor">
                        <ellipse cx="32" cy="16" rx="10" ry="12" className="text-cyan-300" />
                        <rect x="20" y="26" width="24" height="32" rx="4" className="text-cyan-300" />
                        <rect x="22" y="56" width="8" height="18" rx="3" className="text-cyan-300" />
                        <rect x="34" y="56" width="8" height="18" rx="3" className="text-cyan-300" />
                      </svg>
                      <span className="absolute top-0.5 right-0.5 text-xs">{u.role === 'offensive' ? '⚔️' : u.role === 'defensive' ? '🛡️' : '✨'}</span>
                    </div>
                    <p className="text-[8px] text-white/40 mt-1 truncate w-14">{u.name}</p>
                  </div>
                ))}
              </div>
              <p className="text-xl font-mono font-black text-cyan-300">{Math.round(playerPower).toLocaleString()}</p>
              <p className="text-[9px] text-white/20 uppercase tracking-wider">Power</p>
            </div>

            <div className="flex items-center">
              <span className="text-3xl font-black text-white/20">VS</span>
            </div>

            {/* Enemy side — facing front */}
            <div className="flex-1 text-center">
              <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-3 font-bold">Enemies</p>
              <div className="flex gap-2 justify-center mb-3">
                {enemyTeam.map(u => (
                  <div key={u.id} className="flex flex-col items-center">
                    <div className="w-14 h-18 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center justify-center relative overflow-hidden">
                      <svg viewBox="0 0 64 80" className="w-10 h-13 opacity-25" fill="currentColor">
                        <ellipse cx="32" cy="16" rx="10" ry="12" className="text-red-400" />
                        <circle cx="27" cy="14" r="2" className="text-red-200" />
                        <circle cx="37" cy="14" r="2" className="text-red-200" />
                        <rect x="20" y="26" width="24" height="32" rx="4" className="text-red-400" />
                        <rect x="22" y="56" width="8" height="18" rx="3" className="text-red-400" />
                        <rect x="34" y="56" width="8" height="18" rx="3" className="text-red-400" />
                      </svg>
                      <span className="absolute top-0.5 right-0.5 text-xs">{u.role === 'offensive' ? '⚔️' : u.role === 'defensive' ? '🛡️' : '✨'}</span>
                    </div>
                    <p className="text-[8px] text-white/40 mt-1 truncate w-14">{u.name}</p>
                  </div>
                ))}
              </div>
              <p className="text-xl font-mono font-black text-red-400">{Math.round(enemyPower).toLocaleString()}</p>
              <p className="text-[9px] text-white/20 uppercase tracking-wider">Power</p>
            </div>
          </div>

          <button
            onClick={() => setPhase('battle')}
            className="px-14 py-3.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white font-black rounded-xl hover:brightness-110 transition text-sm uppercase tracking-widest shadow-lg shadow-red-500/30"
          >
            FIGHT!
          </button>
        </div>
      </div>
    )
  }

  /* ═══════ RESULT SCREEN ═══════ */
  if (phase === 'result') {
    const won = battleState.phase === 'victory'

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0618] via-[#120826] to-black z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="text-7xl">{won ? '🏆' : '💀'}</div>
          <h2 className={`text-4xl font-black tracking-wider ${won ? 'text-yellow-300' : 'text-red-400'}`}>
            {won ? 'VICTORY!' : 'DEFEATED'}
          </h2>

          <div className="text-sm text-white/30">
            <p>Turns: {battleState.turn} | Actions: {battleState.log.length}</p>
          </div>

          {won && (
            <div className="flex justify-center gap-3">
              {battleState.playerTeam.filter(u => u.isAlive).map(u => (
                <div key={u.id} className="text-center">
                  <div className="w-12 h-16 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-1">
                    <span className="text-sm">{u.role === 'offensive' ? '⚔️' : u.role === 'defensive' ? '🛡️' : '✨'}</span>
                  </div>
                  <p className="text-[8px] text-white/40">{u.name}</p>
                </div>
              ))}
            </div>
          )}

          {!won && (
            <p className="text-sm text-white/30">Upgrade your team and try again</p>
          )}

          <button
            onClick={() => onResult(won)}
            className="px-10 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black rounded-xl hover:brightness-110 transition text-sm uppercase tracking-wider"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════ */
  /*  3D PERSPECTIVE BATTLE SCREEN  (RSL-style)                 */
  /* ═══════════════════════════════════════════════════════════ */

  // Compute spacing for units on the 3D "stage"
  const enemySpacing = Math.min(96, 400 / Math.max(battleState.enemyTeam.length, 1))
  const playerSpacing = Math.min(96, 400 / Math.max(battleState.playerTeam.length, 1))

  return (
    <div className="fixed inset-0 bg-[#07030e] z-50 flex flex-col overflow-hidden">
      {/* ── Top HUD bar ── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/70 border-b border-white/5 z-30 backdrop-blur-sm">
        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/25 font-mono">Turn {battleState.turn}</span>
          <button
            onClick={() => setSpeed(s => s >= 3 ? 1 : s + 1)}
            className="px-2 py-0.5 text-[9px] font-bold rounded bg-white/10 text-white/50 hover:text-white transition"
          >
            {speed}x
          </button>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`px-2 py-0.5 text-[9px] font-bold rounded transition ${
              autoMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/10 text-white/50'
            }`}
          >
            AUTO
          </button>
        </div>
      </div>

      {/* ── Turn order strip ── */}
      <div className="px-2 py-1 z-20">
        <TurnOrderBar
          turnOrder={battleState.turnOrder}
          allUnits={allUnits}
          currentIndex={battleState.currentUnitIndex}
        />
      </div>

      {/* ══════ 3D BATTLEFIELD ══════ */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ perspective: '800px' }}
      >
        {/* Arena ground with perspective grid */}
        <ArenaGround />

        {/* 3D tilted stage */}
        <div
          className="absolute inset-0 flex flex-col justify-between py-4"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(12deg)',
            transformOrigin: '50% 80%',
          }}
        >
          {/* ── ENEMY ROW (far side, facing camera) ── */}
          <div className="flex items-end justify-center px-4" style={{ gap: `${enemySpacing - 72}px` }}>
            {battleState.enemyTeam.map(unit => (
              <ModelSlot
                key={unit.id}
                unit={unit}
                facing="front"
                isActive={currentUnit?.id === unit.id}
                floatingText={floatingTexts[unit.id] || null}
                shakeClass={shakeUnits[unit.id] ? 'animate-shake' : ''}
              />
            ))}
          </div>

          {/* Center divider — faint glow line */}
          <div className="flex items-center justify-center">
            <div className="w-48 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          </div>

          {/* ── PLAYER ROW (near side, backs to camera) ── */}
          <div className="flex items-start justify-center px-4" style={{ gap: `${playerSpacing - 72}px` }}>
            {battleState.playerTeam.map(unit => (
              <ModelSlot
                key={unit.id}
                unit={unit}
                facing="back"
                isActive={currentUnit?.id === unit.id}
                floatingText={floatingTexts[unit.id] || null}
                shakeClass={shakeUnits[unit.id] ? 'animate-shake' : ''}
              />
            ))}
          </div>
        </div>

        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* ── Battle log ── */}
      <div className="px-2 z-20">
        <BattleLog log={battleState.log} />
      </div>

      {/* ── Skill bar (bottom HUD) ── */}
      <div className="px-2 py-2 bg-black/80 border-t border-white/5 z-30 backdrop-blur-sm">
        {isPlayerTurn && !autoMode ? (
          <div className="space-y-1">
            <p className="text-[8px] text-yellow-400/50 uppercase tracking-widest text-center font-bold">
              {currentUnit?.name}'s Turn
            </p>
            <div className="flex gap-1.5">
              {/* Basic attack */}
              <button
                onClick={() => handleSkillUse(-1)}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/10 transition disabled:opacity-30"
              >
                Attack
              </button>
              {/* Skills */}
              {currentUnit?.skills.map((skill, idx) => {
                const onCd = skill.currentCd > 0
                return (
                  <button
                    key={idx}
                    onClick={() => handleSkillUse(idx)}
                    disabled={onCd || isProcessing}
                    className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition disabled:opacity-30 ${
                      onCd
                        ? 'bg-white/[0.02] border-white/5 text-white/15'
                        : skill.type === 'heal' || skill.type === 'aoe_heal'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                        : skill.type === 'buff'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    }`}
                    title={skill.description}
                  >
                    <span className="block truncate text-[10px]">{skill.name}</span>
                    {onCd && <span className="text-[7px] text-white/25">CD:{skill.currentCd}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-[9px] text-white/25 animate-pulse">
              {autoMode ? 'Auto-battling...' : `${currentUnit?.name || 'Enemy'} is acting...`}
            </p>
          </div>
        )}
      </div>

      {/* Inline CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
