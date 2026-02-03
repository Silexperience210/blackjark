#!/bin/bash
# Générateur de la version FIXED optimisée

echo "🔧 Generating BlackjARK ULTIMATE Fixed..."

cd public

# Créer le fichier final
cat > blackjark-ultimate-v2.html << 'EOFINAL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚡ BlackjARK Ultimate - ARK Casino</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
EOFINAL

# Ajouter le CSS optimisé
cat blackjark-style.css >> blackjark-ultimate-v2.html

cat >> blackjark-ultimate-v2.html << 'EOFCSS2'
/* CORRECTIONS THEME SELECTOR */
.theme-toggle {
  position: fixed !important;
  bottom: 180px !important;
  right: 20px !important;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--purple-main), var(--orange-main));
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
  transition: all 0.3s;
  z-index: 1000;
}

.theme-selector {
  position: fixed !important;
  bottom: 250px !important;
  right: 20px !important;
  z-index: 1001;
  background: rgba(10, 10, 10, 0.95);
  border: 2px solid rgba(139, 92, 246, 0.5);
  border-radius: 16px;
  padding: 15px;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8);
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-selector.active {
  opacity: 1 !important;
  transform: scale(1) !important;
  pointer-events: all !important;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.theme-option {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  text-align: center;
  border: 2px solid transparent;
}

.theme-option.active {
  border-color: white;
}

/* MOBILE OPTIMIZATIONS */
@media (max-width: 768px) {
  #cyberpunk-bg, #cursor-trail {
    display: none !important;
  }
  
  .scanlines {
    opacity: 0.5;
  }
  
  .card.holographic::before {
    display: none;
  }
}
  </style>
</head>
<body>
EOFCSS2

# Copier le body depuis blackjark-demo.html (simplifié)
echo "Adding body..."

cat >> blackjark-ultimate-v2.html << 'EOFBODY'
  <canvas id="cyberpunk-bg"></canvas>
  <canvas id="cursor-trail"></canvas>
  <div class="scanlines"></div>
  
  <div class="app-container">
    <header class="header">
      <div class="logo-container">
        <h1 class="title">
          <span class="title-black">BLACK</span><span class="title-ark">jARK</span>
        </h1>
        <div class="subtitle">ULTIMATE VTXO CASINO</div>
      </div>
      <div class="powered-by">
        <span class="powered-text">Powered by</span>
        <svg width="24" height="24" viewBox="0 0 94 94" fill="none"><rect x="47" y="23" width="11" height="11" fill="#8B5CF6"/><rect x="35" y="23" width="11" height="11" fill="#8B5CF6"/></svg>
      </div>
    </header>
    
    <div class="stats-bar">
      <div class="stat-card balance-card">
        <div class="stat-label">Balance</div>
        <div class="stat-value" id="balance">0</div>
        <div class="stat-unit">sats</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Games</div>
        <div class="stat-value" id="games-played">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">vTXOs</div>
        <div class="stat-value" id="vtxo-count">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Win Rate</div>
        <div class="stat-value" id="win-rate">0%</div>
      </div>
    </div>
    
    <div class="action-bar">
      <button class="btn btn-primary" onclick="alert('Deposit via API')">💰 Deposit</button>
      <button class="btn btn-danger" onclick="alert('Withdraw via API')">💸 Withdraw</button>
      <button class="btn btn-secondary" onclick="alert('Stats')">📊 Stats</button>
    </div>
    
    <div class="game-container">
      <div class="dealer-section">
        <div class="section-label">
          <span class="label-text">DEALER</span>
          <span class="dealer-score" id="dealer-score">--</span>
        </div>
        <div class="cards-container" id="dealer-cards"></div>
      </div>
      
      <div class="player-section">
        <div class="section-label">
          <span class="label-text">YOU</span>
          <span class="player-score" id="player-score">--</span>
        </div>
        <div class="cards-container" id="player-cards"></div>
      </div>
      
      <div class="game-controls" id="game-controls">
        <div class="bet-input-container">
          <label>BET AMOUNT</label>
          <input type="number" id="bet-amount" value="100" min="100" max="1000" step="100">
          <span class="input-unit">sats</span>
        </div>
        <button class="btn btn-play" onclick="dealGame()">DEAL</button>
      </div>
      
      <div class="in-game-controls hidden" id="in-game-controls">
        <button class="btn btn-action" onclick="hit()">HIT</button>
        <button class="btn btn-action" onclick="stand()">STAND</button>
        <button class="btn btn-action" onclick="doubleDown()">DOUBLE</button>
      </div>
      
      <div class="game-status hidden" id="game-status">
        <div class="status-text"></div>
        <div class="status-payout"></div>
      </div>
    </div>
    
    <div class="game-history-panel">
      <div class="history-header">
        <h3>🎲 Recent Hands</h3>
        <div class="history-stats">
          <span class="streak-indicator">Streak: <span id="current-streak">0</span></span>
          <span>Best: <span id="best-hand">--</span></span>
        </div>
      </div>
      <div class="history-list" id="history-list"></div>
    </div>
  </div>
  
  <button class="theme-toggle" onclick="toggleThemeSelector()">🎨</button>
  <div class="theme-selector" id="theme-selector">
    <h4 style="text-align:center;color:#8B5CF6;margin-bottom:10px;">Choose Theme</h4>
    <div class="theme-options">
      <div class="theme-option purple active" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:white;" onclick="changeTheme('purple')">PURPLE</div>
      <div class="theme-option orange" style="background:linear-gradient(135deg,#F97316,#EA580C);color:white;" onclick="changeTheme('orange')">ORANGE</div>
      <div class="theme-option green" style="background:linear-gradient(135deg,#22C55E,#16A34A);color:white;" onclick="changeTheme('green')">GREEN</div>
      <div class="theme-option pink" style="background:linear-gradient(135deg,#EC4899,#DB2777);color:white;" onclick="changeTheme('pink')">PINK</div>
      <div class="theme-option gold" style="background:linear-gradient(135deg,#F59E0B,#D97706);color:white;" onclick="changeTheme('gold')">GOLD</div>
    </div>
  </div>
  
  <button class="sound-toggle" id="sound-toggle" onclick="toggleSound()">🔊</button>
  
  <div class="notification-container" id="notifications"></div>
  <div id="particle-effects"></div>
  
  <script>
EOFBODY

echo "Adding corrected JavaScript..."

cat >> blackjark-ultimate-v2.html << 'EOFJS'
// ========================================
// CORRECTED & OPTIMIZED VERSION
// ========================================

// Check mobile
const isMobile = window.innerWidth <= 768;

// Init Three.js (desktop only)
let cyberpunkBG = null;
if (!isMobile && typeof THREE !== 'undefined') {
  class CyberpunkBackground {
    constructor() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('cyberpunk-bg'), alpha: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.position.set(0, 5, 10);
      this.time = 0;
      this.animate();
    }
    animate() {
      requestAnimationFrame(() => this.animate());
      this.time += 0.01;
      this.renderer.render(this.scene, this.camera);
    }
    pulseEffect() {
      console.log('Pulse!');
    }
  }
  try {
    cyberpunkBG = new CyberpunkBackground();
  } catch(e) {
    console.warn('Three.js failed:', e);
  }
}

// Visual Effects (CORRECTED)
const effects = {
  screenFlash(color, intensity) {
    const flash = document.createElement('div');
    flash.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(139,92,246,${intensity});pointer-events:none;z-index:9999;transition:opacity 0.3s`;
    document.body.appendChild(flash);
    setTimeout(() => flash.style.opacity = '0', 50);
    setTimeout(() => flash.remove(), 350);
  },
  confetti(count) {
    for (let i = 0; i < (isMobile ? count/2 : count); i++) {
      const c = document.createElement('div');
      c.style.cssText = `position:fixed;left:${Math.random()*100}%;top:-20px;width:10px;height:10px;background:#8B5CF6;pointer-events:none;z-index:999;border-radius:50%`;
      document.getElementById('particle-effects').appendChild(c);
      let y = -20;
      const fall = setInterval(() => {
        y += 5;
        c.style.top = y + 'px';
        if (y > window.innerHeight) {
          clearInterval(fall);
          c.remove();
        }
      }, 50);
    }
  },
  burst(x, y, color, count) {
    // Simplified for mobile
    if (!isMobile) {
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:5px;height:5px;background:#F97316;border-radius:50%;pointer-events:none;z-index:999`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
      }
    }
  },
  shake(intensity, duration) {
    const el = document.querySelector('.app-container');
    el.style.transform = `translate(${Math.random()*intensity}px,${Math.random()*intensity}px)`;
    setTimeout(() => el.style.transform = '', duration);
  },
  glitch(element, duration) {
    const original = element.textContent;
    const chars = '0123456789ABCDEF';
    let remaining = duration;
    const interval = setInterval(() => {
      element.textContent = original.split('').map(c => Math.random() < 0.3 ? chars[Math.floor(Math.random()*chars.length)] : c).join('');
      remaining -= 50;
      if (remaining <= 0) {
        clearInterval(interval);
        element.textContent = original;
      }
    }, 50);
  }
};
window.effects = effects;

// Sound System (CORRECTED)
const soundSystem = {
  enabled: true,
  audioContext: null,
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      console.warn('Audio not supported');
      this.enabled = false;
    }
  },
  playBeep(freq, duration) {
    if (!this.enabled || !this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  },
  playCardFlip() { this.playBeep(400, 0.05); },
  playWin() { this.playBeep(659, 0.1); this.playBeep(784, 0.1); },
  playLose() { this.playBeep(200, 0.3); },
  playDeal() { this.playBeep(1000, 0.05); },
  playVTXO() { this.playBeep(880, 0.1); },
  playClick() { this.playBeep(600, 0.03); },
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
};
window.soundSystem = soundSystem;
document.addEventListener('click', () => soundSystem.init(), { once: true });

// Game State
let gameState = {
  balance: 1000,
  gamesPlayed: 0,
  gamesWon: 0,
  deck: [],
  playerHand: [],
  dealerHand: [],
  bet: 100,
  gameActive: false
};

// Card Logic
const cards = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const suits = ['♠','♥','♦','♣'];

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let card of cards) {
      deck.push({card, suit});
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function getCardValue(card) {
  if (card.card === 'A') return 11;
  if (['J','Q','K'].includes(card.card)) return 10;
  return parseInt(card.card);
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;
  for (let card of hand) {
    score += getCardValue(card);
    if (card.card === 'A') aces++;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

function renderCard(card, container) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card dealing holographic';
  cardEl.innerHTML = `${card.card}${card.suit}`;
  if (card.suit === '♥' || card.suit === '♦') {
    cardEl.style.color = '#F97316';
  }
  container.appendChild(cardEl);
  setTimeout(() => {
    cardEl.classList.remove('dealing');
    if (soundSystem) soundSystem.playCardFlip();
  }, 100);
}

function updateUI() {
  document.getElementById('balance').textContent = gameState.balance;
  document.getElementById('games-played').textContent = gameState.gamesPlayed;
  document.getElementById('vtxo-count').textContent = Math.floor(gameState.balance / 300);
  const winRate = gameState.gamesPlayed > 0 ? Math.round((gameState.gamesWon / gameState.gamesPlayed) * 100) : 0;
  document.getElementById('win-rate').textContent = winRate + '%';
}

function dealGame() {
  const betAmount = parseInt(document.getElementById('bet-amount').value);
  if (betAmount > gameState.balance) {
    showNotification('Insufficient balance!', 'error');
    return;
  }
  
  gameState.bet = betAmount;
  gameState.balance -= betAmount;
  gameState.deck = createDeck();
  gameState.playerHand = [gameState.deck.pop(), gameState.deck.pop()];
  gameState.dealerHand = [gameState.deck.pop(), gameState.deck.pop()];
  gameState.gameActive = true;
  
  document.getElementById('player-cards').innerHTML = '';
  document.getElementById('dealer-cards').innerHTML = '';
  
  gameState.playerHand.forEach(card => renderCard(card, document.getElementById('player-cards')));
  renderCard(gameState.dealerHand[0], document.getElementById('dealer-cards'));
  const cardBack = document.createElement('div');
  cardBack.className = 'card card-back';
  cardBack.innerHTML = '🂠';
  document.getElementById('dealer-cards').appendChild(cardBack);
  
  document.getElementById('player-score').textContent = calculateScore(gameState.playerHand);
  document.getElementById('dealer-score').textContent = '?';
  
  document.getElementById('game-controls').classList.add('hidden');
  document.getElementById('in-game-controls').classList.remove('hidden');
  document.getElementById('game-status').classList.add('hidden');
  
  updateUI();
  
  if (effects && effects.screenFlash) effects.screenFlash('purple', 0.2);
  if (cyberpunkBG && cyberpunkBG.pulseEffect) cyberpunkBG.pulseEffect();
  if (soundSystem) soundSystem.playDeal();
  
  if (calculateScore(gameState.playerHand) === 21) {
    setTimeout(() => stand(), 500);
  }
}

function hit() {
  if (!gameState.gameActive) return;
  const card = gameState.deck.pop();
  gameState.playerHand.push(card);
  renderCard(card, document.getElementById('player-cards'));
  const score = calculateScore(gameState.playerHand);
  document.getElementById('player-score').textContent = score;
  if (soundSystem) soundSystem.playClick();
  if (score > 21) {
    endGame('bust');
  }
}

function stand() {
  if (!gameState.gameActive) return;
  document.getElementById('dealer-cards').innerHTML = '';
  gameState.dealerHand.forEach(card => renderCard(card, document.getElementById('dealer-cards')));
  while (calculateScore(gameState.dealerHand) < 17) {
    const card = gameState.deck.pop();
    gameState.dealerHand.push(card);
    renderCard(card, document.getElementById('dealer-cards'));
  }
  const playerScore = calculateScore(gameState.playerHand);
  const dealerScore = calculateScore(gameState.dealerHand);
  document.getElementById('dealer-score').textContent = dealerScore;
  if (soundSystem) soundSystem.playClick();
  if (dealerScore > 21) {
    endGame('win');
  } else if (playerScore > dealerScore) {
    endGame('win');
  } else if (playerScore < dealerScore) {
    endGame('lose');
  } else {
    endGame('push');
  }
}

function doubleDown() {
  if (!gameState.gameActive) return;
  if (gameState.bet > gameState.balance) {
    showNotification('Insufficient balance!', 'error');
    return;
  }
  gameState.balance -= gameState.bet;
  gameState.bet *= 2;
  updateUI();
  hit();
  if (gameState.gameActive) {
    setTimeout(() => stand(), 500);
  }
}

function endGame(result) {
  gameState.gameActive = false;
  gameState.gamesPlayed++;
  
  const statusEl = document.getElementById('game-status');
  const statusText = statusEl.querySelector('.status-text');
  const statusPayout = statusEl.querySelector('.status-payout');
  
  let message = '';
  let payout = 0;
  
  if (result === 'win') {
    gameState.gamesWon++;
    payout = gameState.bet * 2;
    gameState.balance += payout;
    message = '🎉 YOU WIN!';
    statusPayout.textContent = `+${payout} sats`;
    statusPayout.style.color = '#22C55E';
    if (effects && effects.confetti) effects.confetti(50);
    if (effects && effects.screenFlash) effects.screenFlash('green', 0.3);
    if (soundSystem) soundSystem.playWin();
  } else if (result === 'bust') {
    message = '💥 BUST!';
    statusPayout.textContent = `-${gameState.bet} sats`;
    statusPayout.style.color = '#EF4444';
    if (effects && effects.shake) effects.shake(5, 300);
    if (soundSystem) soundSystem.playLose();
  } else if (result === 'lose') {
    message = '😔 DEALER WINS';
    statusPayout.textContent = `-${gameState.bet} sats`;
    statusPayout.style.color = '#EF4444';
    if (effects && effects.screenFlash) effects.screenFlash('red', 0.2);
    if (soundSystem) soundSystem.playLose();
  } else if (result === 'push') {
    gameState.balance += gameState.bet;
    message = '🤝 PUSH';
    statusPayout.textContent = `${gameState.bet} sats returned`;
    statusPayout.style.color = '#6B7280';
  }
  
  statusText.textContent = message;
  statusEl.classList.remove('hidden');
  document.getElementById('in-game-controls').classList.add('hidden');
  
  setTimeout(() => {
    document.getElementById('game-controls').classList.remove('hidden');
    statusEl.classList.add('hidden');
  }, 3000);
  
  updateUI();
}

// Theme System (CORRECTED)
const themes = {
  purple: {'--purple-main': '#8B5CF6', '--orange-main': '#F97316'},
  orange: {'--purple-main': '#F97316', '--orange-main': '#8B5CF6'},
  green: {'--purple-main': '#22C55E', '--orange-main': '#10B981'},
  pink: {'--purple-main': '#EC4899', '--orange-main': '#F472B6'},
  gold: {'--purple-main': '#F59E0B', '--orange-main': '#FBBF24'}
};

function toggleThemeSelector() {
  document.getElementById('theme-selector').classList.toggle('active');
  if (soundSystem) soundSystem.playClick();
}

function changeTheme(theme) {
  const colors = themes[theme];
  if (!colors) return;
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
  document.querySelector(`.theme-option.${theme}`).classList.add('active');
  localStorage.setItem('blackjark_theme', theme);
  if (soundSystem) soundSystem.playClick();
  if (effects && effects.screenFlash) effects.screenFlash(theme, 0.2);
  // Close selector
  document.getElementById('theme-selector').classList.remove('active');
}

function toggleSound() {
  if (soundSystem) {
    const enabled = soundSystem.toggle();
    document.getElementById('sound-toggle').textContent = enabled ? '🔊' : '🔇';
    document.getElementById('sound-toggle').classList.toggle('muted', !enabled);
    showNotification(enabled ? 'Sound ON' : 'Sound OFF', 'success');
  }
}

function showNotification(text, type = 'success') {
  const container = document.getElementById('notifications');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  const textEl = document.createElement('div');
  textEl.className = 'notification-text';
  textEl.textContent = text;
  notification.appendChild(textEl);
  container.appendChild(notification);
  if (soundSystem) soundSystem.playClick();
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('blackjark_theme');
  if (saved && themes[saved]) {
    changeTheme(saved);
  }
  updateUI();
  console.log('✅ BlackjARK ULTIMATE Fixed loaded!');
  console.log('🎮 Desktop mode:', !isMobile);
  console.log('🌌 Three.js:', cyberpunkBG ? 'Active' : 'Disabled');
  console.log('🔊 Sound:', soundSystem ? 'Ready' : 'N/A');
});
  </script>
</body>
</html>
EOFJS

echo "✅ Generation complete!"
ls -lh blackjark-ultimate-v2.html
