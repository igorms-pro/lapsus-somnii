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
        
        this.init();
    }
    
    init() {
        this.setupThreeJS();
        this.createTunnel();
        this.createPlayer();
        this.setupEventListeners();
        this.startTime = performance.now();
        this.gameLoop();
    }
    
    setupThreeJS() {
        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        
        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near
            1000 // Far
        );
        this.camera.position.set(0, 0, 5);
        
        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('gameCanvas'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // 4. Basic lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        console.log('Three.js setup complete!');
    }
    
    createTunnel() {
        // Create multiple tunnel sections that follow each other
        // Each tunnel section is 100 units long, with 300 units gap between them
        
        const tunnelColors = [
            0x8B0000, // Dark Red
            0x006400, // Dark Green  
            0x000080, // Dark Blue
            0x4B0082, // Dark Violet
            0x8B4513  // Saddle Brown
        ];
        
        for (let tunnelIndex = 0; tunnelIndex < 5; tunnelIndex++) {
            const tunnelStart = tunnelIndex * 120; // 100 tunnel + 20 gap = 120 total
            
            // Create tunnel segments for this section
            for (let i = 0; i < 50; i++) {
                const depth = tunnelStart + (i * 2); // Distance from camera
                const scale = 1 - ((depth % 100) * 0.01); // Scale resets for each tunnel
                const radius = 4 * scale; // Radius gets smaller
                const segmentLength = 2;
                
                if (scale <= 0.1) continue; // Stop when too small
                
                // Create tunnel ring
                const ringGeometry = new THREE.CylinderGeometry(radius, radius, segmentLength, 16, 1, true);
                const ringMaterial = new THREE.MeshLambertMaterial({
                    color: tunnelColors[tunnelIndex % tunnelColors.length], // Different color per tunnel
                    side: THREE.BackSide, // Inside of cylinder
                    transparent: true,
                    opacity: 0.8 - ((depth % 100) * 0.02) // Fade with distance within tunnel
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
                    radius: radius,
                    tunnelIndex: tunnelIndex
                });
                
                // Add texture details to each ring
                for (let j = 0; j < 8; j++) {
                    const angle = (j * Math.PI * 2) / 8;
                    const detailGeometry = new THREE.BoxGeometry(0.1 * scale, 0.1 * scale, segmentLength);
                    const detailMaterial = new THREE.MeshLambertMaterial({ 
                        color: tunnelColors[tunnelIndex % tunnelColors.length] - 0x222222, // Darker version
                        transparent: true,
                        opacity: 0.6 - ((depth % 100) * 0.02)
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
                        radius: radius,
                        tunnelIndex: tunnelIndex
                    });
                }
            }
            
            // Add point of light at the end of each tunnel
            const pointLight = new THREE.PointLight(0x00ffff, 1, 200);
            pointLight.position.set(0, 0, -(tunnelStart + 100));
            this.scene.add(pointLight);
            
            // Add glowing target at the end of each tunnel
            const targetGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
            const targetMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff, // White
                emissive: 0x444444
            });
            const target = new THREE.Mesh(targetGeometry, targetMaterial);
            target.position.set(0, 0, -(tunnelStart + 100));
            target.rotation.x = Math.PI / 2;
            this.scene.add(target);
            
            // Store target for movement
            this.tunnelSegments.push({
                mesh: target,
                originalDepth: tunnelStart + 100,
                scale: 1,
                radius: 0.2,
                tunnelIndex: tunnelIndex
            });
        }
        
        console.log('Multiple tunnels created!');
    }
    
    createPlayer() {
        // Create player - golden sphere
        const geometry = new THREE.SphereGeometry(0.5, 16, 16); // Bigger sphere
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
        
        // Update tunnel movement (decor moves towards player)
        this.updateTunnel();
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updatePlayer() {
        if (!this.player) return;
        
        const moveSpeed = 0.1;
        
        // Full arrow key movement
        if (this.keys['ArrowLeft']) {
            this.player.position.x -= moveSpeed;
        }
        if (this.keys['ArrowRight']) {
            this.player.position.x += moveSpeed;
        }
        if (this.keys['ArrowUp']) {
            this.player.position.y += moveSpeed;
        }
        if (this.keys['ArrowDown']) {
            this.player.position.y -= moveSpeed;
        }
        
        // Keep player in bounds (tunnel walls)
        this.player.position.x = Math.max(-3, Math.min(3, this.player.position.x));
        this.player.position.y = Math.max(-3, Math.min(3, this.player.position.y));
        this.player.position.z = Math.max(1, Math.min(3, this.player.position.z)); // Keep Z in visible range
        
        // Slight rotation for visual feedback
        this.player.rotation.x += 0.01;
        this.player.rotation.y += 0.01;
    }
    
    updateTunnel() {
        // Stop movement after maxFallSeconds
        if (this.startTime) {
            const elapsedSec = (performance.now() - this.startTime) / 1000;
            if (elapsedSec >= this.maxFallSeconds) {
                return; // Freeze decor
            }
        }

        // Move tunnel segments towards player (create falling effect)
        this.tunnelSegments.forEach(segment => {
            // Move segment towards player
            segment.mesh.position.z += this.speed;
            
            // When segment passes player, reset it to the back seamlessly
            if (segment.mesh.position.z > 5) {
                // Find the furthest segment to place this one right after it
                let furthestZ = -2000; // Much further back
                this.tunnelSegments.forEach(otherSegment => {
                    if (otherSegment.mesh.position.z < furthestZ) {
                        furthestZ = otherSegment.mesh.position.z;
                    }
                });
                
                // Place this segment right after the furthest one
                segment.mesh.position.z = furthestZ - 2; // 2 units spacing
            }
        });
        
        // Gradually increase speed for more intense falling effect
        this.speed += 0.0001;
        this.speed = Math.min(this.speed, 0.2); // Cap max speed
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
