// Type definitions for the combat simulator

export interface Weapon {
  name: string;
  weaponType: string;
  power: number;
}

export interface Armor {
  name: string;
  armorClass: number;
  dexterityPenalty: number;
}

export interface Character {
  name: string;
  characterType: string;
  strength: number;
  baseDexterity: number;
  maxLifeForce: number;
  weapon: Weapon;
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
