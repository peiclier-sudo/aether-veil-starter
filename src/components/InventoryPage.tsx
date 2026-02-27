import { useState, useMemo } from 'react'
import { useGameStore, Gear } from '@/lib/store'
import { GEAR_SELL_VALUES } from '@/lib/shop-data'
import { useNotifications } from '@/lib/notifications'

const rarityColor: Record<string, string> = {
  common: 'border-zinc-500/50 text-zinc-400',
  rare: 'border-blue-400/50 text-blue-400',
  epic: 'border-purple-400/50 text-purple-400',
  legendary: 'border-yellow-400/50 text-yellow-400',
}

const slotIcons: Record<string, string> = {
  weapon: '⚔️', head: '🪖', chest: '🛡️', arms: '🧤',
  legs: '👖', boots: '👢', core1: '💎', core2: '💎',
}

type SortKey = 'rarity' | 'slot' | 'value'
type FilterSlot = 'all' | Gear['slot']
type FilterRarity = 'all' | Gear['rarity']

const rarityOrder: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 }

export default function InventoryPage({ onBack }: { onBack: () => void }) {
  const { inventory, sellGear } = useGameStore()
  const { addToast } = useNotifications()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortKey>('rarity')
  const [filterSlot, setFilterSlot] = useState<FilterSlot>('all')
  const [filterRarity, setFilterRarity] = useState<FilterRarity>('all')

  const filtered = useMemo(() => {
    let items = [...inventory]
    if (filterSlot !== 'all') items = items.filter(g => g.slot === filterSlot)
    if (filterRarity !== 'all') items = items.filter(g => g.rarity === filterRarity)
    items.sort((a, b) => {
      if (sortBy === 'rarity') return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0)
      if (sortBy === 'slot') return a.slot.localeCompare(b.slot)
      return (GEAR_SELL_VALUES[b.rarity] || 0) - (GEAR_SELL_VALUES[a.rarity] || 0)
    })
    return items
  }, [inventory, filterSlot, filterRarity, sortBy])

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(g => g.id)))
  }

  const totalSellValue = useMemo(() => {
    let total = 0
    for (const g of inventory) {
      if (selectedIds.has(g.id)) total += GEAR_SELL_VALUES[g.rarity] || 10
    }
    return total
  }, [selectedIds, inventory])

  const handleSell = () => {
    if (selectedIds.size === 0) return
    const count = selectedIds.size
    const value = sellGear(Array.from(selectedIds))
    setSelectedIds(new Set())
    addToast({ type: 'reward', title: `Sold ${count} Gear`, message: `+${value} shards`, icon: '💎' })
  }

  return (
    <div className="min-h-screen bg-[#0a060f] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 animate-[slide-down_0.3s_ease-out]">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm transition-all hover:-translate-x-0.5">← Back</button>
        <h1 className="text-sm font-bold uppercase tracking-wider">Inventory</h1>
        <span className="text-xs text-white/40">{inventory.length} items</span>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-black/30 border-b border-white/5 space-y-2 animate-[fade-up_0.2s_ease-out]">
        <div className="flex items-center gap-2">
          <select
            value={filterSlot}
            onChange={e => setFilterSlot(e.target.value as FilterSlot)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
          >
            <option value="all">All Slots</option>
            {Object.keys(slotIcons).map(s => (
              <option key={s} value={s}>{slotIcons[s]} {s}</option>
            ))}
          </select>
          <select
            value={filterRarity}
            onChange={e => setFilterRarity(e.target.value as FilterRarity)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
          >
            <option value="all">All Rarity</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
          >
            <option value="rarity">Sort: Rarity</option>
            <option value="slot">Sort: Slot</option>
            <option value="value">Sort: Value</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={selectAll} className="text-xs text-yellow-400 hover:text-yellow-300 transition">
            {selectedIds.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleSell}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20"
            >
              Sell {selectedIds.size} — 💎 {totalSellValue}
            </button>
          )}
        </div>
      </div>

      {/* Gear grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📦</p>
            <p className="text-sm text-white/40">No gear found</p>
            <p className="text-[10px] text-white/30 mt-1">Win battles to earn gear drops</p>
          </div>
        ) : (
          filtered.map((gear, i) => {
            const isSelected = selectedIds.has(gear.id)
            return (
              <button
                key={gear.id}
                onClick={() => toggleSelect(gear.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all hover:brightness-110 animate-[fade-up_0.3s_ease-out] ${
                  isSelected
                    ? 'border-red-400/60 bg-red-500/10 scale-[0.98]'
                    : `${rarityColor[gear.rarity].split(' ')[0]} bg-white/[0.03] hover:bg-white/[0.06]`
                }`}
                style={{ animationDelay: `${0.05 + i * 0.02}s`, animationFillMode: 'backwards' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                    {slotIcons[gear.slot] || '⚙️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${rarityColor[gear.rarity].split(' ')[1]}`}>{gear.name}</span>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-white/10 text-white/40 uppercase">{gear.rarity[0]}</span>
                    </div>
                    <p className="text-[10px] text-white/50">
                      {gear.mainStat.type.toUpperCase()} +{gear.mainStat.value}
                      {gear.subStats.length > 0 && ` • ${gear.subStats.length} subs`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40">💎 {GEAR_SELL_VALUES[gear.rarity]}</p>
                    {isSelected && <span className="text-red-400 text-xs">✓</span>}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
