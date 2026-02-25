import { useState, useMemo } from 'react'
import { useGameStore } from '@/lib/store'
import { generateDailyShop, getFixedItems, getPremiumItems, ShopItem } from '@/lib/shop-data'

const categoryLabels = ['Daily Deals', 'Standard', 'Premium'] as const
type Category = 'daily' | 'fixed' | 'premium'

const rewardIcons: Record<string, string> = {
  energy: '⚡',
  shards: '💎',
  gear: '🗡️',
  hero: '🧬',
}

function ShopItemCard({ item, purchased, canAfford, onBuy }: { item: ShopItem; purchased: boolean; canAfford: boolean; onBuy: () => void }) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${
      purchased ? 'border-white/5 bg-white/[0.02] opacity-40' : 'border-white/10 bg-white/5'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center text-2xl">
          {item.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">{item.name}</h4>
          <p className="text-[10px] text-white/40">{item.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs">{rewardIcons[item.rewardType]}</span>
          <span className="text-[10px] text-white/40 uppercase">{item.rewardType}</span>
        </div>
        {purchased ? (
          <span className="text-[10px] text-white/30 px-3 py-1.5">PURCHASED</span>
        ) : (
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              canAfford
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:brightness-110'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            💎 {item.cost}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ShopPage({ onBack }: { onBack: () => void }) {
  const { aetherShards, shopPurchasesToday, refreshDailyShop, purchaseShopItem, shopLastRefresh } = useGameStore()
  const [category, setCategory] = useState<Category>('daily')
  const [buyResult, setBuyResult] = useState<string | null>(null)

  refreshDailyShop()

  const dailyItems = useMemo(() => generateDailyShop(shopLastRefresh || Date.now()), [shopLastRefresh])
  const fixedItems = useMemo(() => getFixedItems(), [])
  const premiumItems = useMemo(() => getPremiumItems(), [])

  const currentItems = category === 'daily' ? dailyItems : category === 'fixed' ? fixedItems : premiumItems

  const handleBuy = (item: ShopItem) => {
    const success = purchaseShopItem(item)
    if (success) {
      setBuyResult(`Purchased ${item.name}!`)
      setTimeout(() => setBuyResult(null), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Shop</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400 text-sm">💎</span>
          <span className="text-sm font-mono text-white">{aetherShards.toLocaleString()}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-white/10 px-4">
        {(['daily', 'fixed', 'premium'] as Category[]).map((cat, i) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 py-3 text-xs font-medium transition border-b-2 ${
              category === cat ? 'text-white border-yellow-400' : 'text-white/40 border-transparent'
            }`}
          >
            {categoryLabels[i]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {category === 'daily' && (
          <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 p-3 text-center mb-2">
            <p className="text-[10px] text-purple-300 uppercase tracking-wider">Daily deals refresh every 24 hours</p>
          </div>
        )}

        {currentItems.map(item => (
          <ShopItemCard
            key={item.id}
            item={item}
            purchased={item.category === 'daily' && shopPurchasesToday.includes(item.id)}
            canAfford={aetherShards >= item.cost}
            onBuy={() => handleBuy(item)}
          />
        ))}
      </div>

      {/* Buy result toast */}
      {buyResult && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-6 py-3 rounded-xl text-sm font-bold z-50 animate-pulse">
          {buyResult}
        </div>
      )}
    </div>
  )
}
