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

const rarityBorder: Record<string, string> = {
  common: 'border-zinc-500/40',
  rare: 'border-blue-500/40',
  epic: 'border-purple-500/40',
  legendary: 'border-yellow-500/40',
}

const rarityGlow: Record<string, string> = {
  common: '',
  rare: 'shadow-blue-500/10',
  epic: 'shadow-purple-500/10',
  legendary: 'shadow-yellow-500/20',
}

function HpBar({ current, max, isEnemy }: { current: number; max: number; isEnemy: boolean }) {
  const pct = Math.max(0, (current / max) * 100)
  const color = pct > 60 ? 'from-green-500 to-green-400'
    : pct > 30 ? 'from-yellow-500 to-orange-400'
    : 'from-red-500 to-red-400'

  return (
    <div className="w-full">
      <div className="flex justify-between text-[9px] text-white/40 mb-0.5">
        <span>HP</span>
        <span>{Math.max(0, current).toLocaleString()}/{max.toLocaleString()}</span>
      </div>
      <div className={`w-full h-2 rounded-full overflow-hidden ${isEnemy ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function UnitCard({
  unit,
  isActive,
  floatingText,
}: {
  unit: BattleUnit
  isActive: boolean
  floatingText: string | null
}) {
  const borderColor = isActive ? 'border-yellow-400' : (rarityBorder[unit.rarity] || 'border-white/10')
  const glowClass = isActive ? 'shadow-lg shadow-yellow-400/20' : (rarityGlow[unit.rarity] || '')

  return (
    <div className={`relative rounded-lg border ${borderColor} ${glowClass} p-2 transition-all ${
      unit.isAlive ? 'bg-white/5' : 'bg-white/[0.02] opacity-30'
    } ${isActive ? 'ring-1 ring-yellow-400/30 scale-105' : ''}`}>
      {/* Floating damage/heal text */}
      {floatingText && (
        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold animate-bounce z-10 whitespace-nowrap ${
          floatingText.startsWith('+') ? 'text-green-400' : floatingText.includes('CRIT') ? 'text-yellow-300' : 'text-red-400'
        }`}>
          {floatingText}
        </div>
      )}

      {/* Model placeholder */}
      <div className="w-full aspect-square rounded bg-gradient-to-b from-white/10 to-white/[0.02] flex items-center justify-center mb-1.5 relative overflow-hidden">
        <span className="text-2xl">
          {unit.role === 'offensive' ? '⚔️' : unit.role === 'defensive' ? '🛡️' : '✨'}
        </span>
        {/* Placeholder model ID tag */}
        <div className="absolute bottom-0.5 left-0.5 right-0.5 text-[7px] text-white/15 truncate text-center">
          {unit.modelId}
        </div>
        {!unit.isAlive && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-lg">💀</span>
          </div>
        )}
      </div>

      <p className="text-[10px] font-bold text-white truncate text-center">{unit.name}</p>
      <HpBar current={unit.currentHp} max={unit.maxHp} isEnemy={unit.isEnemy} />

      {/* Status effects */}
      {unit.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
          {unit.statusEffects.map((e, i) => (
            <span key={`${e.type}-${i}`} className="text-[10px]" title={`${e.type} (${e.duration}t)`}>
              {statusIcons[e.type]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function TurnOrderBar({ turnOrder, allUnits, currentIndex }: {
  turnOrder: string[]
  allUnits: BattleUnit[]
  currentIndex: number
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 bg-black/40 rounded-lg">
      <span className="text-[9px] text-white/30 mr-1 shrink-0">TURN</span>
      {turnOrder.map((id, idx) => {
        const unit = allUnits.find(u => u.id === id)
        if (!unit || !unit.isAlive) return null
        const isCurrent = idx === currentIndex
        return (
          <div
            key={`${id}-${idx}`}
            className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
              isCurrent
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 scale-110'
                : unit.isEnemy
                ? 'border-red-500/40 bg-red-500/10 text-red-400'
                : 'border-blue-500/40 bg-blue-500/10 text-blue-400'
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

  const lastEntries = log.slice(-12)

  return (
    <div ref={logRef} className="h-24 overflow-y-auto px-2 py-1 bg-black/30 rounded-lg space-y-0.5">
      {lastEntries.map((entry, i) => (
        <p key={i} className={`text-[10px] leading-tight ${
          entry.type === 'death' ? 'text-red-400 font-bold' :
          entry.isCrit ? 'text-yellow-300' :
          entry.healing ? 'text-green-400' :
          entry.statusApplied ? 'text-purple-400' :
          entry.statusRemoved ? 'text-white/30' :
          'text-white/50'
        }`}>
          {entry.message}
        </p>
      ))}
      {lastEntries.length === 0 && (
        <p className="text-[10px] text-white/20 text-center mt-4">Battle begins...</p>
      )}
    </div>
  )
}

export default function BattlePage({ playerTeam, enemyTeam, title, onResult }: BattlePageProps) {
  const [battleState, setBattleState] = useState<BattleState>(() =>
    initBattle([...playerTeam], [...enemyTeam])
  )
  const [phase, setPhase] = useState<'intro' | 'battle' | 'result'>('intro')
  const [autoMode, setAutoMode] = useState(false)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 3x
  const [floatingTexts, setFloatingTexts] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allUnits = [...battleState.playerTeam, ...battleState.enemyTeam]
  const currentUnit = getCurrentUnit(battleState)
  const isPlayerTurn = currentUnit && !currentUnit.isEnemy && currentUnit.isAlive

  const showFloatingText = useCallback((unitId: string, text: string) => {
    setFloatingTexts(prev => ({ ...prev, [unitId]: text }))
    setTimeout(() => {
      setFloatingTexts(prev => {
        const next = { ...prev }
        delete next[unitId]
        return next
      })
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

    // Auto-pick target
    let targetId = ''
    if (skillIndex === -1 || !skill) {
      // Basic attack — target lowest HP enemy
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

  // ----- INTRO SCREEN -----
  if (phase === 'intro') {
    const playerPower = playerTeam.reduce((s, u) => s + u.atk * 2 + u.maxHp * 0.5 + u.def, 0)
    const enemyPower = enemyTeam.reduce((s, u) => s + u.atk * 2 + u.maxHp * 0.5 + u.def, 0)

    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white">{title}</h2>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Your Team</p>
              <div className="flex gap-1 justify-center mb-2">
                {playerTeam.map(u => (
                  <div key={u.id} className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <span className="text-xs">{u.role === 'offensive' ? '⚔️' : u.role === 'defensive' ? '🛡️' : '✨'}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg font-mono font-bold text-yellow-300">{Math.round(playerPower).toLocaleString()}</p>
            </div>
            <span className="text-2xl text-white/30">VS</span>
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Enemy</p>
              <div className="flex gap-1 justify-center mb-2">
                {enemyTeam.map(u => (
                  <div key={u.id} className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <span className="text-xs">{u.role === 'offensive' ? '⚔️' : u.role === 'defensive' ? '🛡️' : '✨'}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg font-mono font-bold text-red-400">{Math.round(enemyPower).toLocaleString()}</p>
            </div>
          </div>

          <button
            onClick={() => setPhase('battle')}
            className="px-10 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:brightness-110 transition text-sm"
          >
            FIGHT!
          </button>
        </div>
      </div>
    )
  }

  // ----- RESULT SCREEN -----
  if (phase === 'result') {
    const won = battleState.phase === 'victory'

    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="text-6xl">{won ? '🏆' : '💀'}</div>
          <h2 className={`text-3xl font-bold ${won ? 'text-yellow-300' : 'text-red-400'}`}>
            {won ? 'VICTORY!' : 'DEFEATED'}
          </h2>

          <div className="text-sm text-white/40">
            <p>Turns: {battleState.turn} | Actions: {battleState.log.length}</p>
          </div>

          {/* Surviving heroes */}
          {won && (
            <div className="flex justify-center gap-2">
              {battleState.playerTeam.filter(u => u.isAlive).map(u => (
                <div key={u.id} className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-1">
                    <span className="text-xs">{u.role === 'offensive' ? '⚔️' : u.role === 'defensive' ? '🛡️' : '✨'}</span>
                  </div>
                  <p className="text-[9px] text-white/40">{u.name}</p>
                </div>
              ))}
            </div>
          )}

          {!won && (
            <p className="text-sm text-white/40">Upgrade your team and try again</p>
          )}

          <button
            onClick={() => onResult(won)}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-xl hover:brightness-110 transition text-sm"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ----- BATTLE SCREEN -----
  return (
    <div className="fixed inset-0 bg-[#0a060f] z-50 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/60 border-b border-white/10">
        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30">Turn {battleState.turn}</span>
          <button
            onClick={() => setSpeed(s => s >= 3 ? 1 : s + 1)}
            className="px-2 py-0.5 text-[10px] font-bold rounded bg-white/10 text-white/60 hover:text-white transition"
          >
            {speed}x
          </button>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
              autoMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/10 text-white/60'
            }`}
          >
            AUTO
          </button>
        </div>
      </div>

      {/* Turn order */}
      <div className="px-2 py-1">
        <TurnOrderBar
          turnOrder={battleState.turnOrder}
          allUnits={allUnits}
          currentIndex={battleState.currentUnitIndex}
        />
      </div>

      {/* Enemy team */}
      <div className="px-2 py-2">
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-[9px] text-red-400/60 uppercase tracking-wider font-bold">Enemy</span>
        </div>
        <div className={`grid gap-1.5 ${
          battleState.enemyTeam.length <= 3 ? 'grid-cols-3' : battleState.enemyTeam.length === 4 ? 'grid-cols-4' : 'grid-cols-5'
        }`}>
          {battleState.enemyTeam.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isActive={currentUnit?.id === unit.id}
              floatingText={floatingTexts[unit.id] || null}
            />
          ))}
        </div>
      </div>

      {/* VS divider */}
      <div className="flex items-center px-4 py-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="px-3 text-[10px] text-white/20">VS</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Player team */}
      <div className="px-2 py-2">
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-[9px] text-blue-400/60 uppercase tracking-wider font-bold">Your Team</span>
        </div>
        <div className={`grid gap-1.5 ${
          battleState.playerTeam.length <= 3 ? 'grid-cols-3' : battleState.playerTeam.length === 4 ? 'grid-cols-4' : 'grid-cols-5'
        }`}>
          {battleState.playerTeam.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              isActive={currentUnit?.id === unit.id}
              floatingText={floatingTexts[unit.id] || null}
            />
          ))}
        </div>
      </div>

      {/* Battle log */}
      <div className="px-2 flex-1 min-h-0">
        <BattleLog log={battleState.log} />
      </div>

      {/* Skill bar */}
      <div className="px-2 py-2 bg-black/60 border-t border-white/10">
        {isPlayerTurn && !autoMode ? (
          <div className="space-y-1.5">
            <p className="text-[9px] text-yellow-400/60 uppercase tracking-wider text-center">
              {currentUnit?.name}'s Turn
            </p>
            <div className="flex gap-1.5">
              {/* Basic attack */}
              <button
                onClick={() => handleSkillUse(-1)}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-white/80 hover:bg-white/15 transition disabled:opacity-30"
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
                        ? 'bg-white/[0.02] border-white/5 text-white/20'
                        : skill.type === 'heal' || skill.type === 'aoe_heal'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                        : skill.type === 'buff'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                        : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    }`}
                    title={skill.description}
                  >
                    <span className="block truncate text-[10px]">{skill.name}</span>
                    {onCd && <span className="text-[8px] text-white/30">CD:{skill.currentCd}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-[10px] text-white/30 animate-pulse">
              {autoMode ? 'Auto-battling...' : `${currentUnit?.name || 'Enemy'} is acting...`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
