// UI Controller

import type { Character, Combatant } from './types';
import { CHARACTERS, CREATURES } from './data';
import {
  combatState,
  initCombat,
  rollInitiative,
  attack,
  defend,
  tackle,
  disengage,
  runAway,
  attemptWakeUp,
  nextTurn,
  getCurrentWeapon,
} from './engine';

// App state
interface AppState {
  selectedCharacter: Character | null;
  selectedCreature: Character | null;
  isProcessing: boolean;
}

const appState: AppState = {
  selectedCharacter: null,
  selectedCreature: null,
  isProcessing: false,
};

// Calculate difficulty rating for creatures
function getDifficulty(creature: Character): string {
  const score =
    creature.maxLifeForce + creature.strength + creature.baseDexterity;
  if (score < 40) return 'Easy';
  if (score < 50) return 'Medium';
  return 'Hard';
}

// Render character selection cards
function renderCharacterSelection(): void {
  const grid = document.getElementById('character-grid');
  if (!grid) return;

  grid.innerHTML = '';

  CHARACTERS.forEach((char, index) => {
    const card = document.createElement('div');
    card.className = 'selection-card';
    card.dataset.index = index.toString();

    const armorText = char.armor
      ? `${char.armor.name} (${char.armor.strength})`
      : 'None';

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

    card.addEventListener('click', () => selectCharacter(index));
    grid.appendChild(card);
  });
}

// Render creature selection cards
function renderCreatureSelection(): void {
  const grid = document.getElementById('creature-grid');
  if (!grid) return;

  grid.innerHTML = '';

  CREATURES.forEach((creature, index) => {
    const card = document.createElement('div');
    card.className = 'selection-card';
    card.dataset.index = index.toString();

    const difficulty = getDifficulty(creature);
    const armorText = creature.armor
      ? `${creature.armor.name} (${creature.armor.strength})`
      : 'None';

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

    card.addEventListener('click', () => selectCreature(index));
    grid.appendChild(card);
  });
}

// Screen management
function showScreen(screenId: string): void {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

// Select character
function selectCharacter(index: number): void {
  appState.selectedCharacter = CHARACTERS[index];
  showScreen('creature-selection');
}

// Select creature and start combat
function selectCreature(index: number): void {
  appState.selectedCreature = CREATURES[index];
  startCombat();
}

// Start combat
function startCombat(): void {
  if (!appState.selectedCharacter || !appState.selectedCreature) return;

  initCombat(appState.selectedCharacter, appState.selectedCreature);
  rollInitiative();

  showScreen('combat-screen');
  updateUI();
  updateCombatLog();

  // If enemy goes first, execute their turn after a delay
  if (combatState.currentTurn === 'enemy') {
    setTimeout(() => executeEnemyTurn(), 1000);
  }
}

// Update UI
function updateUI(): void {
  if (!combatState.player || !combatState.enemy) return;

  updateStats('player', combatState.player);
  updateStats('enemy', combatState.enemy);
  updateCombatState();
  updateActionButtons();
  updateTurnHighlight();
}

// Update combatant stats
function updateStats(side: 'player' | 'enemy', combatant: Combatant): void {
  const container = document.getElementById(`${side}-stats`);
  if (!container) return;

  const weapon = getCurrentWeapon(combatant);

  const nameEl = container.querySelector('.stat-name');
  const typeEl = container.querySelector('.stat-type');
  if (nameEl) nameEl.textContent = combatant.name;
  if (typeEl) typeEl.textContent = combatant.type;

  // HP
  const hpText = `${combatant.currentLifeForce}/${combatant.maxLifeForce}`;
  const hpTextEl = container.querySelector('.hp-text');
  if (hpTextEl) hpTextEl.textContent = hpText;

  const hpPercent = (combatant.currentLifeForce / combatant.maxLifeForce) * 100;
  const hpFill = container.querySelector('.hp-fill') as HTMLElement;
  if (hpFill) {
    hpFill.style.width = hpPercent + '%';

    // HP bar color
    hpFill.classList.remove('low', 'medium');
    if (hpPercent <= 25) {
      hpFill.classList.add('low');
    } else if (hpPercent <= 50) {
      hpFill.classList.add('medium');
    }
  }

  // Stats
  const strEl = container.querySelector('.stat-str');
  if (strEl) strEl.textContent = combatant.strength.toString();

  const armorPenalty = combatant.armor?.dexterityPenalty ?? 0;
  const dexText =
    armorPenalty > 0
      ? `${combatant.effectiveDexterity} (${combatant.baseDexterity}-${armorPenalty})`
      : combatant.effectiveDexterity.toString();
  const dexEl = container.querySelector('.stat-dex');
  if (dexEl) dexEl.textContent = dexText;

  const weaponEl = container.querySelector('.stat-weapon');
  if (weaponEl) weaponEl.textContent = `${weapon.name} (${weapon.power})`;

  const armorStrength = combatant.armor?.strength ?? 0;
  const armorName = combatant.armor?.name ?? 'None';
  const armorEl = container.querySelector('.stat-armor');
  if (armorEl) armorEl.textContent = `${armorName} (${armorStrength})`;

  // Status
  const statusDiv = container.querySelector('.stat-status');
  if (statusDiv) {
    statusDiv.classList.remove('normal', 'weak', 'unconscious');

    if (combatant.isUnconscious) {
      statusDiv.textContent = 'UNCONSCIOUS';
      statusDiv.classList.add('unconscious');
    } else if (combatant.isWeak) {
      statusDiv.textContent = 'Feeling Weak';
      statusDiv.classList.add('weak');
    } else {
      statusDiv.textContent = 'Normal';
      statusDiv.classList.add('normal');
    }
  }
}

// Update combat state
function updateCombatState(): void {
  const rangeText =
    combatState.range === 'close_quarters' ? 'Close Quarters' : 'Adjacent';
  const rangeEl = document.getElementById('combat-range-text');
  if (rangeEl) rangeEl.textContent = rangeText;

  if (!combatState.enemy) return;
  const turnText =
    combatState.currentTurn === 'player'
      ? 'YOUR TURN'
      : `${combatState.enemy.name}'s Turn`;
  const turnEl = document.getElementById('current-turn-text');
  if (turnEl) turnEl.textContent = turnText;
}

// Update turn highlight
function updateTurnHighlight(): void {
  const playerStats = document.getElementById('player-stats');
  const enemyStats = document.getElementById('enemy-stats');

  if (playerStats) playerStats.classList.remove('active-turn');
  if (enemyStats) enemyStats.classList.remove('active-turn');

  if (combatState.currentTurn === 'player' && playerStats) {
    playerStats.classList.add('active-turn');
  } else if (enemyStats) {
    enemyStats.classList.add('active-turn');
  }
}

// Update action buttons
function updateActionButtons(): void {
  if (!combatState.player) return;

  const actionsPanel = document.getElementById('actions-panel') as HTMLElement;
  const attackBtn = document.getElementById(
    'action-attack',
  ) as HTMLButtonElement;
  const defendBtn = document.getElementById(
    'action-defend',
  ) as HTMLButtonElement;
  const tackleBtn = document.getElementById(
    'action-tackle',
  ) as HTMLButtonElement;
  const disengageBtn = document.getElementById(
    'action-disengage',
  ) as HTMLButtonElement;
  const runBtn = document.getElementById('action-run') as HTMLButtonElement;

  // Disable all if not player's turn or game over
  const isPlayerTurn =
    combatState.currentTurn === 'player' && !combatState.isGameOver;
  const isUnconscious = combatState.player.isUnconscious;

  if (actionsPanel)
    actionsPanel.style.opacity = isPlayerTurn && !isUnconscious ? '1' : '0.5';

  if (attackBtn) attackBtn.disabled = !isPlayerTurn || isUnconscious;
  if (defendBtn) defendBtn.disabled = !isPlayerTurn || isUnconscious;
  if (runBtn) runBtn.disabled = !isPlayerTurn || isUnconscious;

  // Show/hide tackle/disengage based on range
  if (combatState.range === 'adjacent') {
    if (tackleBtn) {
      tackleBtn.classList.remove('hidden');
      tackleBtn.disabled = !isPlayerTurn || isUnconscious;
    }
    if (disengageBtn) disengageBtn.classList.add('hidden');
  } else {
    if (tackleBtn) tackleBtn.classList.add('hidden');
    if (disengageBtn) {
      disengageBtn.classList.remove('hidden');
      disengageBtn.disabled = !isPlayerTurn || isUnconscious;
    }
  }
}

// Update combat log
function updateCombatLog(): void {
  const logDiv = document.getElementById('combat-log');
  if (!logDiv) return;

  logDiv.innerHTML = '';

  combatState.combatLog.forEach((message) => {
    const line = document.createElement('div');

    if (message === '---') {
      line.className = 'separator';
    } else if (
      message.includes('VICTORY') ||
      message.includes('DEFEAT') ||
      message.includes('wins')
    ) {
      line.className = 'success';
    } else if (message.includes('damage') || message.includes('takes')) {
      line.className = 'damage';
    } else if (message.includes('Turn')) {
      line.className = 'important';
    }

    line.textContent = message;
    logDiv.appendChild(line);
  });

  // Auto-scroll to bottom
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Player action
async function playerAction(action: string): Promise<void> {
  if (!combatState.player || !combatState.enemy) return;
  if (
    appState.isProcessing ||
    combatState.currentTurn !== 'player' ||
    combatState.isGameOver
  ) {
    return;
  }

  appState.isProcessing = true;

  // Check if unconscious
  if (combatState.player.isUnconscious) {
    attemptWakeUp(combatState.player);
    updateCombatLog();
    updateUI();
    nextTurn();
    appState.isProcessing = false;

    setTimeout(() => executeEnemyTurn(), 1000);
    return;
  }

  let performedAction = false;
  const defender = combatState.enemy;
  const wasDefending = defender.lastAction === 'defend';
  defender.lastAction = null;

  switch (action) {
    case 'attack':
      attack(combatState.player, defender, wasDefending);
      performedAction = true;
      break;

    case 'defend':
      defend(combatState.player);
      combatState.player.lastAction = 'defend';
      performedAction = true;
      break;

    case 'tackle': {
      tackle(combatState.player, defender);
      combatState.combatLog.push('---');
      updateCombatLog();
      updateUI();

      const followUp = await promptFollowUpAction(['attack', 'defend']);
      if (followUp === 'attack') {
        attack(combatState.player, defender, wasDefending);
      } else {
        defend(combatState.player);
        combatState.player.lastAction = 'defend';
      }
      performedAction = true;
      break;
    }

    case 'disengage': {
      disengage(combatState.player, defender);
      combatState.combatLog.push('---');
      updateCombatLog();
      updateUI();

      const followUp2 = await promptFollowUpAction(['attack', 'defend']);
      if (followUp2 === 'attack') {
        attack(combatState.player, defender, wasDefending);
      } else {
        defend(combatState.player);
        combatState.player.lastAction = 'defend';
      }
      performedAction = true;
      break;
    }

    case 'run':
      runAway(combatState.player);
      performedAction = true;
      break;
  }

  if (performedAction) {
    combatState.combatLog.push('---');
    updateCombatLog();
    updateUI();

    // Check if game over
    if (combatState.isGameOver) {
      showGameOver();
      appState.isProcessing = false;
      return;
    }

    // Next turn
    nextTurn();
    updateUI();

    appState.isProcessing = false;

    // Enemy turn
    setTimeout(() => executeEnemyTurn(), 1000);
  } else {
    appState.isProcessing = false;
  }
}

// Prompt for follow-up action after maneuver
function promptFollowUpAction(actions: string[]): Promise<string> {
  return new Promise((resolve) => {
    const originalButtons = {
      attack: document.getElementById('action-attack') as HTMLButtonElement,
      defend: document.getElementById('action-defend') as HTMLButtonElement,
      tackle: document.getElementById('action-tackle') as HTMLButtonElement,
      disengage: document.getElementById(
        'action-disengage',
      ) as HTMLButtonElement,
      run: document.getElementById('action-run') as HTMLButtonElement,
    };

    // Temporarily modify buttons
    const cleanup = () => {
      Object.values(originalButtons).forEach((btn) => {
        if (btn) btn.disabled = false;
      });
      if (originalButtons.tackle)
        originalButtons.tackle.classList.remove('hidden');
      if (originalButtons.disengage)
        originalButtons.disengage.classList.add('hidden');
    };

    // Disable non-allowed actions
    Object.keys(originalButtons).forEach((key) => {
      const btn = originalButtons[key as keyof typeof originalButtons];
      if (btn && !actions.includes(key)) {
        btn.disabled = true;
      }
    });

    const handler = (action: string) => {
      cleanup();
      resolve(action);
    };

    // Add one-time listeners
    const attackHandler = () => handler('attack');
    const defendHandler = () => handler('defend');

    if (originalButtons.attack) {
      originalButtons.attack.addEventListener('click', attackHandler, {
        once: true,
      });
    }
    if (originalButtons.defend) {
      originalButtons.defend.addEventListener('click', defendHandler, {
        once: true,
      });
    }
  });
}

// Execute enemy turn
function executeEnemyTurn(): void {
  if (!combatState.player || !combatState.enemy) return;
  if (combatState.isGameOver || combatState.currentTurn !== 'enemy') {
    return;
  }

  // Check if unconscious
  if (combatState.enemy.isUnconscious) {
    attemptWakeUp(combatState.enemy);
    combatState.combatLog.push('---');
    updateCombatLog();
    updateUI();
    nextTurn();
    updateUI();
    return;
  }

  const action = getEnemyAction();
  const defender = combatState.player;
  const wasDefending = defender.lastAction === 'defend';
  defender.lastAction = null;

  setTimeout(() => {
    if (!combatState.enemy || !combatState.player) return;

    if (action === 'attack') {
      attack(combatState.enemy, defender, wasDefending);
    } else if (action === 'defend') {
      defend(combatState.enemy);
      combatState.enemy.lastAction = 'defend';
    } else if (action === 'tackle') {
      tackle(combatState.enemy, defender);
      combatState.combatLog.push('---');
      updateCombatLog();
      updateUI();

      setTimeout(() => {
        if (!combatState.enemy || !combatState.player) return;
        attack(combatState.enemy, defender, wasDefending);
        finishEnemyTurn();
      }, 800);
      return;
    } else if (action === 'disengage') {
      disengage(combatState.enemy, defender);
      combatState.combatLog.push('---');
      updateCombatLog();
      updateUI();

      setTimeout(() => {
        if (!combatState.enemy || !combatState.player) return;
        attack(combatState.enemy, defender, wasDefending);
        finishEnemyTurn();
      }, 800);
      return;
    }

    finishEnemyTurn();
  }, 500);
}

function finishEnemyTurn(): void {
  combatState.combatLog.push('---');
  updateCombatLog();
  updateUI();

  if (combatState.isGameOver) {
    showGameOver();
    return;
  }

  nextTurn();
  updateUI();
}

// Enemy AI
function getEnemyAction(): string {
  if (!combatState.enemy) return 'attack';

  const rand = Math.random();

  // 85% attack
  if (rand < 0.85) {
    return 'attack';
  }

  // 10% defend if weak
  if (rand < 0.95 && combatState.enemy.isWeak) {
    return 'defend';
  }

  // 5% tactical
  if (combatState.range === 'adjacent') {
    return 'tackle';
  } else {
    return 'disengage';
  }
}

// Show game over
function showGameOver(): void {
  if (!combatState.player || !combatState.enemy) return;

  const panel = document.getElementById('game-over-panel');
  const title = document.getElementById('game-over-title') as HTMLElement;
  const message = document.getElementById('game-over-message');

  if (!panel || !title || !message) return;

  if (combatState.victor === 'player') {
    title.textContent = '🎉 VICTORY! 🎉';
    title.style.color = '#4caf50';
    message.textContent = `${combatState.player.name} has defeated ${combatState.enemy.name}!`;
  } else if (combatState.victor === 'enemy') {
    title.textContent = '💀 DEFEAT 💀';
    title.style.color = '#f44336';
    message.textContent = `${combatState.enemy.name} has defeated ${combatState.player.name}!`;
  } else if (combatState.victor === 'fled') {
    title.textContent = '🏃 FLED 🏃';
    title.style.color = '#ff9800';
    message.textContent = `${combatState.player.name} fled from combat!`;
  }

  panel.classList.remove('hidden');
}

// Attach event listeners
function attachEventListeners(): void {
  const backBtn = document.getElementById('back-to-characters');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showScreen('character-selection');
    });
  }

  const actionAttack = document.getElementById('action-attack');
  if (actionAttack)
    actionAttack.addEventListener('click', () => playerAction('attack'));

  const actionDefend = document.getElementById('action-defend');
  if (actionDefend)
    actionDefend.addEventListener('click', () => playerAction('defend'));

  const actionTackle = document.getElementById('action-tackle');
  if (actionTackle)
    actionTackle.addEventListener('click', () => playerAction('tackle'));

  const actionDisengage = document.getElementById('action-disengage');
  if (actionDisengage)
    actionDisengage.addEventListener('click', () => playerAction('disengage'));

  const actionRun = document.getElementById('action-run');
  if (actionRun) actionRun.addEventListener('click', () => playerAction('run'));

  const newCombatBtn = document.getElementById('new-combat-btn');
  if (newCombatBtn) {
    newCombatBtn.addEventListener('click', () => {
      showScreen('character-selection');
      appState.selectedCharacter = null;
      appState.selectedCreature = null;
    });
  }
}

// Initialize app
function init(): void {
  renderCharacterSelection();
  renderCreatureSelection();
  attachEventListeners();
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});
