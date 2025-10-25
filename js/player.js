// Lapsus Somnii - Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.speed = 5;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Player state
        this.health = 3;
        this.maxHealth = 3;
        this.isAlive = true;
        
        // Power-ups
        this.powerUps = {
            slowTime: { active: false, duration: 0 },
            reverseGravity: { active: false, duration: 0 },
            shield: { active: false, duration: 0 }
        };
        
        // Visual effects
        this.glowIntensity = 0;
        this.rotation = 0;
        this.trail = [];
        this.maxTrailLength = 10;
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
    }
    
    update(deltaTime, keys) {
        if (!this.isAlive) return;
        
        // Handle input
        this.handleInput(keys, deltaTime);
        
        // Apply physics
        this.applyPhysics(deltaTime);
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Update trail
        this.updateTrail();
        
        // Keep player in bounds
        this.constrainToBounds();
    }
    
    handleInput(keys, deltaTime) {
        const moveSpeed = this.speed * deltaTime * 0.1;
        
        // Horizontal movement
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.velocityX = -moveSpeed;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            this.velocityX = moveSpeed;
        } else {
            this.velocityX *= 0.8; // Friction
        }
        
        // Power-up activation
        if (keys['Space'] || keys['KeyW']) {
            this.activatePowerUp();
        }
    }
    
    applyPhysics(deltaTime) {
        // Mode tunnel - joueur au centre qui tombe
        const centerX = window.game.width / 2;
        const centerY = window.game.height / 2;
        
        // Le joueur reste au centre horizontalement
        this.velocityX += (centerX - this.x) * 0.1 * deltaTime * 0.1;
        
        // Chute verticale (le tunnel bouge, pas le joueur)
        // Le joueur reste à la même position Y, c'est le tunnel qui défile
        
        // Apply slow time effect
        const timeMultiplier = this.powerUps.slowTime.active ? 0.3 : 1;
        
        // Update position
        this.x += this.velocityX * timeMultiplier;
        // this.y reste fixe - c'est le tunnel qui bouge
        
        // Update rotation based on movement
        this.rotation += this.velocityX * 0.02;
    }
    
    updatePowerUps(deltaTime) {
        Object.keys(this.powerUps).forEach(key => {
            if (this.powerUps[key].active) {
                this.powerUps[key].duration -= deltaTime;
                if (this.powerUps[key].duration <= 0) {
                    this.powerUps[key].active = false;
                }
            }
        });
    }
    
    updateVisualEffects(deltaTime) {
        // Glow effect
        this.glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        
        // Animation
        this.animationFrame += this.animationSpeed * deltaTime;
        if (this.animationFrame >= 1) {
            this.animationFrame = 0;
        }
    }
    
    updateTrail() {
        // Add current position to trail
        this.trail.push({
            x: this.x,
            y: this.y,
            life: 1.0
        });
        
        // Remove old trail points
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Update trail life
        this.trail.forEach(point => {
            point.life -= 0.05;
        });
        
        // Remove dead trail points
        this.trail = this.trail.filter(point => point.life > 0);
    }
    
    constrainToBounds() {
        const margin = this.width / 2;
        this.x = Math.max(margin, Math.min(window.game.width - margin, this.x));
    }
    
    activatePowerUp() {
        // Activate the first available power-up
        if (this.powerUps.slowTime.duration > 0) {
            this.powerUps.slowTime.active = true;
        } else if (this.powerUps.reverseGravity.duration > 0) {
            this.powerUps.reverseGravity.active = true;
        } else if (this.powerUps.shield.duration > 0) {
            this.powerUps.shield.active = true;
        }
    }
    
    activateSlowTime() {
        this.powerUps.slowTime.active = true;
        this.powerUps.slowTime.duration = 3000; // 3 seconds
    }
    
    activateReverseGravity() {
        this.powerUps.reverseGravity.active = true;
        this.powerUps.reverseGravity.duration = 2000; // 2 seconds
    }
    
    activateShield() {
        this.powerUps.shield.active = true;
        this.powerUps.shield.duration = 5000; // 5 seconds
    }
    
    takeDamage() {
        if (this.powerUps.shield.active) {
            // Shield absorbs damage
            this.powerUps.shield.active = false;
            this.powerUps.shield.duration = 0;
            return;
        }
        
        this.health--;
        this.glowIntensity = 1.5; // Flash effect
        
        // In the infinite dream, you can't die
        // Just visual feedback for collisions
        if (this.health <= 0) {
            this.health = 1; // Reset to minimum health
        }
    }
    
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Move to player position
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Render trail
        this.renderTrail(ctx);
        
        // Render shield effect
        if (this.powerUps.shield.active) {
            this.renderShield(ctx);
        }
        
        // Render player body
        this.renderBody(ctx);
        
        // Render power-up effects
        this.renderPowerUpEffects(ctx);
        
        ctx.restore();
    }
    
    renderTrail(ctx) {
        ctx.save();
        
        this.trail.forEach((point, index) => {
            const alpha = point.life * 0.5;
            const size = (index / this.trail.length) * 15;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(point.x - this.x, point.y - this.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    renderShield(ctx) {
        const shieldSize = 50;
        const shieldAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
        
        ctx.save();
        ctx.globalAlpha = shieldAlpha;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, shieldSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    
    renderBody(ctx) {
        // Main body gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${this.glowIntensity})`);
        gradient.addColorStop(0.7, 'rgba(255, 165, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0.6)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Dream-like shape (elongated diamond)
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 3, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(-this.width / 3, 0);
        ctx.closePath();
        ctx.fill();
        
        // Inner glow
        ctx.fillStyle = `rgba(255, 255, 255, ${this.glowIntensity * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 4, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderPowerUpEffects(ctx) {
        // Slow time effect
        if (this.powerUps.slowTime.active) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 40, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // Reverse gravity effect
        if (this.powerUps.reverseGravity.active) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(0, -30, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 30, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}
