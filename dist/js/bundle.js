// dist/js/data.js
var CHARACTER_TYPE_DEFINITIONS = {
  human: {
    name: "Human",
    adjustments: {
      adjacentDamage: 3
    }
  },
  elf: {
    name: "Elf",
    adjustments: {
      closeQuartersAttack: 3
    }
  },
  halfling: {
    name: "Halfling",
    adjustments: {
      closeQuartersAttack: 3
    }
  },
  dwarf: {
    name: "Dwarf",
    adjustments: {
      closeQuartersAttack: 2,
      adjacentDamage: 3
    }
  },
  thief: {
    name: "Thief",
    adjustments: {
      closeQuartersAttack: 3
    }
  },
  zombie: {
    name: "Zombie",
    adjustments: {}
  },
  tiger: {
    name: "Tiger",
    adjustments: {}
  },
  dragon: {
    name: "Dragon",
    adjustments: {}
  },
  other: {
    name: "Other",
    adjustments: {}
  }
};
var CHARACTERS = [
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
var CREATURES = [
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

// dist/js/dice.js
function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function d20() {
  return roll(1, 20);
}

// dist/js/engine.js
var MAX_INITIATIVE_RETRIES = 10;
var combatState = {
  player: null,
  enemy: null,
  range: "adjacent",
  currentTurn: null,
  playerGoesFirst: false,
  combatLog: [],
  isGameOver: false,
  victor: null,
  turnCount: 0,
  initiativeRetries: 0
};
function initializeCombatant(data) {
  const combatant = {
    ...data,
    currentLifeForce: data.maxLifeForce,
    isUnconscious: false,
    lastAction: null,
    effectiveDexterity: 0,
    isWeak: false,
    isTackled: false
  };
  const armorPenalty = combatant.armor?.dexterityPenalty ?? 0;
  combatant.effectiveDexterity = combatant.baseDexterity - armorPenalty;
  return combatant;
}
function initCombat(player, enemy) {
  combatState.player = initializeCombatant(player);
  combatState.enemy = initializeCombatant(enemy);
  combatState.range = "adjacent";
  combatState.currentTurn = null;
  combatState.playerGoesFirst = false;
  combatState.combatLog = [];
  combatState.isGameOver = false;
  combatState.victor = null;
  combatState.turnCount = 0;
  combatState.initiativeRetries = 0;
}
function getCurrentWeapon(combatant) {
  if (combatState.range === "close_quarters") {
    return combatant.closeWeapon;
  }
  return combatant.adjacentWeapon;
}
function rollInitiative() {
  if (!combatState.player || !combatState.enemy)
    return;
  const playerRoll = d20();
  const enemyRoll = d20();
  const playerTotal = playerRoll + combatState.player.effectiveDexterity;
  const enemyTotal = enemyRoll + combatState.enemy.effectiveDexterity;
  log(`${combatState.player.name} rolled initiative: ${playerTotal} (1d20: ${playerRoll} + DEX: ${combatState.player.effectiveDexterity})`);
  log(`${combatState.enemy.name} rolled initiative: ${enemyTotal} (1d20: ${enemyRoll} + DEX: ${combatState.enemy.effectiveDexterity})`);
  if (playerTotal > enemyTotal) {
    combatState.playerGoesFirst = true;
    combatState.currentTurn = "player";
    log(`${combatState.player.name} goes first!`);
  } else if (enemyTotal > playerTotal) {
    combatState.playerGoesFirst = false;
    combatState.currentTurn = "enemy";
    log(`${combatState.enemy.name} goes first!`);
  } else {
    combatState.initiativeRetries++;
    if (combatState.initiativeRetries >= MAX_INITIATIVE_RETRIES) {
      log(`Tie! Maximum retries reached (${MAX_INITIATIVE_RETRIES}). Randomly determining initiative...`);
      if (Math.random() < 0.5) {
        combatState.playerGoesFirst = true;
        combatState.currentTurn = "player";
        log(`${combatState.player.name} goes first!`);
      } else {
        combatState.playerGoesFirst = false;
        combatState.currentTurn = "enemy";
        log(`${combatState.enemy.name} goes first!`);
      }
    } else {
      log("Tie! Re-rolling initiative...");
      rollInitiative();
      return;
    }
  }
  log("---");
}
function nextTurn() {
  if (combatState.player)
    combatState.player.isTackled = false;
  if (combatState.enemy)
    combatState.enemy.isTackled = false;
  combatState.currentTurn = combatState.currentTurn === "player" ? "enemy" : "player";
  combatState.turnCount++;
}
function getAttackBonus(combatant) {
  const typeDef = CHARACTER_TYPE_DEFINITIONS[combatant.type];
  if (combatState.range === "close_quarters") {
    return typeDef.adjustments.closeQuartersAttack ?? 0;
  } else {
    return typeDef.adjustments.adjacentAttack ?? 0;
  }
}
function getDamageBonus(combatant) {
  const typeDef = CHARACTER_TYPE_DEFINITIONS[combatant.type];
  if (combatState.range === "close_quarters") {
    return typeDef.adjustments.closeQuartersDamage ?? 0;
  } else {
    return typeDef.adjustments.adjacentDamage ?? 0;
  }
}
function attack(attacker, defender, isDefending) {
  if (!combatState.player || !combatState.enemy)
    return false;
  const attackerName = attacker === combatState.player ? combatState.player.name : combatState.enemy.name;
  const defenderName = defender === combatState.player ? combatState.player.name : combatState.enemy.name;
  const weapon = getCurrentWeapon(attacker);
  log(`${attackerName}'s Turn`);
  log(`${attackerName} attacks with ${weapon.name}!`);
  if (defender.isUnconscious) {
    log(`${defenderName} is unconscious and cannot defend!`);
    const damage = calculateDamage(attacker, defender);
    applyDamage(defender, damage);
    return true;
  }
  const attackBonus = getAttackBonus(attacker);
  const attackerRoll = d20();
  const attackerTotal = attackerRoll + attacker.effectiveDexterity + attackBonus;
  const defenderBonus = isDefending ? 5 : 0;
  const defenderPenalty = defender.isTackled ? -5 : 0;
  const defenderRoll = d20();
  const defenderTotal = defenderRoll + defender.effectiveDexterity + defenderBonus + defenderPenalty;
  log(`Attack roll: ${attackerTotal} (1d20: ${attackerRoll} + DEX: ${attacker.effectiveDexterity}${attackBonus > 0 ? ` + Bonus: ${attackBonus}` : ""})`);
  log(`Defense roll: ${defenderTotal} (1d20: ${defenderRoll} + DEX: ${defender.effectiveDexterity}${defenderBonus > 0 ? ` + Defend: ${defenderBonus}` : ""}${defenderPenalty < 0 ? ` - Tackled: ${Math.abs(defenderPenalty)}` : ""})`);
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
function calculateDamage(attacker, defender) {
  const weapon = getCurrentWeapon(attacker);
  const effectiveStrength = attacker.isWeak ? Math.max(1, attacker.strength - 3) : attacker.strength;
  const strRoll = roll(1, effectiveStrength);
  const damageBonus = getDamageBonus(attacker);
  const rawDamage = strRoll + weapon.power + damageBonus;
  const armorStrength = defender.armor?.strength ?? 0;
  const finalDamage = Math.max(0, rawDamage - armorStrength);
  const parts = [];
  parts.push(`STR: ${strRoll}`);
  parts.push(`Weapon: ${weapon.power}`);
  if (damageBonus > 0)
    parts.push(`Bonus: ${damageBonus}`);
  let calculation = parts.join(" + ");
  if (armorStrength > 0) {
    calculation += ` - AC: ${armorStrength}`;
  }
  log(`Damage: ${finalDamage} (${calculation})`);
  return finalDamage;
}
function applyDamage(target, damage) {
  if (!combatState.player || !combatState.enemy)
    return;
  const targetName = target === combatState.player ? combatState.player.name : combatState.enemy.name;
  const oldHP = target.currentLifeForce;
  target.currentLifeForce = Math.max(0, target.currentLifeForce - damage);
  if (damage === 0) {
    log(`${targetName}'s armor absorbs all the damage!`);
  } else {
    log(`${targetName} takes ${damage} damage! (${oldHP} \u2192 ${target.currentLifeForce} HP)`);
  }
  updateCombatantStatus(target);
  if (target.currentLifeForce === 0) {
    log(`${targetName} is defeated!`);
    endCombat(target === combatState.player ? "enemy" : "player");
  }
}
function updateCombatantStatus(combatant) {
  if (!combatState.player || !combatState.enemy)
    return;
  const targetName = combatant === combatState.player ? combatState.player.name : combatState.enemy.name;
  const unconsciousThreshold = Math.floor(combatant.maxLifeForce * 0.1);
  const wasUnconscious = combatant.isUnconscious;
  combatant.isUnconscious = combatant.currentLifeForce <= unconsciousThreshold && combatant.currentLifeForce > 0;
  if (combatant.isUnconscious && !wasUnconscious) {
    log(`${targetName} falls unconscious!`);
  }
  const wasWeak = combatant.isWeak;
  combatant.isWeak = combatant.currentLifeForce < combatant.maxLifeForce * 0.5;
  if (combatant.isWeak && !wasWeak) {
    log(`${targetName} is feeling weak...`);
  }
}
function defend(defender) {
  if (!combatState.player || !combatState.enemy)
    return;
  const defenderName = defender === combatState.player ? combatState.player.name : combatState.enemy.name;
  log(`${defenderName}'s Turn`);
  log(`${defenderName} takes a defensive stance!`);
  defender.lastAction = "defend";
}
function tackle(attacker, defender) {
  if (!combatState.player || !combatState.enemy)
    return false;
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
    defender.isTackled = true;
    log(`Success! ${attackerName} tackles ${defenderName} into close quarters!`);
    combatState.range = "close_quarters";
    return true;
  } else {
    log(`Failed! ${defenderName} avoids the tackle!`);
    return false;
  }
}
function disengage(attacker, defender) {
  if (!combatState.player || !combatState.enemy)
    return false;
  const attackerName = attacker === combatState.player ? combatState.player.name : combatState.enemy.name;
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
    combatState.range = "adjacent";
    return true;
  } else {
    log(`Failed! ${attackerName} remains in close quarters!`);
    return false;
  }
}
function runAway(runner) {
  if (!combatState.player || !combatState.enemy)
    return;
  const runnerName = runner === combatState.player ? combatState.player.name : combatState.enemy.name;
  log(`${runnerName} flees from combat!`);
  endCombat(runner === combatState.player ? "fled" : "player");
}
function attemptWakeUp(combatant) {
  if (!combatState.player || !combatState.enemy)
    return false;
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
function endCombat(victor) {
  if (!combatState.player || !combatState.enemy)
    return;
  combatState.isGameOver = true;
  combatState.victor = victor;
  log("---");
  if (victor === "player") {
    log(`VICTORY! ${combatState.player.name} wins!`);
  } else if (victor === "enemy") {
    log(`DEFEAT! ${combatState.enemy.name} wins!`);
  } else if (victor === "fled") {
    log(`${combatState.player.name} fled the battle!`);
  }
}
function log(message) {
  combatState.combatLog.push(message);
}

// dist/js/app.js
var appState = {
  selectedCharacter: null,
  selectedCreature: null,
  isProcessing: false
};
function getDifficulty(creature) {
  const score = creature.maxLifeForce + creature.strength + creature.baseDexterity;
  if (score < 40)
    return "Easy";
  if (score < 50)
    return "Medium";
  return "Hard";
}
function renderCharacterSelection() {
  const grid = document.getElementById("character-grid");
  if (!grid)
    return;
  grid.innerHTML = "";
  CHARACTERS.forEach((char, index) => {
    const card = document.createElement("div");
    card.className = "selection-card";
    card.dataset.index = index.toString();
    const armorText = char.armor ? `${char.armor.name} (${char.armor.strength})` : "None";
    card.innerHTML = `
      <h3>${char.name}</h3>
      <div class="card-type">${char.type}</div>
      <div class="card-stats">
        <div class="stat-row"><label>HP:</label> ${char.maxLifeForce}</div>
        <div class="stat-row"><label>STR:</label> ${char.strength}</div>
        <div class="stat-row"><label>DEX:</label> ${char.baseDexterity}</div>
        <div class="stat-row"><label>Weapon:</label> ${char.adjacentWeapon.name} (${char.adjacentWeapon.power})</div>
        <div class="stat-row"><label>Armor:</label> ${armorText}</div>
      </div>
    `;
    card.addEventListener("click", () => selectCharacter(index));
    grid.appendChild(card);
  });
}
function renderCreatureSelection() {
  const grid = document.getElementById("creature-grid");
  if (!grid)
    return;
  grid.innerHTML = "";
  CREATURES.forEach((creature, index) => {
    const card = document.createElement("div");
    card.className = "selection-card";
    card.dataset.index = index.toString();
    const difficulty = getDifficulty(creature);
    const armorText = creature.armor ? `${creature.armor.name} (${creature.armor.strength})` : "None";
    card.innerHTML = `
      <h3>${creature.name}</h3>
      <div class="card-type">${creature.type} - ${difficulty}</div>
      <div class="card-stats">
        <div class="stat-row"><label>HP:</label> ${creature.maxLifeForce}</div>
        <div class="stat-row"><label>STR:</label> ${creature.strength}</div>
        <div class="stat-row"><label>DEX:</label> ${creature.baseDexterity}</div>
        <div class="stat-row"><label>Weapon:</label> ${creature.adjacentWeapon.name} (${creature.adjacentWeapon.power})</div>
        <div class="stat-row"><label>Armor:</label> ${armorText}</div>
      </div>
    `;
    card.addEventListener("click", () => selectCreature(index));
    grid.appendChild(card);
  });
}
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add("active");
  }
}
function selectCharacter(index) {
  appState.selectedCharacter = CHARACTERS[index];
  showScreen("creature-selection");
}
function selectCreature(index) {
  appState.selectedCreature = CREATURES[index];
  startCombat();
}
function startCombat() {
  if (!appState.selectedCharacter || !appState.selectedCreature)
    return;
  initCombat(appState.selectedCharacter, appState.selectedCreature);
  rollInitiative();
  showScreen("combat-screen");
  updateUI();
  updateCombatLog();
  if (combatState.currentTurn === "enemy") {
    setTimeout(() => executeEnemyTurn(), 1e3);
  }
}
function updateUI() {
  if (!combatState.player || !combatState.enemy)
    return;
  updateStats("player", combatState.player);
  updateStats("enemy", combatState.enemy);
  updateCombatState();
  updateActionButtons();
  updateTurnHighlight();
}
function updateStats(side, combatant) {
  const container = document.getElementById(`${side}-stats`);
  if (!container)
    return;
  const weapon = getCurrentWeapon(combatant);
  const nameEl = container.querySelector(".stat-name");
  const typeEl = container.querySelector(".stat-type");
  if (nameEl)
    nameEl.textContent = combatant.name;
  if (typeEl)
    typeEl.textContent = combatant.type;
  const hpText = `${combatant.currentLifeForce}/${combatant.maxLifeForce}`;
  const hpTextEl = container.querySelector(".hp-text");
  if (hpTextEl)
    hpTextEl.textContent = hpText;
  const hpPercent = combatant.currentLifeForce / combatant.maxLifeForce * 100;
  const hpFill = container.querySelector(".hp-fill");
  if (hpFill) {
    hpFill.style.width = hpPercent + "%";
    hpFill.classList.remove("low", "medium");
    if (hpPercent <= 25) {
      hpFill.classList.add("low");
    } else if (hpPercent <= 50) {
      hpFill.classList.add("medium");
    }
  }
  const strEl = container.querySelector(".stat-str");
  if (strEl)
    strEl.textContent = combatant.strength.toString();
  const armorPenalty = combatant.armor?.dexterityPenalty ?? 0;
  const dexText = armorPenalty > 0 ? `${combatant.effectiveDexterity} (${combatant.baseDexterity}-${armorPenalty})` : combatant.effectiveDexterity.toString();
  const dexEl = container.querySelector(".stat-dex");
  if (dexEl)
    dexEl.textContent = dexText;
  const weaponEl = container.querySelector(".stat-weapon");
  if (weaponEl)
    weaponEl.textContent = `${weapon.name} (${weapon.power})`;
  const armorStrength = combatant.armor?.strength ?? 0;
  const armorName = combatant.armor?.name ?? "None";
  const armorEl = container.querySelector(".stat-armor");
  if (armorEl)
    armorEl.textContent = `${armorName} (${armorStrength})`;
  const statusDiv = container.querySelector(".stat-status");
  if (statusDiv) {
    statusDiv.classList.remove("normal", "weak", "unconscious");
    if (combatant.isUnconscious) {
      statusDiv.textContent = "UNCONSCIOUS";
      statusDiv.classList.add("unconscious");
    } else if (combatant.isWeak) {
      statusDiv.textContent = "Feeling Weak";
      statusDiv.classList.add("weak");
    } else {
      statusDiv.textContent = "Normal";
      statusDiv.classList.add("normal");
    }
  }
}
function updateCombatState() {
  const rangeText = combatState.range === "close_quarters" ? "Close Quarters" : "Adjacent";
  const rangeEl = document.getElementById("combat-range-text");
  if (rangeEl)
    rangeEl.textContent = rangeText;
  if (!combatState.enemy)
    return;
  const turnText = combatState.currentTurn === "player" ? "YOUR TURN" : `${combatState.enemy.name}'s Turn`;
  const turnEl = document.getElementById("current-turn-text");
  if (turnEl)
    turnEl.textContent = turnText;
}
function updateTurnHighlight() {
  const playerStats = document.getElementById("player-stats");
  const enemyStats = document.getElementById("enemy-stats");
  if (playerStats)
    playerStats.classList.remove("active-turn");
  if (enemyStats)
    enemyStats.classList.remove("active-turn");
  if (combatState.currentTurn === "player" && playerStats) {
    playerStats.classList.add("active-turn");
  } else if (enemyStats) {
    enemyStats.classList.add("active-turn");
  }
}
function updateActionButtons() {
  if (!combatState.player)
    return;
  const actionsPanel = document.getElementById("actions-panel");
  const attackBtn = document.getElementById("action-attack");
  const defendBtn = document.getElementById("action-defend");
  const tackleBtn = document.getElementById("action-tackle");
  const disengageBtn = document.getElementById("action-disengage");
  const runBtn = document.getElementById("action-run");
  const isPlayerTurn = combatState.currentTurn === "player" && !combatState.isGameOver;
  const isUnconscious = combatState.player.isUnconscious;
  if (actionsPanel)
    actionsPanel.style.opacity = isPlayerTurn && !isUnconscious ? "1" : "0.5";
  if (attackBtn)
    attackBtn.disabled = !isPlayerTurn || isUnconscious;
  if (defendBtn)
    defendBtn.disabled = !isPlayerTurn || isUnconscious;
  if (runBtn)
    runBtn.disabled = !isPlayerTurn || isUnconscious;
  if (combatState.range === "adjacent") {
    if (tackleBtn) {
      tackleBtn.classList.remove("hidden");
      tackleBtn.disabled = !isPlayerTurn || isUnconscious;
    }
    if (disengageBtn)
      disengageBtn.classList.add("hidden");
  } else {
    if (tackleBtn)
      tackleBtn.classList.add("hidden");
    if (disengageBtn) {
      disengageBtn.classList.remove("hidden");
      disengageBtn.disabled = !isPlayerTurn || isUnconscious;
    }
  }
}
function updateCombatLog() {
  const logDiv = document.getElementById("combat-log");
  if (!logDiv)
    return;
  logDiv.innerHTML = "";
  combatState.combatLog.forEach((message) => {
    const line = document.createElement("div");
    if (message === "---") {
      line.className = "separator";
    } else if (message.includes("VICTORY") || message.includes("DEFEAT") || message.includes("wins")) {
      line.className = "success";
    } else if (message.includes("damage") || message.includes("takes")) {
      line.className = "damage";
    } else if (message.includes("Turn")) {
      line.className = "important";
    }
    line.textContent = message;
    logDiv.appendChild(line);
  });
  logDiv.scrollTop = logDiv.scrollHeight;
}
async function playerAction(action) {
  if (!combatState.player || !combatState.enemy)
    return;
  if (appState.isProcessing || combatState.currentTurn !== "player" || combatState.isGameOver) {
    return;
  }
  appState.isProcessing = true;
  if (combatState.player.isUnconscious) {
    attemptWakeUp(combatState.player);
    updateCombatLog();
    updateUI();
    nextTurn();
    appState.isProcessing = false;
    setTimeout(() => executeEnemyTurn(), 1e3);
    return;
  }
  let performedAction = false;
  const defender = combatState.enemy;
  const wasDefending = defender.lastAction === "defend";
  defender.lastAction = null;
  switch (action) {
    case "attack":
      attack(combatState.player, defender, wasDefending);
      performedAction = true;
      break;
    case "defend":
      defend(combatState.player);
      combatState.player.lastAction = "defend";
      performedAction = true;
      break;
    case "tackle": {
      tackle(combatState.player, defender);
      combatState.combatLog.push("---");
      updateCombatLog();
      updateUI();
      const followUp = await promptFollowUpAction(["attack", "defend"]);
      if (followUp === "attack") {
        attack(combatState.player, defender, wasDefending);
      } else {
        defend(combatState.player);
        combatState.player.lastAction = "defend";
      }
      performedAction = true;
      break;
    }
    case "disengage": {
      disengage(combatState.player, defender);
      combatState.combatLog.push("---");
      updateCombatLog();
      updateUI();
      const followUp2 = await promptFollowUpAction(["attack", "defend"]);
      if (followUp2 === "attack") {
        attack(combatState.player, defender, wasDefending);
      } else {
        defend(combatState.player);
        combatState.player.lastAction = "defend";
      }
      performedAction = true;
      break;
    }
    case "run":
      runAway(combatState.player);
      performedAction = true;
      break;
  }
  if (performedAction) {
    combatState.combatLog.push("---");
    updateCombatLog();
    updateUI();
    if (combatState.isGameOver) {
      showGameOver();
      appState.isProcessing = false;
      return;
    }
    nextTurn();
    updateUI();
    appState.isProcessing = false;
    setTimeout(() => executeEnemyTurn(), 1e3);
  } else {
    appState.isProcessing = false;
  }
}
function promptFollowUpAction(actions) {
  return new Promise((resolve) => {
    const originalButtons = {
      attack: document.getElementById("action-attack"),
      defend: document.getElementById("action-defend"),
      tackle: document.getElementById("action-tackle"),
      disengage: document.getElementById("action-disengage"),
      run: document.getElementById("action-run")
    };
    const cleanup = () => {
      Object.values(originalButtons).forEach((btn) => {
        if (btn)
          btn.disabled = false;
      });
      if (originalButtons.tackle)
        originalButtons.tackle.classList.remove("hidden");
      if (originalButtons.disengage)
        originalButtons.disengage.classList.add("hidden");
    };
    Object.keys(originalButtons).forEach((key) => {
      const btn = originalButtons[key];
      if (btn && !actions.includes(key)) {
        btn.disabled = true;
      }
    });
    const handler = (action) => {
      cleanup();
      resolve(action);
    };
    const attackHandler = () => handler("attack");
    const defendHandler = () => handler("defend");
    if (originalButtons.attack) {
      originalButtons.attack.addEventListener("click", attackHandler, {
        once: true
      });
    }
    if (originalButtons.defend) {
      originalButtons.defend.addEventListener("click", defendHandler, {
        once: true
      });
    }
  });
}
function executeEnemyTurn() {
  if (!combatState.player || !combatState.enemy)
    return;
  if (combatState.isGameOver || combatState.currentTurn !== "enemy") {
    return;
  }
  if (combatState.enemy.isUnconscious) {
    attemptWakeUp(combatState.enemy);
    combatState.combatLog.push("---");
    updateCombatLog();
    updateUI();
    nextTurn();
    updateUI();
    return;
  }
  const action = getEnemyAction();
  const defender = combatState.player;
  const wasDefending = defender.lastAction === "defend";
  defender.lastAction = null;
  setTimeout(() => {
    if (!combatState.enemy || !combatState.player)
      return;
    if (action === "attack") {
      attack(combatState.enemy, defender, wasDefending);
    } else if (action === "defend") {
      defend(combatState.enemy);
      combatState.enemy.lastAction = "defend";
    } else if (action === "tackle") {
      tackle(combatState.enemy, defender);
      combatState.combatLog.push("---");
      updateCombatLog();
      updateUI();
      setTimeout(() => {
        if (!combatState.enemy || !combatState.player)
          return;
        attack(combatState.enemy, defender, wasDefending);
        finishEnemyTurn();
      }, 800);
      return;
    } else if (action === "disengage") {
      disengage(combatState.enemy, defender);
      combatState.combatLog.push("---");
      updateCombatLog();
      updateUI();
      setTimeout(() => {
        if (!combatState.enemy || !combatState.player)
          return;
        attack(combatState.enemy, defender, wasDefending);
        finishEnemyTurn();
      }, 800);
      return;
    }
    finishEnemyTurn();
  }, 500);
}
function finishEnemyTurn() {
  combatState.combatLog.push("---");
  updateCombatLog();
  updateUI();
  if (combatState.isGameOver) {
    showGameOver();
    return;
  }
  nextTurn();
  updateUI();
}
function getEnemyAction() {
  if (!combatState.enemy)
    return "attack";
  const rand = Math.random();
  if (rand < 0.85) {
    return "attack";
  }
  if (rand < 0.95 && combatState.enemy.isWeak) {
    return "defend";
  }
  if (combatState.range === "adjacent") {
    return "tackle";
  } else {
    return "disengage";
  }
}
function showGameOver() {
  if (!combatState.player || !combatState.enemy)
    return;
  const panel = document.getElementById("game-over-panel");
  const title = document.getElementById("game-over-title");
  const message = document.getElementById("game-over-message");
  if (!panel || !title || !message)
    return;
  if (combatState.victor === "player") {
    title.textContent = "\u{1F389} VICTORY! \u{1F389}";
    title.style.color = "#4caf50";
    message.textContent = `${combatState.player.name} has defeated ${combatState.enemy.name}!`;
  } else if (combatState.victor === "enemy") {
    title.textContent = "\u{1F480} DEFEAT \u{1F480}";
    title.style.color = "#f44336";
    message.textContent = `${combatState.enemy.name} has defeated ${combatState.player.name}!`;
  } else if (combatState.victor === "fled") {
    title.textContent = "\u{1F3C3} FLED \u{1F3C3}";
    title.style.color = "#ff9800";
    message.textContent = `${combatState.player.name} fled from combat!`;
  }
  panel.classList.remove("hidden");
}
function attachEventListeners() {
  const backBtn = document.getElementById("back-to-characters");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      showScreen("character-selection");
    });
  }
  const actionAttack = document.getElementById("action-attack");
  if (actionAttack)
    actionAttack.addEventListener("click", () => playerAction("attack"));
  const actionDefend = document.getElementById("action-defend");
  if (actionDefend)
    actionDefend.addEventListener("click", () => playerAction("defend"));
  const actionTackle = document.getElementById("action-tackle");
  if (actionTackle)
    actionTackle.addEventListener("click", () => playerAction("tackle"));
  const actionDisengage = document.getElementById("action-disengage");
  if (actionDisengage)
    actionDisengage.addEventListener("click", () => playerAction("disengage"));
  const actionRun = document.getElementById("action-run");
  if (actionRun)
    actionRun.addEventListener("click", () => playerAction("run"));
  const newCombatBtn = document.getElementById("new-combat-btn");
  if (newCombatBtn) {
    newCombatBtn.addEventListener("click", () => {
      showScreen("character-selection");
      appState.selectedCharacter = null;
      appState.selectedCreature = null;
    });
  }
}
function init() {
  renderCharacterSelection();
  renderCreatureSelection();
  attachEventListeners();
}
document.addEventListener("DOMContentLoaded", () => {
  init();
});
//# sourceMappingURL=bundle.js.map
