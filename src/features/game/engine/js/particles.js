// Lapsus Somnii - Particle System
class Particle {
    constructor(x, y, color = '#ffffff', type = 'sparkle') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.color = color;
        this.type = type;
        
        // Life properties
        this.life = 1.0;
        this.maxLife = 1.0;
        this.decay = 0.02 + Math.random() * 0.03;
        
        // Visual properties
        this.size = 2 + Math.random() * 4;
        this.maxSize = this.size;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        
        // Special effects
        this.glowIntensity = Math.random() * 0.5 + 0.5;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        this.setupByType();
    }
    
    setupByType() {
        switch (this.type) {
            case 'sparkle':
                this.life = 0.8 + Math.random() * 0.4;
                this.maxLife = this.life;
                this.size = 1 + Math.random() * 3;
                this.maxSize = this.size;
                break;
                
            case 'explosion':
                this.vx = (Math.random() - 0.5) * 8;
                this.vy = (Math.random() - 0.5) * 8;
                this.life = 1.2 + Math.random() * 0.8;
                this.maxLife = this.life;
                this.size = 3 + Math.random() * 6;
                this.maxSize = this.size;
                break;
                
            case 'trail':
                this.vx *= 0.3;
                this.vy *= 0.3;
                this.life = 0.5 + Math.random() * 0.3;
                this.maxLife = this.life;
                this.size = 1 + Math.random() * 2;
                this.maxSize = this.size;
                break;
                
            case 'dream':
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = -Math.random() * 3;
                this.life = 2 + Math.random() * 2;
                this.maxLife = this.life;
                this.size = 2 + Math.random() * 4;
                this.maxSize = this.size;
                break;
        }
    }
    
    update(deltaTime) {
        // Update position
        this.x += this.vx * deltaTime * 0.1;
        this.y += this.vy * deltaTime * 0.1;
        
        // Apply gravity for some particle types
        if (this.type === 'explosion' || this.type === 'sparkle') {
            this.vy += 0.1 * deltaTime * 0.1;
        }
        
        // Update life
        this.life -= this.decay * deltaTime * 0.1;
        
        // Update visual properties
        this.rotation += this.rotationSpeed * deltaTime * 0.1;
        this.glowIntensity = Math.sin(this.pulsePhase + Date.now() * 0.005) * 0.3 + 0.7;
        
        // Update size based on life
        const lifeRatio = this.life / this.maxLife;
        this.size = this.maxSize * lifeRatio;
    }
    
    render(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        
        switch (this.type) {
            case 'sparkle':
                this.renderSparkle(ctx);
                break;
            case 'explosion':
                this.renderExplosion(ctx);
                break;
            case 'trail':
                this.renderTrail(ctx);
                break;
            case 'dream':
                this.renderDream(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    renderSparkle(ctx) {
        // Glowing point
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer glow
        ctx.save();
        ctx.globalAlpha *= 0.3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Cross pattern
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.size * 2, 0);
        ctx.lineTo(this.size * 2, 0);
        ctx.moveTo(0, -this.size * 2);
        ctx.lineTo(0, this.size * 2);
        ctx.stroke();
    }
    
    renderExplosion(ctx) {
        // Main particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Explosion rings
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
            ctx.globalAlpha = (1 - i * 0.3) * (this.life / this.maxLife);
            ctx.beginPath();
            ctx.arc(0, 0, this.size * i, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    renderTrail(ctx) {
        // Elongated trail particle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 2, this.rotation, 0, Math.PI * 2);
        ctx.fill();
        
        // Soft glow
        ctx.save();
        ctx.globalAlpha *= 0.4;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.5, this.size * 3, this.rotation, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    renderDream(ctx) {
        // Ethereal, wispy particle
        ctx.save();
        ctx.globalAlpha *= 0.6;
        
        // Main body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 1.5, this.rotation, 0, Math.PI * 2);
        ctx.fill();
        
        // Wispy trails
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2 / 3) + this.rotation;
            const trailX = Math.cos(angle) * this.size * 0.8;
            const trailY = Math.sin(angle) * this.size * 0.8;
            
            ctx.globalAlpha *= 0.5;
            ctx.beginPath();
            ctx.ellipse(trailX, trailY, this.size * 0.3, this.size * 0.8, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Particle System Manager
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    addParticle(x, y, color, type = 'sparkle') {
        this.particles.push(new Particle(x, y, color, type));
    }
    
    addExplosion(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            this.addParticle(x, y, color, 'explosion');
        }
    }
    
    addTrail(x, y, color, count = 3) {
        for (let i = 0; i < count; i++) {
            this.addParticle(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, color, 'trail');
        }
    }
    
    addDreamEffect(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.addParticle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, color, 'dream');
        }
    }
    
    update(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.update(deltaTime);
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    render(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }
    
    clear() {
        this.particles = [];
    }
}
