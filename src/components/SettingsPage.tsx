import { useState } from 'react'
import { useGameStore, getPlayerLevel } from '@/lib/store'
import { useNotifications } from '@/lib/notifications'
import { useAuth } from '@/lib/auth'
import { saveToCloud, loadFromCloud } from '@/lib/cloud-save'

export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const { playerName, setPlayerName, playerXp, heroes, totalBattlesWon, totalSummons, arenaWins, dungeonClears } = useGameStore()
  const { addToast } = useNotifications()
  const { user, configured, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } = useAuth()
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(playerName)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const { level } = getPlayerLevel(playerXp)

  const handleAuth = async () => {
    if (!email || !password) { setAuthError('Email and password required'); return }
    setAuthLoading(true)
    setAuthError(null)
    const fn = authMode === 'login' ? signInWithEmail : signUpWithEmail
    const { error } = await fn(email, password)
    setAuthLoading(false)
    if (error) { setAuthError(error); return }
    setEmail('')
    setPassword('')
    addToast({
      type: 'info',
      title: authMode === 'login' ? 'Signed In!' : 'Account Created!',
      message: authMode === 'login' ? 'Cloud save will sync automatically' : 'Check your email to confirm',
      icon: '🔐',
    })
  }

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    setAuthError(null)
    const { error } = await signInWithGoogle()
    setAuthLoading(false)
    if (error) setAuthError(error)
  }

  const handleSignOut = async () => {
    await signOut()
    addToast({ type: 'info', title: 'Signed Out', message: 'Local progress is still saved', icon: '👋' })
  }

  const handleCloudSave = async () => {
    if (!user) return
    setSyncing(true)
    const { error } = await saveToCloud(user.id)
    setSyncing(false)
    addToast({
      type: error ? 'error' : 'info',
      title: error ? 'Save Failed' : 'Saved to Cloud!',
      message: error || 'Your progress is backed up',
      icon: error ? '❌' : '☁️',
    })
  }

  const handleCloudLoad = async () => {
    if (!user) return
    setSyncing(true)
    const { error, hasData } = await loadFromCloud(user.id)
    setSyncing(false)
    addToast({
      type: error ? 'error' : 'info',
      title: error ? 'Load Failed' : hasData ? 'Cloud Save Loaded!' : 'No Cloud Save',
      message: error || (hasData ? 'Your progress has been restored' : 'Save your game first'),
      icon: error ? '❌' : '☁️',
    })
  }

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPlayerName(nameInput)
      addToast({ type: 'info', title: 'Name Updated', message: `You are now ${nameInput.trim().slice(0, 20)}`, icon: '✏️' })
    }
    setEditingName(false)
  }

  const handleReset = () => {
    localStorage.removeItem('aether-veil-storage')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Settings</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-lg mx-auto w-full">
        {/* Profile section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Profile</h2>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Player Name</p>
                {editingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={20}
                      autoFocus
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-yellow-400/50 w-40"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 active:scale-95 transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNameInput(playerName) }}
                      className="px-3 py-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-white">{playerName}</p>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-[10px] text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-lg border-2 border-yellow-300/60">
                {level}
              </div>
            </div>
          </div>
        </section>

        {/* Account / Auth section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Account</h2>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
            {!configured ? (
              <p className="text-xs text-white/30">Cloud save not configured. Add Supabase env vars to enable.</p>
            ) : user ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm text-white font-medium truncate max-w-[200px]">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-white/10 text-white/60 hover:bg-white/15 active:scale-95 transition-all"
                  >
                    Sign Out
                  </button>
                </div>

                {/* Cloud save controls */}
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={handleCloudSave}
                    disabled={syncing}
                    className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {syncing ? 'Syncing...' : '☁️ Save to Cloud'}
                  </button>
                  <button
                    onClick={handleCloudLoad}
                    disabled={syncing}
                    className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-white/10 text-white hover:bg-white/15 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {syncing ? 'Syncing...' : '⬇️ Load from Cloud'}
                  </button>
                </div>
                <p className="text-[10px] text-white/25 text-center">Auto-saves every 3 seconds while signed in</p>
              </>
            ) : (
              <>
                {/* Auth tabs */}
                <div className="flex border-b border-white/10 -mx-4 px-4">
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(null) }}
                    className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all ${
                      authMode === 'login' ? 'text-white border-yellow-400' : 'text-white/40 border-transparent'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(null) }}
                    className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all ${
                      authMode === 'signup' ? 'text-white border-yellow-400' : 'text-white/40 border-transparent'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-yellow-400/50"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-yellow-400/50"
                  />
                  {authError && <p className="text-xs text-red-400">{authError}</p>}
                  <button
                    onClick={handleAuth}
                    disabled={authLoading}
                    className="w-full py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full py-2.5 text-xs font-bold rounded-lg bg-white/10 text-white hover:bg-white/15 active:scale-95 transition-all disabled:opacity-50"
                  >
                    Continue with Google
                  </button>
                </div>
                <p className="text-[10px] text-white/25 text-center">Sign in to sync progress across devices and enable purchases</p>
              </>
            )}
          </div>
        </section>

        {/* Stats section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Statistics</h2>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Heroes', value: heroes.length, icon: '👥' },
                { label: 'Battles Won', value: totalBattlesWon, icon: '⚔️' },
                { label: 'Total Summons', value: totalSummons, icon: '🌟' },
                { label: 'Arena Wins', value: arenaWins, icon: '🏟️' },
                { label: 'Dungeon Clears', value: dungeonClears, icon: '🌀' },
                { label: 'Player Level', value: level, icon: '📊' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="text-lg">{stat.icon}</span>
                  <div>
                    <p className="text-[10px] text-white/40">{stat.label}</p>
                    <p className="text-sm font-mono font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data management */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Data</h2>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Reset Progress</p>
                <p className="text-[10px] text-white/30">Delete all data and start fresh</p>
              </div>
              {showResetConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-red-500 text-white hover:brightness-110 active:scale-95 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-white/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">About</h2>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">Version</p>
              <p className="text-xs font-mono text-white/70">1.0.0</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">Game</p>
              <p className="text-xs text-white/70">Aether Veil: Luminara Echoes</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
