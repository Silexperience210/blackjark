// ========================================
// BlackjARK - Visual Effects
// ========================================

class VisualEffects {
  constructor() {
    this.cursorCanvas = document.getElementById('cursor-trail');
    this.cursorCtx = this.cursorCanvas.setupCanvas();
    this.cursorTrail = [];
    this.particleEffects = document.getElementById('particle-effects');
    
    this.initCursorTrail();
    this.setupCanvas();
  }
  
  setupCanvas() {
    this.cursorCanvas.width = window.innerWidth;
    this.cursorCanvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
      this.cursorCanvas.width = window.innerWidth;
      this.cursorCanvas.height = window.innerHeight;
    });
  }
  
  initCursorTrail() {
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Add trail point
      this.cursorTrail.push({
        x: mouseX,
        y: mouseY,
        life: 1.0
      });
      
      // Limit trail length
      if (this.cursorTrail.length > 20) {
        this.cursorTrail.shift();
      }
    });
    
    // Animate trail
    this.animateCursorTrail();
  }
  
  animateCursorTrail() {
    const ctx = this.cursorCanvas.getContext('2d');
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);
      
      // Draw trail
      this.cursorTrail.forEach((point, index) => {
        const size = 5 * point.life;
        const opacity = point.life * 0.5;
        
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size
        );
        
        // Purple gradient
        gradient.addColorStop(0, `rgba(139, 92, 246, ${opacity})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Decrease life
        point.life -= 0.05;
      });
      
      // Remove dead points
      this.cursorTrail = this.cursorTrail.filter(p => p.life > 0);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  // Particle burst effect
  createParticleBurst(x, y, color = 'purple', count = 30) {
    const colors = {
      purple: ['#8B5CF6', '#A78BFA', '#7C3AED'],
      orange: ['#F97316', '#FB923C', '#EA580C'],
      green: ['#22C55E', '#4ADE80', '#16A34A']
    };
    
    const colorPalette = colors[color] || colors.purple;
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.width = (Math.random() * 8 + 4) + 'px';
      particle.style.height = particle.style.width;
      particle.style.borderRadius = '50%';
      particle.style.background = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '999';
      particle.style.boxShadow = `0 0 10px ${colorPalette[0]}`;
      
      this.particleEffects.appendChild(particle);
      
      const angle = (Math.PI * 2 * i) / count;
      const velocity = Math.random() * 5 + 3;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      this.animateParticle(particle, x, y, vx, vy);
    }
  }
  
  animateParticle(particle, startX, startY, vx, vy) {
    let x = startX;
    let y = startY;
    let opacity = 1;
    let scale = 1;
    
    const animate = () => {
      x += vx;
      y += vy;
      vy += 0.3; // Gravity
      opacity -= 0.02;
      scale -= 0.02;
      
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.opacity = opacity;
      particle.style.transform = `scale(${scale})`;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    
    animate();
  }
  
  // Screen flash effect
  screenFlash(color = 'purple', intensity = 0.3) {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.3s';
    
    const colors = {
      purple: 'rgba(139, 92, 246, INTENSITY)',
      orange: 'rgba(249, 115, 22, INTENSITY)',
      green: 'rgba(34, 197, 94, INTENSITY)',
      red: 'rgba(239, 68, 68, INTENSITY)'
    };
    
    flash.style.background = (colors[color] || colors.purple).replace('INTENSITY', intensity);
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      flash.style.opacity = '0';
    }, 150);
    
    setTimeout(() => {
      flash.remove();
    }, 500);
  }
  
  // Screen shake effect
  screenShake(intensity = 5, duration = 300) {
    const container = document.querySelector('.app-container');
    const originalTransform = container.style.transform;
    
    const startTime = Date.now();
    
    const shake = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < duration) {
        const x = (Math.random() - 0.5) * intensity;
        const y = (Math.random() - 0.5) * intensity;
        container.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(shake);
      } else {
        container.style.transform = originalTransform;
      }
    };
    
    shake();
  }
  
  // Glitch effect
  glitchEffect(element, duration = 500) {
    const originalText = element.textContent;
    const chars = '0123456789ABCDEF!@#$%^&*';
    
    const startTime = Date.now();
    
    const glitch = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < duration) {
        let glitchedText = '';
        for (let i = 0; i < originalText.length; i++) {
          if (Math.random() < 0.3) {
            glitchedText += chars[Math.floor(Math.random() * chars.length)];
          } else {
            glitchedText += originalText[i];
          }
        }
        element.textContent = glitchedText;
        
        setTimeout(glitch, 50);
      } else {
        element.textContent = originalText;
      }
    };
    
    glitch();
  }
  
  // Lightning bolt effect
  lightningBolt(startX, startY, endX, endY) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '998';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Generate jagged lightning path
    const points = [];
    const segments = 10;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 30;
      const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 30;
      points.push({x, y});
    }
    
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#8B5CF6');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('filter', 'drop-shadow(0 0 10px #8B5CF6)');
    
    svg.appendChild(path);
    document.body.appendChild(svg);
    
    setTimeout(() => {
      svg.remove();
    }, 200);
  }
  
  // Confetti effect
  createConfetti(count = 50) {
    const colors = ['#8B5CF6', '#F97316', '#22C55E', '#3B82F6', '#EC4899'];
    
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-20px';
      confetti.style.width = (Math.random() * 10 + 5) + 'px';
      confetti.style.height = (Math.random() * 10 + 5) + 'px';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '999';
      confetti.style.opacity = '0.8';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      
      this.particleEffects.appendChild(confetti);
      
      this.animateConfetti(confetti);
    }
  }
  
  animateConfetti(confetti) {
    const vy = Math.random() * 3 + 2;
    const vx = (Math.random() - 0.5) * 2;
    const rotation = Math.random() * 360;
    const rotationSpeed = (Math.random() - 0.5) * 10;
    
    let y = parseFloat(confetti.style.top);
    let x = parseFloat(confetti.style.left);
    let r = rotation;
    
    const animate = () => {
      y += vy;
      x += vx;
      r += rotationSpeed;
      
      confetti.style.top = y + 'px';
      confetti.style.left = x + 'px';
      confetti.style.transform = `rotate(${r}deg)`;
      
      if (y < window.innerHeight) {
        requestAnimationFrame(animate);
      } else {
        confetti.remove();
      }
    };
    
    animate();
  }
}

// Initialize effects
let visualEffects;
window.addEventListener('DOMContentLoaded', () => {
  visualEffects = new VisualEffects();
});

// Export for use in other scripts
window.effects = {
  burst: (x, y, color, count) => visualEffects.createParticleBurst(x, y, color, count),
  flash: (color, intensity) => visualEffects.screenFlash(color, intensity),
  shake: (intensity, duration) => visualEffects.screenShake(intensity, duration),
  glitch: (element, duration) => visualEffects.glitchEffect(element, duration),
  lightning: (x1, y1, x2, y2) => visualEffects.lightningBolt(x1, y1, x2, y2),
  confetti: (count) => visualEffects.createConfetti(count)
};
