import { useState } from 'react'
import { useGameStore } from '@/lib/store'

const steps = [
  {
    icon: '✨',
    title: 'Welcome to Luminara Echoes',
    body: 'You are the Echo Warden, summoner of heroes from across the fractured realms. Build your team, conquer campaigns, and unravel the mysteries of the Aether Veil.',
  },
  {
    icon: '⚔️',
    title: 'Battle & Conquer',
    body: 'Take on Campaign stages, challenge rivals in the Arena, and delve into Dungeons for powerful loot. Each victory makes your roster stronger.',
  },
  {
    icon: '🌟',
    title: 'Summon Heroes',
    body: 'Spend Aether Shards at the Summon Portal to recruit new heroes. Build a team of 5 across four factions — Dawn Sentinels, Veil Walkers, Obsidian Pact, and Stormborn.',
  },
  {
    icon: '🚀',
    title: 'Ready to Begin!',
    body: 'Start with the Campaign to earn rewards, then check Daily Quests and the Battle Pass for bonus loot. Good luck, Warden!',
  },
]

export default function OnboardingOverlay() {
  const { onboardingComplete, completeOnboarding } = useGameStore()
  const [step, setStep] = useState(0)

  if (onboardingComplete) return null

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-[fade-in_0.4s_ease-out]">
      <div className="max-w-sm w-full bg-gradient-to-b from-[#1a1028] to-[#0a060f] rounded-2xl border border-white/10 p-8 text-center space-y-6 shadow-2xl shadow-purple-500/10">
        <div className="text-6xl animate-[bounce-in_0.5s_ease-out]" key={step}>
          {current.icon}
        </div>
        <h2 className="text-xl font-bold text-white">{current.title}</h2>
        <p className="text-sm text-white/60 leading-relaxed">{current.body}</p>

        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-yellow-400 scale-125' : i < step ? 'bg-yellow-400/40' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 bg-white/10 text-white/70 font-medium text-sm rounded-xl hover:bg-white/20 active:scale-95 transition-all"
            >
              Back
            </button>
          )}
          {isLast ? (
            <button
              onClick={completeOnboarding}
              className="px-8 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm rounded-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              Start Playing!
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              className="px-8 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm rounded-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/20"
            >
              Next
            </button>
          )}
        </div>

        {!isLast && (
          <button
            onClick={completeOnboarding}
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Skip tutorial
          </button>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
