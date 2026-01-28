// Type definitions for the combat simulator

export type WeaponType = 'dagger' | 'sword';

export type CharacterType = 'human' | 'elf' | 'halfling' | 'dwarf' | 'thief' | 'other';

export interface Weapon {
  name: string;
  type: WeaponType;
  power: number;
}

export interface Armor {
  name: string;
  armorClass: number;
  dexterityPenalty: number;
}

export interface Character {
  name: string;
  type: CharacterType;
  strength: number;
  baseDexterity: number;
  maxLifeForce: number;
  sword: Weapon;
  dagger: Weapon;
  armor: Armor;
}

export interface Combatant extends Character {
  currentLifeForce: number;
  isUnconscious: boolean;
  lastAction: string | null;
  effectiveDexterity: number;
  isWeak: boolean;
}
