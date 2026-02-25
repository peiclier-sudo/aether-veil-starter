# Aether Veil: Luminara Echoes – Combat & Champion System v1.2
**No Energy System – Pure Cooldown-Based Action (2026 Mature Luminous Edition)**

## 1. Core Stats (Level 1 baseline – scales linearly with level + gear)
| Rarity     | HP   | ATK  | DEF  | SPD  | CRIT_RATE | CRIT_DMG | ACC  | RES  |
|------------|------|------|------|------|-----------|----------|------|------|
| Common     | 880  | 88   | 58   | 95   | 15%       | 150%     | 85   | 85   |
| Rare       | 1080 | 108  | 72   | 104  | 18%       | 160%     | 95   | 95   |
| Epic       | 1350 | 135  | 88   | 110  | 22%       | 172%     | 105  | 105  |
| Legendary  | 1650 | 165  | 105  | 118  | 26%       | 185%     | 115  | 115  |

Role modifiers (applied on top of base):
- Offensive: +15% ATK, +8% SPD, -10% DEF
- Defensive: +25% HP, +20% DEF, -10% ATK
- Support: +18% RES, +15% HP, +12% ACC

> **Implementation**: `battle-engine.ts` → `ROLE_MODIFIERS`, `RARITY_CRIT`, `applyRoleModifiers()`, `getCritForRarity()`

## 2. Combat Flow (Turn-by-Turn – Cooldown Only)
- **No energy at all**.
- Turn Meter fills every tick = SPD / 100.
- When a hero reaches 100 → they act (3D camera orbits hero, particles glow on skin/outfit).
- **Basic Attack**: always available (0 cooldown, 1.0× multiplier).
- **Skills**: fixed cooldown in turns (count down at end of every full round).
- Ultimate is a high-CD skill (6–8 turns).
- After action, turn meter resets to 0.
- **Aether Resonance**: bonded heroes filling the meter together trigger team burst when full (visual luminous explosion across all heroes). *(Not yet implemented — planned for future update)*

This makes timing cooldowns the core skill expression – fast, strategic, and perfect for auto + manual play.

> **Implementation**: `battle-engine.ts` → `computeTurnOrder()` (turn meter simulation), `initBattle()` (meters start at 0), `advanceTurn()` (reset meter after action)

## 3. Damage Formula (exact, copy-paste ready)
```ts
const baseDamage = attacker.ATK * skillMultiplier;
const isCrit = Math.random() < (attacker.CRIT_RATE / 100);
const critMult = isCrit ? (attacker.CRIT_DMG / 100) : 1.0;
const defReduction = defender.DEF / (defender.DEF + 600); // soft cap
const affinityMod = getAffinityMultiplier(attacker.faction, defender.faction); // 1.3 advantage, 0.7 disadvantage, 1.0 neutral
const finalDamage = Math.floor(baseDamage * critMult * (1 - defReduction) * affinityMod * (0.92 + Math.random() * 0.16));
if (finalDamage < 1) finalDamage = 1;
```

> **Implementation**: `battle-engine.ts` → `calculateDamage()` — matches this formula exactly

## 4. Faction Affinity Matrix
| Attacker ↓ \ Defender → | Dawn Sentinels | Veil Walkers | Obsidian Pact | Stormborn |
|--------------------------|----------------|--------------|---------------|-----------|
| **Dawn Sentinels**       | 1.0            | **1.3**      | 0.7           | 1.0       |
| **Veil Walkers**         | 0.7            | 1.0          | **1.3**       | 1.0       |
| **Obsidian Pact**        | 1.0            | 0.7          | 1.0           | **1.3**   |
| **Stormborn**            | **1.3**        | 1.0          | 0.7           | 1.0       |

> **Implementation**: `battle-engine.ts` → `FACTION_ADVANTAGE`, `getAffinityMultiplier()`

## 5. Status Effects
10 status types with duration-based ticking:

| Type       | Category | Effect                                    |
|------------|----------|-------------------------------------------|
| `poison`   | DoT      | Flat damage per turn                      |
| `burn`     | DoT      | Flat damage per turn                      |
| `stun`     | CC       | Skip turn entirely                        |
| `shield`   | Absorb   | Flat HP shield, absorbs damage before HP  |
| `atk_up`   | Buff     | +X% ATK for duration                     |
| `atk_down` | Debuff   | -X% ATK for duration                     |
| `def_up`   | Buff     | +X% DEF for duration                     |
| `def_down` | Debuff   | -X% DEF for duration                     |
| `regen`    | Heal     | Flat HP heal per turn                     |
| `speed_up` | Buff     | +X% SPD for duration                     |

### Status processing order (per turn start):
1. Tick all DoTs (poison, burn) — can kill
2. Tick regen
3. Decrement all durations; remove expired effects
4. Check stun — if stunned, skip action

> **Implementation**: `battle-engine.ts` → `processStatusTicks()`, `getBuffedStat()`, `isStunned()`

### Shield absorption:
Shields absorb damage before HP. Multiple shields stack. Depleted shields auto-remove.

> **Implementation**: `battle-engine.ts` → `applyDamage()`

## 6. Skill Types
| Type         | Target          | Notes                                    |
|--------------|-----------------|------------------------------------------|
| `damage`     | Single enemy    | 1.0× multiplier, may proc status effect  |
| `aoe_damage` | All enemies     | 0.7× of single-target multiplier         |
| `heal`       | Single ally     | ATK × multiplier × 0.8                   |
| `aoe_heal`   | All allies      | ATK × multiplier × 0.5                   |
| `buff`       | Self/ally       | Applies a positive status effect          |
| `debuff`     | Enemy           | Deals 0.6× damage + may proc debuff      |

> **Implementation**: `battle-engine.ts` → `executeTurn()` switch cases

## 7. AI System (Auto-Battle)
Priority-based skill selection for enemy turns and auto-play:
1. **Heal** if any ally below 50% HP → target lowest HP% ally
2. **Use strongest damage skill** (highest multiplier among ready skills) → target lowest HP% enemy
3. **Basic attack** → target lowest current HP enemy

> **Implementation**: `battle-engine.ts` → `aiChooseAction()`, `autoAction()`

## 8. Enemy Templates
All enemies use placeholder model/portrait IDs to be replaced when 3D assets are uploaded.

### Campaign Enemies (9 templates)
- **Chapter 1** (Common): Shade Grunt, Ember Imp, Stone Sentry
- **Chapter 2** (Rare): Void Stalker, Thunder Brute, Crystal Shaman
- **Chapter 3** (Epic): Abyss Knight, Lich Warden, Storm Colossus

### Dungeon Enemies (3 templates)
- Cavern Golem (Rare/Defensive), Shard Wraith (Rare/Offensive), Void Herald (Epic/Offensive)

### Arena Enemies (5 templates)
- Berserker, Sentinel, Oracle, Assassin, Warlord

### Guild Boss
- Single powerful unit with Annihilate (2.0×), Cataclysm (1.3× AoE + burn), Boss Fury (ATK buff)

Enemy scaling formula:
```ts
basePower = hp * 0.3 + atk * 1.5 + def * 1.0 + spd * 2
scale = max(0.3, targetPower / basePower)
// All stats multiplied by scale, role modifiers applied, per-rarity crit used
```

> **Implementation**: `enemy-data.ts` → `scaleTemplate()`, `generateCampaignEnemies()`, `generateDungeonEnemies()`, `generateArenaEnemies()`, `generateGuildBossUnit()`

## 9. Battle UI (BattlePage Component)
- **Intro screen**: Team preview with power comparison
- **Turn order bar**: Shows initiative order with current-unit highlight
- **Unit cards**: HP bars, status effect icons, floating damage/heal numbers, death overlay
- **Skill bar**: Cooldown tracking, color-coded by type (red=damage, green=heal, blue=buff)
- **Controls**: Auto-battle toggle, speed selector (1×/2×/3×)
- **Battle log**: Scrolling action feed with color-coded entries
- **Result screen**: Victory/defeat with surviving hero display

> **Implementation**: `BattlePage.tsx`

## 10. Integration Points
The battle system is used by:
- **Campaign** → `CampaignPage.tsx` — stage enemies scaled by chapter + power
- **Dungeons** → `DungeonsPage.tsx` — floor enemies scaled by floor + power
- **Arena** → `ArenaPage.tsx` — procedural opponents scaled to player rating
- **Guild Boss** → `GuildPage.tsx` — single boss unit with persistent HP

## 11. Placeholder Assets
All model and portrait references follow the pattern:
- Player heroes: `model_{heroId}`, `portrait_{heroId}`
- Enemies: `model_enemy_{name}`, `portrait_enemy_{name}`
- Arena: `model_arena_{role}`, `portrait_arena_{role}`
- Guild boss: `model_guild_boss`, `portrait_guild_boss`

Replace these with actual asset paths when 3D models are uploaded.
