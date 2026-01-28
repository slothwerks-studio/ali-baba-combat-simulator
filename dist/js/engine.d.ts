import type { Character, Combatant, Weapon } from './types';
export type Range = 'adjacent' | 'close_quarters';
export type Turn = 'player' | 'enemy';
export type Victor = 'player' | 'enemy' | 'fled' | null;
export interface CombatState {
    player: Combatant | null;
    enemy: Combatant | null;
    range: Range;
    currentTurn: Turn | null;
    playerGoesFirst: boolean;
    combatLog: string[];
    isGameOver: boolean;
    victor: Victor;
    turnCount: number;
    initiativeRetries: number;
}
export declare const combatState: CombatState;
export declare function initCombat(player: Character, enemy: Character): void;
export declare function getCurrentWeapon(combatant: Combatant): Weapon;
export declare function rollInitiative(): void;
export declare function nextTurn(): void;
export declare function attack(attacker: Combatant, defender: Combatant, isDefending: boolean): boolean;
export declare function defend(defender: Combatant): void;
export declare function tackle(attacker: Combatant, defender: Combatant): boolean;
export declare function disengage(attacker: Combatant, defender: Combatant): boolean;
export declare function runAway(runner: Combatant): void;
export declare function attemptWakeUp(combatant: Combatant): boolean;
//# sourceMappingURL=engine.d.ts.map