import { useEffect, useRef } from 'react'
import { createHeroScene } from '../game/createHeroScene'
import { useGameStore } from '../stores/game-store'

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sceneReady = useGameStore((state) => state.sceneReady)
  const setSceneReady = useGameStore((state) => state.setSceneReady)

  useEffect(() => {
    if (!canvasRef.current) return

    const cleanup = createHeroScene(canvasRef.current, () => setSceneReady(true))
    return cleanup
  }, [setSceneReady])

  return (
    <section className="rounded-2xl border border-zinc-700 bg-black/40 p-4 shadow-2xl">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-400">
        <span>Hero Stage</span>
        <span>{sceneReady ? 'Scene Ready' : 'Loading Scene...'}</span>
      </div>
      <canvas ref={canvasRef} className="h-[420px] w-full rounded-xl border border-zinc-800 bg-gradient-to-b from-[#10141f] to-[#080b12]" />
      <p className="mt-3 text-sm text-zinc-400">Placeholder hero slot centered for future Meshy GLB import pipeline.</p>
    </section>
  )
}
