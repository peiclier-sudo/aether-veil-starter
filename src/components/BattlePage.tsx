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

/* ─────────── Isometric diamond tile ─────────── */
function IsoTile({ color, size = 48 }: { color: string; size?: number }) {
  const half = size / 2
  return (
    <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`} className="absolute bottom-0 left-1/2 -translate-x-1/2">
      <polygon
        points={`${half},0 ${size},${half * 0.6} ${half},${size * 0.6} 0,${half * 0.6}`}
        fill={color}
        opacity="0.3"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.5"
      />
    </svg>
  )
}

/* ─────────── Ambient floating particles ─────────── */
function AmbientParticles() {
  // 12 particles with staggered positions and delays
  const particles = Array.from({ length: 12 }, (_, i) => ({
    left: `${8 + (i * 7.3) % 84}%`,
    delay: `${(i * 0.7) % 4}s`,
    duration: `${3 + (i % 3)}s`,
    size: 2 + (i % 3),
    color: i % 2 === 0 ? 'rgba(168,85,247,0.4)' : 'rgba(6,182,212,0.3)',
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-particle-float"
          style={{
            left: p.left,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}

/* ─────────── 3D model placeholder on isometric field ─────────── */
function IsoBattleUnit({
  unit,
  facing,
  isActive,
  floatingText,
  isShaking,
  isAttacking,
  isHit,
}: {
  unit: BattleUnit
  facing: 'upper-right' | 'lower-left'
  isActive: boolean
  floatingText: string | null
  isShaking: boolean
  isAttacking: boolean
  isHit: boolean
}) {
  const borderCol = isActive
    ? 'rgba(250,204,21,0.8)'
    : `${rarityColor[unit.rarity] || '#555'}66`
  const glowShadow = isActive
    ? '0 0 24px rgba(250,204,21,0.5), 0 6px 20px rgba(0,0,0,0.6)'
    : '0 4px 16px rgba(0,0,0,0.5)'
  const tileColor = unit.isEnemy ? '#ef4444' : '#06b6d4'

  // Build animation classes
  let animClass = ''
  if (!unit.isAlive) animClass = 'animate-death-fall'
  else if (isAttacking) animClass = facing === 'upper-right' ? 'animate-lunge-ur' : 'animate-lunge-ll'
  else if (isShaking) animClass = 'animate-shake'
  else animClass = 'animate-idle-breathe'

  return (
    <div
      className={`relative flex flex-col items-center ${animClass}`}
      style={{
        transition: 'transform 0.3s, filter 0.3s',
        transform: isActive && !isAttacking ? 'scale(1.08) translateY(-6px)' : 'scale(1)',
        filter: isActive ? 'brightness(1.2)' : 'brightness(1)',
        zIndex: isActive ? 20 : 10,
      }}
    >
      {/* Floating damage / heal text */}
      {floatingText && (
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-lg font-black z-30 whitespace-nowrap animate-float-up ${
          floatingText.startsWith('+') ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]'
          : floatingText.includes('CRIT') ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]'
          : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]'
        }`}>
          {floatingText}
        </div>
      )}

      {/* 3D model placeholder */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          width: 100,
          height: 136,
          border: `2px solid ${borderCol}`,
          boxShadow: glowShadow,
          background: `linear-gradient(${facing === 'lower-left' ? '200deg' : '20deg'}, rgba(255,255,255,0.06), rgba(0,0,0,0.4))`,
        }}
      >
        {/* Silhouette — facing direction */}
        <div className="absolute inset-0 flex items-center justify-center">
          {facing === 'upper-right' ? (
            <svg viewBox="0 0 48 64" className="w-[4.5rem] h-24 opacity-25" style={{ transform: 'scaleX(-1)' }}>
              <ellipse cx="24" cy="12" rx="8" ry="10" fill="#67e8f9" />
              <rect x="15" y="20" width="18" height="24" rx="3" fill="#67e8f9" />
              <rect x="10" y="23" width="6" height="16" rx="2" fill="#67e8f9" />
              <rect x="32" y="23" width="6" height="16" rx="2" fill="#67e8f9" />
              <rect x="17" y="42" width="6" height="14" rx="2" fill="#67e8f9" />
              <rect x="25" y="42" width="6" height="14" rx="2" fill="#67e8f9" />
            </svg>
          ) : (
            <svg viewBox="0 0 48 64" className="w-[4.5rem] h-24 opacity-25">
              <ellipse cx="24" cy="12" rx="8" ry="10" fill="#f87171" />
              <circle cx="20" cy="10" r="1.5" fill="#fca5a5" />
              <circle cx="28" cy="10" r="1.5" fill="#fca5a5" />
              <rect x="15" y="20" width="18" height="24" rx="3" fill="#f87171" />
              <rect x="10" y="23" width="6" height="16" rx="2" fill="#f87171" />
              <rect x="32" y="23" width="6" height="16" rx="2" fill="#f87171" />
              <rect x="17" y="42" width="6" height="14" rx="2" fill="#f87171" />
              <rect x="25" y="42" width="6" height="14" rx="2" fill="#f87171" />
            </svg>
          )}
        </div>

        {/* Role badge */}
        <div className="absolute top-1.5 right-1.5 text-base opacity-60">
          {unit.role === 'offensive' ? '⚔️' : unit.role === 'defensive' ? '🛡️' : '✨'}
        </div>

        {/* Model ID watermark */}
        <div className="absolute bottom-1 left-1 right-1 text-[6px] text-white/10 truncate text-center">
          {unit.modelId}
        </div>

        {/* Hit flash overlay */}
        {isHit && unit.isAlive && (
          <div className="absolute inset-0 bg-white/40 animate-hit-flash rounded-xl pointer-events-none" />
        )}

        {/* Death overlay */}
        {!unit.isAlive && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="text-3xl">💀</span>
          </div>
        )}

        {/* Active glow pulse */}
        {isActive && unit.isAlive && (
          <div className="absolute -inset-1 rounded-xl border-2 border-yellow-400/60 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Isometric floor tile under the unit */}
      <div className="relative w-24 h-8 -mt-1">
        <IsoTile color={tileColor} size={100} />
      </div>

      {/* Name + HP */}
      <div className="w-24 text-center -mt-0.5">
        <p className="text-[10px] font-bold text-white truncate">{unit.name}</p>
        <HpBarCompact current={unit.currentHp} max={unit.maxHp} />
        {unit.statusEffects.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
            {unit.statusEffects.map((e, i) => (
              <span key={`${e.type}-${i}`} className="text-[9px]" title={`${e.type} (${e.duration}t)`}>
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

/* ─────────── Isometric diamond platform ─────────── */
function IsoPlatform({ units, side }: { units: number; side: 'player' | 'enemy' }) {
  const tileSize = 80
  const cols = Math.min(units, 3)
  const rows = Math.ceil(units / cols)
  const baseColor = side === 'player' ? 'rgba(6,182,212,' : 'rgba(239,68,68,'

  const tiles: { x: number; y: number }[] = []
  for (let r = 0; r < rows + 2; r++) {
    for (let c = 0; c < cols + 2; c++) {
      tiles.push({
        x: (c - r) * (tileSize * 0.5),
        y: (c + r) * (tileSize * 0.3),
      })
    }
  }

  const minX = Math.min(...tiles.map(t => t.x))
  const maxX = Math.max(...tiles.map(t => t.x))
  const minY = Math.min(...tiles.map(t => t.y))
  const maxY = Math.max(...tiles.map(t => t.y))
  const w = maxX - minX + tileSize
  const h = maxY - minY + tileSize * 0.6

  return (
    <svg
      width={w}
      height={h}
      viewBox={`${minX} ${minY} ${w} ${h}`}
      className="absolute inset-0 pointer-events-none animate-platform-glow"
      style={{ opacity: 0.4 }}
    >
      {tiles.map((t, i) => {
        const half = tileSize / 2
        const th = tileSize * 0.3
        return (
          <polygon
            key={i}
            points={`${t.x + half},${t.y} ${t.x + tileSize},${t.y + th} ${t.x + half},${t.y + th * 2} ${t.x},${t.y + th}`}
            fill={`${baseColor}0.15)`}
            stroke={`${baseColor}0.5)`}
            strokeWidth="0.5"
          />
        )
      })}
    </svg>
  )
}

function TurnOrderBar({ turnOrder, allUnits, currentIndex }: {
  turnOrder: string[]
  allUnits: BattleUnit[]
  currentIndex: number
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 py-1 bg-black/50 rounded-lg backdrop-blur-sm">
      <span className="text-[7px] text-white/30 mr-1 shrink-0 uppercase tracking-widest">Turn</span>
      {turnOrder.map((id, idx) => {
        const unit = allUnits.find(u => u.id === id)
        if (!unit || !unit.isAlive) return null
        const isCurrent = idx === currentIndex
        return (
          <div
            key={`${id}-${idx}`}
            className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold border transition-all ${
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

  const lastEntries = log.slice(-6)

  return (
    <div ref={logRef} className="h-14 overflow-y-auto px-2 py-1 bg-black/40 rounded-lg backdrop-blur-sm space-y-px">
      {lastEntries.map((entry, i) => (
        <p key={i} className={`text-[8px] leading-tight ${
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
        <p className="text-[8px] text-white/20 text-center mt-2">Battle begins...</p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN BATTLE PAGE                                          */
/* ═══════════════════════════════════════════════════════════ */

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
  const [attackingId, setAttackingId] = useState<string | null>(null)
  const [hitIds, setHitIds] = useState<Record<string, boolean>>({})
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allUnits = [...battleState.playerTeam, ...battleState.enemyTeam]
  const currentUnit = getCurrentUnit(battleState)
  const isPlayerTurn = currentUnit && !currentUnit.isEnemy && currentUnit.isAlive

  const showFloatingText = useCallback((unitId: string, text: string) => {
    setFloatingTexts(prev => ({ ...prev, [unitId]: text }))
    if (text.startsWith('-') || text.includes('CRIT')) {
      // Shake + hit flash on damaged unit
      setShakeUnits(prev => ({ ...prev, [unitId]: true }))
      setHitIds(prev => ({ ...prev, [unitId]: true }))
      setTimeout(() => setShakeUnits(prev => { const n = { ...prev }; delete n[unitId]; return n }), 400)
      setTimeout(() => setHitIds(prev => { const n = { ...prev }; delete n[unitId]; return n }), 300)
    }
    setTimeout(() => {
      setFloatingTexts(prev => { const next = { ...prev }; delete next[unitId]; return next })
    }, 1400)
  }, [])

  const processActions = useCallback((actions: BattleAction[]) => {
    for (const action of actions) {
      // Trigger attack lunge on the acting unit
      if (action.actorId && (action.damage || action.healing) && action.type !== 'death') {
        setAttackingId(action.actorId)
        setTimeout(() => setAttackingId(null), 350)
      }
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
    const newState = {
      ...battleState,
      playerTeam: [...battleState.playerTeam],
      enemyTeam: [...battleState.enemyTeam],
      log: [...battleState.log],
      turnOrder: [...battleState.turnOrder],
    }
    const actions = advanceTurn(newState, skillIndex, targetId)
    processActions(actions)
    setBattleState(newState)

    if (newState.phase === 'victory' || newState.phase === 'defeat') {
      setTimeout(() => setPhase('result'), 1200)
    }

    setTimeout(() => setIsProcessing(false), 500 / speed)
  }, [battleState, isProcessing, processActions, speed])

  const executeEnemyTurn = useCallback(() => {
    if (battleState.phase !== 'active') return
    const unit = getCurrentUnit(battleState)
    if (!unit || !unit.isEnemy) return

    const { skillIndex, targetId } = autoAction(battleState)
    executeAction(skillIndex, targetId)
  }, [battleState, executeAction])

  useEffect(() => {
    if (phase !== 'battle' || battleState.phase !== 'active') return
    const unit = getCurrentUnit(battleState)
    if (!unit || !unit.isAlive) return

    if (unit.isEnemy && !isProcessing) {
      const timer = setTimeout(executeEnemyTurn, 600 / speed)
      return () => clearTimeout(timer)
    }
  }, [battleState, phase, isProcessing, executeEnemyTurn, speed])

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

  /* ═══════════════ INTRO SCREEN ═══════════════ */
  if (phase === 'intro') {
    const playerPower = playerTeam.reduce((s, u) => s + u.atk * 2 + u.maxHp * 0.5 + u.def, 0)
    const enemyPower = enemyTeam.reduce((s, u) => s + u.atk * 2 + u.maxHp * 0.5 + u.def, 0)

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0618] via-[#120826] to-black z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-lg w-full animate-fade-in">
          <h2 className="text-2xl font-black text-white tracking-wide uppercase">{title}</h2>

          <div className="flex items-stretch justify-center gap-6">
            <div className="flex-1 text-center animate-slide-in-left">
              <p className="text-[10px] text-cyan-400/60 uppercase tracking-widest mb-3 font-bold">Your Champions</p>
              <div className="flex gap-2 justify-center mb-3">
                {playerTeam.map(u => (
                  <div key={u.id} className="flex flex-col items-center">
                    <div className="w-14 h-18 rounded-lg bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
                      <svg viewBox="0 0 48 64" className="w-9 h-12 opacity-25">
                        <ellipse cx="24" cy="12" rx="8" ry="10" fill="#67e8f9" />
                        <rect x="15" y="20" width="18" height="24" rx="3" fill="#67e8f9" />
                        <rect x="17" y="42" width="6" height="14" rx="2" fill="#67e8f9" />
                        <rect x="25" y="42" width="6" height="14" rx="2" fill="#67e8f9" />
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
              <span className="text-3xl font-black text-white/20 animate-pulse">VS</span>
            </div>

            <div className="flex-1 text-center animate-slide-in-right">
              <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-3 font-bold">Enemies</p>
              <div className="flex gap-2 justify-center mb-3">
                {enemyTeam.map(u => (
                  <div key={u.id} className="flex flex-col items-center">
                    <div className="w-14 h-18 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center justify-center relative overflow-hidden">
                      <svg viewBox="0 0 48 64" className="w-9 h-12 opacity-25">
                        <ellipse cx="24" cy="12" rx="8" ry="10" fill="#f87171" />
                        <circle cx="20" cy="10" r="1.5" fill="#fca5a5" />
                        <circle cx="28" cy="10" r="1.5" fill="#fca5a5" />
                        <rect x="15" y="20" width="18" height="24" rx="3" fill="#f87171" />
                        <rect x="17" y="42" width="6" height="14" rx="2" fill="#f87171" />
                        <rect x="25" y="42" width="6" height="14" rx="2" fill="#f87171" />
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
            className="px-14 py-3.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white font-black rounded-xl hover:brightness-110 hover:scale-105 transition-all text-sm uppercase tracking-widest shadow-lg shadow-red-500/30"
          >
            FIGHT!
          </button>
        </div>
      </div>
    )
  }

  /* ═══════════════ RESULT SCREEN ═══════════════ */
  if (phase === 'result') {
    const won = battleState.phase === 'victory'

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0618] via-[#120826] to-black z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="text-7xl animate-result-pop">{won ? '🏆' : '💀'}</div>
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
            className="px-10 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black rounded-xl hover:brightness-110 hover:scale-105 transition-all text-sm uppercase tracking-wider"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════ */
  /*  ISOMETRIC BATTLE SCENE  —  RSL diagonal layout                */
  /* ═══════════════════════════════════════════════════════════════ */

  const getFormationPositions = (count: number) => {
    const positions: { x: number; y: number }[] = []
    if (count <= 2) {
      for (let i = 0; i < count; i++) {
        positions.push({ x: i * 114, y: i * 32 })
      }
    } else if (count <= 4) {
      const front = Math.ceil(count / 2)
      const back = count - front
      for (let i = 0; i < front; i++) {
        positions.push({ x: i * 114, y: i * 32 })
      }
      for (let i = 0; i < back; i++) {
        positions.push({ x: i * 114 + 57, y: i * 32 + 72 })
      }
    } else {
      for (let i = 0; i < 3; i++) {
        positions.push({ x: i * 110, y: i * 30 })
      }
      for (let i = 0; i < count - 3; i++) {
        positions.push({ x: i * 110 + 55, y: i * 30 + 68 })
      }
    }
    return positions
  }

  const playerPositions = getFormationPositions(battleState.playerTeam.length)
  const enemyPositions = getFormationPositions(battleState.enemyTeam.length)

  const pMaxX = Math.max(...playerPositions.map(p => p.x), 0)
  const pMaxY = Math.max(...playerPositions.map(p => p.y), 0)
  const eMaxX = Math.max(...enemyPositions.map(p => p.x), 0)
  const eMaxY = Math.max(...enemyPositions.map(p => p.y), 0)

  return (
    <div className="fixed inset-0 bg-[#07030e] z-50 flex flex-col overflow-hidden">
      {/* ── Top HUD ── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/70 border-b border-white/5 z-30 backdrop-blur-sm">
        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-white/25 font-mono">Turn {battleState.turn}</span>
          <button
            onClick={() => setSpeed(s => s >= 3 ? 1 : s + 1)}
            className="px-2 py-0.5 text-[8px] font-bold rounded bg-white/10 text-white/50 hover:text-white transition"
          >
            {speed}x
          </button>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`px-2 py-0.5 text-[8px] font-bold rounded transition ${
              autoMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/10 text-white/50'
            }`}
          >
            AUTO
          </button>
        </div>
      </div>

      {/* ── Turn order ── */}
      <div className="px-2 py-0.5 z-20">
        <TurnOrderBar
          turnOrder={battleState.turnOrder}
          allUnits={allUnits}
          currentIndex={battleState.currentUnitIndex}
        />
      </div>

      {/* ═══════ ISOMETRIC BATTLEFIELD ═══════ */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 55%, rgba(30,10,60,0.8) 0%, transparent 70%),
              radial-gradient(ellipse 40% 30% at 30% 65%, rgba(6,182,212,0.08) 0%, transparent 50%),
              radial-gradient(ellipse 40% 30% at 70% 35%, rgba(239,68,68,0.08) 0%, transparent 50%),
              linear-gradient(180deg, #07030e 0%, #0d0520 50%, #07030e 100%)
            `,
          }}
        />

        {/* Ambient particles */}
        <AmbientParticles />

        {/* Isometric ground grid */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ opacity: 0.12 }}
        >
          <div
            className="absolute"
            style={{
              width: '200%',
              height: '200%',
              left: '-50%',
              top: '-20%',
              transform: 'rotateX(60deg) rotateZ(45deg)',
              transformOrigin: '50% 50%',
              backgroundImage: `
                linear-gradient(rgba(150,100,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(150,100,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* ── Enemy group — upper-right, close to center ── */}
        <div
          className="absolute z-10 animate-slide-in-right"
          style={{
            top: '6%',
            right: '8%',
            width: eMaxX + 130,
            height: eMaxY + 200,
          }}
        >
          <div className="absolute inset-0 -z-10">
            <IsoPlatform units={battleState.enemyTeam.length} side="enemy" />
          </div>

          {battleState.enemyTeam.map((unit, idx) => {
            const pos = enemyPositions[idx] || { x: 0, y: 0 }
            return (
              <div
                key={unit.id}
                className="absolute"
                style={{ left: pos.x, top: pos.y }}
              >
                <IsoBattleUnit
                  unit={unit}
                  facing="lower-left"
                  isActive={currentUnit?.id === unit.id}
                  floatingText={floatingTexts[unit.id] || null}
                  isShaking={!!shakeUnits[unit.id]}
                  isAttacking={attackingId === unit.id}
                  isHit={!!hitIds[unit.id]}
                />
              </div>
            )
          })}

          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <span className="text-[8px] text-red-400/50 uppercase tracking-widest font-bold">Enemy</span>
          </div>
        </div>

        {/* ── Diagonal clash energy (center) ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 pointer-events-none">
          <div className="relative">
            <div
              className="absolute w-48 h-0.5 animate-clash-pulse"
              style={{
                background: 'linear-gradient(90deg, rgba(6,182,212,0.3), rgba(168,85,247,0.4), rgba(239,68,68,0.3))',
                transform: 'rotate(-30deg)',
                transformOrigin: '50% 50%',
                top: 0,
                left: -96,
                borderRadius: 2,
              }}
            />
            <div className="w-12 h-12 rounded-full bg-purple-500/10 blur-2xl animate-pulse" />
          </div>
        </div>

        {/* ── Player group — bottom-left, close to center ── */}
        <div
          className="absolute z-10 animate-slide-in-left"
          style={{
            bottom: '6%',
            left: '8%',
            width: pMaxX + 130,
            height: pMaxY + 200,
          }}
        >
          <div className="absolute inset-0 -z-10">
            <IsoPlatform units={battleState.playerTeam.length} side="player" />
          </div>

          {battleState.playerTeam.map((unit, idx) => {
            const pos = playerPositions[idx] || { x: 0, y: 0 }
            return (
              <div
                key={unit.id}
                className="absolute"
                style={{ left: pos.x, top: pos.y }}
              >
                <IsoBattleUnit
                  unit={unit}
                  facing="upper-right"
                  isActive={currentUnit?.id === unit.id}
                  floatingText={floatingTexts[unit.id] || null}
                  isShaking={!!shakeUnits[unit.id]}
                  isAttacking={attackingId === unit.id}
                  isHit={!!hitIds[unit.id]}
                />
              </div>
            )
          })}

          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <span className="text-[8px] text-cyan-400/50 uppercase tracking-widest font-bold">Your Team</span>
          </div>
        </div>
      </div>

      {/* ── Battle log ── */}
      <div className="px-2 z-20">
        <BattleLog log={battleState.log} />
      </div>

      {/* ── Skill bar ── */}
      <div className="px-2 py-1.5 bg-black/80 border-t border-white/5 z-30 backdrop-blur-sm">
        {isPlayerTurn && !autoMode ? (
          <div className="space-y-1">
            <p className="text-[7px] text-yellow-400/50 uppercase tracking-widest text-center font-bold">
              {currentUnit?.name}'s Turn
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleSkillUse(-1)}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
              >
                Attack
              </button>
              {currentUnit?.skills.map((skill, idx) => {
                const onCd = skill.currentCd > 0
                return (
                  <button
                    key={idx}
                    onClick={() => handleSkillUse(idx)}
                    disabled={onCd || isProcessing}
                    className={`flex-1 py-2 rounded-lg border text-[10px] font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 ${
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
                    <span className="block truncate">{skill.name}</span>
                    {onCd && <span className="text-[6px] text-white/25">CD:{skill.currentCd}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-1.5">
            <p className="text-[8px] text-white/25 animate-pulse">
              {autoMode ? 'Auto-battling...' : `${currentUnit?.name || 'Enemy'} is acting...`}
            </p>
          </div>
        )}
      </div>

      {/* ═══════ ALL ANIMATIONS ═══════ */}
      <style>{`
        /* ── Idle breathing ── */
        @keyframes idle-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-idle-breathe {
          animation: idle-breathe 2.5s ease-in-out infinite;
        }

        /* ── Shake on hit ── */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px) rotate(-1deg); }
          30% { transform: translateX(6px) rotate(1deg); }
          45% { transform: translateX(-5px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        /* ── Attack lunge upper-right (player) ── */
        @keyframes lunge-ur {
          0%, 100% { transform: translate(0, 0); }
          40% { transform: translate(18px, -12px) scale(1.05); }
          60% { transform: translate(18px, -12px) scale(1.05); }
        }
        .animate-lunge-ur {
          animation: lunge-ur 0.35s ease-in-out;
        }

        /* ── Attack lunge lower-left (enemy) ── */
        @keyframes lunge-ll {
          0%, 100% { transform: translate(0, 0); }
          40% { transform: translate(-18px, 12px) scale(1.05); }
          60% { transform: translate(-18px, 12px) scale(1.05); }
        }
        .animate-lunge-ll {
          animation: lunge-ll 0.35s ease-in-out;
        }

        /* ── Hit white flash ── */
        @keyframes hit-flash {
          0% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        .animate-hit-flash {
          animation: hit-flash 0.3s ease-out forwards;
        }

        /* ── Death fall ── */
        @keyframes death-fall {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(0.7) rotate(8deg) translateY(10px); opacity: 0.2; }
        }
        .animate-death-fall {
          animation: death-fall 0.6s ease-in forwards;
        }

        /* ── Float up (damage/heal text) ── */
        @keyframes float-up {
          0% { transform: translate(-50%, 0) scale(0.8); opacity: 0; }
          15% { transform: translate(-50%, -4px) scale(1.2); opacity: 1; }
          30% { transform: translate(-50%, -10px) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -30px) scale(0.9); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 1.4s ease-out forwards;
        }

        /* ── Slide in from left ── */
        @keyframes slide-in-left {
          0% { transform: translateX(-40px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }

        /* ── Slide in from right ── */
        @keyframes slide-in-right {
          0% { transform: translateX(40px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }

        /* ── Fade in ── */
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        /* ── Result pop ── */
        @keyframes result-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-result-pop {
          animation: result-pop 0.6s ease-out;
        }

        /* ── Clash energy pulse ── */
        @keyframes clash-pulse {
          0%, 100% { opacity: 0.3; transform: rotate(-30deg) scaleX(1); }
          50% { opacity: 0.7; transform: rotate(-30deg) scaleX(1.15); }
        }
        .animate-clash-pulse {
          animation: clash-pulse 2s ease-in-out infinite;
        }

        /* ── Platform glow ── */
        @keyframes platform-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.5; }
        }
        .animate-platform-glow {
          animation: platform-glow 3s ease-in-out infinite;
        }

        /* ── Floating particles ── */
        @keyframes particle-float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-400px) scale(0.3); opacity: 0; }
        }
        .animate-particle-float {
          animation: particle-float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
