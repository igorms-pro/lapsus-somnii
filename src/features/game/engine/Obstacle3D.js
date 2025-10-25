/**
 * Obstacle3D - Three.js Obstacle Class
 * Converted from old obstacles.js for React Native
 */

import * as THREE from 'three';

export class Obstacle3D {
  constructor(x, y, z, type) {
    this.position = new THREE.Vector3(x, y, z);
    this.type = type;
    this.size = { width: 60, height: 60, depth: 40 };
    this.speed = 2;
    
    // Visual properties
    this.mesh = null;
    this.rotation = 0;
    this.animationFrame = 0;
    this.glowIntensity = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    
    // Behavior properties
    this.isActive = true;
    this.collisionCooldown = 0;
    
    this.setupByType();
    this.createMesh();
  }
  
  setupByType() {
    switch (this.type) {
      case 'illusion':
        this.size = { width: 80, height: 40, depth: 20 };
        this.color = 0xffd700;
        this.glowColor = 0xffff00;
        this.behavior = 'fade';
        break;
        
      case 'memory':
        this.size = { width: 50, height: 50, depth: 30 };
        this.color = 0x8A2BE2;
        this.glowColor = 0xDA70D6;
        this.behavior = 'pulse';
        break;
        
      case 'regret':
        this.size = { width: 70, height: 70, depth: 50 };
        this.color = 0x8B0000;
        this.glowColor = 0xFF0000;
        this.behavior = 'shake';
        break;
        
      case 'fear':
        this.size = { width: 60, height: 60, depth: 40 };
        this.color = 0x000000;
        this.glowColor = 0x800080;
        this.behavior = 'teleport';
        break;
        
      case 'powerup_slow':
        this.size = { width: 30, height: 30, depth: 20 };
        this.color = 0x00BFFF;
        this.glowColor = 0x87CEEB;
        this.behavior = 'float';
        break;
        
      case 'powerup_shield':
        this.size = { width: 30, height: 30, depth: 20 };
        this.color = 0x32CD32;
        this.glowColor = 0x90EE90;
        this.behavior = 'float';
        break;
        
      case 'powerup_gravity':
        this.size = { width: 30, height: 30, depth: 20 };
        this.color = 0xFFD700;
        this.glowColor = 0xFFFF00;
        this.behavior = 'float';
        break;
        
      default:
        this.size = { width: 60, height: 60, depth: 40 };
        this.color = 0x666666;
        this.glowColor = 0x888888;
        this.behavior = 'static';
    }
  }
  
  createMesh() {
    // Create geometry based on type
    let geometry;
    
    if (this.type.includes('powerup')) {
      geometry = new THREE.SphereGeometry(this.size.width / 2, 8, 6);
    } else {
      geometry = new THREE.BoxGeometry(
        this.size.width, 
        this.size.height, 
        this.size.depth
      );
    }
    
    // Create material
    const material = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.8
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
  }
  
  update(deltaTime, gameSpeed = 1) {
    if (!this.isActive) return;
    
    // Update position (falling down)
    this.position.y -= this.speed * gameSpeed * deltaTime;
    this.mesh.position.copy(this.position);
    
    // Update behavior
    this.updateBehavior(deltaTime);
    
    // Update visual effects
    this.updateVisualEffects(deltaTime);
    
    // Update collision cooldown
    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= deltaTime;
    }
  }
  
  updateBehavior(deltaTime) {
    switch (this.behavior) {
      case 'fade':
        this.fadeBehavior(deltaTime);
        break;
      case 'pulse':
        this.pulseBehavior(deltaTime);
        break;
      case 'shake':
        this.shakeBehavior(deltaTime);
        break;
      case 'teleport':
        this.teleportBehavior(deltaTime);
        break;
      case 'float':
        this.floatBehavior(deltaTime);
        break;
    }
  }
  
  fadeBehavior(deltaTime) {
    // Fade in and out
    const fadeSpeed = 2;
    this.animationFrame += deltaTime * fadeSpeed;
    const opacity = 0.3 + Math.sin(this.animationFrame) * 0.4;
    this.mesh.material.opacity = opacity;
  }
  
  pulseBehavior(deltaTime) {
    // Pulsing size
    const pulseSpeed = 3;
    this.pulsePhase += deltaTime * pulseSpeed;
    const scale = 1 + Math.sin(this.pulsePhase) * 0.2;
    this.mesh.scale.setScalar(scale);
  }
  
  shakeBehavior(deltaTime) {
    // Shaking movement
    const shakeIntensity = 2;
    this.animationFrame += deltaTime * 10;
    const shakeX = Math.sin(this.animationFrame) * shakeIntensity;
    const shakeY = Math.cos(this.animationFrame * 1.3) * shakeIntensity;
    this.mesh.position.x += shakeX;
    this.mesh.position.y += shakeY;
  }
  
  teleportBehavior(deltaTime) {
    // Teleporting effect
    this.animationFrame += deltaTime * 2;
    if (Math.sin(this.animationFrame) > 0.8) {
      this.mesh.visible = true;
    } else {
      this.mesh.visible = false;
    }
  }
  
  floatBehavior(deltaTime) {
    // Floating up and down
    this.animationFrame += deltaTime * 2;
    const floatOffset = Math.sin(this.animationFrame) * 5;
    this.mesh.position.y += floatOffset * deltaTime;
  }
  
  updateVisualEffects(deltaTime) {
    // Rotation
    this.rotation += deltaTime * 2;
    this.mesh.rotation.z = this.rotation;
    
    // Glow effect
    this.pulsePhase += deltaTime * 3;
    this.glowIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3;
    
    // Update material
    if (this.mesh.material) {
      this.mesh.material.opacity = this.glowIntensity;
    }
  }
  
  // Collision detection
  checkCollision(player) {
    const distance = this.position.distanceTo(player.position);
    const minDistance = (this.size.width + player.size.width) / 2;
    return distance < minDistance;
  }
  
  // Power-up effects
  applyPowerUp(player) {
    if (this.type === 'powerup_slow') {
      player.activatePowerUp('slowTime', 5000);
    } else if (this.type === 'powerup_shield') {
      player.activatePowerUp('shield', 3000);
    } else if (this.type === 'powerup_gravity') {
      player.activatePowerUp('reverseGravity', 4000);
    }
  }
  
  // Reset
  reset() {
    this.isActive = true;
    this.collisionCooldown = 0;
    this.mesh.visible = true;
  }
  
  // Dispose
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}
