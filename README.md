# Ali Baba Combat Simulator

Turn-based 1v1 combat simulator inspired by the classic Ali Baba game and Advanced Dungeons & Dragons mechanics.

## 🎮 Play Now

**[Launch Combat Simulator](https://[YOUR-USERNAME].github.io/ali-baba-combat-simulator/)**

*(Update the link above with your GitHub username after deploying)*

## Overview

This project simulates the combat mechanics from the classic Ali Baba game, using AD&D-inspired turn-based combat rules with opposed dice rolls, character-specific bonuses, and dynamic combat ranges.

## Character Model

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
- **4 Enemy Creatures**: Face off against Goblins, Orcs, Trolls, and Shadow Assassins
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
  - **Dwarves**: +3 damage with swords, +2 to hit in close quarters
  - **Humans**: +3 damage with swords
  - **Halflings**: +3 damage in close quarters
  - **Elves**: +3 damage in close quarters

## Tech Stack

- Pure JavaScript (ES6+)
- HTML5 & CSS3
- No frameworks or dependencies
- Deployed via GitHub Pages

## Documentation

- [Combat System Design](combat.md) - Detailed combat mechanics and formulas
- [MVP Specification](MVP.md) - Implementation requirements and specifications

## Project Structure

```
docs/               # GitHub Pages deployment folder
  index.html        # Main application
  styles.css        # Styling
  js/
    app.js          # UI controller
    engine.js       # Combat engine
    data.js         # Character/creature data
    dice.js         # Random number utilities
src/js/             # Source files (copied to docs)
combat.md           # Combat design document
MVP.md              # Phase 1 implementation spec
```

## Local Development

Simply open `docs/index.html` in a web browser. No build process required!

## Deploying to GitHub Pages

1. Push the `web-interface` branch to GitHub
2. Go to repository Settings → Pages
3. Set Source to "Deploy from a branch"
4. Select branch: `web-interface`
5. Select folder: `/docs`
6. Save and wait for deployment

Your site will be available at: `https://[YOUR-USERNAME].github.io/ali-baba-combat-simulator/`

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
