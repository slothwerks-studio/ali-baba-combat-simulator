export type WeaponType = 'dagger' | 'sword' | 'fists' | 'teeth' | 'claws' | 'nails';
export type CharacterType = 'human' | 'elf' | 'halfling' | 'dwarf' | 'thief' | 'zombie' | 'tiger' | 'dragon' | 'other';
export interface Weapon {
    name: string;
    type: WeaponType;
    power: number;
}
export interface Armor {
    name: string;
    strength: number;
    dexterityPenalty: number;
}
export interface Character {
    name: string;
    type: CharacterType;
    strength: number;
    baseDexterity: number;
    maxLifeForce: number;
    adjacentWeapon: Weapon;
    closeWeapon: Weapon;
    armor: Armor | null;
}
export interface Combatant extends Character {
    currentLifeForce: number;
    isUnconscious: boolean;
    lastAction: string | null;
    effectiveDexterity: number;
    isWeak: boolean;
}
export interface CharacterTypeAdjustments {
    adjacentAttack?: number;
    adjacentDamage?: number;
    closeQuartersAttack?: number;
    closeQuartersDamage?: number;
}
export interface CharacterTypeDefinition {
    name: string;
    adjustments: CharacterTypeAdjustments;
}
//# sourceMappingURL=types.d.ts.map