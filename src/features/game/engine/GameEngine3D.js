/**
 * GameEngine3D - Three.js Game Engine
 * Converted from old game.js for React Native
 */

import * as THREE from 'three';
import { Player3D } from './Player3D';
import { Obstacle3D } from './Obstacle3D';

export class GameEngine3D {
  constructor(gl, width, height) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    
    // Three.js setup
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    
    // Game state
    this.state = 'menu'; // menu, playing, paused, gameOver
    this.score = 0;
    this.depth = 0;
    this.speed = 2;
    this.maxSpeed = 8;
    this.level = 1;
    
    // Game objects
    this.player = null;
    this.obstacles = [];
    this.particles = [];
    this.powerUps = [];
    
    // Camera
    this.cameraOffset = new THREE.Vector3(0, 0, 10);
    this.cameraShake = new THREE.Vector3(0, 0, 0);
    this.shakeIntensity = 0;
    
    // Timing
    this.lastTime = 0;
    this.deltaTime = 0;
    this.obstacleSpawnTimer = 0;
    this.powerUpSpawnTimer = 0;
    
    // Spawn rates
    this.obstacleSpawnRate = 2000; // milliseconds
    this.powerUpSpawnRate = 8000; // milliseconds
    
    // Visual effects
    this.backgroundLayers = [];
    this.dreamEffects = [];
    
    this.init();
  }
  
  init() {
    this.setupThreeJS();
    this.setupScene();
    this.setupCamera();
    this.setupLighting();
    this.setupBackground();
  }
  
  setupThreeJS() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.gl.canvas,
      context: this.gl,
      antialias: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1.0);
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.copy(this.cameraOffset);
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    this.scene.add(directionalLight);
  }
  
  setupBackground() {
    // Create background layers for parallax effect
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.PlaneGeometry(200, 200);
      const material = new THREE.MeshBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.3 - i * 0.1
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.z = -50 - i * 20;
      this.backgroundLayers.push(plane);
      this.scene.add(plane);
    }
  }
  
  startGame() {
    this.state = 'playing';
    this.score = 0;
    this.depth = 0;
    this.speed = 2;
    this.level = 1;
    
    // Create player
    this.player = new Player3D(0, 0, 0);
    this.scene.add(this.player.mesh);
    
    // Clear existing objects
    this.clearObstacles();
    this.clearParticles();
    
    console.log('Game started!');
  }
  
  pauseGame() {
    this.state = 'paused';
  }
  
  resumeGame() {
    this.state = 'playing';
  }
  
  endGame() {
    this.state = 'gameOver';
  }
  
  update(currentTime) {
    if (this.state !== 'playing') return;
    
    // Calculate delta time
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Update game objects
    this.updatePlayer();
    this.updateObstacles();
    this.updateParticles();
    this.updateCamera();
    this.updateBackground();
    
    // Spawn new obstacles
    this.spawnObstacles();
    this.spawnPowerUps();
    
    // Check collisions
    this.checkCollisions();
    
    // Update score and depth
    this.updateScore();
    
    // Render
    this.render();
  }
  
  updatePlayer() {
    if (this.player) {
      this.player.update(this.deltaTime);
    }
  }
  
  updateObstacles() {
    this.obstacles.forEach((obstacle, index) => {
      obstacle.update(this.deltaTime, this.speed);
      
      // Remove obstacles that are off screen
      if (obstacle.position.y < -100) {
        this.removeObstacle(index);
      }
    });
  }
  
  updateParticles() {
    this.particles.forEach((particle, index) => {
      // Update particle position
      particle.position.add(particle.velocity.clone().multiplyScalar(this.deltaTime));
      
      // Update particle life
      particle.life -= this.deltaTime * 1000; // Convert to milliseconds
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.removeParticle(index);
      }
    });
  }
  
  updateCamera() {
    if (this.player) {
      // Follow player
      this.camera.position.x = this.player.position.x + this.cameraOffset.x;
      this.camera.position.y = this.player.position.y + this.cameraOffset.y;
      
      // Apply camera shake
      if (this.shakeIntensity > 0) {
        this.camera.position.x += this.cameraShake.x;
        this.camera.position.y += this.cameraShake.y;
        this.shakeIntensity *= 0.9; // Dampen shake
      }
    }
  }
  
  updateBackground() {
    // Parallax scrolling
    this.backgroundLayers.forEach((layer, index) => {
      layer.position.y -= this.speed * (index + 1) * 0.1;
      
      // Reset position when off screen
      if (layer.position.y < -100) {
        layer.position.y = 100;
      }
    });
  }
  
  spawnObstacles() {
    this.obstacleSpawnTimer += this.deltaTime;
    
    if (this.obstacleSpawnTimer >= this.obstacleSpawnRate) {
      this.obstacleSpawnTimer = 0;
      
      // Random obstacle type
      const types = ['illusion', 'memory', 'regret', 'fear'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      // Random X position
      const x = (Math.random() - 0.5) * 200;
      const y = 100;
      const z = 0;
      
      const obstacle = new Obstacle3D(x, y, z, type);
      this.obstacles.push(obstacle);
      this.scene.add(obstacle.mesh);
      
      console.log('Spawned obstacle:', type, 'at', x, y, z);
    }
  }
  
  spawnPowerUps() {
    this.powerUpSpawnTimer += this.deltaTime;
    
    if (this.powerUpSpawnTimer >= this.powerUpSpawnRate) {
      this.powerUpSpawnTimer = 0;
      
      // Random power-up type
      const types = ['powerup_slow', 'powerup_shield', 'powerup_gravity'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      // Random X position
      const x = (Math.random() - 0.5) * 200;
      const y = 100;
      const z = 0;
      
      const powerUp = new Obstacle3D(x, y, z, type);
      this.powerUps.push(powerUp);
      this.scene.add(powerUp.mesh);
    }
  }
  
  checkCollisions() {
    if (!this.player) return;
    
    // Check obstacle collisions
    this.obstacles.forEach((obstacle, index) => {
      if (obstacle.checkCollision(this.player)) {
        console.log('Collision detected with obstacle:', obstacle.type);
        this.handleCollision(obstacle, index);
      }
    });
    
    // Check power-up collisions
    this.powerUps.forEach((powerUp, index) => {
      if (powerUp.checkCollision(this.player)) {
        console.log('Power-up collected:', powerUp.type);
        this.handlePowerUp(powerUp, index);
      }
    });
  }
  
  handleCollision(obstacle, index) {
    // Player takes damage
    this.player.takeDamage(1);
    
    // Create explosion particles
    this.createExplosion(obstacle.position);
    
    // Camera shake
    this.addCameraShake(5);
    
    // Remove obstacle
    this.removeObstacle(index);
  }
  
  handlePowerUp(powerUp, index) {
    // Apply power-up effect
    powerUp.applyPowerUp(this.player);
    
    // Create collection particles
    this.createCollectionEffect(powerUp.position);
    
    // Remove power-up
    this.removePowerUp(index);
  }
  
  updateScore() {
    this.depth += this.speed * this.deltaTime;
    this.score = Math.floor(this.depth / 100);
    
    // Increase speed over time
    this.speed = Math.min(this.speed + this.deltaTime * 0.001, this.maxSpeed);
    
    // Level progression
    this.level = Math.floor(this.score / 10) + 1;
  }
  
  // Input handling
  handleInput(direction) {
    if (!this.player) return;
    
    switch (direction) {
      case 'left':
        this.player.moveLeft(this.deltaTime);
        console.log('Player moving left');
        break;
      case 'right':
        this.player.moveRight(this.deltaTime);
        console.log('Player moving right');
        break;
      case 'jump':
        this.player.jump();
        console.log('Player jumping');
        break;
    }
  }
  
  // Visual effects
  createExplosion(position) {
    // Create explosion particles
    for (let i = 0; i < 10; i++) {
      const particle = {
        position: position.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        life: 1000,
        maxLife: 1000
      };
      this.particles.push(particle);
    }
  }
  
  createCollectionEffect(position) {
    // Create collection particles
    for (let i = 0; i < 5; i++) {
      const particle = {
        position: position.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        life: 500,
        maxLife: 500
      };
      this.particles.push(particle);
    }
  }
  
  addCameraShake(intensity) {
    this.shakeIntensity = intensity;
    this.cameraShake.set(
      (Math.random() - 0.5) * intensity,
      (Math.random() - 0.5) * intensity,
      0
    );
  }
  
  // Cleanup methods
  clearObstacles() {
    this.obstacles.forEach(obstacle => obstacle.dispose());
    this.obstacles = [];
  }
  
  clearParticles() {
    this.particles = [];
  }
  
  removeObstacle(index) {
    if (index >= 0 && index < this.obstacles.length) {
      this.obstacles[index].dispose();
      this.obstacles.splice(index, 1);
    }
  }
  
  removePowerUp(index) {
    if (index >= 0 && index < this.powerUps.length) {
      this.powerUps[index].dispose();
      this.powerUps.splice(index, 1);
    }
  }
  
  removeParticle(index) {
    if (index >= 0 && index < this.particles.length) {
      this.particles.splice(index, 1);
    }
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  dispose() {
    // Clean up all objects
    this.clearObstacles();
    this.clearParticles();
    
    if (this.player) {
      this.player.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
