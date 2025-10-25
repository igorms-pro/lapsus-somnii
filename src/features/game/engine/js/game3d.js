// Lapsus Somnii - 3D Game Engine with Three.js
class Game3D {
    constructor() {
        this.container = document.getElementById('gameContainer');
        this.canvas = document.getElementById('gameCanvas');
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.depth = 0;
        this.fragments = 0;
        this.speed = 2;
        this.maxSpeed = 8;
        
        // Three.js setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Game objects
        this.player = null;
        this.obstacles = [];
        this.powerUps = [];
        this.tunnelSegments = [];
        
        // Input
        this.keys = {};
        this.touchControls = {
            startX: 0,
            startY: 0,
            isActive: false
        };
        
        // Timing
        this.obstacleSpawnTimer = 0;
        this.powerUpSpawnTimer = 0;
        
        this.init();
    }
    
    init() {
        this.setupThreeJS();
        this.setupEventListeners();
        this.setupUI();
        this.createTunnel();
        this.createPlayer();
        this.gameLoop();
    }
    
    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near
            1000 // Far
        );
        this.camera.position.set(0, 0, 5);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(0, 0, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Point light at the end of tunnel
        const pointLight = new THREE.PointLight(0xffd700, 1, 100);
        pointLight.position.set(0, 0, -50);
        this.scene.add(pointLight);
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
            
            this.keys['ArrowLeft'] = deltaX < -20;
            this.keys['ArrowRight'] = deltaX > 20;
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
                const centerX = window.innerWidth / 2;
                
                this.keys['ArrowLeft'] = mouseX < centerX - 50;
                this.keys['ArrowRight'] = mouseX > centerX + 50;
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
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
    
    createTunnel() {
        // Create tunnel segments
        for (let i = 0; i < 50; i++) {
            const segment = this.createTunnelSegment(i * -10);
            this.tunnelSegments.push(segment);
            this.scene.add(segment);
        }
    }
    
    createTunnelSegment(z) {
        const group = new THREE.Group();
        
        // Tunnel wall geometry
        const geometry = new THREE.CylinderGeometry(3, 3, 10, 16, 1, true);
        
        // Create material with texture-like appearance
        const material = new THREE.MeshLambertMaterial({
            color: 0x8B4513, // Brown color
            side: THREE.BackSide, // Inside of cylinder
            transparent: true,
            opacity: 0.8
        });
        
        const tunnelWall = new THREE.Mesh(geometry, material);
        tunnelWall.position.z = z;
        tunnelWall.rotation.x = Math.PI / 2;
        group.add(tunnelWall);
        
        // Add some texture details
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const detailGeometry = new THREE.BoxGeometry(0.1, 0.1, 10);
            const detailMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const detail = new THREE.Mesh(detailGeometry, detailMaterial);
            
            detail.position.x = Math.cos(angle) * 3.1;
            detail.position.y = Math.sin(angle) * 3.1;
            detail.position.z = z;
            detail.rotation.z = angle;
            
            group.add(detail);
        }
        
        return group;
    }
    
    createPlayer() {
        // Player geometry
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshLambertMaterial({
            color: 0xffd700,
            emissive: 0x444400
        });
        
        this.player = new THREE.Mesh(geometry, material);
        this.player.position.set(0, 0, 0);
        this.player.castShadow = true;
        this.scene.add(this.player);
    }
    
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.depth = 0;
        this.fragments = 0;
        this.speed = 2;
        
        // Reset player position
        this.player.position.set(0, 0, 0);
        
        // Clear obstacles and power-ups
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.powerUps.forEach(powerUp => this.scene.remove(powerUp));
        this.obstacles = [];
        this.powerUps = [];
        
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
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        // Update game speed
        this.speed = Math.min(this.speed + deltaTime * 0.001, this.maxSpeed);
        
        // Update depth
        this.depth += this.speed * deltaTime * 0.1;
        
        // Move tunnel segments
        this.tunnelSegments.forEach(segment => {
            segment.position.z += this.speed * deltaTime * 0.1;
            
            // Reset segment position when it goes too far
            if (segment.position.z > 20) {
                segment.position.z -= 500; // Reset to back
            }
        });
        
        // Update player
        this.updatePlayer(deltaTime);
        
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
            obstacle.position.z += this.speed * deltaTime * 0.1;
            obstacle.rotation.y += deltaTime * 0.001;
            
            // Remove obstacles that are behind player
            if (obstacle.position.z > 10) {
                this.scene.remove(obstacle);
                this.obstacles.splice(index, 1);
            }
            
            // Check collision
            if (this.checkCollision(this.player, obstacle)) {
                this.handleCollision(obstacle);
            }
        });
        
        // Update power-ups
        this.powerUps.forEach((powerUp, index) => {
            powerUp.position.z += this.speed * deltaTime * 0.1;
            powerUp.rotation.y += deltaTime * 0.002;
            
            // Remove power-ups that are behind player
            if (powerUp.position.z > 10) {
                this.scene.remove(powerUp);
                this.powerUps.splice(index, 1);
            }
            
            // Check collection
            if (this.checkCollision(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
                this.scene.remove(powerUp);
                this.powerUps.splice(index, 1);
            }
        });
        
        // Update score
        this.score = Math.floor(this.depth * 10 + this.fragments * 100);
        
        this.updateUI();
    }
    
    updatePlayer(deltaTime) {
        // Handle input
        const moveSpeed = 3 * deltaTime * 0.1;
        
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.position.x -= moveSpeed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.position.x += moveSpeed;
        }
        
        // Keep player in bounds
        this.player.position.x = Math.max(-2.5, Math.min(2.5, this.player.position.x));
        
        // Player rotation
        this.player.rotation.x += deltaTime * 0.001;
        this.player.rotation.z += deltaTime * 0.0005;
    }
    
    spawnObstacle() {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
        const obstacle = new THREE.Mesh(geometry, material);
        
        obstacle.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            -50
        );
        obstacle.castShadow = true;
        
        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
    }
    
    spawnPowerUp() {
        const geometry = new THREE.OctahedronGeometry(0.3);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x00ff88,
            emissive: 0x004400
        });
        const powerUp = new THREE.Mesh(geometry, material);
        
        powerUp.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            -50
        );
        powerUp.castShadow = true;
        
        this.powerUps.push(powerUp);
        this.scene.add(powerUp);
    }
    
    checkCollision(obj1, obj2) {
        const distance = obj1.position.distanceTo(obj2.position);
        return distance < 0.8; // Collision radius
    }
    
    handleCollision(obstacle) {
        // Visual feedback
        this.player.material.color.setHex(0xff0000);
        setTimeout(() => {
            this.player.material.color.setHex(0xffd700);
        }, 200);
        
        // Add score penalty or other effects
        this.score -= 50;
    }
    
    collectPowerUp(powerUp) {
        this.fragments++;
        // Visual feedback
        this.player.material.color.setHex(0x00ff00);
        setTimeout(() => {
            this.player.material.color.setHex(0xffd700);
        }, 200);
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('depthValue').textContent = Math.floor(this.depth);
        document.getElementById('fragmentsValue').textContent = this.fragments;
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    gameLoop() {
        const deltaTime = this.clock.getDelta() * 1000; // Convert to milliseconds
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize 3D game when page loads
window.addEventListener('load', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        window.game = new Game3D();
    } else {
        console.error('Three.js not loaded!');
    }
});
