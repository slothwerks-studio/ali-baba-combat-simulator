// Character and Creature Data

import type { Character } from './types';

export const CHARACTERS: Character[] = [
  {
    name: "Thorin the Dwarf",
    characterType: "dwarf",
    strength: 18,
    baseDexterity: 12,
    maxLifeForce: 22,
    weapon: { name: "Steel Sword", weaponType: "sword", power: 13 },
    dagger: { name: "Iron Dagger", weaponType: "dagger", power: 11 },
    armor: { name: "Chainmail", armorClass: 3, dexterityPenalty: 2 }
  },
  {
    name: "Pippin the Halfling",
    characterType: "halfling",
    strength: 10,
    baseDexterity: 20,
    maxLifeForce: 24,
    weapon: { name: "Short Sword", weaponType: "sword", power: 10 },
    dagger: { name: "Fine Dagger", weaponType: "dagger", power: 9 },
    armor: { name: "Leather Armor", armorClass: 1, dexterityPenalty: 1 }
  },
  {
    name: "Legolas the Elf",
    characterType: "elf",
    strength: 12,
    baseDexterity: 22,
    maxLifeForce: 16,
    weapon: { name: "Elven Blade", weaponType: "sword", power: 12 },
    dagger: { name: "Elven Dagger", weaponType: "dagger", power: 10 },
    armor: { name: "Leather Armor", armorClass: 1, dexterityPenalty: 1 }
  },
  {
    name: "Aragorn the Human",
    characterType: "human",
    strength: 16,
    baseDexterity: 14,
    maxLifeForce: 20,
    weapon: { name: "Longsword", weaponType: "sword", power: 14 },
    dagger: { name: "Steel Dagger", weaponType: "dagger", power: 11 },
    armor: { name: "Chainmail", armorClass: 3, dexterityPenalty: 2 }
  }
];

export const CREATURES: Character[] = [
  {
    name: "Goblin Scout",
    characterType: "goblin",
    strength: 8,
    baseDexterity: 16,
    maxLifeForce: 12,
    weapon: { name: "Rusty Sword", weaponType: "sword", power: 7 },
    dagger: { name: "Rusty Dagger", weaponType: "dagger", power: 6 },
    armor: { name: "No Armor", armorClass: 0, dexterityPenalty: 0 }
  },
  {
    name: "Orc Warrior",
    characterType: "orc",
    strength: 16,
    baseDexterity: 10,
    maxLifeForce: 20,
    weapon: { name: "Crude Sword", weaponType: "sword", power: 11 },
    dagger: { name: "Crude Dagger", weaponType: "dagger", power: 9 },
    armor: { name: "Hide Armor", armorClass: 2, dexterityPenalty: 1 }
  },
  {
    name: "Troll Berserker",
    characterType: "troll",
    strength: 20,
    baseDexterity: 8,
    maxLifeForce: 26,
    weapon: { name: "Great Club", weaponType: "sword", power: 12 },
    dagger: { name: "Bone Dagger", weaponType: "dagger", power: 10 },
    armor: { name: "Thick Hide", armorClass: 4, dexterityPenalty: 0 }
  },
  {
    name: "Shadow Assassin",
    characterType: "assassin",
    strength: 14,
    baseDexterity: 20,
    maxLifeForce: 18,
    weapon: { name: "Curved Blade", weaponType: "sword", power: 11 },
    dagger: { name: "Poison Dagger", weaponType: "dagger", power: 12 },
    armor: { name: "Leather Armor", armorClass: 1, dexterityPenalty: 0 }
  }
];
