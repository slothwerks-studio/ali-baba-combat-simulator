// Combat Engine

import type { Character, Combatant, Weapon } from './types';
import { d20, roll } from './dice';

const MAX_INITIATIVE_RETRIES = 10;

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

// Mutable combat state
export let combatState: CombatState = {
  player: null,
  enemy: null,
  range: 'adjacent',
  currentTurn: null,
  playerGoesFirst: false,
  combatLog: [],
  isGameOver: false,
  victor: null,
  turnCount: 0,
  initiativeRetries: 0
};

// Initialize a combatant from character data
function initializeCombatant(data: Character): Combatant {
  const combatant: Combatant = {
    ...data,
    currentLifeForce: data.maxLifeForce,
    isUnconscious: false,
    lastAction: null,
    effectiveDexterity: 0,
    isWeak: false
  };
  
  const armorPenalty = combatant.armor?.dexterityPenalty ?? 0;
  combatant.effectiveDexterity = combatant.baseDexterity - armorPenalty;
  
  return combatant;
}

// Initialize combat with player and enemy
export function initCombat(player: Character, enemy: Character): void {
  combatState.player = initializeCombatant(player);
  combatState.enemy = initializeCombatant(enemy);
  combatState.range = 'adjacent';
  combatState.currentTurn = null;
  combatState.playerGoesFirst = false;
  combatState.combatLog = [];
  combatState.isGameOver = false;
  combatState.victor = null;
  combatState.turnCount = 0;
  combatState.initiativeRetries = 0;
}

// Get current weapon based on combat range
function getCurrentWeapon(combatant: Combatant): Weapon {
  if (combatState.range === 'close_quarters') {
    return combatant.closeWeapon;
  }
  return combatant.adjacentWeapon;
}

// Initiative roll
export function rollInitiative(): void {
  if (!combatState.player || !combatState.enemy) return;
  
  const playerRoll = d20();
  const enemyRoll = d20();
  const playerTotal = playerRoll + combatState.player.effectiveDexterity;
  const enemyTotal = enemyRoll + combatState.enemy.effectiveDexterity;

  log(`${combatState.player.name} rolled initiative: ${playerTotal} (1d20: ${playerRoll} + DEX: ${combatState.player.effectiveDexterity})`);
  log(`${combatState.enemy.name} rolled initiative: ${enemyTotal} (1d20: ${enemyRoll} + DEX: ${combatState.enemy.effectiveDexterity})`);

  if (playerTotal > enemyTotal) {
    combatState.playerGoesFirst = true;
    combatState.currentTurn = 'player';
    log(`${combatState.player.name} goes first!`);
  } else if (enemyTotal > playerTotal) {
    combatState.playerGoesFirst = false;
    combatState.currentTurn = 'enemy';
    log(`${combatState.enemy.name} goes first!`);
  } else {
    // Tie - re-roll
    combatState.initiativeRetries++;
    
    if (combatState.initiativeRetries >= MAX_INITIATIVE_RETRIES) {
      log(`Tie! Maximum retries reached (${MAX_INITIATIVE_RETRIES}). Randomly determining initiative...`);
      // Break tie randomly
      if (Math.random() < 0.5) {
        combatState.playerGoesFirst = true;
        combatState.currentTurn = 'player';
        log(`${combatState.player.name} goes first!`);
      } else {
        combatState.playerGoesFirst = false;
        combatState.currentTurn = 'enemy';
        log(`${combatState.enemy.name} goes first!`);
      }
    } else {
      log('Tie! Re-rolling initiative...');
      rollInitiative();
      return;
    }
  }
  log('---');
}

// Switch turns
export function nextTurn(): void {
  combatState.currentTurn = combatState.currentTurn === 'player' ? 'enemy' : 'player';
  combatState.turnCount++;
}

// Get character type bonuses
function getAttackBonus(combatant: Combatant): number {
  let bonus = 0;
  // Dwarf: +2 to hit in close quarters
  if (combatant.type === 'dwarf' && combatState.range === 'close_quarters') {
    bonus += 2;
  }
  return bonus;
}

function getDamageBonus(combatant: Combatant): number {
  let bonus = 0;
  // Dwarf: +3 damage with swords (adjacent)
  if (combatant.type === 'dwarf' && combatState.range === 'adjacent') {
    bonus += 3;
  }
  // Human: +3 damage with swords (adjacent)
  if (combatant.type === 'human' && combatState.range === 'adjacent') {
    bonus += 3;
  }
  // Halfling: +3 damage in close quarters
  if (combatant.type === 'halfling' && combatState.range === 'close_quarters') {
    bonus += 3;
  }
  // Elf: +3 damage in close quarters
  if (combatant.type === 'elf' && combatState.range === 'close_quarters') {
    bonus += 3;
  }
  return bonus;
}

// Attack action
export function attack(attacker: Combatant, defender: Combatant, isDefending: boolean): boolean {
  const attackerName = attacker === combatState.player ? combatState.player.name : combatState.enemy.name;
  const defenderName = defender === combatState.player ? combatState.player.name : combatState.enemy.name;
  const weapon = getCurrentWeapon(attacker);

  log(`${attackerName}'s Turn`);
  log(`${attackerName} attacks with ${weapon.name}!`);

  // Check if defender is unconscious (auto-hit)
  if (defender.isUnconscious) {
    log(`${defenderName} is unconscious and cannot defend!`);
    const damage = calculateDamage(attacker, defender);
    applyDamage(defender, damage);
    return true;
  }

  // To-hit roll (opposed)
  const attackBonus = getAttackBonus(attacker);
  const attackerRoll = d20();
  const attackerTotal = attackerRoll + attacker.effectiveDexterity + attackBonus;

  const defenderBonus = isDefending ? 5 : 0;
  const defenderRoll = d20();
  const defenderTotal = defenderRoll + defender.effectiveDexterity + defenderBonus;

  log(`Attack roll: ${attackerTotal} (1d20: ${attackerRoll} + DEX: ${attacker.effectiveDexterity}${attackBonus > 0 ? ` + Bonus: ${attackBonus}` : ''})`);
  log(`Defense roll: ${defenderTotal} (1d20: ${defenderRoll} + DEX: ${defender.effectiveDexterity}${defenderBonus > 0 ? ` + Defend: ${defenderBonus}` : ''})`);

  if (attackerTotal > defenderTotal) {
    log(`Hit! ${attackerName} lands a blow!`);
    const damage = calculateDamage(attacker, defender);
    applyDamage(defender, damage);
    return true;
  } else {
    log(`Miss! ${defenderName} dodges the attack!`);
    return false;
  }
}

// Calculate damage
function calculateDamage(attacker: Combatant, defender: Combatant): number {
  const weapon = getCurrentWeapon(attacker);
  
  // Apply weakness penalty
  const effectiveStrength = attacker.isWeak ? Math.max(1, attacker.strength - 3) : attacker.strength;
  const strRoll = roll(1, effectiveStrength);
  
  const damageBonus = getDamageBonus(attacker);
  
  const rawDamage = strRoll + weapon.power + damageBonus;
  const armorStrength = defender.armor?.strength ?? 0;
  const finalDamage = Math.max(0, rawDamage - armorStrength);

  const parts: string[] = [];
  parts.push(`STR: ${strRoll}`);
  parts.push(`Weapon: ${weapon.power}`);
  if (damageBonus > 0) parts.push(`Bonus: ${damageBonus}`);
  if (armorStrength > 0) parts.push(`AC: -${armorStrength}`);

  log(`Damage: ${finalDamage} (${parts.join(' + ')})`);

  return finalDamage;
}

// Apply damage
function applyDamage(target: Combatant, damage: number): void {
  const targetName = target === combatState.player ? combatState.player.name : combatState.enemy.name;
  const oldHP = target.currentLifeForce;
  target.currentLifeForce = Math.max(0, target.currentLifeForce - damage);
  
  if (damage === 0) {
    log(`${targetName}'s armor absorbs all the damage!`);
  } else {
    log(`${targetName} takes ${damage} damage! (${oldHP} → ${target.currentLifeForce} HP)`);
  }

  // Update status
  updateCombatantStatus(target);

  // Check for defeat
  if (target.currentLifeForce === 0) {
    log(`${targetName} is defeated!`);
    endCombat(target === combatState.player ? 'enemy' : 'player');
  }
}

// Update combatant status
function updateCombatantStatus(combatant: Combatant): void {
  const targetName = combatant === combatState.player ? combatState.player.name : combatState.enemy.name;
  
  // Check unconscious
  const unconsciousThreshold = Math.floor(combatant.maxLifeForce * 0.1);
  const wasUnconscious = combatant.isUnconscious;
  combatant.isUnconscious = combatant.currentLifeForce <= unconsciousThreshold && combatant.currentLifeForce > 0;
  
  if (combatant.isUnconscious && !wasUnconscious) {
    log(`${targetName} falls unconscious!`);
  }

  // Check weak
  const wasWeak = combatant.isWeak;
  combatant.isWeak = combatant.currentLifeForce < combatant.maxLifeForce * 0.5;
  
  if (combatant.isWeak && !wasWeak) {
    log(`${targetName} is feeling weak...`);
  }
}

// Defend action
export function defend(defender: Combatant): void {
  const defenderName = defender === combatState.player ? combatState.player.name : combatState.enemy.name;
  log(`${defenderName}'s Turn`);
  log(`${defenderName} takes a defensive stance!`);
  defender.lastAction = 'defend';
}

// Tackle/Wrestle action
export function tackle(attacker: Combatant, defender: Combatant): boolean {
  const attackerName = attacker === combatState.player ? combatState.player.name : combatState.enemy.name;
  const defenderName = defender === combatState.player ? combatState.player.name : combatState.enemy.name;

  log(`${attackerName}'s Turn`);
  log(`${attackerName} attempts to tackle ${defenderName}!`);

  const attackerRoll = d20();
  const attackerTotal = attackerRoll + attacker.effectiveDexterity;
  
  const defenderRoll = d20();
  const defenderTotal = defenderRoll + defender.effectiveDexterity;

  log(`Tackle roll: ${attackerTotal} (1d20: ${attackerRoll} + DEX: ${attacker.effectiveDexterity})`);
  log(`Resist roll: ${defenderTotal} (1d20: ${defenderRoll} + DEX: ${defender.effectiveDexterity})`);

  if (attackerTotal > defenderTotal) {
    log(`Success! ${attackerName} tackles ${defenderName} into close quarters!`);
    combatState.range = 'close_quarters';
    return true;
  } else {
    log(`Failed! ${defenderName} avoids the tackle!`);
    return false;
  }
}

// Disengage action
export function disengage(attacker: Combatant, defender: Combatant): boolean {
  const attackerName = attacker === combatState.player ? combatState.player.name : combatState.enemy.name;
  const defenderName = defender === combatState.player ? combatState.player.name : combatState.enemy.name;

  log(`${attackerName}'s Turn`);
  log(`${attackerName} attempts to disengage from close quarters!`);

  const attackerRoll = d20();
  const attackerTotal = attackerRoll + attacker.effectiveDexterity;
  
  const defenderRoll = d20();
  const defenderTotal = defenderRoll + defender.effectiveDexterity;

  log(`Disengage roll: ${attackerTotal} (1d20: ${attackerRoll} + DEX: ${attacker.effectiveDexterity})`);
  log(`Resist roll: ${defenderTotal} (1d20: ${defenderRoll} + DEX: ${defender.effectiveDexterity})`);

  if (attackerTotal > defenderTotal) {
    log(`Success! ${attackerName} breaks away to adjacent range!`);
    combatState.range = 'adjacent';
    return true;
  } else {
    log(`Failed! ${attackerName} remains in close quarters!`);
    return false;
  }
}

// Run away action
export function runAway(runner: Combatant): void {
  const runnerName = runner === combatState.player ? combatState.player.name : combatState.enemy.name;
  log(`${runnerName} flees from combat!`);
  endCombat(runner === combatState.player ? 'fled' : 'player');
}

// Wake up attempt for unconscious
export function attemptWakeUp(combatant: Combatant): boolean {
  const combatantName = combatant === combatState.player ? combatState.player.name : combatState.enemy.name;
  log(`${combatantName}'s Turn`);
  log(`${combatantName} is unconscious...`);
  
  const wakeRoll = d20();
  log(`Wake-up roll: ${wakeRoll} (need 10+)`);
  
  if (wakeRoll >= 10) {
    combatant.isUnconscious = false;
    log(`${combatantName} regains consciousness!`);
    return true;
  } else {
    log(`${combatantName} remains unconscious.`);
    return false;
  }
}

// End combat
function endCombat(victor: 'player' | 'enemy' | 'fled'): void {
  combatState.isGameOver = true;
  combatState.victor = victor;
  log('---');
  
  if (victor === 'player') {
    log(`VICTORY! ${combatState.player.name} wins!`);
  } else if (victor === 'enemy') {
    log(`DEFEAT! ${combatState.enemy.name} wins!`);
  } else if (victor === 'fled') {
    log(`${combatState.player.name} fled the battle!`);
  }
}

// Logging
function log(message: string): void {
  combatState.combatLog.push(message);
}

// Get current combatant
export function getCurrentCombatant(): Combatant {
  return combatState.currentTurn === 'player' ? combatState.player : combatState.enemy;
}

// Get opponent of a combatant
export function getOpponent(combatant: Combatant): Combatant {
  return combatant === combatState.player ? combatState.enemy : combatState.player;
}
