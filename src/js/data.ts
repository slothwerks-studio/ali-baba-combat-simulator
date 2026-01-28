// Character and Creature Data

import type { Character, CharacterType, CharacterTypeDefinition } from './types';

// Character type definitions with bonuses
export const CHARACTER_TYPE_DEFINITIONS: Record<CharacterType, CharacterTypeDefinition> = {
  human: {
    name: 'Human',
    adjustments: {
      adjacentDamage: 3
    }
  },
  elf: {
    name: 'Elf',
    adjustments: {
      closeQuartersAttack: 3
    }
  },
  halfling: {
    name: 'Halfling',
    adjustments: {
      closeQuartersAttack: 3
    }
  },
  dwarf: {
    name: 'Dwarf',
    adjustments: {
      closeQuartersAttack: 2,
      adjacentDamage: 3
    }
  },
  thief: {
    name: 'Thief',
    adjustments: {
      closeQuartersAttack: 3
    }
  },
  zombie: {
    name: 'Zombie',
    adjustments: {}
  },
  tiger: {
    name: 'Tiger',
    adjustments: {}
  },
  dragon: {
    name: 'Dragon',
    adjustments: {}
  },
  other: {
    name: 'Other',
    adjustments: {}
  }
};

export const CHARACTERS: Character[] = [
  {
    name: "Thora",
    type: "dwarf",
    strength: 17,
    baseDexterity: 11,
    maxLifeForce: 21,
    adjacentWeapon: { name: "Steel Sword", type: "sword", power: 10 },
    closeWeapon: { name: "Iron Dagger", type: "dagger", power: 5 },
    armor: { name: "Leather Armor", strength: 1, dexterityPenalty: 1 }
  },
  {
    name: "Stilbo",
    type: "halfling",
    strength: 10,
    baseDexterity: 16,
    maxLifeForce: 26,
    adjacentWeapon: { name: "Iron Sword", type: "sword", power: 6 },
    closeWeapon: { name: "Iron Dagger", type: "dagger", power: 6 },
    armor: { name: "Leather Armor", strength: 1, dexterityPenalty: 1 }
  },
  {
    name: "Huan",
    type: "elf",
    strength: 16,
    baseDexterity: 11,
    maxLifeForce: 16,
    adjacentWeapon: { name: "Iron Sword", type: "sword", power: 8 },
    closeWeapon: { name: "Steel Dagger", type: "dagger", power: 9 },
    armor: { name: "Leather Armor", strength: 1, dexterityPenalty: 1 }
  },
  {
    name: "Bairam Medio",
    type: "human",
    strength: 14,
    baseDexterity: 14,
    maxLifeForce: 14,
    adjacentWeapon: { name: "Iron Sword", type: "sword", power: 7 },
    closeWeapon: { name: "Iron Dagger", type: "dagger", power: 6 },
    armor: null
  }
];

export const CREATURES: Character[] = [
  {
    name: "Jami",
    type: "thief",
    strength: 13,
    baseDexterity: 15,
    maxLifeForce: 14,
    adjacentWeapon: { name: "Iron Sword", type: "sword", power: 5 },
    closeWeapon: { name: "Steel Dagger", type: "dagger", power: 7 },
    armor: { name: "Leather Armor", strength: 1, dexterityPenalty: 1 }
  },
  {
    name: "Small Zombie",
    type: "zombie",
    strength: 14,
    baseDexterity: 8,
    maxLifeForce: 14,
    adjacentWeapon: { name: "Nails", type: "nails", power: 4 },
    closeWeapon: { name: "Teeth", type: "teeth", power: 6 },
    armor: null
  },
  {
    name: "Tiger",
    type: "tiger",
    strength: 12,
    baseDexterity: 12,
    maxLifeForce: 13,
    adjacentWeapon: { name: "Claws", type: "claws", power: 8 },
    closeWeapon: { name: "Teeth", type: "teeth", power: 8 },
    armor: { name: "Thick Hide", strength: 1, dexterityPenalty: 0 }
  },
  {
    name: "Very Young Dragon",
    type: "dragon",
    strength: 14,
    baseDexterity: 13,
    maxLifeForce: 15,
    adjacentWeapon: { name: "Claws", type: "claws", power: 8 },
    closeWeapon: { name: "Teeth", type: "teeth", power: 8 },
    armor: { name: "Thick Hide", strength: 2, dexterityPenalty: 0 }
  }
];
