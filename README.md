# Ali Baba Combat Simulator
A TypeScript combat simulator based on the 1982 Apple II game "Ali Baba and the Forty Thieves"

## Overview
This project simulates the combat mechanics from the classic game, using D&D-inspired turn-based combat rules.

## Character Model

Each character in the combat system has the following attributes:

### Core Attributes
- **name**: Character identifier
- **lifeForce**: Health/hit points
- **dexterity**: Ability to hit opponents and dodge attacks
- **strength**: Physical power affecting damage
- **armor**: Armor class for defense
- **sword**: Long-range weapon strength
- **dagger**: Short-range weapon strength

### TypeScript Interface (Draft)
```typescript
interface Character {
  name: string;
  lifeForce: number;
  dexterity: number;
  strength: number;
  armor: number;
  sword: number;
  dagger: number;
}
```

## Combat Mechanics
_To be defined_

## Tech Stack
- TypeScript (compiles to JavaScript)
- HTML interface (planned)

## Setup & Development

### Initial Setup
```bash
# Install dependencies
npm install
```

### Local Development
```bash
# Run TypeScript compiler in watch mode
# This will automatically recompile when you make changes
npm run dev
```

### Build for Production
```bash
# Compile TypeScript to JavaScript
npm run build

# Run the compiled JavaScript
npm start
```

### Project Structure
```
src/          - TypeScript source files
dist/         - Compiled JavaScript output (generated)
```

## Deployment
_To be determined_
