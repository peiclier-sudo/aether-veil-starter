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

/* ─────────── 3D model placeholder on isometric field ─────────── */
function IsoBattleUnit({
  unit,
  facing,
  isActive,
  floatingText,
  isShaking,
}: {
  unit: BattleUnit
  facing: 'upper-right' | 'lower-left'
  isActive: boolean
  floatingText: string | null
  isShaking: boolean
}) {
  const borderCol = isActive
    ? 'rgba(250,204,21,0.8)'
    : `${rarityColor[unit.rarity] || '#555'}66`
  const glowShadow = isActive ? '0 0 20px rgba(250,204,21,0.4), 0 4px 16px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.5)'
  const tileColor = unit.isEnemy ? '#ef4444' : '#06b6d4'

  return (
    <div
      className={`relative flex flex-col items-center ${isShaking ? 'animate-shake' : ''} ${
        !unit.isAlive ? 'opacity-25' : ''
      }`}
      style={{
        transition: 'transform 0.3s, filter 0.3s',
        transform: isActive ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
        filter: isActive ? 'brightness(1.15)' : 'brightness(1)',
        zIndex: isActive ? 20 : 10,
      }}
    >
      {/* Floating damage / heal text */}
      {floatingText && (
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-base font-black z-30 whitespace-nowrap drop-shadow-lg animate-bounce ${
          floatingText.startsWith('+') ? 'text-green-400' : floatingText.includes('CRIT') ? 'text-yellow-300' : 'text-red-400'
        }`}>
          {floatingText}
        </div>
      )}

      {/* 3D model placeholder */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          width: 80,
          height: 108,
          border: `2px solid ${borderCol}`,
          boxShadow: glowShadow,
          background: `linear-gradient(${facing === 'lower-left' ? '200deg' : '20deg'}, rgba(255,255,255,0.06), rgba(0,0,0,0.4))`,
        }}
      >
        {/* Silhouette — facing direction */}
        <div className="absolute inset-0 flex items-center justify-center">
          {facing === 'upper-right' ? (
            /* Player hero — back turned, facing upper-right */
            <svg viewBox="0 0 48 64" className="w-14 h-[4.5rem] opacity-25" style={{ transform: 'scaleX(-1)' }}>
              <ellipse cx="24" cy="12" rx="8" ry="10" fill="#67e8f9" />
              <rect x="15" y="20" width="18" height="24" rx="3" fill="#67e8f9" />
              <rect x="10" y="23" width="6" height="16" rx="2" fill="#67e8f9" />
              <rect x="32" y="23" width="6" height="16" rx="2" fill="#67e8f9" />
              <rect x="17" y="42" width="6" height="14" rx="2" fill="#67e8f9" />
              <rect x="25" y="42" width="6" height="14" rx="2" fill="#67e8f9" />
            </svg>
          ) : (
            /* Enemy — facing lower-left toward camera/player */
            <svg viewBox="0 0 48 64" className="w-14 h-[4.5rem] opacity-25">
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
        <div className="absolute top-1 right-1 text-sm opacity-60">
          {unit.role === 'offensive' ? '⚔️' : unit.role === 'defensive' ? '🛡️' : '✨'}
        </div>

        {/* Model ID watermark */}
        <div className="absolute bottom-1 left-1 right-1 text-[6px] text-white/10 truncate text-center">
          {unit.modelId}
        </div>

        {/* Death overlay */}
        {!unit.isAlive && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="text-2xl">💀</span>
          </div>
        )}

        {/* Active glow pulse */}
        {isActive && unit.isAlive && (
          <div className="absolute -inset-0.5 rounded-xl border-2 border-yellow-400/50 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Isometric floor tile under the unit */}
      <div className="relative w-20 h-7 -mt-1">
        <IsoTile color={tileColor} size={80} />
      </div>

      {/* Name + HP */}
      <div className="w-22 text-center -mt-0.5">
        <p className="text-[9px] font-bold text-white truncate">{unit.name}</p>
        <HpBarCompact current={unit.currentHp} max={unit.maxHp} />
        {unit.statusEffects.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
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

/* ─────────── Isometric diamond platform ─────────── */
function IsoPlatform({ units, side }: { units: number; side: 'player' | 'enemy' }) {
  // Build a diamond grid of tiles for the platform
  const tileSize = 64
  const cols = Math.min(units, 3)
  const rows = Math.ceil(units / cols)
  const baseColor = side === 'player' ? 'rgba(6,182,212,' : 'rgba(239,68,68,'

  // Generate diamond tile positions
  const tiles: { x: number; y: number }[] = []
  for (let r = 0; r < rows + 1; r++) {
    for (let c = 0; c < cols + 1; c++) {
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
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.35 }}
    >
      {tiles.map((t, i) => {
        const half = tileSize / 2
        const th = tileSize * 0.3
        return (
          <polygon
            key={i}
            points={`${t.x + half},${t.y} ${t.x + tileSize},${t.y + th} ${t.x + half},${t.y + th * 2} ${t.x},${t.y + th}`}
            fill={`${baseColor}0.15)`}
            stroke={`${baseColor}0.4)`}
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
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allUnits = [...battleState.playerTeam, ...battleState.enemyTeam]
  const currentUnit = getCurrentUnit(battleState)
  const isPlayerTurn = currentUnit && !currentUnit.isEnemy && currentUnit.isAlive

  const showFloatingText = useCallback((unitId: string, text: string) => {
    setFloatingTexts(prev => ({ ...prev, [unitId]: text }))
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
        <div className="text-center space-y-8 max-w-lg w-full">
          <h2 className="text-2xl font-black text-white tracking-wide uppercase">{title}</h2>

          <div className="flex items-stretch justify-center gap-6">
            <div className="flex-1 text-center">
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
              <span className="text-3xl font-black text-white/20">VS</span>
            </div>

            <div className="flex-1 text-center">
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
            className="px-14 py-3.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white font-black rounded-xl hover:brightness-110 transition text-sm uppercase tracking-widest shadow-lg shadow-red-500/30"
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

  /* ═══════════════════════════════════════════════════════════════ */
  /*  ISOMETRIC BATTLE SCENE  —  RSL diagonal layout                */
  /*                                                                */
  /*  Player team (bottom-left)  ←——→  Enemy team (upper-right)    */
  /*  Heroes face upper-right        Enemies face lower-left        */
  /*  Each group on a diamond platform                              */
  /* ═══════════════════════════════════════════════════════════════ */

  // Position units in a staggered formation on their diamond platform
  // Player: 2×2 or 1×N diagonal layout, bottom-left
  // Enemy: same, upper-right
  const getFormationPositions = (count: number) => {
    // Isometric positions: each unit offset diagonally
    // Bigger spacing for larger character models
    const positions: { x: number; y: number }[] = []
    if (count <= 2) {
      for (let i = 0; i < count; i++) {
        positions.push({ x: i * 96, y: i * 28 })
      }
    } else if (count <= 4) {
      const front = Math.ceil(count / 2)
      const back = count - front
      for (let i = 0; i < front; i++) {
        positions.push({ x: i * 96, y: i * 28 })
      }
      for (let i = 0; i < back; i++) {
        positions.push({ x: i * 96 + 48, y: i * 28 + 64 })
      }
    } else {
      for (let i = 0; i < 3; i++) {
        positions.push({ x: i * 92, y: i * 26 })
      }
      for (let i = 0; i < count - 3; i++) {
        positions.push({ x: i * 92 + 46, y: i * 26 + 60 })
      }
    }
    return positions
  }

  const playerPositions = getFormationPositions(battleState.playerTeam.length)
  const enemyPositions = getFormationPositions(battleState.enemyTeam.length)

  // Compute bounding box for positioning
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
        {/* Background — dark arena with radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 55%, rgba(30,10,60,0.8) 0%, transparent 70%),
              radial-gradient(ellipse 40% 30% at 30% 70%, rgba(6,182,212,0.06) 0%, transparent 50%),
              radial-gradient(ellipse 40% 30% at 70% 30%, rgba(239,68,68,0.06) 0%, transparent 50%),
              linear-gradient(180deg, #07030e 0%, #0d0520 50%, #07030e 100%)
            `,
          }}
        />

        {/* Isometric ground grid — rotated 45deg, scaled for perspective */}
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

        {/* ── Enemy group — upper-right, pulled toward center ── */}
        <div
          className="absolute z-10"
          style={{
            top: '4%',
            right: '14%',
            width: eMaxX + 110,
            height: eMaxY + 170,
          }}
        >
          {/* Diamond platform behind enemies */}
          <div className="absolute inset-0 -z-10">
            <IsoPlatform units={battleState.enemyTeam.length} side="enemy" />
          </div>

          {/* Enemy units */}
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
                />
              </div>
            )
          })}

          {/* "ENEMY" label */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="text-[7px] text-red-400/40 uppercase tracking-widest font-bold">Enemy</span>
          </div>
        </div>

        {/* ── Diagonal clash indicator (center) ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 pointer-events-none">
          <div className="relative">
            {/* Diagonal line connecting the two groups */}
            <div
              className="absolute w-40 h-px"
              style={{
                background: 'linear-gradient(90deg, rgba(6,182,212,0.2), rgba(150,100,255,0.15), rgba(239,68,68,0.2))',
                transform: 'rotate(-30deg)',
                transformOrigin: '50% 50%',
                top: 0,
                left: -80,
              }}
            />
            {/* Center glow */}
            <div className="w-8 h-8 rounded-full bg-purple-500/10 blur-xl" />
          </div>
        </div>

        {/* ── Player group — bottom-left, pulled toward center ── */}
        <div
          className="absolute z-10"
          style={{
            bottom: '4%',
            left: '14%',
            width: pMaxX + 110,
            height: pMaxY + 170,
          }}
        >
          {/* Diamond platform behind players */}
          <div className="absolute inset-0 -z-10">
            <IsoPlatform units={battleState.playerTeam.length} side="player" />
          </div>

          {/* Player units */}
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
                />
              </div>
            )
          })}

          {/* "YOUR TEAM" label */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="text-[7px] text-cyan-400/40 uppercase tracking-widest font-bold">Your Team</span>
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
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 hover:bg-white/10 transition disabled:opacity-30"
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
                    className={`flex-1 py-2 rounded-lg border text-[10px] font-bold transition disabled:opacity-30 ${
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

      {/* Shake animation */}
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
