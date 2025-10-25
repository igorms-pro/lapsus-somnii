// Lapsus Somnii - 3D Game Engine (Version Ultra Simple)
class Game3DSimple {
    constructor() {
        // Three.js core seulement
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Player
        this.player = null;
        
        // Input
        this.keys = {};
        
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isSwiping = false;
        
        // Game state
        this.obstacles = [];
        this.powerUps = []; // Store power-ups separately
        this.tunnelSegments = []; // Store tunnel segments for movement
        this.speed = 0.005; // Speed of tunnel movement
        this.startTime = null; // Start time for fall duration
        this.maxFallSeconds = 30; // Stop after 30s
        this.landscapeElements = []; // Store landscape elements for subtle movement
        this.fallSpeed = 0.05; // Speed of obstacles moving up (Start at old level 3 speed)
        this.tunnelActive = true; // Keep tunnel active
        this.obstaclesInTunnel = true; // Spawn obstacles in tunnel
        
        // Game state
        this.gameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        
        // Power-up state
        this.activePowerUp = null; // Currently active power-up
        this.powerUpEndTime = 0; // When current power-up expires
        
        // Difficulty progression (Amateur: 1min30, Pro: 4-5min)
        this.baseSpawnRate = 0.05; // Base spawn rate (Level 1 = old Level 3)
        this.currentSpawnRate = 0.05; // Current spawn rate (increases over time)
        this.baseFallSpeed = 0.05; // Base fall speed (Level 1 = old Level 3)
        this.difficultyIncreaseInterval = 15000; // Increase difficulty every 15 seconds (amateur: 1min30, pro: 4-5min)
        this.lastDifficultyIncrease = Date.now();
        
        this.init();
    }
    
    init() {
        this.setupThreeJS();
        this.createCornerMarkers();
        this.createPlayer();
        this.setupEventListeners();
        this.startTime = performance.now();
        this.gameLoop();
    }
    
    setupThreeJS() {
        // 1. Scene
        this.scene = new THREE.Scene();
        // No 3D background - use SVG background instead
        
        /* Remove 3D sky sphere - using SVG now
        const skyGeometry = new THREE.SphereGeometry(500, 32, 15);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) }, // Blue at top
                bottomColor: { value: new THREE.Color(0x87CEEB) }, // Light blue at bottom
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        */
        
        // 2. Camera (optimized for mobile portrait)
        this.camera = new THREE.PerspectiveCamera(
            45, // FOV (tighter for mobile)
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near
            1000 // Far
        );
        this.camera.position.set(0, 8, 0); // Closer for mobile (8 instead of 10)
        this.camera.lookAt(0, 0, 0); // Look down at player
        
        // 3. Main Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('gameCanvas'),
            antialias: true,
            alpha: true // Transparent canvas to show SVG background
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // 4. Side View Camera (lateral view)
        this.sideCamera = new THREE.PerspectiveCamera(
            60, // FOV
            120 / 180, // Aspect ratio (120x180 canvas)
            0.1,
            1000
        );
        this.sideCamera.position.set(10, 0, 0); // Camera to the side (X=10)
        this.sideCamera.lookAt(0, 0, 0);
        
        // 5. Side View Renderer (check if canvas exists)
        const sideCanvas = document.getElementById('sideViewCanvas');
        if (sideCanvas) {
            this.sideRenderer = new THREE.WebGLRenderer({
                canvas: sideCanvas,
                antialias: true,
                alpha: false // NOT transparent - we want to see it!
            });
            this.sideRenderer.setSize(120, 180);
            this.sideRenderer.setClearColor(0x001122, 1); // Dark blue background
            console.log('Side view renderer created! Canvas:', sideCanvas.width, 'x', sideCanvas.height);
        } else {
            console.warn('Side view canvas not found');
            this.sideRenderer = null;
        }
        
        // 4. Realistic lighting
        const ambientLight = new THREE.AmbientLight(0x87CEEB, 0.4); // Sky blue ambient
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        console.log('Three.js setup complete!');
    }
    
    createLandscape() {
        // Create dreamy landscape with subtle movement
        
        // Create mountains in the far background
        for (let i = 0; i < 8; i++) {
            const mountainGeometry = new THREE.ConeGeometry(15, 25, 8);
            const mountainMaterial = new THREE.MeshLambertMaterial({
                color: 0x8B7D6B, // Mountain brown
                transparent: true,
                opacity: 0.4 // More transparent for distance
            });
            
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            mountain.position.set(
                (i - 4) * 40, // Spread mountains wider horizontally
                -50, // Much lower - ground level for falling ball
                -200 - (i * 30) // Much further back
            );
            this.scene.add(mountain);
            
            // Store for subtle movement
            this.landscapeElements.push({
                mesh: mountain,
                type: 'mountain',
                originalY: mountain.position.y,
                wiggleSpeed: 0.0005 + (i * 0.0002)
            });
        }
        
        // Create realistic clouds with multiple spheres
        for (let i = 0; i < 15; i++) {
            const cloudGroup = new THREE.Group();
            
            // Create cloud with multiple spheres for realistic shape
            for (let j = 0; j < 5 + Math.random() * 8; j++) {
                const cloudGeometry = new THREE.SphereGeometry(3 + Math.random() * 4, 8, 6);
                const cloudMaterial = new THREE.MeshLambertMaterial({
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.4 + Math.random() * 0.3
                });
                
                const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
                cloudPart.position.set(
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 10
                );
                cloudPart.scale.set(
                    0.8 + Math.random() * 0.4,
                    0.6 + Math.random() * 0.4,
                    0.8 + Math.random() * 0.4
                );
                cloudGroup.add(cloudPart);
            }
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 400,
                50 + Math.random() * 100, // Much higher - above falling ball
                -200 - Math.random() * 300
            );
            cloudGroup.scale.set(1 + Math.random(), 0.5 + Math.random() * 0.5, 1 + Math.random());
            this.scene.add(cloudGroup);
            
            // Store for subtle movement
            this.landscapeElements.push({
                mesh: cloudGroup,
                type: 'cloud',
                originalY: cloudGroup.position.y,
                wiggleSpeed: 0.0008 + (Math.random() * 0.0015),
                wiggleAmount: 0.5 + Math.random() * 1.5
            });
        }
        
        // Create stars - very far back
        for (let i = 0; i < 30; i++) {
            const starGeometry = new THREE.SphereGeometry(0.2, 4, 4);
            const starMaterial = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF,
                emissive: 0x222222
            });
            
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
                (Math.random() - 0.5) * 400, // Spread very wide
                80 + Math.random() * 100, // Much higher - above falling ball
                -300 - Math.random() * 300 // Very far back
            );
            this.scene.add(star);
            
            // Store for twinkling
            this.landscapeElements.push({
                mesh: star,
                type: 'star',
                originalOpacity: 0.6 + Math.random() * 0.4,
                twinkleSpeed: 0.005 + Math.random() * 0.01
            });
        }
        
        console.log('Dreamy landscape created!');
    }
    
    createTunnel() {
        // Create tunnel segments with perspective effect
        // Each segment gets smaller as it goes deeper
        
        for (let i = 0; i < 50; i++) {
            const depth = i * 2; // Distance from camera
            const scale = 1 - (depth * 0.05); // Scale decreases with distance
            const radius = 4 * scale; // Radius gets smaller
            const segmentLength = 2;
            
            if (scale <= 0.1) continue; // Stop when too small
            
            // Create tunnel ring
            const ringGeometry = new THREE.CylinderGeometry(radius, radius, segmentLength, 16, 1, true);
            const ringMaterial = new THREE.MeshLambertMaterial({
                color: 0x8B0000, // Dark Red
                side: THREE.BackSide, // Inside of cylinder
                transparent: true,
                opacity: 0.8 - (depth * 0.02) // Fade with distance
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(0, 0, -depth);
            ring.rotation.x = Math.PI / 2;
            this.scene.add(ring);
            
            // Store segment for movement
            this.tunnelSegments.push({
                mesh: ring,
                originalDepth: depth,
                scale: scale,
                radius: radius
            });
            
            // Add texture details to each ring
            for (let j = 0; j < 8; j++) {
                const angle = (j * Math.PI * 2) / 8;
                const detailGeometry = new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, segmentLength);
                const detailMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x4B0000, // Darker Red for details
                    transparent: true,
                    opacity: 0.6 - (depth * 0.02)
                });
                const detail = new THREE.Mesh(detailGeometry, detailMaterial);
                
                detail.position.x = Math.cos(angle) * (radius + 0.1);
                detail.position.y = Math.sin(angle) * (radius + 0.1);
                detail.position.z = -depth;
                detail.rotation.z = angle;
                
                this.scene.add(detail);
                
                // Store detail for movement too
                this.tunnelSegments.push({
                    mesh: detail,
                    originalDepth: depth,
                    scale: scale,
                    radius: radius
                });
            }
        }
        
        // Add point of light at the end (vanishing point)
        const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
        pointLight.position.set(0, 0, -100);
        this.scene.add(pointLight);
        
        // Add glowing target at the end
        const targetGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const targetMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff, // White
            emissive: 0x444444
        });
        const target = new THREE.Mesh(targetGeometry, targetMaterial);
        target.position.set(0, 0, -100);
        target.rotation.x = Math.PI / 2;
        this.scene.add(target);
        
        // Store target for movement
        this.tunnelSegments.push({
            mesh: target,
            originalDepth: 100,
            scale: 1,
            radius: 0.2
        });
        
        console.log('Tunnel with perspective created!');
    }
    
    createCornerMarkers() {
        // Create 4 corner markers to delimit the play area
        const cornerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const cornerMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            emissive: 0x666666,
            transparent: true,
            opacity: 0.6
        });
        
        const corners = [
            { x: -3, z: -5 },  // Top-left
            { x: 3, z: -5 },   // Top-right
            { x: -3, z: 5 },   // Bottom-left
            { x: 3, z: 5 }     // Bottom-right
        ];
        
        corners.forEach(pos => {
            const marker = new THREE.Mesh(cornerGeometry, cornerMaterial);
            marker.position.set(pos.x, 0, pos.z);
            this.scene.add(marker);
        });
        
        console.log('Corner markers created');
    }
    
    createPlayer() {
        // Create player - golden sphere (smaller)
        const geometry = new THREE.SphereGeometry(0.4, 16, 16); // Smaller sphere (radius 0.4)
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xffd700,
            emissive: 0x444400 // Slight glow
        });
        
        this.player = new THREE.Mesh(geometry, material);
        this.player.position.set(0, 0, 0); // Player at center
        this.scene.add(this.player);
        
        console.log('Player created at position:', this.player.position);
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Restart on R key
            if (e.code === 'KeyR' && this.gameOver) {
                this.restart();
            }
            
            // Pause on Escape or Space
            if ((e.code === 'Escape' || e.code === 'Space') && !this.gameOver) {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Side view toggle
        const toggleBtn = document.getElementById('sideViewToggle');
        const sideCanvas = document.getElementById('sideViewCanvas');
        const container = document.getElementById('sideViewContainer');
        let isCollapsed = false;
        
        if (toggleBtn && sideCanvas && container) {
            toggleBtn.addEventListener('click', () => {
                isCollapsed = !isCollapsed;
                if (isCollapsed) {
                    sideCanvas.style.width = '0px';
                    sideCanvas.style.height = '0px';
                    sideCanvas.style.border = 'none';
                    sideCanvas.style.opacity = '0';
                    toggleBtn.textContent = '+';
                    toggleBtn.style.position = 'relative';
                    toggleBtn.style.top = '0';
                    toggleBtn.style.right = '0';
                } else {
                    sideCanvas.style.width = '120px';
                    sideCanvas.style.height = '180px';
                    sideCanvas.style.border = '2px solid rgba(255,255,255,0.6)';
                    sideCanvas.style.opacity = '1';
                    toggleBtn.textContent = '−';
                    toggleBtn.style.position = 'absolute';
                    toggleBtn.style.top = '5px';
                    toggleBtn.style.right = '5px';
                }
            });
        }
        
        // Touch controls (swipe)
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
            this.isSwiping = false;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;
            
            this.isSwiping = true;
            
            const touchCurrentX = e.touches[0].clientX;
            const touchCurrentY = e.touches[0].clientY;
            
            const deltaX = touchCurrentX - this.touchStartX;
            const deltaY = touchCurrentY - this.touchStartY;
            
            // Continuous movement based on swipe
            const sensitivity = 0.01;
            
            // Horizontal movement (X axis)
            if (Math.abs(deltaX) > 10) {
                this.player.position.x += deltaX * sensitivity;
                
                // Keep in bounds
                const maxX = 3;
                this.player.position.x = Math.max(-maxX, Math.min(maxX, this.player.position.x));
            }
            
            // Vertical movement (Z axis)
            if (Math.abs(deltaY) > 10) {
                this.player.position.z += deltaY * sensitivity;
                
                // Keep in bounds
                const maxZ = 5;
                this.player.position.z = Math.max(-maxZ, Math.min(maxZ, this.player.position.z));
            }
            
            // Update start position for continuous movement
            this.touchStartX = touchCurrentX;
            this.touchStartY = touchCurrentY;
            
            // Prevent scrolling
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.isSwiping = false;
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    render() {
        // Render main view (top-down)
        this.renderer.render(this.scene, this.camera);
        
        // Render side view (lateral) - only if renderer exists
        if (this.sideRenderer && this.sideCamera) {
            this.sideRenderer.clear();
            this.sideRenderer.render(this.scene, this.sideCamera);
            // console.log('Side view rendered'); // Debug
        }
    }
    
    gameLoop() {
        if (!this.gameOver && !this.isPaused) {
            // Update player movement
            this.updatePlayer();
            
            // Update obstacles (they move up towards player)
            this.updateObstacles();
            
            // Check collisions (ENABLED!)
            this.checkCollisions();
            
            // Check if power-up expired
            if (this.activePowerUp && Date.now() > this.powerUpEndTime) {
                this.deactivatePowerUp();
            }
            
            // Update difficulty over time
            this.updateDifficulty();
            
            // Update camera to follow player
            this.updateCamera();
            
            // Update score (distance fallen)
            this.updateScore();
        }
        
        // Update ball coordinates display
        this.updateBallDisplay();
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateBallDisplay() {
        const coordsDiv = document.getElementById('ballCoords');
        if (coordsDiv && this.player) {
            if (this.gameOver) {
                coordsDiv.innerHTML = `
                    <div style="font-size: 24px; color: #ff4444; font-weight: bold;">GAME OVER!</div>
                    <div style="font-size: 18px; margin-top: 10px;">Score: ${this.score}m</div>
                    <div style="font-size: 16px;">Best: ${this.bestScore}m</div>
                    <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">Press R to restart</div>
                `;
            } else if (this.isPaused) {
                coordsDiv.innerHTML = `
                    <div style="font-size: 24px; color: #ffaa00; font-weight: bold;">⏸ PAUSED</div>
                    <div style="font-size: 18px; margin-top: 10px;">Score: ${this.score}m</div>
                    <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">Press SPACE or ESC to resume</div>
                `;
            } else {
                const difficultyLevel = Math.floor((this.currentSpawnRate - this.baseSpawnRate) / 0.008) + 1;
                const activePowerUpText = this.activePowerUp ? `<div style="font-size: 14px; color: #00ff00;">⚡ ${this.activePowerUp.toUpperCase()}</div>` : '';
                
                coordsDiv.innerHTML = `
                    <div>BALL: X=${this.player.position.x.toFixed(2)} Y=${this.player.position.y.toFixed(2)} Z=${this.player.position.z.toFixed(2)}</div>
                    <div style="font-size: 20px; font-weight: bold; margin-top: 5px;">Score: ${this.score}m</div>
                    <div style="font-size: 14px; opacity: 0.7;">Level: ${difficultyLevel}</div>
                    ${activePowerUpText}
                `;
            }
        }
    }
    
    updateScore() {
        // Score = distance fallen (absolute value of Y)
        this.score = Math.floor(Math.abs(this.player.position.y));
    }
    
    checkCollisions() {
        if (!this.player) return;
        
        const ballRadius = 0.4; // Player ball radius
        
        // Check OBSTACLE collisions (detect but don't do anything yet)
        this.obstacles.forEach(obstacle => {
            // First check: Is obstacle at same HEIGHT (Y) as ball?
            const dy = Math.abs(this.player.position.y - obstacle.position.y);
            
            // Only check collision if obstacle is at roughly same height (within 1 unit)
            if (dy < 1.0) {
                // Calculate horizontal distance (X and Z only)
                const dx = this.player.position.x - obstacle.position.x;
                const dz = this.player.position.z - obstacle.position.z;
                const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
                
                // Estimate obstacle radius (use scale as approximation)
                const obstacleRadius = obstacle.scale.x * 0.6; // Slightly smaller for better feel
                
                // Collision detected but NO EFFECT (no game over, no red ball)
                if (horizontalDistance < ballRadius + obstacleRadius) {
                    console.log('Obstacle collision detected (no effect yet)');
                }
            }
        });
        
        // Check POWER-UP collisions (collect them!)
        this.powerUps.forEach((powerUp, index) => {
            // First check: Is power-up at same HEIGHT (Y) as ball?
            const dy = Math.abs(this.player.position.y - powerUp.mesh.position.y);
            
            // Only check collision if power-up is at roughly same height (within 1 unit)
            if (dy < 1.0) {
                // Calculate horizontal distance (X and Z only)
                const dx = this.player.position.x - powerUp.mesh.position.x;
                const dz = this.player.position.z - powerUp.mesh.position.z;
                const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
                
                // Power-up radius (aura size)
                const powerUpRadius = 0.6; // Size of aura
                
                // Collision if horizontal distance less than sum of radii
                if (horizontalDistance < ballRadius + powerUpRadius) {
                    this.collectPowerUp(powerUp);
                    
                    // Remove power-up from scene and array
                    this.scene.remove(powerUp.mesh);
                    if (powerUp.aura) this.scene.remove(powerUp.aura);
                    this.powerUps.splice(index, 1);
                }
            }
        });
    }
    
    collectPowerUp(powerUp) {
        console.log('Power-up collected:', powerUp.type);
        
        // Activate power-up effect
        this.activePowerUp = powerUp.type;
        this.powerUpEndTime = Date.now() + 5000; // 5 seconds duration
        
        // Apply immediate effects based on type
        switch(powerUp.type) {
            case 'slowmo':
                // Slow down fall speed
                this.fallSpeed = this.fallSpeed * 0.5; // Half current speed
                console.log('Slow motion activated!');
                break;
            case 'shield':
                // Give shield (visual indicator)
                console.log('Shield activated!');
                break;
            case 'bonus':
                // Give bonus points
                this.score += 50;
                console.log('Bonus +50 points!');
                break;
        }
    }
    
    deactivatePowerUp() {
        console.log('Power-up expired:', this.activePowerUp);
        
        // Revert effects based on type
        switch(this.activePowerUp) {
            case 'slowmo':
                // Reset fall speed to current difficulty level
                this.fallSpeed = Math.min(this.baseFallSpeed + (this.currentSpawnRate - this.baseSpawnRate) * 0.8, 0.10);
                console.log('Slow motion deactivated');
                break;
            case 'shield':
                console.log('Shield deactivated');
                break;
        }
        
        this.activePowerUp = null;
        this.powerUpEndTime = 0;
    }
    
    triggerGameOver() {
        if (this.gameOver) return; // Already game over
        
        this.gameOver = true;
        console.log('GAME OVER! Score:', this.score);
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            console.log('NEW BEST SCORE!', this.bestScore);
        }
        
        // Change ball color to red
        this.player.material.color.setHex(0xff0000);
        this.player.material.emissive.setHex(0x440000);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? 'Game paused' : 'Game resumed');
    }
    
    updateDifficulty() {
        // Increase difficulty every 15 seconds (amateur: 1min30, pro: 4-5min)
        const currentTime = Date.now();
        const timeSinceLastIncrease = currentTime - this.lastDifficultyIncrease;
        
        if (timeSinceLastIncrease >= this.difficultyIncreaseInterval) {
            // Increase spawn rate (more obstacles)
            this.currentSpawnRate = Math.min(this.currentSpawnRate + 0.008, 0.12); // Cap at 0.12 for pro players
            
            // Increase fall speed (faster game)
            if (!this.activePowerUp || this.activePowerUp !== 'slowmo') {
                this.fallSpeed = Math.min(this.baseFallSpeed + (this.currentSpawnRate - this.baseSpawnRate) * 0.8, 0.10); // Cap at 0.10 for pro
            }
            
            this.lastDifficultyIncrease = currentTime;
            
            const level = Math.floor((this.currentSpawnRate - this.baseSpawnRate) / 0.008) + 1;
            console.log(`Difficulty increased! Level ${level} - Spawn rate: ${this.currentSpawnRate.toFixed(3)}, Fall speed: ${this.fallSpeed.toFixed(3)}`);
        }
    }
    
    restart() {
        console.log('Restarting game...');
        
        // Reset game state
        this.gameOver = false;
        this.isPaused = false;
        this.score = 0;
        
        // Reset difficulty
        this.currentSpawnRate = this.baseSpawnRate;
        this.fallSpeed = this.baseFallSpeed;
        this.lastDifficultyIncrease = Date.now();
        
        // Reset power-ups
        this.activePowerUp = null;
        this.powerUpEndTime = 0;
        
        // Reset player position
        this.player.position.set(0, 0, 0);
        
        // Reset player color
        this.player.material.color.setHex(0xffd700);
        this.player.material.emissive.setHex(0x444400);
        
        // Clear obstacles
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.obstacles = [];
        
        // Clear power-ups
        this.powerUps.forEach(powerUp => {
            this.scene.remove(powerUp.mesh);
            if (powerUp.aura) this.scene.remove(powerUp.aura);
        });
        this.powerUps = [];
    }
    
    updatePlayer() {
        if (!this.player) return;
        
        const moveSpeed = 0.15;
        
        // Movement in all 4 directions (larger space)
        if (this.keys['ArrowLeft']) {
            this.player.position.x -= moveSpeed;
        }
        if (this.keys['ArrowRight']) {
            this.player.position.x += moveSpeed;
        }
        if (this.keys['ArrowUp']) {
            this.player.position.z -= moveSpeed;
        }
        if (this.keys['ArrowDown']) {
            this.player.position.z += moveSpeed;
        }
        
        // Ball falls down
        this.player.position.y -= this.fallSpeed;
        
        // Keep player in bounds (mobile-optimized area)
        const maxX = 3; // Narrower width for mobile
        const maxZ = 5; // Taller height for portrait mode
        this.player.position.x = Math.max(-maxX, Math.min(maxX, this.player.position.x));
        this.player.position.z = Math.max(-maxZ, Math.min(maxZ, this.player.position.z));
        
        // Slight rotation for visual feedback
        this.player.rotation.x += 0.01;
        this.player.rotation.y += 0.01;
    }
    
    updateCamera() {
        // Main camera FOLLOWS player (mobile optimized - top-down view)
        this.camera.position.x = this.player.position.x; // Follow X
        this.camera.position.y = this.player.position.y + 8; // 8 units above player (closer for mobile)
        this.camera.position.z = this.player.position.z; // Follow Z
        this.camera.lookAt(this.player.position); // Always look at player
        
        // Side camera FOLLOWS player (lateral view - from the side)
        if (this.sideCamera) {
            this.sideCamera.position.x = 10; // Fixed to the side
            this.sideCamera.position.y = this.player.position.y; // Same height as player
            this.sideCamera.position.z = this.player.position.z; // Follow Z
            this.sideCamera.lookAt(this.player.position); // Look at player
        }
    }
    
    updateLandscape() {
        // Update landscape elements with subtle movement
        
        this.landscapeElements.forEach(element => {
            if (element.type === 'mountain') {
                // Mountains wiggle slightly
                element.mesh.position.y = element.originalY + Math.sin(Date.now() * element.wiggleSpeed) * 0.2;
            }
            
            if (element.type === 'cloud') {
                // Clouds float and wiggle
                element.mesh.position.y = element.originalY + Math.sin(Date.now() * element.wiggleSpeed) * element.wiggleAmount;
                element.mesh.rotation.y += 0.001;
            }
            
            if (element.type === 'star') {
                // Stars twinkle
                const twinkle = Math.sin(Date.now() * element.twinkleSpeed) * 0.3 + 0.7;
                element.mesh.material.opacity = element.originalOpacity * twinkle;
            }
        });
    }
    
    
    updateTunnel() {
        // Move tunnel segments towards player (create falling effect)
        this.tunnelSegments.forEach(segment => {
            // Move segment towards player
            segment.mesh.position.z += this.fallSpeed;
            
            // When segment passes player, reset it to the back seamlessly
            if (segment.mesh.position.z > 5) {
                // Find the furthest segment to place this one right after it
                let furthestZ = -1000;
                this.tunnelSegments.forEach(otherSegment => {
                    if (otherSegment.mesh.position.z < furthestZ) {
                        furthestZ = otherSegment.mesh.position.z;
                    }
                });
                
                // Place this segment right after the furthest one
                segment.mesh.position.z = furthestZ - 2; // 2 units spacing
            }
        });
    }
    
    updateObstacles() {
        // Spawn obstacles AND power-ups randomly below the player (with progressive difficulty)
        if (Math.random() < this.currentSpawnRate) {
            // 70% obstacles, 30% power-ups
            if (Math.random() < 0.7) {
                this.spawnObstacle();
            } else {
                this.spawnPowerUp();
            }
        }
        
        // Update obstacles (static)
        this.obstacles.forEach((obstacle, index) => {
            // Remove obstacles that the ball has passed (above the ball)
            if (obstacle.position.y > this.player.position.y + 5) {
                this.scene.remove(obstacle);
                this.obstacles.splice(index, 1);
            }
        });
        
        // Update power-ups (static + pulse aura)
        this.powerUps.forEach((powerUp, index) => {
            // Pulse the aura
            if (powerUp.aura) {
                const pulseScale = 1.2 + Math.sin(Date.now() * 0.005) * 0.3;
                powerUp.aura.scale.set(pulseScale, pulseScale, pulseScale);
            }
            
            // Remove power-ups that the ball has passed
            if (powerUp.mesh.position.y > this.player.position.y + 5) {
                this.scene.remove(powerUp.mesh);
                if (powerUp.aura) this.scene.remove(powerUp.aura);
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    spawnObstacle() {
        // Create random obstacle
        const obstacleTypes = ['cube', 'sphere', 'pyramid'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        let geometry, material;
        
        switch(type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.5, 8, 6);
                material = new THREE.MeshLambertMaterial({ color: 0x4ecdc4 });
                break;
            case 'pyramid':
                geometry = new THREE.ConeGeometry(0.5, 1, 4);
                material = new THREE.MeshLambertMaterial({ color: 0x45b7d1 });
                break;
        }
        
        const obstacle = new THREE.Mesh(geometry, material);
        
        // Random size (smaller platforms)
        const randomScale = 0.5 + Math.random() * 0.8; // Scale between 0.5 and 1.3 (smaller)
        
        // Random position in WIDER area (mobile portrait optimized)
        const randomX = Math.random() * 10 - 5; // -5 to +5 (wider than playable -3 to +3)
        const randomZ = Math.random() * 14 - 7; // -7 to +7 (wider than playable -5 to +5)
        
        obstacle.position.set(
            randomX, // Random X across full width
            this.player.position.y - 8 - Math.random() * 8, // Below player (8-16 units, closer)
            randomZ  // Random Z across full height
        );
        
        obstacle.scale.set(randomScale, 0.5, randomScale); // Flat platforms
        
        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
        
        console.log('Obstacle spawned at X:', randomX.toFixed(2), 'Z:', randomZ.toFixed(2));
    }
    
    spawnPowerUp() {
        // Power-up types
        const powerUpTypes = [
            { type: 'slowmo', color: 0xffff00, auraColor: 0xffff00 }, // Yellow
            { type: 'shield', color: 0x00ff00, auraColor: 0x00ff88 },  // Green
            { type: 'bonus', color: 0xff00ff, auraColor: 0xff00ff }    // Magenta
        ];
        
        const powerUpData = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        // Create power-up mesh (small diamond/octahedron)
        const geometry = new THREE.OctahedronGeometry(0.3, 0);
        const material = new THREE.MeshLambertMaterial({ 
            color: powerUpData.color,
            emissive: powerUpData.color,
            emissiveIntensity: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Create AURA (glowing sphere around it)
        const auraGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({ 
            color: powerUpData.auraColor,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide // Render inside-out for glow effect
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        
        // Random position (same as obstacles)
        const randomX = Math.random() * 10 - 5;
        const randomZ = Math.random() * 14 - 7;
        const yPos = this.player.position.y - 8 - Math.random() * 8;
        
        mesh.position.set(randomX, yPos, randomZ);
        aura.position.set(randomX, yPos, randomZ);
        
        // Store power-up with its aura
        this.powerUps.push({
            mesh: mesh,
            aura: aura,
            type: powerUpData.type
        });
        
        this.scene.add(mesh);
        this.scene.add(aura);
        
        console.log('Power-up spawned:', powerUpData.type, 'at X:', randomX.toFixed(2), 'Z:', randomZ.toFixed(2));
    }
    
}

// Initialize simple 3D game
window.addEventListener('load', () => {
    if (typeof THREE !== 'undefined') {
        window.game = new Game3DSimple();
        console.log('Game initialized!');
    } else {
        console.error('Three.js not loaded!');
    }
});
