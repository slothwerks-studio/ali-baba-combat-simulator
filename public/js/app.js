// UI Controller

class CombatApp {
  constructor() {
    this.selectedCharacter = null;
    this.selectedCreature = null;
    this.combat = null;
    this.isProcessing = false;

    this.init();
  }

  init() {
    this.renderCharacterSelection();
    this.renderCreatureSelection();
    this.attachEventListeners();
  }

  // Render character selection cards
  renderCharacterSelection() {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';

    CHARACTERS.forEach((char, index) => {
      const card = document.createElement('div');
      card.className = 'selection-card';
      card.dataset.index = index;
      
      card.innerHTML = `
        <h3>${char.name}</h3>
        <div class="card-type">${char.characterType}</div>
        <div class="card-stats">
          <div class="stat-row"><label>HP:</label> ${char.maxLifeForce}</div>
          <div class="stat-row"><label>STR:</label> ${char.strength}</div>
          <div class="stat-row"><label>DEX:</label> ${char.baseDexterity}</div>
          <div class="stat-row"><label>Weapon:</label> ${char.weapon.name} (${char.weapon.power})</div>
          <div class="stat-row"><label>Armor:</label> ${char.armor.name} (${char.armor.armorClass})</div>
        </div>
      `;

      card.addEventListener('click', () => this.selectCharacter(index));
      grid.appendChild(card);
    });
  }

  // Render creature selection cards
  renderCreatureSelection() {
    const grid = document.getElementById('creature-grid');
    grid.innerHTML = '';

    CREATURES.forEach((creature, index) => {
      const card = document.createElement('div');
      card.className = 'selection-card';
      card.dataset.index = index;
      
      const difficulty = this.getDifficulty(creature);
      
      card.innerHTML = `
        <h3>${creature.name}</h3>
        <div class="card-type">${creature.characterType} - ${difficulty}</div>
        <div class="card-stats">
          <div class="stat-row"><label>HP:</label> ${creature.maxLifeForce}</div>
          <div class="stat-row"><label>STR:</label> ${creature.strength}</div>
          <div class="stat-row"><label>DEX:</label> ${creature.baseDexterity}</div>
          <div class="stat-row"><label>Weapon:</label> ${creature.weapon.name} (${creature.weapon.power})</div>
          <div class="stat-row"><label>Armor:</label> ${creature.armor.name} (${creature.armor.armorClass})</div>
        </div>
      `;

      card.addEventListener('click', () => this.selectCreature(index));
      grid.appendChild(card);
    });
  }

  getDifficulty(creature) {
    const score = creature.maxLifeForce + creature.strength + creature.baseDexterity;
    if (score < 40) return 'Easy';
    if (score < 50) return 'Medium';
    return 'Hard';
  }

  // Event listeners
  attachEventListeners() {
    document.getElementById('back-to-characters').addEventListener('click', () => {
      this.showScreen('character-selection');
    });

    document.getElementById('action-attack').addEventListener('click', () => this.playerAction('attack'));
    document.getElementById('action-defend').addEventListener('click', () => this.playerAction('defend'));
    document.getElementById('action-tackle').addEventListener('click', () => this.playerAction('tackle'));
    document.getElementById('action-disengage').addEventListener('click', () => this.playerAction('disengage'));
    document.getElementById('action-run').addEventListener('click', () => this.playerAction('run'));
    
    document.getElementById('new-combat-btn').addEventListener('click', () => {
      this.showScreen('character-selection');
      this.selectedCharacter = null;
      this.selectedCreature = null;
      this.combat = null;
    });
  }

  // Screen management
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
  }

  // Select character
  selectCharacter(index) {
    this.selectedCharacter = CHARACTERS[index];
    this.showScreen('creature-selection');
  }

  // Select creature and start combat
  selectCreature(index) {
    this.selectedCreature = CREATURES[index];
    this.startCombat();
  }

  // Start combat
  startCombat() {
    this.combat = new CombatEngine(this.selectedCharacter, this.selectedCreature);
    this.combat.rollInitiative();
    
    this.showScreen('combat-screen');
    this.updateUI();
    this.updateCombatLog();
    
    // If enemy goes first, execute their turn after a delay
    if (this.combat.currentTurn === 'enemy') {
      setTimeout(() => this.executeEnemyTurn(), 1000);
    }
  }

  // Update UI
  updateUI() {
    this.updateStats('player', this.combat.player);
    this.updateStats('enemy', this.combat.enemy);
    this.updateCombatState();
    this.updateActionButtons();
    this.updateTurnHighlight();
  }

  // Update combatant stats
  updateStats(side, combatant) {
    const container = document.getElementById(`${side}-stats`);
    const weapon = this.combat.getCurrentWeapon(combatant);
    
    container.querySelector('.stat-name').textContent = combatant.name;
    container.querySelector('.stat-type').textContent = combatant.characterType;
    
    // HP
    const hpText = `${combatant.currentLifeForce}/${combatant.maxLifeForce}`;
    container.querySelector('.hp-text').textContent = hpText;
    
    const hpPercent = (combatant.currentLifeForce / combatant.maxLifeForce) * 100;
    const hpFill = container.querySelector('.hp-fill');
    hpFill.style.width = hpPercent + '%';
    
    // HP bar color
    hpFill.classList.remove('low', 'medium');
    if (hpPercent <= 25) {
      hpFill.classList.add('low');
    } else if (hpPercent <= 50) {
      hpFill.classList.add('medium');
    }
    
    // Stats
    container.querySelector('.stat-str').textContent = combatant.strength;
    const dexText = combatant.armor.dexterityPenalty > 0 
      ? `${combatant.effectiveDexterity} (${combatant.baseDexterity}-${combatant.armor.dexterityPenalty})`
      : combatant.effectiveDexterity;
    container.querySelector('.stat-dex').textContent = dexText;
    
    container.querySelector('.stat-weapon').textContent = `${weapon.name} (${weapon.power})`;
    container.querySelector('.stat-armor').textContent = `${combatant.armor.name} (${combatant.armor.armorClass})`;
    
    // Status
    const statusDiv = container.querySelector('.stat-status');
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

  // Update combat state
  updateCombatState() {
    const rangeText = this.combat.range === 'close_quarters' ? 'Close Quarters' : 'Adjacent';
    document.getElementById('combat-range-text').textContent = rangeText;
    
    const turnText = this.combat.currentTurn === 'player' ? 'YOUR TURN' : `${this.combat.enemy.name}'s Turn`;
    document.getElementById('current-turn-text').textContent = turnText;
  }

  // Update turn highlight
  updateTurnHighlight() {
    const playerStats = document.getElementById('player-stats');
    const enemyStats = document.getElementById('enemy-stats');
    
    playerStats.classList.remove('active-turn');
    enemyStats.classList.remove('active-turn');
    
    if (this.combat.currentTurn === 'player') {
      playerStats.classList.add('active-turn');
    } else {
      enemyStats.classList.add('active-turn');
    }
  }

  // Update action buttons
  updateActionButtons() {
    const actionsPanel = document.getElementById('actions-panel');
    const attackBtn = document.getElementById('action-attack');
    const defendBtn = document.getElementById('action-defend');
    const tackleBtn = document.getElementById('action-tackle');
    const disengageBtn = document.getElementById('action-disengage');
    const runBtn = document.getElementById('action-run');

    // Disable all if not player's turn or game over
    const isPlayerTurn = this.combat.currentTurn === 'player' && !this.combat.isGameOver;
    const isUnconscious = this.combat.player.isUnconscious;

    actionsPanel.style.opacity = isPlayerTurn && !isUnconscious ? '1' : '0.5';

    attackBtn.disabled = !isPlayerTurn || isUnconscious;
    defendBtn.disabled = !isPlayerTurn || isUnconscious;
    runBtn.disabled = !isPlayerTurn || isUnconscious;

    // Show/hide tackle/disengage based on range
    if (this.combat.range === 'adjacent') {
      tackleBtn.classList.remove('hidden');
      disengageBtn.classList.add('hidden');
      tackleBtn.disabled = !isPlayerTurn || isUnconscious;
    } else {
      tackleBtn.classList.add('hidden');
      disengageBtn.classList.remove('hidden');
      disengageBtn.disabled = !isPlayerTurn || isUnconscious;
    }
  }

  // Update combat log
  updateCombatLog() {
    const logDiv = document.getElementById('combat-log');
    logDiv.innerHTML = '';

    this.combat.combatLog.forEach(message => {
      const line = document.createElement('div');
      
      if (message === '---') {
        line.className = 'separator';
      } else if (message.includes('VICTORY') || message.includes('DEFEAT') || message.includes('wins')) {
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
  async playerAction(action) {
    if (this.isProcessing || this.combat.currentTurn !== 'player' || this.combat.isGameOver) {
      return;
    }

    this.isProcessing = true;

    // Check if unconscious
    if (this.combat.player.isUnconscious) {
      this.combat.attemptWakeUp(this.combat.player);
      this.updateCombatLog();
      this.updateUI();
      this.combat.nextTurn();
      this.isProcessing = false;
      
      setTimeout(() => this.executeEnemyTurn(), 1000);
      return;
    }

    let performedAction = false;
    const defender = this.combat.enemy;
    const wasDefending = defender.lastAction === 'defend';
    defender.lastAction = null;

    switch (action) {
      case 'attack':
        this.combat.attack(this.combat.player, defender, wasDefending);
        performedAction = true;
        break;
        
      case 'defend':
        this.combat.defend(this.combat.player);
        this.combat.player.lastAction = 'defend';
        performedAction = true;
        break;
        
      case 'tackle':
        const tackleSuccess = this.combat.tackle(this.combat.player, defender);
        this.combat.log("---");
        // After tackle, allow attack or defend
        this.updateCombatLog();
        this.updateUI();
        
        const followUp = await this.promptFollowUpAction(['attack', 'defend']);
        if (followUp === 'attack') {
          this.combat.attack(this.combat.player, defender, wasDefending);
        } else {
          this.combat.defend(this.combat.player);
          this.combat.player.lastAction = 'defend';
        }
        performedAction = true;
        break;
        
      case 'disengage':
        const disengageSuccess = this.combat.disengage(this.combat.player, defender);
        this.combat.log("---");
        // After disengage, allow attack or defend
        this.updateCombatLog();
        this.updateUI();
        
        const followUp2 = await this.promptFollowUpAction(['attack', 'defend']);
        if (followUp2 === 'attack') {
          this.combat.attack(this.combat.player, defender, wasDefending);
        } else {
          this.combat.defend(this.combat.player);
          this.combat.player.lastAction = 'defend';
        }
        performedAction = true;
        break;
        
      case 'run':
        this.combat.runAway(this.combat.player);
        performedAction = true;
        break;
    }

    if (performedAction) {
      this.combat.log("---");
      this.updateCombatLog();
      this.updateUI();

      // Check if game over
      if (this.combat.isGameOver) {
        this.showGameOver();
        this.isProcessing = false;
        return;
      }

      // Next turn
      this.combat.nextTurn();
      this.updateUI();
      
      this.isProcessing = false;

      // Enemy turn
      setTimeout(() => this.executeEnemyTurn(), 1000);
    } else {
      this.isProcessing = false;
    }
  }

  // Prompt for follow-up action after maneuver
  promptFollowUpAction(actions) {
    return new Promise((resolve) => {
      const originalButtons = {
        attack: document.getElementById('action-attack'),
        defend: document.getElementById('action-defend'),
        tackle: document.getElementById('action-tackle'),
        disengage: document.getElementById('action-disengage'),
        run: document.getElementById('action-run')
      };

      // Temporarily modify buttons
      const cleanup = () => {
        Object.values(originalButtons).forEach(btn => btn.disabled = false);
        originalButtons.tackle.classList.remove('hidden');
        originalButtons.disengage.classList.add('hidden');
      };

      // Disable non-allowed actions
      Object.keys(originalButtons).forEach(key => {
        if (!actions.includes(key)) {
          originalButtons[key].disabled = true;
        }
      });

      const handler = (action) => {
        cleanup();
        resolve(action);
      };

      // Add one-time listeners
      const attackHandler = () => handler('attack');
      const defendHandler = () => handler('defend');

      originalButtons.attack.addEventListener('click', attackHandler, { once: true });
      originalButtons.defend.addEventListener('click', defendHandler, { once: true });
    });
  }

  // Execute enemy turn
  executeEnemyTurn() {
    if (this.combat.isGameOver || this.combat.currentTurn !== 'enemy') {
      return;
    }

    // Check if unconscious
    if (this.combat.enemy.isUnconscious) {
      const wokeUp = this.combat.attemptWakeUp(this.combat.enemy);
      this.combat.log("---");
      this.updateCombatLog();
      this.updateUI();
      this.combat.nextTurn();
      this.updateUI();
      return;
    }

    const action = this.getEnemyAction();
    const defender = this.combat.player;
    const wasDefending = defender.lastAction === 'defend';
    defender.lastAction = null;

    setTimeout(() => {
      if (action === 'attack') {
        this.combat.attack(this.combat.enemy, defender, wasDefending);
      } else if (action === 'defend') {
        this.combat.defend(this.combat.enemy);
        this.combat.enemy.lastAction = 'defend';
      } else if (action === 'tackle') {
        this.combat.tackle(this.combat.enemy, defender);
        this.combat.log("---");
        this.updateCombatLog();
        this.updateUI();
        
        setTimeout(() => {
          this.combat.attack(this.combat.enemy, defender, wasDefending);
          this.finishEnemyTurn();
        }, 800);
        return;
      } else if (action === 'disengage') {
        this.combat.disengage(this.combat.enemy, defender);
        this.combat.log("---");
        this.updateCombatLog();
        this.updateUI();
        
        setTimeout(() => {
          this.combat.attack(this.combat.enemy, defender, wasDefending);
          this.finishEnemyTurn();
        }, 800);
        return;
      }

      this.finishEnemyTurn();
    }, 500);
  }

  finishEnemyTurn() {
    this.combat.log("---");
    this.updateCombatLog();
    this.updateUI();

    if (this.combat.isGameOver) {
      this.showGameOver();
      return;
    }

    this.combat.nextTurn();
    this.updateUI();
  }

  // Enemy AI
  getEnemyAction() {
    const rand = Math.random();
    
    // 85% attack
    if (rand < 0.85) {
      return 'attack';
    }
    
    // 10% defend if weak
    if (rand < 0.95 && this.combat.enemy.isWeak) {
      return 'defend';
    }
    
    // 5% tactical
    if (this.combat.range === 'adjacent') {
      return 'tackle';
    } else {
      return 'disengage';
    }
  }

  // Show game over
  showGameOver() {
    const panel = document.getElementById('game-over-panel');
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');

    if (this.combat.victor === 'player') {
      title.textContent = '🎉 VICTORY! 🎉';
      title.style.color = '#4caf50';
      message.textContent = `${this.combat.player.name} has defeated ${this.combat.enemy.name}!`;
    } else if (this.combat.victor === 'enemy') {
      title.textContent = '💀 DEFEAT 💀';
      title.style.color = '#f44336';
      message.textContent = `${this.combat.enemy.name} has defeated ${this.combat.player.name}!`;
    } else if (this.combat.victor === 'fled') {
      title.textContent = '🏃 FLED 🏃';
      title.style.color = '#ff9800';
      message.textContent = `${this.combat.player.name} fled from combat!`;
    }

    panel.classList.remove('hidden');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CombatApp();
});
