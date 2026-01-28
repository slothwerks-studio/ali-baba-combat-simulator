// Combat Engine

/**
 * @typedef {Object} Weapon
 * @property {string} name
 * @property {string} weaponType
 * @property {number} power
 */

/**
 * @typedef {Object} Armor
 * @property {string} name
 * @property {number} armorClass
 * @property {number} dexterityPenalty
 */

/**
 * @typedef {Object} Character
 * @property {string} name
 * @property {string} characterType
 * @property {number} strength
 * @property {number} baseDexterity
 * @property {number} maxLifeForce
 * @property {Weapon} weapon
 * @property {Weapon} dagger
 * @property {Armor} armor
 */

/**
 * @typedef {Object} Combatant
 * @property {string} name
 * @property {string} characterType
 * @property {number} strength
 * @property {number} baseDexterity
 * @property {number} maxLifeForce
 * @property {Weapon} weapon
 * @property {Weapon} dagger
 * @property {Armor} armor
 * @property {number} currentLifeForce
 * @property {boolean} isUnconscious
 * @property {string | null} lastAction
 * @property {number} effectiveDexterity
 * @property {boolean} isWeak
 */

class CombatEngine {
  /**
   * @param {Character} player
   * @param {Character} enemy
   */
  constructor(player, enemy) {
    this.player = this.initializeCombatant(player);
    this.enemy = this.initializeCombatant(enemy);
    this.range = "adjacent"; // Start at adjacent range
    /** @type {string | null} */
    this.currentTurn = null;
    this.playerGoesFirst = false;
    /** @type {string[]} */
    this.combatLog = [];
    this.isGameOver = false;
    /** @type {string | null} */
    this.victor = null;
    this.turnCount = 0;
  }

  /**
   * @param {Character} data
   * @returns {Combatant}
   */
  initializeCombatant(data) {
    /** @type {Combatant} */
    const combatant = {
      ...data,
      currentLifeForce: data.maxLifeForce,
      isUnconscious: false,
      lastAction: null,
      effectiveDexterity: 0,
      isWeak: false
    };
    combatant.effectiveDexterity = combatant.baseDexterity - combatant.armor.dexterityPenalty;
    combatant.isWeak = false;
    return combatant;
  }

  // Get current weapon based on combat range
  /**
   * @param {Combatant} combatant
   * @returns {Weapon}
   */
  getCurrentWeapon(combatant) {
    if (this.range === "close_quarters") {
      return combatant.dagger;
    }
    return combatant.weapon;
  }

  // Initiative roll
  rollInitiative() {
    const playerRoll = d20();
    const enemyRoll = d20();
    const playerTotal = playerRoll + this.player.effectiveDexterity;
    const enemyTotal = enemyRoll + this.enemy.effectiveDexterity;

    this.log(`${this.player.name} rolled initiative: ${playerTotal} (1d20: ${playerRoll} + DEX: ${this.player.effectiveDexterity})`);
    this.log(`${this.enemy.name} rolled initiative: ${enemyTotal} (1d20: ${enemyRoll} + DEX: ${this.enemy.effectiveDexterity})`);

    if (playerTotal > enemyTotal) {
      this.playerGoesFirst = true;
      this.currentTurn = "player";
      this.log(`${this.player.name} goes first!`);
    } else if (enemyTotal > playerTotal) {
      this.playerGoesFirst = false;
      this.currentTurn = "enemy";
      this.log(`${this.enemy.name} goes first!`);
    } else {
      // Tie - re-roll
      this.log("Tie! Re-rolling initiative...");
      this.rollInitiative();
      return;
    }
    this.log("---");
  }

  // Switch turns
  nextTurn() {
    this.currentTurn = this.currentTurn === "player" ? "enemy" : "player";
    this.turnCount++;
  }

  // Get character type bonuses
  /**
   * @param {Combatant} combatant
   * @returns {number}
   */
  getAttackBonus(combatant) {
    let bonus = 0;
    // Dwarf: +2 to hit in close quarters
    if (combatant.characterType === "dwarf" && this.range === "close_quarters") {
      bonus += 2;
    }
    return bonus;
  }

  /**
   * @param {Combatant} combatant
   * @returns {number}
   */
  getDamageBonus(combatant) {
    let bonus = 0;
    // Dwarf: +3 damage with swords (adjacent)
    if (combatant.characterType === "dwarf" && this.range === "adjacent") {
      bonus += 3;
    }
    // Human: +3 damage with swords (adjacent)
    if (combatant.characterType === "human" && this.range === "adjacent") {
      bonus += 3;
    }
    // Halfling: +3 damage in close quarters
    if (combatant.characterType === "halfling" && this.range === "close_quarters") {
      bonus += 3;
    }
    // Elf: +3 damage in close quarters
    if (combatant.characterType === "elf" && this.range === "close_quarters") {
      bonus += 3;
    }
    return bonus;
  }

  // Attack action
  /**
   * @param {Combatant} attacker
   * @param {Combatant} defender
   * @param {boolean} isDefending
   * @returns {boolean}
   */
  attack(attacker, defender, isDefending) {
    const attackerName = attacker === this.player ? this.player.name : this.enemy.name;
    const defenderName = defender === this.player ? this.player.name : this.enemy.name;
    const weapon = this.getCurrentWeapon(attacker);

    this.log(`${attackerName}'s Turn`);
    this.log(`${attackerName} attacks with ${weapon.name}!`);

    // Check if defender is unconscious (auto-hit)
    if (defender.isUnconscious) {
      this.log(`${defenderName} is unconscious and cannot defend!`);
      const damage = this.calculateDamage(attacker, defender);
      this.applyDamage(defender, damage);
      return true;
    }

    // To-hit roll (opposed)
    const attackBonus = this.getAttackBonus(attacker);
    const attackerRoll = d20();
    const attackerTotal = attackerRoll + attacker.effectiveDexterity + attackBonus;

    const defenderBonus = isDefending ? 5 : 0;
    const defenderRoll = d20();
    const defenderTotal = defenderRoll + defender.effectiveDexterity + defenderBonus;

    this.log(`Attack roll: ${attackerTotal} (1d20: ${attackerRoll} + DEX: ${attacker.effectiveDexterity}${attackBonus > 0 ? ` + Bonus: ${attackBonus}` : ''})`);
    this.log(`Defense roll: ${defenderTotal} (1d20: ${defenderRoll} + DEX: ${defender.effectiveDexterity}${defenderBonus > 0 ? ` + Defend: ${defenderBonus}` : ''})`);

    if (attackerTotal > defenderTotal) {
      this.log(`Hit! ${attackerName} lands a blow!`);
      const damage = this.calculateDamage(attacker, defender);
      this.applyDamage(defender, damage);
      return true;
    } else {
      this.log(`Miss! ${defenderName} dodges the attack!`);
      return false;
    }
  }

  // Calculate damage
  /**
   * @param {Combatant} attacker
   * @param {Combatant} defender
   * @returns {number}
   */
  calculateDamage(attacker, defender) {
    const weapon = this.getCurrentWeapon(attacker);
    
    // Apply weakness penalty
    const effectiveStrength = attacker.isWeak ? Math.max(1, attacker.strength - 3) : attacker.strength;
    const strRoll = roll(1, effectiveStrength);
    
    const damageBonus = this.getDamageBonus(attacker);
    
    const rawDamage = strRoll + weapon.power + damageBonus;
    const finalDamage = Math.max(0, rawDamage - defender.armor.armorClass);

    const parts = [];
    parts.push(`STR: ${strRoll}`);
    parts.push(`Weapon: ${weapon.power}`);
    if (damageBonus > 0) parts.push(`Bonus: ${damageBonus}`);
    if (defender.armor.armorClass > 0) parts.push(`AC: -${defender.armor.armorClass}`);

    this.log(`Damage: ${finalDamage} (${parts.join(' + ')})`);

    return finalDamage;
  }

  // Apply damage
  /**
   * @param {Combatant} target
   * @param {number} damage
   */
  applyDamage(target, damage) {
    const targetName = target === this.player ? this.player.name : this.enemy.name;
    const oldHP = target.currentLifeForce;
    target.currentLifeForce = Math.max(0, target.currentLifeForce - damage);
    
    if (damage === 0) {
      this.log(`${targetName}'s armor absorbs all the damage!`);
    } else {
      this.log(`${targetName} takes ${damage} damage! (${oldHP} → ${target.currentLifeForce} HP)`);
    }

    // Update status
    this.updateCombatantStatus(target);

    // Check for defeat
    if (target.currentLifeForce === 0) {
      this.log(`${targetName} is defeated!`);
      this.endCombat(target === this.player ? "enemy" : "player");
    }
  }

  // Update combatant status
  /**
   * @param {Combatant} combatant
   */
  updateCombatantStatus(combatant) {
    const targetName = combatant === this.player ? this.player.name : this.enemy.name;
    
    // Check unconscious
    const unconsciousThreshold = Math.floor(combatant.maxLifeForce * 0.1);
    const wasUnconscious = combatant.isUnconscious;
    combatant.isUnconscious = combatant.currentLifeForce <= unconsciousThreshold && combatant.currentLifeForce > 0;
    
    if (combatant.isUnconscious && !wasUnconscious) {
      this.log(`${targetName} falls unconscious!`);
    }

    // Check weak
    const wasWeak = combatant.isWeak;
    combatant.isWeak = combatant.currentLifeForce < combatant.maxLifeForce * 0.5;
    
    if (combatant.isWeak && !wasWeak) {
      this.log(`${targetName} is feeling weak...`);
    }
  }

  // Defend action
  /**
   * @param {Combatant} defender
   */
  defend(defender) {
    const defenderName = defender === this.player ? this.player.name : this.enemy.name;
    this.log(`${defenderName}'s Turn`);
    this.log(`${defenderName} takes a defensive stance!`);
    defender.lastAction = "defend";
  }

  // Tackle/Wrestle action
  /**
   * @param {Combatant} attacker
   * @param {Combatant} defender
   * @returns {boolean}
   */
  tackle(attacker, defender) {
    const attackerName = attacker === this.player ? this.player.name : this.enemy.name;
    const defenderName = defender === this.player ? this.player.name : this.enemy.name;

    this.log(`${attackerName}'s Turn`);
    this.log(`${attackerName} attempts to tackle ${defenderName}!`);

    const attackerRoll = d20();
    const attackerTotal = attackerRoll + attacker.effectiveDexterity;
    
    const defenderRoll = d20();
    const defenderTotal = defenderRoll + defender.effectiveDexterity;

    this.log(`Tackle roll: ${attackerTotal} (1d20: ${attackerRoll} + DEX: ${attacker.effectiveDexterity})`);
    this.log(`Resist roll: ${defenderTotal} (1d20: ${defenderRoll} + DEX: ${defender.effectiveDexterity})`);

    if (attackerTotal > defenderTotal) {
      this.log(`Success! ${attackerName} tackles ${defenderName} into close quarters!`);
      this.range = "close_quarters";
      return true;
    } else {
      this.log(`Failed! ${defenderName} avoids the tackle!`);
      return false;
    }
  }

  // Disengage action
  /**
   * @param {Combatant} attacker
   * @param {Combatant} defender
   * @returns {boolean}
   */
  disengage(attacker, defender) {
    const attackerName = attacker === this.player ? this.player.name : this.enemy.name;
    const defenderName = defender === this.player ? this.player.name : this.enemy.name;

    this.log(`${attackerName}'s Turn`);
    this.log(`${attackerName} attempts to disengage from close quarters!`);

    const attackerRoll = d20();
    const attackerTotal = attackerRoll + attacker.effectiveDexterity;
    
    const defenderRoll = d20();
    const defenderTotal = defenderRoll + defender.effectiveDexterity;

    this.log(`Disengage roll: ${attackerTotal} (1d20: ${attackerRoll} + DEX: ${attacker.effectiveDexterity})`);
    this.log(`Resist roll: ${defenderTotal} (1d20: ${defenderRoll} + DEX: ${defender.effectiveDexterity})`);

    if (attackerTotal > defenderTotal) {
      this.log(`Success! ${attackerName} breaks away to adjacent range!`);
      this.range = "adjacent";
      return true;
    } else {
      this.log(`Failed! ${attackerName} remains in close quarters!`);
      return false;
    }
  }

  // Run away action
  /**
   * @param {Combatant} runner
   */
  runAway(runner) {
    const runnerName = runner === this.player ? this.player.name : this.enemy.name;
    this.log(`${runnerName} flees from combat!`);
    this.endCombat(runner === this.player ? "fled" : "player");
  }

  // Wake up attempt for unconscious
  /**
   * @param {Combatant} combatant
   * @returns {boolean}
   */
  attemptWakeUp(combatant) {
    const combatantName = combatant === this.player ? this.player.name : this.enemy.name;
    this.log(`${combatantName}'s Turn`);
    this.log(`${combatantName} is unconscious...`);
    
    const wakeRoll = d20();
    this.log(`Wake-up roll: ${wakeRoll} (need 10+)`);
    
    if (wakeRoll >= 10) {
      combatant.isUnconscious = false;
      this.log(`${combatantName} regains consciousness!`);
      return true;
    } else {
      this.log(`${combatantName} remains unconscious.`);
      return false;
    }
  }

  // End combat
  /**
   * @param {string} victor
   */
  endCombat(victor) {
    this.isGameOver = true;
    this.victor = victor;
    this.log("---");
    
    if (victor === "player") {
      this.log(`VICTORY! ${this.player.name} wins!`);
    } else if (victor === "enemy") {
      this.log(`DEFEAT! ${this.enemy.name} wins!`);
    } else if (victor === "fled") {
      this.log(`${this.player.name} fled the battle!`);
    }
  }

  // Logging
  /**
   * @param {string} message
   */
  log(message) {
    this.combatLog.push(message);
  }

  // Get current combatant
  getCurrentCombatant() {
    return this.currentTurn === "player" ? this.player : this.enemy;
  }

  /**
   * @param {Combatant} combatant
   * @returns {Combatant}
   */
  getOpponent(combatant) {
    return combatant === this.player ? this.enemy : this.player;
  }
}
