// Lapsus Somnii - Game Engine
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.depth = 0;
        this.fragments = 0;
        this.speed = 2;
        this.maxSpeed = 8;
        
        // Game objects
        this.player = null;
        this.obstacles = [];
        this.particles = [];
        this.powerUps = [];
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            shake: 0,
            shakeIntensity: 0
        };
        
        // Input
        this.keys = {};
        this.touchControls = {
            startX: 0,
            startY: 0,
            isActive: false
        };
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.obstacleSpawnTimer = 0;
        this.powerUpSpawnTimer = 0;
        
        // Visual effects
        this.backgroundLayers = [];
        this.dreamEffects = [];
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupBackground();
        this.setupUI();
        this.gameLoop();
    }
    
    setupCanvas() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
    }
    
    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchControls.startX = touch.clientX;
            this.touchControls.startY = touch.clientY;
            this.touchControls.isActive = true;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.touchControls.isActive) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchControls.startX;
            const deltaY = touch.clientY - this.touchControls.startY;
            
            // Horizontal movement
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                this.keys['ArrowLeft'] = deltaX < -20;
                this.keys['ArrowRight'] = deltaX > 20;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.isActive = false;
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
        });
        
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.state === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const centerX = this.width / 2;
                
                this.keys['ArrowLeft'] = mouseX < centerX - 50;
                this.keys['ArrowRight'] = mouseX > centerX + 50;
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.setupCanvas();
        });
    }
    
    setupBackground() {
        // Create multiple background layers for parallax effect
        for (let i = 0; i < 5; i++) {
            this.backgroundLayers.push({
                y: i * this.height,
                speed: (i + 1) * 0.5,
                opacity: 1 - (i * 0.15)
            });
        }
    }
    
    setupUI() {
        // Menu buttons
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('instructionsButton').addEventListener('click', () => {
            this.showInstructions();
        });
        
        document.getElementById('backButton').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('continueButton').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('newDreamButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseMenuButton').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('resumeButton').addEventListener('click', () => {
            this.resumeGame();
        });
    }
    
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.depth = 0;
        this.fragments = 0;
        this.speed = 2;
        this.camera.y = 0;
        
        // Initialize player at center of perspective
        this.player = new Player(this.width / 2, this.height / 2);
        
        // Clear arrays
        this.obstacles = [];
        this.particles = [];
        this.powerUps = [];
        this.dreamEffects = [];
        
        // Hide menus
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('instructionsMenu').classList.add('hidden');
        document.getElementById('dreamStatusMenu').classList.add('hidden');
        document.getElementById('pauseMenu').classList.add('hidden');
        
        this.updateUI();
    }
    
    showMainMenu() {
        this.state = 'menu';
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('instructionsMenu').classList.add('hidden');
        document.getElementById('dreamStatusMenu').classList.add('hidden');
        document.getElementById('pauseMenu').classList.add('hidden');
    }
    
    showInstructions() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('instructionsMenu').classList.remove('hidden');
    }
    
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseMenu').classList.remove('hidden');
        } else if (this.state === 'paused') {
            this.resumeGame();
        }
    }
    
    resumeGame() {
        this.state = 'playing';
        document.getElementById('pauseMenu').classList.add('hidden');
    }
    
    // No game over - infinite fall in the dream
    // The player can fall forever and ever...
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        this.deltaTime = deltaTime;
        
        // Update game speed (gradually increase for more intense fall)
        this.speed = Math.min(this.speed + deltaTime * 0.005, this.maxSpeed);
        
        // Update depth (infinite fall - accélération)
        this.depth += this.speed * deltaTime * 0.5;
        
        // Update camera (follow the infinite fall)
        this.camera.y += this.speed * deltaTime * 1.2;
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.keys);
            
            // Keep player in infinite fall - no game over
            // Player can fall forever in the dream
        }
        
        // Spawn obstacles
        this.obstacleSpawnTimer += deltaTime;
        if (this.obstacleSpawnTimer > 2000 - (this.speed * 100)) {
            this.spawnObstacle();
            this.obstacleSpawnTimer = 0;
        }
        
        // Spawn power-ups
        this.powerUpSpawnTimer += deltaTime;
        if (this.powerUpSpawnTimer > 5000) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }
        
        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.update(deltaTime);
            
            // Remove obstacles that are far below camera
            if (obstacle.y > this.camera.y + this.height + 200) {
                this.obstacles.splice(index, 1);
            }
            
            // Check collision with player
            if (this.player && obstacle.checkCollision(this.player)) {
                this.handleCollision(obstacle);
            }
        });
        
        // Update power-ups
        this.powerUps.forEach((powerUp, index) => {
            powerUp.update(deltaTime);
            
            // Remove power-ups that are far below camera
            if (powerUp.y > this.camera.y + this.height + 200) {
                this.powerUps.splice(index, 1);
            }
            
            // Check collection
            if (this.player && powerUp.checkCollision(this.player)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }
        });
        
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.update(deltaTime);
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // Update dream effects
        this.dreamEffects.forEach((effect, index) => {
            effect.update(deltaTime);
            if (effect.life <= 0) {
                this.dreamEffects.splice(index, 1);
            }
        });
        
        // Update score
        this.score = Math.floor(this.depth * 10 + this.fragments * 100);
        
        this.updateUI();
    }
    
    spawnObstacle() {
        const centerX = this.width / 2;
        const x = centerX + (Math.random() - 0.5) * 200; // Spawn around center
        const y = this.camera.y - 300; // Spawn far above for 3D effect
        const type = Math.random() < 0.7 ? 'illusion' : 'creature';
        
        this.obstacles.push(new Obstacle(x, y, type));
    }
    
    spawnPowerUp() {
        const centerX = this.width / 2;
        const x = centerX + (Math.random() - 0.5) * 150; // Spawn around center
        const y = this.camera.y - 300; // Spawn far above for 3D effect
        const types = ['fragment', 'slowTime', 'reverseGravity', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerUps.push(new PowerUp(x, y, type));
    }
    
    handleCollision(obstacle) {
        if (obstacle.type === 'illusion') {
            // Illusions can be passed through with timing
            this.addCameraShake(5);
            this.createParticles(obstacle.x, obstacle.y, '#ffd700', 8);
        } else if (obstacle.type === 'creature') {
            // Creatures cause damage
            this.addCameraShake(10);
            this.createParticles(obstacle.x, obstacle.y, '#ff6b6b', 12);
            this.player.takeDamage();
        }
    }
    
    collectPowerUp(powerUp) {
        this.fragments++;
        this.createParticles(powerUp.x, powerUp.y, '#00ff88', 6);
        
        switch (powerUp.type) {
            case 'fragment':
                this.score += 100;
                break;
            case 'slowTime':
                this.player.activateSlowTime();
                break;
            case 'reverseGravity':
                this.player.activateReverseGravity();
                break;
            case 'shield':
                this.player.activateShield();
                break;
        }
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    addCameraShake(intensity) {
        this.camera.shakeIntensity = intensity;
        this.camera.shake = intensity;
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('depthValue').textContent = Math.floor(this.depth);
        document.getElementById('fragmentsValue').textContent = this.fragments;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Apply camera shake
        if (this.camera.shake > 0) {
            this.ctx.save();
            this.ctx.translate(
                (Math.random() - 0.5) * this.camera.shake,
                (Math.random() - 0.5) * this.camera.shake
            );
            this.camera.shake *= 0.9;
            if (this.camera.shake < 0.1) this.camera.shake = 0;
        }
        
        // Render background with 3D perspective
        this.renderBackground3D();
        
        // Render game objects with 3D perspective
        if (this.state === 'playing') {
            this.renderObjects3D();
        }
        
        // Restore context if shake was applied
        if (this.camera.shake > 0) {
            this.ctx.restore();
        }
    }
    
    renderBackground3D() {
        // Vraie texture 3D de tunnel
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Fond noir
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Créer des segments de tunnel avec texture 3D
        const tunnelSpeed = this.depth * 0.2;
        
        for (let segment = 0; segment < 20; segment++) {
            const segmentY = segment * 30 + (tunnelSpeed) % 30;
            const scale = 1 - (segment * 0.06); // Les segments se rétrécissent
            const alpha = 1 - (segment * 0.08); // Fade avec la distance
            
            if (scale <= 0.3) continue;
            
            const radius = 100 * scale;
            const y = centerY + segmentY;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // Créer des "briques" ou "tuiles" sur le tunnel
            const numTiles = Math.floor(16 * scale);
            for (let i = 0; i < numTiles; i++) {
                const angle1 = (i * Math.PI * 2) / numTiles;
                const angle2 = ((i + 1) * Math.PI * 2) / numTiles;
                
                // Position des coins de la tuile
                const x1 = centerX + Math.cos(angle1) * radius;
                const y1 = y + Math.sin(angle1) * radius;
                const x2 = centerX + Math.cos(angle2) * radius;
                const y2 = y + Math.sin(angle2) * radius;
                
                // Position de la tuile suivante (plus proche)
                const nextRadius = radius * 0.95;
                const x3 = centerX + Math.cos(angle2) * nextRadius;
                const y3 = y + Math.sin(angle2) * nextRadius;
                const x4 = centerX + Math.cos(angle1) * nextRadius;
                const y4 = y + Math.sin(angle1) * nextRadius;
                
                // Couleur de la tuile (variation)
                const tileColor = `hsl(${30 + (i * 5) % 20}, 40%, ${20 + (segment * 2)}%)`;
                
                // Dessiner la tuile
                this.ctx.fillStyle = tileColor;
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.lineTo(x3, y3);
                this.ctx.lineTo(x4, y4);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Bordure de la tuile
                this.ctx.strokeStyle = '#222222';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
        
        // Point de fuite avec glow
        this.ctx.save();
        this.ctx.globalAlpha = 0.8 + Math.sin(this.depth * 0.01) * 0.2;
        
        // Glow externe
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(0.5, '#ffaa00');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Point central
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    renderObjects3D() {
        // Étape 1: Rendu simple des objets (pas de 3D pour l'instant)
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        
        if (this.player) {
            this.player.render(this.ctx);
        }
    }
    
    renderObject3D(obj, centerX, centerY) {
        // Calculate 3D position
        const relativeY = obj.y - this.camera.y;
        const depth = Math.max(0, relativeY);
        const scale = Math.max(0.1, 1 - (depth / 800)); // Perspective scaling
        const alpha = Math.max(0.1, 1 - (depth / 600)); // Fade with distance
        
        if (scale <= 0.1) return;
        
        // Calculate screen position with perspective
        const screenX = centerX + (obj.x - centerX) * scale;
        const screenY = centerY + (obj.y - centerY) * scale;
        
        this.ctx.save();
        this.ctx.translate(screenX, screenY);
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = alpha;
        
        // Render the object
        obj.render(this.ctx);
        
        this.ctx.restore();
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    window.game = new Game();
});
