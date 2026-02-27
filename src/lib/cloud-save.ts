import { supabase } from './supabase'
import { useGameStore, type PlayerState } from './store'

// Fields that are functions or shouldn't be saved to the cloud
const EXCLUDED_KEYS = new Set([
  'addHero', 'equipGear', 'unequipGear', 'addToInventory', 'removeFromInventory',
  'levelUpHero', 'createResonanceBond', 'setCurrentTeam', 'updateHeroLevel',
  'spendShards', 'spendEnergy', 'addShards', 'addEnergy', 'incrementSummons',
  'completeCampaignStage', 'updateArenaRating', 'ascendHero', 'upgradeSkill',
  'sellGear', 'purchaseShopItem', 'refreshDailyShop', 'claimAchievementReward',
  'updateAchievementProgress', 'incrementDungeonClears', 'createGuild',
  'donateToGuild', 'attackGuildBoss', 'removeHero', 'tickEnergyRegen',
  'checkDailyLogin', 'claimDailyReward', 'incrementBattlesWon',
  'addBattlePassXp', 'unlockPremiumPass', 'claimBattlePassReward',
  'trackDailyQuest', 'claimDailyQuestReward', 'addPlayerXp',
  'completeOnboarding', 'setPlayerName', 'purchaseStarterPack',
])

/** Extract only serializable game state from the Zustand store */
function getSerializableState(): Record<string, unknown> {
  const state = useGameStore.getState() as unknown as Record<string, unknown>
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(state)) {
    if (!EXCLUDED_KEYS.has(key) && typeof state[key] !== 'function') {
      result[key] = state[key]
    }
  }
  return result
}

/** Save current game state to Supabase */
export async function saveToCloud(userId: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' }

  const gameState = getSerializableState()

  const { error } = await supabase
    .from('save_data')
    .upsert({
      user_id: userId,
      game_state: gameState,
      version: 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  return { error: error?.message ?? null }
}

/** Load game state from Supabase and hydrate the Zustand store */
export async function loadFromCloud(userId: string): Promise<{ error: string | null; hasData: boolean }> {
  if (!supabase) return { error: 'Supabase not configured', hasData: false }

  const { data, error } = await supabase
    .from('save_data')
    .select('game_state')
    .eq('user_id', userId)
    .single()

  if (error) return { error: error.message, hasData: false }
  if (!data?.game_state || Object.keys(data.game_state).length === 0) {
    return { error: null, hasData: false }
  }

  // Hydrate store with cloud data
  useGameStore.setState(data.game_state as Partial<PlayerState>)
  return { error: null, hasData: true }
}

/** Debounced auto-save: call this after state changes */
let saveTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleCloudSave(userId: string) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveToCloud(userId).catch(console.error)
  }, 3000) // 3-second debounce
}

/** Flush any pending save immediately (call on logout / tab close) */
export function flushCloudSave(userId: string) {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  saveToCloud(userId).catch(console.error)
}
