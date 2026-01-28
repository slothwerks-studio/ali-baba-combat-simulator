# Ali Baba Combat Simulator

Turn-based 1v1 combat simulator inspired by the classic Ali Baba game and Advanced Dungeons & Dragons mechanics.

## 🎮 Play Now

**[Launch Combat Simulator](https://[YOUR-USERNAME].github.io/ali-baba-combat-simulator/)**

*(Update the link above with your GitHub username after deploying)*

## Overview

This project simulates the combat mechanics from the [classic Ali Baba game](https://archive.org/details/Ali_Baba_and_the_Forty_Thieves_Dr._Death_crack), using AD&D-inspired turn-based combat rules with opposed dice rolls, character-specific bonuses, and dynamic combat ranges.

## Character Model

The original game shows characters with these attributes:
- Name
- Lifeforce: The number of remaining hit points, or the amount of damage the character can take before it perishes (decreases as damage is taken)
- Strength
- Dexterity
- Speed: The number of spaces the character can move per turn (not used in this application)
- Sword
- Dagger
- Armor

The combat simulator uses the following character attributes:

### Core Attributes
- **name**: Character identifier
- **characterType**: Race (dwarf, halfling, elf, human)
- **maxLifeForce**: Maximum health/hit points (up to 26)
- **currentLifeForce**: Current HP
- **strength**: Physical power (1-20, affects damage)
- **baseDexterity**: Agility (1-24, affects hit chance)
- **effectiveDexterity**: Base DEX - Armor penalty
- **weapon**: Sword for adjacent combat
- **dagger**: Dagger for close quarters combat
- **armor**: Provides AC but reduces DEX

## Features

- **4 Playable Characters**: Dwarf, Halfling, Elf, and Human - each with unique combat bonuses
- **4 Enemy Creatures**: Face off against a Thief (Jami), Zombie, Tiger, or Dragon
- **Turn-Based Combat**: Initiative-based combat with alternating turns
- **Multiple Combat Actions**:
  - Attack with sword or dagger
  - Defend for defensive bonus (+5 to defense roll)
  - Tackle to enter close quarters combat
  - Disengage to create distance
  - Run away (if you must!)
- **Two Combat Ranges**: Adjacent (sword) vs Close Quarters (dagger)
- **Character-Specific Bonuses**: Different races excel in different combat scenarios
- **Real-Time Stat Tracking**: Watch HP, status effects, and combat state update live
- **Detailed Combat Log**: See all dice rolls and combat resolution

## Combat Mechanics

Based on classic AD&D-inspired rules:
- **Initiative**: DEX-based roll determines who goes first (rolled once per combat)
- **To-Hit**: Opposed DEX rolls determine if attacks land
- **Damage**: `random(1, STR) + Weapon Power - Armor Class`
- **Status Effects**: Characters become weak at 50% HP (STR -3), unconscious at 10% HP
- **Character Bonuses**: 
  - **Dwarves**: +3 damage at adjacent range, +2 to hit in close quarters
  - **Humans**: +3 damage at adjacent range
  - **Halflings**: +3 to hit in close quarters
  - **Elves**: +3 to hit in close quarters

## Tech Stack

- TypeScript (ES2020)
- Functional programming approach
- HTML5 & CSS3
- ES Modules
- GitHub Pages deployment

## Documentation

- [Combat System Design](combat.md) - Detailed combat mechanics and formulas
- [MVP Specification](MVP.md) - Implementation requirements and specifications

## Project Structure

```
src/js/             # TypeScript source files
  app.ts            # UI controller
  engine.ts         # Combat engine
  data.ts           # Character/creature data & type definitions
  dice.ts           # Random number utilities
  types.ts          # TypeScript type definitions
  version.ts        # Auto-generated version info
public/             # Static HTML/CSS assets
  index.html        # Main HTML file
  styles.css        # Application styles
dist/               # Build output (deployed to GitHub Pages)
  index.html        # Copied from public/
  styles.css        # Copied from public/
  js/               # Compiled JavaScript from TypeScript
scripts/            # Build scripts
  generate-version.js
combat.md           # Combat design document
MVP.md              # Phase 1 implementation spec
```

## Local Development

### Prerequisites
- Node.js (LTS preferred)
- npm

### Setup and Build

1. Install dependencies:
```bash
npm install
```

2. Build the project (compile TypeScript + copy assets to dist/):
```bash
npm run build
```

3. Development mode (auto-rebuild TypeScript on changes):
```bash
npm run dev
```

### Running the Web Interface

After building, open `dist/index.html` in a web browser, or use a local development server:

```bash
# Using Python 3
cd dist && python3 -m http.server 8000

# Using Node.js http-server (install globally: npm i -g http-server)
cd dist && http-server
```

Then navigate to `http://localhost:8000`

## Deployment

The project is deployed to GitHub Pages from the `dist/` folder. The `dist/` folder is committed to the repository and contains the built application ready for deployment.

To deploy:
1. Build the project: `npm run build`
2. Commit the changes including `dist/`
3. Push to GitHub
4. Merge changes to `main`; GitHub Pages will automatically serve from the `dist/` folder

## Future Enhancements

- Equipment customization with random stat ranges
- Character creation and rolling
- Multiple enemy combat
- Weapon impale critical hit mechanic
- Combat statistics tracking

## License

MIT

## Credits

Inspired by the classic Ali Baba game and Advanced Dungeons & Dragons combat systems.
