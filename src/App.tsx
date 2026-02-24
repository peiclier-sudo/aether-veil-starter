import { useState } from 'react'
import Dashboard from './components/Dashboard'
import RosterPage from './components/RosterPage'
import SummonPortal from './components/SummonPortal'
import TeamBuilder from './components/TeamBuilder'
import CampaignPage from './components/CampaignPage'

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'roster', label: 'Champions', icon: '👥' },
  { id: 'campaign', label: 'Campaign', icon: '⚔️' },
  { id: 'summon', label: 'Summon', icon: '🌟' },
  { id: 'arena', label: 'Arena', icon: '🏟️' },
]

function ComingSoon({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <div className="flex items-center px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider ml-4">{title}</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🚧</p>
          <p className="text-lg font-bold text-white/60">{title}</p>
          <p className="text-sm text-white/30 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  )
}

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
        return <ComingSoon title="Arena" onBack={() => setPage('home')} />
      case 'dungeons':
        return <ComingSoon title="Dungeons" onBack={() => setPage('home')} />
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
