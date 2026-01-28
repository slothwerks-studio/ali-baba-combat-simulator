# Phase 1: Build Core 1v1 Combat Simulator Interface

## Overview
Build a single-page combat simulator for the Ali Baba game based on the combat system documented in `combat.md`. This is a turn-based 1v1 combat system with character selection, creature selection, and real-time stat tracking.

## Tech Stack
- **HTML/CSS/JavaScript** (or TypeScript if preferred)
- Single-page application (no routing needed)
- Vanilla JS is fine, or use a simple framework if it makes sense
- Clean, readable UI with real-time stat updates

## Reference Documentation
All combat mechanics, formulas, and data structures are documented in `combat.md`. Key sections:
- Combat System Design Decisions (initiative, to-hit, damage formulas)
- Character Types & Combat Bonuses
- Data Structures Needed
- Turn Structure and Action Flow

## File Structure
```
/src
  /types
    - combat.ts (or .js)      # Type definitions
  /data
    - characters.ts           # Pre-built character data
    - creatures.ts            # Pre-built creature data
    - equipment.ts            # Weapon and armor definitions
  /combat
    - engine.ts               # Core combat logic
    - dice.ts                 # Random number generation utilities
  /ui
    - index.html              # Main interface
    - styles.css              # Styling
    - app.ts                  # UI controller
```

## Data Structures (TypeScript/JavaScript)

### Core Types
```typescript
type CharacterType = "dwarf" | "halfling" | "human" | "elf";
type CreatureType = "thief" | "other";
type CombatantType = CharacterType | CreatureType;
type WeaponType = "sword" | "dagger";
type CombatRange = "adjacent" | "close_quarters";

interface Armor {
  name: string;
  armorClass: number;
  dexterityPenalty: number;
}

interface Weapon {
  name: string;
  weaponType: WeaponType;
  power: number;
}

interface Combatant {
  name: string;
  type: CombatantType;  // Can be CharacterType or CreatureType
  strength: number;           // 1-20
  baseDexterity: number;      // 1-24
  maxLifeForce: number;       // max HP (up to ~26)
  currentLifeForce: number;   // current HP
  sword: Weapon;              // Used in adjacent combat
  dagger: Weapon;             // Used in close quarters combat
  armor: Armor;
  isUnconscious: boolean;
  
  // Computed properties
  effectiveDexterity: number; // baseDexterity - armor.dexterityPenalty
  isWeak: boolean;           // currentLifeForce < maxLifeForce * 0.5
}

interface CombatState {
  player: Combatant;
  enemy: Combatant;
  range: CombatRange;        // "adjacent" or "close_quarters"
  currentTurn: "player" | "enemy";
  playerGoesFirst: boolean;  // determined by initiative
  combatLog: string[];
  isGameOver: boolean;
  victor: "player" | "enemy" | "fled" | null;
}
```

## Pre-Built Data

### Characters (create 3-4 diverse characters)
Example:
```javascript
const CHARACTERS = [
  {
    name: "Thorin the Dwarf",
    type: "dwarf",
    strength: 18,
    baseDexterity: 12,
    maxLifeForce: 22,
    sword: { name: "Steel Sword", weaponType: "sword", power: 13 },
    dagger: { name: "Iron Dagger", weaponType: "dagger", power: 10 },
    armor: { name: "Chainmail", armorClass: 3, dexterityPenalty: 2 }
  },
  {
    name: "Pippin the Halfling",
    type: "halfling",
    strength: 10,
    baseDexterity: 20,
    maxLifeForce: 24,
    sword: { name: "Short Sword", weaponType: "sword", power: 10 },
    dagger: { name: "Stiletto", weaponType: "dagger", power: 9 },
    armor: { name: "Leather Armor", armorClass: 1, dexterityPenalty: 1 }
  },
  {
    name: "Legolas the Elf",
    type: "elf",
    strength: 12,
    baseDexterity: 22,
    maxLifeForce: 16,
    sword: { name: "Elven Blade", weaponType: "sword", power: 12 },
    dagger: { name: "Elven Dagger", weaponType: "dagger", power: 11 },
    armor: { name: "Leather Armor", armorClass: 1, dexterityPenalty: 1 }
  },
  {
    name: "Aragorn the Human",
    type: "human",
    strength: 16,
    baseDexterity: 14,
    maxLifeForce: 20,
    sword: { name: "Longsword", weaponType: "sword", power: 14 },
    dagger: { name: "Ranger's Knife", weaponType: "dagger", power: 10 },
    armor: { name: "Chainmail", armorClass: 3, dexterityPenalty: 2 }
  }
];
```

### Creatures (create 3-4 enemies of varying difficulty)
Example:
```javascript
const CREATURES = [
  {
    name: "Goblin Scout",
    type: "thief",
    strength: 8,
    baseDexterity: 16,
    maxLifeForce: 12,
    sword: { name: "Short Blade", weaponType: "sword", power: 8 },
    dagger: { name: "Rusty Dagger", weaponType: "dagger", power: 6 },
    armor: { name: "No Armor", armorClass: 0, dexterityPenalty: 0 }
  },
  {
    name: "Orc Warrior",
    type: "other",
    strength: 16,
    baseDexterity: 10,
    maxLifeForce: 20,
    sword: { name: "Crude Sword", weaponType: "sword", power: 11 },
    dagger: { name: "Jagged Knife", weaponType: "dagger", power: 8 },
    armor: { name: "Hide Armor", armorClass: 2, dexterityPenalty: 1 }
  },
  {
    name: "Troll Berserker",
    type: "other",
    strength: 20,
    baseDexterity: 8,
    maxLifeForce: 26,
    sword: { name: "Great Club", weaponType: "sword", power: 12 },
    dagger: { name: "Troll Claw", weaponType: "dagger", power: 10 },
    armor: { name: "Thick Hide", armorClass: 4, dexterityPenalty: 0 }
  }
];
```

## Combat Mechanics to Implement

### 1. Initiative (Start of Combat)
```javascript
function rollInitiative(combatant) {
  return roll(1, 20) + combatant.effectiveDexterity;
}
// Player vs Enemy - higher roll goes first
// Initiative only rolled ONCE at start, then turns alternate
```

### 2. To-Hit Check (Opposed Rolls)
```javascript
function attackRoll(attacker, defender, isDefending) {
  const attackerRoll = roll(1, 20) + attacker.effectiveDexterity + getAttackBonus(attacker);
  const defenderBonus = isDefending ? 5 : 0;
  const defenderRoll = roll(1, 20) + defender.effectiveDexterity + defenderBonus;
  
  return attackerRoll > defenderRoll;
}

function getAttackBonus(combatant) {
  // Dwarf: +2 to hit in close quarters
  // Other bonuses based on character type (see combat.md)
  return 0; // implement based on character type and range
}
```

### 3. Damage Calculation
```javascript
function calculateDamage(attacker, defender, currentRange) {
  // Get weapon power based on combat range
  // Close quarters uses dagger, adjacent uses sword
  const weaponPower = currentRange === "close_quarters" 
    ? attacker.dagger.power
    : attacker.sword.power;
  
  // Random STR roll
  const effectiveStrength = attacker.isWeak ? Math.max(1, attacker.strength - 3) : attacker.strength;
  const strRoll = roll(1, effectiveStrength);
  
  // Apply damage bonuses
  const damageBonus = getDamageBonus(attacker, currentRange);
  
  // Calculate final damage
  const rawDamage = strRoll + weaponPower + damageBonus;
  const finalDamage = Math.max(0, rawDamage - defender.armor.armorClass);
  
  return finalDamage;
}

function getDamageBonus(combatant, range) {
  // Dwarf: +3 damage with swords (adjacent)
  // Human: +3 damage with swords (adjacent)
  // Halfling: +3 damage in close quarters
  // Elf: +3 damage in close quarters
  return 0; // implement based on combat.md bonuses
}
```

### 4. Maneuver Checks (Tackle/Disengage)
```javascript
function attemptManeuver(attacker, defender) {
  const attackerRoll = roll(1, 20) + attacker.effectiveDexterity;
  const defenderRoll = roll(1, 20) + defender.effectiveDexterity;
  
  return attackerRoll > defenderRoll;
}
```

### 5. Unconscious Check
```javascript
function checkUnconscious(combatant) {
  const threshold = Math.floor(combatant.maxLifeForce * 0.1);
  return combatant.currentLifeForce <= threshold;
}

function attemptWakeUp() {
  return roll(1, 20) >= 10; // 50% chance
}
```

### 6. Utility - Dice Rolling
```javascript
function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

## UI Requirements

### Layout Sections

1. **Character Selection Screen** (initial view)
   - Title: "Ali Baba Combat Simulator"
   - Grid of character cards (show name, type, key stats)
   - Click to select character

2. **Creature Selection Screen** (after character selected)
   - Title: "Choose Your Opponent"
   - Grid of creature cards (show name, difficulty indicator)
   - Click to select creature
   - Back button to reselect character

3. **Combat Screen** (main interface)
   ```
   ┌─────────────────────────────────────────┐
   │     Ali Baba Combat Simulator           │
   ├──────────────────┬──────────────────────┤
   │  PLAYER STATS    │   ENEMY STATS        │
   │  Name: Thorin    │   Name: Goblin       │
   │  Type: Dwarf     │   Type: Goblin       │
   │  HP: 22/22 ████  │   HP: 12/12 ████     │
   │  STR: 18         │   STR: 8             │
   │  DEX: 10 (12-2)  │   DEX: 16            │
   │  Weapon: Sword   │   Weapon: Dagger     │
   │  Armor: Chain(3) │   Armor: None(0)     │
   │                  │                      │
   │  Status: Normal  │   Status: Normal     │
   ├──────────────────┴──────────────────────┤
   │  Combat State: Adjacent Combat          │
   │  Current Turn: YOUR TURN                │
   ├─────────────────────────────────────────┤
   │  ACTIONS:                               │
   │  [Attack] [Defend] [Tackle] [Run Away]  │
   ├─────────────────────────────────────────┤
   │  COMBAT LOG:                            │
   │  > Thorin rolled initiative: 15         │
   │  > Goblin rolled initiative: 12         │
   │  > Thorin goes first!                   │
   │  > ...                                  │
   │  (scrollable, newest at bottom)         │
   └─────────────────────────────────────────┘
   ```

### UI Features

- **Real-time stat updates**: HP bars decrease, stats change as combat progresses
- **Status indicators**: Show "Weak" when HP < 50%, "Unconscious" when below threshold
- **Dynamic action buttons**: 
  - Adjacent: [Attack] [Defend] [Tackle] [Run Away]
  - Close Quarters: [Attack] [Defend] [Disengage] [Run Away]
  - Hide Run Away after first turn if engagement happened
- **Combat log**: Auto-scroll to bottom, show all rolls and outcomes
- **Turn indicator**: Clearly show whose turn it is
- **Victory/Defeat screen**: Show outcome when combat ends
- **Restart button**: Start new combat

### Combat Log Messages (Examples)

```
"Thorin rolled initiative: 15 (DEX: 10)"
"Goblin rolled initiative: 12 (DEX: 16)"
"Thorin goes first!"
"---"
"Thorin's Turn"
"Thorin attacks with sword!"
"Attack roll: 18 (1d20: 14 + DEX: 10)"
"Defense roll: 15 (1d20: 10 + DEX: 16)"
"Hit! Thorin lands a blow!"
"Damage: 16 (STR: 8 + Weapon: 13 - AC: 0) = 16 damage"
"Goblin takes 16 damage! (12 → 0 HP)"
"Goblin is defeated!"
"VICTORY! Thorin wins!"
```

## AI Behavior (Creature Actions)

Simple AI for creature turns:
- 85% chance: Attack
- 10% chance: Defend (if HP < 50%)
- 5% chance: Tactical (Tackle if adjacent, Disengage if close quarters)
- Never runs away

```javascript
function getCreatureAction(creature, range, player) {
  if (creature.isUnconscious) return null;
  
  const rand = Math.random();
  
  if (rand < 0.85) {
    return "attack";
  } else if (rand < 0.95 && creature.currentLifeForce < creature.maxLifeForce * 0.5) {
    return "defend";
  } else {
    return range === "adjacent" ? "tackle" : "disengage";
  }
}
```

## Testing Checklist

- [ ] Character selection works
- [ ] Creature selection works
- [ ] Initiative rolls and determines turn order correctly
- [ ] Combat alternates between player and enemy
- [ ] All actions work: Attack, Defend, Tackle, Disengage, Run Away
- [ ] Action buttons change based on combat range
- [ ] To-hit rolls work with opposed DEX rolls
- [ ] Damage calculation correct (STR + Weapon - AC)
- [ ] Armor DEX penalty applies correctly
- [ ] HP updates in real-time
- [ ] Weak status shows at 50% HP
- [ ] Unconscious triggers at 10% HP
- [ ] Unconscious characters can't act
- [ ] Wake-up rolls work for unconscious
- [ ] Attacking unconscious is auto-hit
- [ ] Combat ends on death/unconscious/flee
- [ ] Victory/defeat screens show correctly
- [ ] Character type bonuses apply (dwarves, halflings, etc.)
- [ ] Combat log shows all relevant information
- [ ] Can restart combat after game ends

## Styling Suggestions

- Clean, readable fonts
- HP bars with color coding (green > 50%, yellow 25-50%, red < 25%)
- Highlight active combatant's turn
- Disable action buttons during enemy turn
- Smooth transitions for stat changes
- Distinct visual states for combat ranges
- Clear visual feedback for actions

## Acceptance Criteria

✅ User can select a pre-built character
✅ User can select a creature opponent  
✅ Initiative determines turn order (once per combat)
✅ Combat alternates between player and AI
✅ All combat mechanics work per combat.md specifications
✅ Stats update in real-time during combat
✅ Combat log shows detailed information about all actions
✅ Game ends appropriately (victory/defeat/flee)
✅ UI is clean, intuitive, and responsive

## Out of Scope (Future Phases)

- Equipment customization
- Character creation/rolling
- Multiple enemies
- Weapon impale mechanic
- Persistent stats/save system

---

**Reference**: All combat formulas and detailed mechanics are in `combat.md`. If anything is unclear, check that document first.
