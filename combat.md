# Ali Baba Combat System Design

## Overview
This document outlines the combat mechanics for the Ali Baba Combat Simulator, inspired by Advanced Dungeons & Dragons rules.

## Background
- Ali Baba appears to be influenced by AD&D mechanics
- We don't have access to the original source code
- Goal: Build a simulator that approximates the original game's combat behavior using AD&D-inspired rules

## Combat Mechanics Discussion

### What We Know About Ali Baba Combat

#### Character Attributes
Ali Baba uses three core attributes:
1. **Strength** - Affects combat effectiveness
2. **Dexterity** - Likely affects hit chance/accuracy
3. **Life Force** - Character's health/hit points
   - Possible mechanic: Low health may penalize combat ability (to be determined)

#### Combat Modes
The game has **two distinct fighting modes** based on positioning:

1. **Adjacent Square Combat** (Melee Range)
   - Character in adjacent square to enemy
   - Uses **Sword**
   - Standard melee combat

2. **Same Square Combat** (Close Quarters)
   - Character occupies same square as enemy
   - Uses **Dagger**
   - Close combat/grappling situation

**Key Implication**: Weapon type (and thus damage) is determined by combat mode, not player choice

#### Weapon Damage
- **Sword**: Used in adjacent combat (damage TBD - map to AD&D weapon)
- **Dagger**: Used in close quarters (damage TBD - map to AD&D weapon)

---

### AD&D Combat Foundation

#### Core Combat Flow (AD&D 1st/2nd Edition)
1. **Determine Surprise** (if applicable)
2. **Determine Initiative** (1d6 per side, or individual initiative in 2nd Ed)
3. **Declare Actions**
4. **Resolve Combat Round**
   - Attack rolls
   - Damage rolls
   - Saving throws
   - Morale checks

#### Key Mechanics
- **THAC0 (To Hit Armor Class 0)**: Lower level = higher THAC0
  - Attack roll: 1d20 + modifiers ≥ (THAC0 - target AC)
- **Armor Class**: Descending scale (10 = unarmored, lower = better)
- **Damage**: Varies by weapon (e.g., 1d8 for longsword, 1d4 for dagger)
- **Hit Points**: Determined by class hit dice + CON modifier

---

#### Combat Actions & Flow

When adjacent to an enemy, a character has the following options:

**1. Attack (Adjacent/Sword)**
- Standard melee attack using sword
- Normal hit mechanics apply

**2. Defend**
- Defensive stance
- Likely grants defensive bonus (either boost to defense roll OR penalty to attacker)
- Passive action

**3. Jump/Wrestle (Enter Same Square)**
- Attempt to close to same square as enemy
- Changes combat mode to close quarters (dagger)
- **Can fail** - likely requires Dexterity check
- May grant tactical advantage (knock enemy off balance?)
- Game text: "jump up and wrestling with the foe"

**4. Disengage (Leave Same Square)**
- Attempt to back away from close quarters combat
- **Can fail** - likely requires Dexterity check
- Used tactically by AI (jump away, then jump back in)

#### Observations
- AI uses jump/disengage tactics, suggesting there's strategic advantage
- Both wrestling and disengaging can fail, pointing to skill checks (DEX-based)
- Possible advantage to initiating close quarters combat
- Defend action modifies combat math somehow

#### Turn-Based Combat System

**Ali Baba uses turn-based rounds**. On each turn, available actions depend on combat state:

**Close Quarters Combat** (same square as enemy):
- **Attack** (with dagger)
- **Defend**
- **Disengage** (attempt to back away - can fail)

**Adjacent Combat** (next to enemy, different square):
- **Attack** (with sword)
- **Defend**
- **Tackle** (attempt to enter close quarters - can fail)
- **Run Away** (ends combat - defeat but survival)

#### Combat Resolution (Black Box)

**All dice rolls are hidden** - combat mechanics happen under the hood. Players only see results (hit/miss, damage dealt).

**Attack Resolution**:
1. Determine if attack hits (likely DEX-based to-hit roll vs. target defense)
2. If hit, calculate damage: `f(STR, Weapon Power) - Armor Class`
3. Apply damage to target's Life Force

#### Armor System

Armor provides **Armor Class (AC)** but **penalizes Dexterity**.

**Observed Armor Types**:
| Armor Type | Armor Class | DEX Penalty |
|------------|-------------|-------------|
| Leather/Wood | ~1 | ~1 |
| Chainmail | ~3 | Moderate |
| Plate | ~5 | ~5+ |

**Armor Mechanics**:
- AC reduces incoming damage
- DEX penalty reduces combat effectiveness (hit chance, maneuver success)
- Armor does NOT degrade/break during combat

#### Weapon System

**Weapon Properties**:
- **Type**: Sword (long range/adjacent) or Dagger (short range/close quarters)
- **Power**: Numeric value affecting damage output

**Observed Weapon Power Ranges**:
- **Swords**: Up to ~14
- **Daggers**: Up to ~11-12 (slightly weaker)

**Special Mechanic - Weapon Impale** *(to be implemented later)*:
- Rare critical hit condition
- Deals maximum or near-maximum damage
- Weapon **breaks** after impaling
- Weapon Power reduced to very low value (weapon unusable/severely weakened)

#### Character Stat Ranges

Based on observed gameplay:
- **Life Force**: 1-26 (hit points)
- **Strength**: 1-20 (affects damage output)
- **Dexterity**: 1-24 (affects hit chance, maneuvers)
  - Modified by armor penalties

## Data Structures Needed

### Armor Type
```typescript
{
  name: string
  armorClass: number
  dexterityPenalty: number
}
```

### Weapon Type
```typescript
{
  name: string
  weaponType: "sword" | "dagger"  // determines range (long/short)
  power: number
}
```

### Character Type
```typescript
type CharacterType = "dwarf" | "halfling" | "human" | "elf"
```

### Character Combat Stats
```typescript
{
  characterType: CharacterType
  strength: number        // 1-20
  baseDexterity: number   // 1-24
  lifeForce: number       // current HP
  maxLifeForce: number    // maximum HP (up to ~26)
  weapon: Weapon
  armor: Armor
  isUnconscious: boolean  // true when below HP threshold
  
  // Computed:
  effectiveDexterity: number  // baseDexterity - armor.dexterityPenalty
}
```

---

## Character Types & Combat Bonuses

Ali Baba has different **character types** (dwarf, halfling, human, elf) that receive specific combat bonuses.

### Character Type Bonuses

#### Halfling
- **High Dexterity** (dodge well, hard to hit)
- **High Hit Points** (typically high Life Force)
- **Enjoy close fighting**: Bonus in close quarters combat (TBD: +hit? +damage?)

#### Elf
- **High Dexterity** (dodge well, hard to hit)
- **Fast** (movement - not relevant for combat simulator)
- **Weak**: Lower hit points/Life Force
- **Enjoy close fighting**: Bonus in close quarters combat (TBD: +hit? +damage?)

#### Dwarf
- **More damage with axes and swords**: Bonus when using sword (adjacent combat)
- **Hit more often in close combat**: Bonus to-hit when in close quarters

#### Human
- **More damage with axes and swords**: Bonus when using sword (adjacent combat)

### Combat Bonus Implementation

**Character types get conditional bonuses**:
- Some get bonuses based on **weapon type** (swords/axes vs daggers)
- Some get bonuses based on **combat range** (close quarters vs adjacent)
- Bonuses could be:
  - To-hit bonus (add to attack roll)
  - Damage bonus (add to damage calculation)
  
**Design Decision Needed**: Exact values for these bonuses (suggest: +2 to +5 range for balance)

## Questions to Address
1. What are the tactical advantages of wrestling vs. adjacent combat? (just weapon type, or other bonuses?)
2. What exact bonuses do character types get? (values TBD)
3. Unconscious threshold? (10% of max HP? Fixed value?)
4. Wake-up roll mechanics for unconscious characters?
5. Attacking unconscious: auto-hit or just no defense roll?
6. DEX modifier: raw DEX or scaled down?
7. Defend action bonus value? (currently +5, needs playtesting)
8. Do critical hits exist beyond weapon impale mechanic?

---

## Combat System Design Decisions

### Initiative System ✅ DECIDED
**DEX-based roll at START of combat, then alternating turns**
- Each combatant rolls ONCE: `1d20 + DEX_modifier`
- Higher roll acts first
- After initial turn, combat alternates back-and-forth
- Matches observed game behavior

### Turn Structure ✅ CONFIRMED
**Important**: Tackle and Disengage do NOT end your turn!

**Turn Flow**:
1. Attempt maneuver (Tackle/Disengage) if desired
2. Maneuver succeeds or fails (changes combat state)
3. Regardless of outcome, you can then Attack or Defend

**Examples**:
- "I Tackle → Success → Now in close quarters → Attack with dagger"
- "I Tackle → Fail → Still adjacent → Attack with sword"
- "I Disengage → Success → Now adjacent → Attack with sword"
- "I Disengage → Fail → Still close quarters → Defend"

### To-Hit Mechanics ✅ DECIDED

**Opposed Rolls System**:
```
Attacker Roll: 1d20 + attacker_effective_DEX
Defender Roll: 1d20 + defender_effective_DEX + defend_bonus

If attacker_roll > defender_roll: HIT
Otherwise: MISS
```

**Defend Bonus**: +5 (tentative - needs playtesting to balance)

**Notes**:
- effective_DEX = base_DEX - armor_DEX_penalty
- Defender gets bonus only if they chose "Defend" action
- Clean system, no complex modifier stacking

### Damage Calculation ✅ DECIDED

**Formula**:
```
raw_damage = random(1, STR) + weapon_power
final_damage = max(0, raw_damage - target_AC)
```

**Where**:
- `random(1, STR)` = random integer between 1 and STR (inclusive)
- `weapon_power` = static value from weapon (11-14 for swords, ~11 for daggers)
- `target_AC` = target's Armor Class
- Minimum damage = 0 (heavy armor can completely negate weak hits)

**Reasoning**:
- Weapon Power represents consistent weapon quality
- STR roll represents swing effectiveness/effort
- Armor Class directly reduces damage, making heavy armor very effective against weak attackers

### Tackle/Disengage Mechanics ✅ DECIDED

**Opposed DEX Rolls**:
```
Attacker Roll: 1d20 + attacker_effective_DEX
Defender Roll: 1d20 + defender_effective_DEX

If attacker_roll > defender_roll: SUCCESS
Otherwise: FAIL
```

**Notes**:
- Opponent's DEX matters (observed in gameplay)
- Uses same opposed roll system as combat
- Character remains in original position if maneuver fails

### Low HP / Unconscious Mechanics ✅ DECIDED

**Observed Behavior**:
- Characters can land heavy blows even when heavily damaged
- Game displays "feeling rather weak" message at certain HP threshold (~50%?)
- This message indicates combat penalty when wounded

**"Weak" Status** (below 50% Life Force):
- Combatant is flagged as weak when `currentLifeForce < maxLifeForce * 0.5`
- **Combat Penalty**: -3 to effective STR for damage calculation
  - When weak: `effectiveStrength = max(1, strength - 3)`
  - This reduces the STR component in damage formula: `random(1, effectiveStrength) + weapon_power - target_AC`
- Weak combatants deal less damage but can still attack normally
- DEX is not affected (to-hit rolls remain unchanged)

**Unconscious Threshold** (below 10% Life Force):
- Character falls unconscious when `currentLifeForce <= maxLifeForce * 0.1`
- While unconscious:
  - **Cannot take actions** (no attack/defend/maneuver)
  - **Rolls each turn to wake up** (1d20, need 10+ to wake)
  - If successful: regains consciousness, can act normally
  - If failed: remains unconscious
  
**Attacking Unconscious Targets**:
- **No opposing DEX roll** from unconscious defender (defender roll = 0)
- Effectively auto-hit (attacker roll just needs >0)
- Normal damage calculation applies

**Open Questions**: 
- Wake-up roll mechanics (currently: 1d20 >= 10, may need adjustment)

---

## Remaining Design Questions

### DEX Modifier for Rolls
Currently using raw DEX values in rolls. Should we scale them?

**Options**:
- **Option A**: Use raw DEX (simpler, DEX 1-24 directly added to d20)
- **Option B**: D&D-style modifier: `(DEX - 10) / 2` rounded down
- **Option C**: Scale down: `DEX / 5` rounded down

**Consideration**: With raw DEX (Option A), a DEX 24 character vs DEX 1 character has huge advantage (+23 on 1d20 roll). This might be intended given the wide stat range.

**Recommendation**: Start with Option A (raw DEX) and adjust if combat feels unbalanced.

### Character Type Bonus Values

Need to determine exact bonus amounts:
- **Halfling close quarters bonus**: +? to hit or +? damage
- **Elf close quarters bonus**: +? to hit or +? damage  
- **Dwarf sword damage bonus**: +? damage
- **Dwarf close quarters hit bonus**: +? to hit
- **Human sword damage bonus**: +? damage

**Recommendation**: Start with +3 to +5 range, playtest and adjust.

**Recommendation**: Start with +3 for damage bonuses, +2 for hit bonuses, playtest and adjust.

---

## Implementation Roadmap

### Phase 1: Core 1v1 Combat System

**Scope**:
- **1v1 combat only** (single character vs single creature)
- Pre-built characters with fixed default stats
- Pre-built creatures with fixed stats
- Turn-based combat with initial initiative, then alternating turns
- Full action system (Attack, Defend, Tackle, Disengage, Run Away)
- Combat continues until defeat, unconsciousness, or retreat

**Interface** (Single-page HTML/JavaScript):
1. Welcome screen
2. **Choose Character** (from pre-built list)
3. **Choose Creature** (from pre-built list)
4. **Combat View**:
   - Display both combatants' stats (STR, DEX, Life Force, weapon, armor)
   - Stats update in real-time as combat progresses
   - Show current combat state (adjacent vs close quarters)
   - Action buttons based on current state
   - Combat log showing what happens each turn

**Creature AI**: 
- Primarily attacks (90%+ of the time)
- Rarely defends
- Uses tackle/disengage tactically when appropriate

**Combat Flow**:
1. Select character & creature
2. Roll initiative (DEX-based, determines who goes first)
3. Turns alternate back-and-forth
4. Each turn: choose action → resolve → update stats
5. End when someone dies, falls unconscious, or runs away

### Phase 2: Equipment System (Stretch Goal)

**Equipment Customization**:
- Ability to equip different weapons and armor
- **Equipment has VALUE RANGES** (not fixed stats):
  - Example: Plate Armor = 5-7 AC (random when equipped)
  - Example: Steel Sword = 12-14 Power (random when equipped)
- Each equipment type has min/max values
- Random roll within range when equipped
- Can switch equipment before combat

**Equipment Types to Define**:
- **Armor**: Leather, Wood, Chainmail, Plate (each with AC range & DEX penalty range?)
- **Swords**: Various types with Power ranges
- **Daggers**: Various types with Power ranges

### Phase 3: Character Creation (Stretch Goal)

**Options**:
- Build custom character (assign stat points)
- **Roll random character** (3d6 or similar for each stat)
- Choose character type (dwarf, halfling, human, elf)
- Generates character with randomized stats within reasonable ranges

### Phase 4: Advanced Features (Future)

- Multiple creature combat (1 vs many)
- Multiple character combat (party vs enemies)
- Weapon impale mechanic (critical hits, weapon breaking)
- Position tracking (which square characters occupy)
- Combat history/statistics tracking

---

### Open Questions
1. Should initiative re-roll each round, or determine once? (Current: determine once, then alternate)
2. Do critical hits exist (natural 20)? Critical failures (natural 1)?

---

## Notes
*Discussion started: January 27, 2026*
