# Aether Veil: Luminara Echoes – Combat & Champion System v1.1
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

## 2. Combat Flow (Turn-by-Turn – Cooldown Only)
- **No energy at all**.
- Turn Meter fills every tick = SPD / 100.
- When a hero reaches 100 → they act (3D camera orbits hero, particles glow on skin/outfit).
- **Basic Attack**: always available (0 cooldown, 1.0× multiplier).
- **Skills**: fixed cooldown in turns (count down at end of every full round).
- Ultimate is a high-CD skill (6–8 turns).
- After action, turn meter resets to 0.
- **Aether Resonance**: bonded heroes filling the meter together trigger team burst when full (visual luminous explosion across all heroes).

This makes timing cooldowns the core skill expression – fast, strategic, and perfect for auto + manual play.

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
