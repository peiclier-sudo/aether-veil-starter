import { Sparkles } from 'lucide-react'
import { HeroScene } from './components/hero-scene'

export default function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0d14] to-[#171221] text-zinc-100">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:py-14">
        <header className="rounded-2xl border border-amber-400/20 bg-black/30 p-6 shadow-[0_0_40px_rgba(251,191,36,0.08)] backdrop-blur">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
            <Sparkles className="h-3.5 w-3.5" />
            Luminous Runtime Ready
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-amber-50 lg:text-5xl">Aether Veil Starter</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-300 lg:text-base">
            Vite 6, React 19, Babylon.js 8, PWA, Supabase, and Zustand tuned for instant Vercel deployment.
          </p>
        </header>

        <HeroScene />
      </section>
    </main>
  )
}
