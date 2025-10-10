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
        
        // Game state
        this.obstacles = [];
        this.tunnelSegments = []; // Store tunnel segments for movement
        this.speed = 0.005; // Speed of tunnel movement
        this.startTime = null; // Start time for fall duration
        this.maxFallSeconds = 30; // Stop after 30s
        this.landscapeElements = []; // Store landscape elements for subtle movement
        this.obstacles = []; // Store obstacles
        this.fallSpeed = 0.05; // Speed of obstacles moving up (slow)
        this.tunnelActive = true; // Keep tunnel active
        this.obstaclesInTunnel = true; // Spawn obstacles in tunnel
        
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
        
        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(
            50, // FOV (reduced from 75 for more zoom)
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near
            1000 // Far
        );
        this.camera.position.set(0, 10, 0); // Camera even closer (more zoom)
        this.camera.lookAt(0, 0, 0); // Look down at player
        
        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('gameCanvas'),
            antialias: true,
            alpha: true // Transparent canvas to show SVG background
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
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
            { x: -5, z: -6 },  // Top-left
            { x: 5, z: -6 },   // Top-right
            { x: -5, z: 6 },   // Bottom-left
            { x: 5, z: 6 }     // Bottom-right
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
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    gameLoop() {
        // Update player movement
        this.updatePlayer();
        
        // Update obstacles (they move up towards player)
        this.updateObstacles();
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update ball coordinates display
        this.updateBallDisplay();
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateBallDisplay() {
        const coordsDiv = document.getElementById('ballCoords');
        if (coordsDiv && this.player) {
            coordsDiv.textContent = `BALL: X=${this.player.position.x.toFixed(2)} Y=${this.player.position.y.toFixed(2)} Z=${this.player.position.z.toFixed(2)}`;
        }
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
        
        // Keep player in bounds (smaller area for better gameplay)
        const maxX = 5; // Narrower width
        const maxZ = 6; // Narrower height
        this.player.position.x = Math.max(-maxX, Math.min(maxX, this.player.position.x));
        this.player.position.z = Math.max(-maxZ, Math.min(maxZ, this.player.position.z));
        
        // Slight rotation for visual feedback
        this.player.rotation.x += 0.01;
        this.player.rotation.y += 0.01;
    }
    
    updateCamera() {
        // Camera follows player from above (aerial view)
        this.camera.position.x = this.player.position.x;
        this.camera.position.y = this.player.position.y + 10; // 10 units above player (even closer zoom)
        this.camera.position.z = this.player.position.z;
        this.camera.lookAt(this.player.position);
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
        // Spawn obstacles randomly below the player (very frequent)
        if (Math.random() < 0.05) {
            this.spawnObstacle();
        }
        
        // Obstacles stay in place (static)
        this.obstacles.forEach((obstacle, index) => {
            // Remove obstacles that the ball has passed (above the ball)
            if (obstacle.position.y > this.player.position.y + 5) {
                this.scene.remove(obstacle);
                this.obstacles.splice(index, 1);
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
        
        // Random position across entire play area (TRULY random)
        const randomX = Math.random() * 10 - 5; // -5 to +5 (ensures full range)
        const randomZ = Math.random() * 12 - 6; // -6 to +6 (ensures full range)
        
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
