// Lapsus Somnii - Obstacles and Power-ups
class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 60;
        this.height = 60;
        this.speed = window.game.speed;
        
        // Visual properties
        this.rotation = 0;
        this.animationFrame = 0;
        this.glowIntensity = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        // Behavior properties
        this.isActive = true;
        this.collisionCooldown = 0;
        
        this.setupByType();
    }
    
    setupByType() {
        switch (this.type) {
            case 'illusion':
                this.width = 80;
                this.height = 40;
                this.color = '#ffd700';
                this.glowColor = '#ffff00';
                this.speed *= 0.8;
                break;
                
            case 'creature':
                this.width = 50;
                this.height = 50;
                this.color = '#ff6b6b';
                this.glowColor = '#ff0000';
                this.speed *= 1.2;
                break;
                
            case 'fragment':
                this.width = 30;
                this.height = 30;
                this.color = '#00ff88';
                this.glowColor = '#00ffff';
                this.speed *= 0.5;
                break;
        }
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Move downward
        this.y += this.speed * deltaTime * 0.1;
        
        // Update visual effects
        this.rotation += deltaTime * 0.002;
        this.animationFrame += deltaTime * 0.005;
        this.glowIntensity = Math.sin(this.pulsePhase + Date.now() * 0.003) * 0.5 + 0.5;
        
        // Update collision cooldown
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= deltaTime;
        }
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Render glow effect
        this.renderGlow(ctx);
        
        // Render main body
        this.renderBody(ctx);
        
        // Render type-specific details
        this.renderDetails(ctx);
        
        ctx.restore();
    }
    
    renderGlow(ctx) {
        const glowSize = this.width * (1 + this.glowIntensity * 0.5);
        
        ctx.save();
        ctx.globalAlpha = this.glowIntensity * 0.3;
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    renderBody(ctx) {
        ctx.fillStyle = this.color;
        
        switch (this.type) {
            case 'illusion':
                this.renderIllusion(ctx);
                break;
            case 'creature':
                this.renderCreature(ctx);
                break;
            case 'fragment':
                this.renderFragment(ctx);
                break;
        }
    }
    
    renderIllusion(ctx) {
        // Wispy, ethereal shape
        ctx.save();
        ctx.globalAlpha = 0.7 + this.glowIntensity * 0.3;
        
        // Main body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, this.rotation, 0, Math.PI * 2);
        ctx.fill();
        
        // Wispy trails
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2 / 3) + this.animationFrame;
            const trailX = Math.cos(angle) * this.width / 3;
            const trailY = Math.sin(angle) * this.height / 3;
            
            ctx.beginPath();
            ctx.ellipse(trailX, trailY, 8, 15, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    renderCreature(ctx) {
        // Angular, menacing shape
        ctx.save();
        ctx.globalAlpha = 0.8;
        
        // Main body (diamond shape)
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, 0);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-this.width / 4, -this.height / 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.width / 4, -this.height / 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-this.width / 4, -this.height / 4, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.width / 4, -this.height / 4, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    renderFragment(ctx) {
        // Crystalline, precious shape
        ctx.save();
        ctx.globalAlpha = 0.9;
        
        // Main crystal
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 3, -this.height / 4);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(this.width / 3, this.height / 4);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(-this.width / 3, this.height / 4);
        ctx.lineTo(-this.width / 2, 0);
        ctx.lineTo(-this.width / 3, -this.height / 4);
        ctx.closePath();
        ctx.fill();
        
        // Inner facets
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 3);
        ctx.lineTo(this.width / 4, 0);
        ctx.lineTo(0, this.height / 3);
        ctx.lineTo(-this.width / 4, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    renderDetails(ctx) {
        // Add sparkle effects for fragments
        if (this.type === 'fragment') {
            ctx.save();
            ctx.globalAlpha = this.glowIntensity;
            ctx.fillStyle = '#ffffff';
            
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI / 2) + this.animationFrame;
                const sparkleX = Math.cos(angle) * this.width / 2;
                const sparkleY = Math.sin(angle) * this.height / 2;
                
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    checkCollision(player) {
        if (this.collisionCooldown > 0) return false;
        
        const playerBounds = player.getBounds();
        const obstacleBounds = this.getBounds();
        
        return (
            playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
            playerBounds.x + playerBounds.width > obstacleBounds.x &&
            playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
            playerBounds.y + playerBounds.height > obstacleBounds.y
        );
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

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 40;
        this.height = 40;
        this.speed = window.game.speed * 0.5;
        
        // Visual properties
        this.rotation = 0;
        this.animationFrame = 0;
        this.glowIntensity = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.floatOffset = Math.random() * Math.PI * 2;
        
        // Behavior
        this.isActive = true;
        this.collected = false;
        
        this.setupByType();
    }
    
    setupByType() {
        switch (this.type) {
            case 'fragment':
                this.color = '#00ff88';
                this.glowColor = '#00ffff';
                this.symbol = '✦';
                break;
                
            case 'slowTime':
                this.color = '#ffff00';
                this.glowColor = '#ffaa00';
                this.symbol = '⏰';
                break;
                
            case 'reverseGravity':
                this.color = '#ff00ff';
                this.glowColor = '#ff0080';
                this.symbol = '↕';
                break;
                
            case 'shield':
                this.color = '#00aaff';
                this.glowColor = '#0088ff';
                this.symbol = '🛡';
                break;
        }
    }
    
    update(deltaTime) {
        if (!this.isActive || this.collected) return;
        
        // Move downward with floating motion
        this.y += this.speed * deltaTime * 0.1;
        this.x += Math.sin(this.floatOffset + Date.now() * 0.002) * 0.5;
        
        // Update visual effects
        this.rotation += deltaTime * 0.001;
        this.animationFrame += deltaTime * 0.003;
        this.glowIntensity = Math.sin(this.pulsePhase + Date.now() * 0.004) * 0.5 + 0.5;
    }
    
    render(ctx) {
        if (!this.isActive || this.collected) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Render glow effect
        this.renderGlow(ctx);
        
        // Render main body
        this.renderBody(ctx);
        
        // Render symbol
        this.renderSymbol(ctx);
        
        ctx.restore();
    }
    
    renderGlow(ctx) {
        const glowSize = this.width * (1 + this.glowIntensity * 0.8);
        
        ctx.save();
        ctx.globalAlpha = this.glowIntensity * 0.4;
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    renderBody(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.8 + this.glowIntensity * 0.2;
        ctx.fillStyle = this.color;
        
        // Circular body
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner ring
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 - 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderSymbol(ctx) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = `${this.width / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.9;
        
        ctx.fillText(this.symbol, 0, 0);
        ctx.restore();
    }
    
    checkCollision(player) {
        if (this.collected) return false;
        
        const playerBounds = player.getBounds();
        const powerUpBounds = this.getBounds();
        
        return (
            playerBounds.x < powerUpBounds.x + powerUpBounds.width &&
            playerBounds.x + playerBounds.width > powerUpBounds.x &&
            playerBounds.y < powerUpBounds.y + powerUpBounds.height &&
            playerBounds.y + playerBounds.height > powerUpBounds.y
        );
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
