import { useState, useMemo, useEffect } from 'react'
import { useGameStore } from '@/lib/store'
import { generateDailyShop, getFixedItems, getPremiumItems, ShopItem } from '@/lib/shop-data'
import { useNotifications } from '@/lib/notifications'

const categoryData = [
  { key: 'daily' as const, label: 'Daily Deals', icon: '🎁', gradient: 'from-orange-500/20 to-yellow-500/10' },
  { key: 'fixed' as const, label: 'Standard', icon: '🛒', gradient: 'from-blue-500/20 to-cyan-500/10' },
  { key: 'premium' as const, label: 'Premium', icon: '👑', gradient: 'from-purple-500/20 to-pink-500/10' },
]

type Category = 'daily' | 'fixed' | 'premium'

const rewardIcons: Record<string, string> = { energy: '⚡', shards: '💎', gear: '🗡️', hero: '🧬' }
const rewardLabels: Record<string, string> = { energy: 'Energy', shards: 'Shards', gear: 'Gear', hero: 'Hero' }

function CountdownTimer({ targetMs }: { targetMs: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, targetMs - Date.now()))

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, targetMs - Date.now()))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetMs])

  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return (
    <span className="text-xs font-mono text-yellow-400 tabular-nums">
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  )
}

function ShopItemCard({
  item,
  purchased,
  canAfford,
  onBuy,
  index,
  isPremium,
}: {
  item: ShopItem
  purchased: boolean
  canAfford: boolean
  onBuy: () => void
  index: number
  isPremium: boolean
}) {
  const [buying, setBuying] = useState(false)

  const handleBuy = () => {
    setBuying(true)
    setTimeout(() => {
      onBuy()
      setBuying(false)
    }, 300)
  }

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all animate-[fade-up_0.4s_ease-out] ${
        purchased
          ? 'border-white/5 bg-white/[0.02] opacity-40 scale-[0.98]'
          : buying
          ? 'border-yellow-400/50 bg-yellow-500/10 scale-[1.02]'
          : isPremium
          ? 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10'
          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 hover:shadow-lg hover:shadow-black/20'
      }`}
      style={{ animationDelay: `${0.1 + index * 0.06}s`, animationFillMode: 'backwards' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
            isPremium
              ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-purple-400/30 shadow-inner shadow-purple-500/10'
              : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10'
          }`}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
              {isPremium && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold shrink-0">PREMIUM</span>}
            </div>
            <p className="text-[10px] text-white/40 mt-0.5">{item.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs">{rewardIcons[item.rewardType]}</span>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">{rewardLabels[item.rewardType]}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span className="text-purple-400 text-xs">💎</span>
            <span className={`text-sm font-mono font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
              {item.cost.toLocaleString()}
            </span>
          </div>
          {purchased ? (
            <span className="text-[10px] text-green-400/60 font-bold px-3 py-1.5">✓ PURCHASED</span>
          ) : (
            <button
              onClick={handleBuy}
              disabled={!canAfford || buying}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                canAfford
                  ? isPremium
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:brightness-110 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20'
                    : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              Buy
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopPage({ onBack }: { onBack: () => void }) {
  const { aetherShards, shopPurchasesToday, refreshDailyShop, purchaseShopItem, shopLastRefresh } = useGameStore()
  const { addToast } = useNotifications()
  const [category, setCategory] = useState<Category>('daily')

  refreshDailyShop()

  const dailyItems = useMemo(() => generateDailyShop(shopLastRefresh || Date.now()), [shopLastRefresh])
  const fixedItems = useMemo(() => getFixedItems(), [])
  const premiumItems = useMemo(() => getPremiumItems(), [])

  const currentItems = category === 'daily' ? dailyItems : category === 'fixed' ? fixedItems : premiumItems
  const nextRefresh = (shopLastRefresh || Date.now()) + 86400000

  const handleBuy = (item: ShopItem) => {
    const success = purchaseShopItem(item)
    if (success) {
      addToast({ type: 'reward', title: `Purchased ${item.name}!`, message: `Received ${rewardLabels[item.rewardType]}`, icon: item.icon })
    }
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Shop</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400 text-sm">💎</span>
          <span className="text-sm font-mono font-bold text-white">{aetherShards.toLocaleString()}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-white/10 px-2">
        {categoryData.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 ${
              category === c.key
                ? 'text-white border-yellow-400 bg-white/5'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            <span className="mr-1">{c.icon}</span> {c.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Daily refresh timer */}
        {category === 'daily' && (
          <div className="rounded-xl bg-gradient-to-r from-orange-500/15 to-yellow-500/10 border border-orange-400/30 p-4 flex items-center justify-between animate-[fade-up_0.3s_ease-out]">
            <div>
              <p className="text-xs font-bold text-orange-300 uppercase tracking-wider">Daily Deals</p>
              <p className="text-[10px] text-white/40 mt-0.5">Refreshes in:</p>
            </div>
            <CountdownTimer targetMs={nextRefresh} />
          </div>
        )}

        {category === 'premium' && (
          <div className="rounded-xl bg-gradient-to-r from-purple-500/15 to-pink-500/10 border border-purple-400/30 p-4 text-center animate-[fade-up_0.3s_ease-out]">
            <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">Premium Collection</p>
            <p className="text-[10px] text-white/40 mt-1">Exclusive items with the best value</p>
          </div>
        )}

        {/* Item grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentItems.map((item, i) => (
            <ShopItemCard
              key={item.id}
              item={item}
              purchased={item.category === 'daily' && shopPurchasesToday.includes(item.id)}
              canAfford={aetherShards >= item.cost}
              onBuy={() => handleBuy(item)}
              index={i}
              isPremium={category === 'premium'}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
