import { useState } from 'react'
import Dashboard from './components/Dashboard'
import RosterPage from './components/RosterPage'
import SummonPortal from './components/SummonPortal'
import TeamBuilder from './components/TeamBuilder'
import CampaignPage from './components/CampaignPage'
import DungeonsPage from './components/DungeonsPage'
import ArenaPage from './components/ArenaPage'
import ResonanceBonds from './components/ResonanceBonds'

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'campaign', label: 'Campaign', icon: '⚔️' },
  { id: 'dungeons', label: 'Dungeons', icon: '🌀' },
  { id: 'arena', label: 'Arena', icon: '🏟️' },
  { id: 'summon', label: 'Summon', icon: '🌟' },
]

function App() {
  const [page, setPage] = useState('home')

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Dashboard onNavigate={setPage} />
      case 'roster':
        return <RosterPage onBack={() => setPage('home')} />
      case 'summon':
        return <SummonPortal onBack={() => setPage('home')} />
      case 'team':
        return <TeamBuilder onBack={() => setPage('home')} />
      case 'campaign':
        return <CampaignPage onBack={() => setPage('home')} onTeamBuilder={() => setPage('team')} />
      case 'arena':
        return <ArenaPage onBack={() => setPage('home')} onTeamBuilder={() => setPage('team')} />
      case 'dungeons':
        return <DungeonsPage onBack={() => setPage('home')} onTeamBuilder={() => setPage('team')} />
      case 'resonance':
        return <ResonanceBonds onBack={() => setPage('home')} />
      default:
        return <Dashboard onNavigate={setPage} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0a060f] flex flex-col">
      <div className="flex-1 overflow-hidden">
        {renderPage()}
      </div>

      {/* Bottom navigation */}
      <nav className="flex items-center justify-around bg-black/80 backdrop-blur-md border-t border-white/10 py-1 px-2 sticky bottom-0 z-40">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-all ${
              page === item.id
                ? 'text-yellow-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className={`text-xl transition-transform ${page === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
            {page === item.id && (
              <div className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
