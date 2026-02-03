// ========================================
// BlackjARK - Three.js Cyberpunk Grid Background
// ========================================

class CyberpunkBackground {
  constructor() {
    this.canvas = document.getElementById('cyberpunk-bg');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.grid = null;
    this.particles = [];
    this.dataStreams = [];
    this.time = 0;
    
    this.init();
    this.createGrid();
    this.createParticles();
    this.createDataStreams();
    this.animate();
  }
  
  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0A0A0A, 0.02);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }
  
  createGrid() {
    // Cyberpunk grid (style Tron)
    const gridSize = 50;
    const gridDivisions = 50;
    const gridColor1 = 0x8B5CF6; // Purple
    const gridColor2 = 0x7C3AED; // Purple dark
    
    // Horizontal grid
    const gridHelper1 = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      gridColor1,
      gridColor2
    );
    gridHelper1.material.opacity = 0.3;
    gridHelper1.material.transparent = true;
    this.scene.add(gridHelper1);
    
    // Vertical grid (rotated)
    const gridHelper2 = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      gridColor1,
      gridColor2
    );
    gridHelper2.rotation.x = Math.PI / 2;
    gridHelper2.position.z = -gridSize / 2;
    gridHelper2.material.opacity = 0.2;
    gridHelper2.material.transparent = true;
    this.scene.add(gridHelper2);
    
    this.grid = {
      horizontal: gridHelper1,
      vertical: gridHelper2
    };
  }
  
  createParticles() {
    // Floating purple particles
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      positions.push(
        (Math.random() - 0.5) * 50,
        Math.random() * 20,
        (Math.random() - 0.5) * 50
      );
      
      // Color (purple or orange)
      const isPurple = Math.random() > 0.3;
      if (isPurple) {
        colors.push(0.545, 0.361, 0.965); // Purple #8B5CF6
      } else {
        colors.push(0.976, 0.451, 0.086); // Orange #F97316
      }
      
      // Size
      sizes.push(Math.random() * 3 + 1);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  createDataStreams() {
    // Data streams (lines moving upward)
    const streamCount = 10;
    
    for (let i = 0; i < streamCount; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const segmentCount = 20;
      
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      
      for (let j = 0; j < segmentCount; j++) {
        positions.push(x, j * 0.5, z);
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: Math.random() > 0.5 ? 0x8B5CF6 : 0xF97316,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      
      const line = new THREE.Line(geometry, material);
      line.userData.speed = Math.random() * 0.05 + 0.02;
      line.userData.baseY = line.position.y;
      
      this.scene.add(line);
      this.dataStreams.push(line);
    }
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.time += 0.01;
    
    // Rotate grid slowly
    if (this.grid) {
      this.grid.horizontal.rotation.y += 0.001;
    }
    
    // Animate particles (floating)
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(this.time + i) * 0.01;
        
        // Reset if too high
        if (positions[i + 1] > 20) {
          positions[i + 1] = 0;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate data streams (moving up)
    this.dataStreams.forEach(stream => {
      stream.position.y += stream.userData.speed;
      
      // Reset if too high
      if (stream.position.y > 15) {
        stream.position.y = stream.userData.baseY;
      }
      
      // Pulse opacity
      stream.material.opacity = 0.3 + Math.sin(this.time * 2) * 0.2;
    });
    
    // Camera gentle movement
    this.camera.position.x = Math.sin(this.time * 0.1) * 2;
    this.camera.position.y = 5 + Math.sin(this.time * 0.15) * 1;
    this.camera.lookAt(0, 0, 0);
    
    this.renderer.render(this.scene, this.camera);
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  // Public method: Pulse effect on transaction
  pulseEffect() {
    // Flash grid
    if (this.grid) {
      this.grid.horizontal.material.opacity = 0.8;
      this.grid.vertical.material.opacity = 0.6;
      
      setTimeout(() => {
        this.grid.horizontal.material.opacity = 0.3;
        this.grid.vertical.material.opacity = 0.2;
      }, 200);
    }
    
    // Burst particles
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.random() * 2;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}

// Initialize when page loads
let cyberpunkBG;
window.addEventListener('DOMContentLoaded', () => {
  cyberpunkBG = new CyberpunkBackground();
});
