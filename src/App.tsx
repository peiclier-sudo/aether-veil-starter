import { useState, useRef, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import RosterPage from './components/RosterPage'
import SummonPortal from './components/SummonPortal'
import TeamBuilder from './components/TeamBuilder'
import CampaignPage from './components/CampaignPage'
import DungeonsPage from './components/DungeonsPage'
import ArenaPage from './components/ArenaPage'
import ResonanceBonds from './components/ResonanceBonds'
import AscensionPage from './components/AscensionPage'
import ShopPage from './components/ShopPage'
import InventoryPage from './components/InventoryPage'
import AchievementsPage from './components/AchievementsPage'
import GuildPage from './components/GuildPage'

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'campaign', label: 'Campaign', icon: '⚔️' },
  { id: 'dungeons', label: 'Dungeons', icon: '🌀' },
  { id: 'arena', label: 'Arena', icon: '🏟️' },
  { id: 'summon', label: 'Summon', icon: '🌟' },
]

function App() {
  const [page, setPage] = useState('home')
  const [transitioning, setTransitioning] = useState(false)
  const [displayedPage, setDisplayedPage] = useState('home')
  const pendingPage = useRef<string | null>(null)

  const navigate = useCallback((target: string) => {
    if (target === displayedPage || transitioning) return
    pendingPage.current = target
    setTransitioning(true)
  }, [displayedPage, transitioning])

  // Handle the fade-out → swap → fade-in cycle
  useEffect(() => {
    if (!transitioning || !pendingPage.current) return
    const timer = setTimeout(() => {
      const next = pendingPage.current!
      pendingPage.current = null
      setPage(next)
      setDisplayedPage(next)
      setTransitioning(false)
    }, 150) // fade-out duration
    return () => clearTimeout(timer)
  }, [transitioning])

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Dashboard onNavigate={navigate} />
      case 'roster':
        return <RosterPage onBack={() => navigate('home')} />
      case 'summon':
        return <SummonPortal onBack={() => navigate('home')} />
      case 'team':
        return <TeamBuilder onBack={() => navigate('home')} />
      case 'campaign':
        return <CampaignPage onBack={() => navigate('home')} onTeamBuilder={() => navigate('team')} />
      case 'arena':
        return <ArenaPage onBack={() => navigate('home')} onTeamBuilder={() => navigate('team')} />
      case 'dungeons':
        return <DungeonsPage onBack={() => navigate('home')} onTeamBuilder={() => navigate('team')} />
      case 'resonance':
        return <ResonanceBonds onBack={() => navigate('home')} />
      case 'ascension':
        return <AscensionPage onBack={() => navigate('home')} />
      case 'shop':
        return <ShopPage onBack={() => navigate('home')} />
      case 'inventory':
        return <InventoryPage onBack={() => navigate('home')} />
      case 'achievements':
        return <AchievementsPage onBack={() => navigate('home')} />
      case 'guild':
        return <GuildPage onBack={() => navigate('home')} />
      default:
        return <Dashboard onNavigate={navigate} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0a060f] flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div
          className="h-full transition-all duration-150 ease-in-out"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(8px) scale(0.99)' : 'translateY(0) scale(1)',
          }}
        >
          {renderPage()}
        </div>
      </div>

      {/* Bottom navigation */}
      <nav className="flex items-center justify-around bg-black/80 backdrop-blur-md border-t border-white/10 py-1 px-2 sticky bottom-0 z-40">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-all ${
              displayedPage === item.id
                ? 'text-yellow-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className={`text-xl transition-transform duration-200 ${displayedPage === item.id ? 'scale-110 -translate-y-0.5' : ''}`}>{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
            {displayedPage === item.id && (
              <div className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5 animate-[scale-in_0.2s_ease-out]" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
