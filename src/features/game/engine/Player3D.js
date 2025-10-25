/**
 * Player3D - Three.js Player Class
 * Converted from old player.js for React Native
 */

import * as THREE from 'three';

export class Player3D {
  constructor(x, y, z = 0) {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.size = { width: 30, height: 40, depth: 20 };
    
    // Player state
    this.health = 3;
    this.maxHealth = 3;
    this.isAlive = true;
    this.score = 0;
    
    // Movement
    this.speed = 5;
    this.gravity = 0.5;
    this.jumpPower = 12;
    this.isGrounded = false;
    
    // Power-ups
    this.powerUps = {
      slowTime: { active: false, duration: 0 },
      reverseGravity: { active: false, duration: 0 },
      shield: { active: false, duration: 0 }
    };
    
    // Visual effects
    this.mesh = null;
    this.glowIntensity = 0;
    this.rotation = 0;
    this.trail = [];
    this.maxTrailLength = 10;
    
    // Animation
    this.animationFrame = 0;
    this.bobOffset = 0;
    this.pulsePhase = 0;
    
    this.createMesh();
  }
  
  createMesh() {
    // Create player geometry
    const geometry = new THREE.BoxGeometry(
      this.size.width, 
      this.size.height, 
      this.size.depth
    );
    
    // Create material with glow effect
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
  }
  
  update(deltaTime) {
    if (!this.isAlive) return;
    
    // Apply gravity
    if (!this.powerUps.reverseGravity.active) {
      this.velocity.y -= this.gravity * deltaTime;
    } else {
      this.velocity.y += this.gravity * deltaTime;
    }
    
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.mesh.position.copy(this.position);
    
    // Update power-ups
    this.updatePowerUps(deltaTime);
    
    // Update visual effects
    this.updateVisualEffects(deltaTime);
    
    // Update trail
    this.updateTrail();
  }
  
  updatePowerUps(deltaTime) {
    Object.keys(this.powerUps).forEach(key => {
      const powerUp = this.powerUps[key];
      if (powerUp.active && powerUp.duration > 0) {
        powerUp.duration -= deltaTime;
        if (powerUp.duration <= 0) {
          powerUp.active = false;
        }
      }
    });
  }
  
  updateVisualEffects(deltaTime) {
    // Rotation
    this.rotation += deltaTime * 2;
    this.mesh.rotation.z = this.rotation;
    
    // Bobbing animation
    this.bobOffset = Math.sin(this.animationFrame * 0.1) * 2;
    this.mesh.position.y += this.bobOffset;
    
    // Pulsing glow
    this.pulsePhase += deltaTime * 3;
    this.glowIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3;
    
    // Update material
    if (this.mesh.material) {
      this.mesh.material.opacity = this.glowIntensity;
    }
    
    this.animationFrame += deltaTime;
  }
  
  updateTrail() {
    // Add current position to trail
    this.trail.push(this.position.clone());
    
    // Limit trail length
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }
  
  // Movement methods
  moveLeft(deltaTime) {
    this.velocity.x = -this.speed;
  }
  
  moveRight(deltaTime) {
    this.velocity.x = this.speed;
  }
  
  jump() {
    if (this.isGrounded || this.powerUps.reverseGravity.active) {
      this.velocity.y = this.jumpPower;
      this.isGrounded = false;
    }
  }
  
  // Power-up methods
  activatePowerUp(type, duration = 5000) {
    this.powerUps[type] = { active: true, duration };
  }
  
  // Collision methods
  checkCollision(obstacle) {
    const distance = this.position.distanceTo(obstacle.position);
    const minDistance = (this.size.width + obstacle.size.width) / 2;
    return distance < minDistance;
  }
  
  takeDamage(amount = 1) {
    if (this.powerUps.shield.active) return;
    
    this.health -= amount;
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }
  
  // Reset methods
  reset() {
    this.health = this.maxHealth;
    this.isAlive = true;
    this.velocity.set(0, 0, 0);
    this.powerUps = {
      slowTime: { active: false, duration: 0 },
      reverseGravity: { active: false, duration: 0 },
      shield: { active: false, duration: 0 }
    };
  }
  
  // Dispose
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}
