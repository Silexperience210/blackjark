// ========================================
// BlackjARK - Achievements System
// ========================================

class AchievementSystem {
  constructor() {
    this.achievements = {
      firstWin: {
        id: 'firstWin',
        name: 'First Blood',
        description: 'Win your first hand',
        icon: '🥇',
        unlocked: false,
        check: (stats) => stats.gamesWon >= 1
      },
      blackjackMaster: {
        id: 'blackjackMaster',
        name: 'Blackjack Master',
        description: 'Get 3 blackjacks in a row',
        icon: '🎯',
        unlocked: false,
        requiresStreak: 3
      },
      luckyStreak: {
        id: 'luckyStreak',
        name: 'Lucky Streak',
        description: 'Win 5 hands in a row',
        icon: '🍀',
        unlocked: false,
        requiresStreak: 5
      },
      highRoller: {
        id: 'highRoller',
        name: 'High Roller',
        description: 'Bet 500 sats or more',
        icon: '💎',
        unlocked: false,
        check: (stats, bet) => bet >= 500
      },
      arkWhale: {
        id: 'arkWhale',
        name: 'ARK Whale',
        description: 'Reach 5000 sats balance',
        icon: '🐋',
        unlocked: false,
        check: (stats) => stats.balance >= 5000
      },
      grinder: {
        id: 'grinder',
        name: 'The Grinder',
        description: 'Play 50 hands',
        icon: '⚙️',
        unlocked: false,
        check: (stats) => stats.gamesPlayed >= 50
      },
      perfectTen: {
        id: 'perfectTen',
        name: 'Perfect 10',
        description: 'Get exactly 21 with 3+ cards',
        icon: '🎲',
        unlocked: false
      },
      comeback: {
        id: 'comeback',
        name: 'The Comeback',
        description: 'Win after being below 100 sats',
        icon: '🔥',
        unlocked: false
      },
      instantaneous: {
        id: 'instantaneous',
        name: 'Instantaneous',
        description: 'Win 10 hands with vTXO speed',
        icon: '⚡',
        unlocked: false,
        check: (stats) => stats.gamesWon >= 10
      },
      doubleOrNothing: {
        id: 'doubleOrNothing',
        name: 'Double or Nothing',
        description: 'Win with a double down',
        icon: '🎰',
        unlocked: false
      }
    };
    
    this.loadProgress();
  }
  
  loadProgress() {
    const saved = localStorage.getItem('blackjark_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(id => {
        if (this.achievements[id]) {
          this.achievements[id].unlocked = data[id];
        }
      });
    }
  }
  
  saveProgress() {
    const data = {};
    Object.keys(this.achievements).forEach(id => {
      data[id] = this.achievements[id].unlocked;
    });
    localStorage.setItem('blackjark_achievements', JSON.stringify(data));
  }
  
  check(achievementId, stats, extraData = {}) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return false;
    
    let unlocked = false;
    
    if (achievement.check) {
      unlocked = achievement.check(stats, extraData.bet);
    }
    
    if (unlocked) {
      this.unlock(achievementId);
    }
    
    return unlocked;
  }
  
  checkAll(stats, extraData = {}) {
    const newUnlocks = [];
    
    Object.keys(this.achievements).forEach(id => {
      if (this.check(id, stats, extraData)) {
        newUnlocks.push(this.achievements[id]);
      }
    });
    
    return newUnlocks;
  }
  
  unlock(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;
    
    achievement.unlocked = true;
    this.saveProgress();
    this.showAchievementPopup(achievement);
    
    // Sound effect
    if (window.soundSystem) {
      window.soundSystem.playAchievement();
    }
    
    // Visual effects
    if (window.effects) {
      window.effects.confetti(100);
      window.effects.flash('orange', 0.4);
    }
  }
  
  showAchievementPopup(achievement) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Animate in
    setTimeout(() => popup.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => popup.remove(), 500);
    }, 4000);
  }
  
  getProgress() {
    const total = Object.keys(this.achievements).length;
    const unlocked = Object.values(this.achievements).filter(a => a.unlocked).length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100)
    };
  }
  
  getAll() {
    return Object.values(this.achievements);
  }
  
  reset() {
    Object.values(this.achievements).forEach(a => a.unlocked = false);
    this.saveProgress();
  }
}

// CSS for achievement popup
const achievementStyles = document.createElement('style');
achievementStyles.textContent = `
.achievement-popup {
  position: fixed;
  top: 100px;
  right: -400px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(249, 115, 22, 0.95));
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  max-width: 350px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8),
              0 0 30px rgba(139, 92, 246, 0.5);
  z-index: 10000;
  transition: right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(20px);
}

.achievement-popup.show {
  right: 20px;
}

.achievement-icon {
  font-size: 3rem;
  line-height: 1;
  animation: achievement-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes achievement-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
}

.achievement-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 5px;
}

.achievement-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.3;
}

@media (max-width: 480px) {
  .achievement-popup {
    right: -350px;
    max-width: 300px;
  }
  .achievement-popup.show {
    right: 10px;
  }
}
`;
document.head.appendChild(achievementStyles);

// Export global
window.achievementSystem = new AchievementSystem();
