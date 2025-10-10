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
        
        this.init();
    }
    
    init() {
        this.setupThreeJS();
        this.createTunnel();
        this.createPlayer();
        this.setupEventListeners();
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
        // Create tunnel segments with perspective effect
        // Each segment gets smaller as it goes deeper
        
        for (let i = 0; i < 20; i++) {
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
            }
        }
        
        // Add point of light at the end (vanishing point)
        const pointLight = new THREE.PointLight(0x00ffff, 1, 50);
        pointLight.position.set(0, 0, -40);
        this.scene.add(pointLight);
        
        // Add glowing target at the end
        const targetGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const targetMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ffff,
            emissive: 0x004444
        });
        const target = new THREE.Mesh(targetGeometry, targetMaterial);
        target.position.set(0, 0, -40);
        target.rotation.x = Math.PI / 2;
        this.scene.add(target);
        
        console.log('Tunnel with perspective created!');
    }
    
    createPlayer() {
        // Create player - golden sphere
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xffd700,
            emissive: 0x444400 // Slight glow
        });
        
        this.player = new THREE.Mesh(geometry, material);
        this.player.position.set(0, 0, 0);
        this.scene.add(this.player);
        
        console.log('Player created!');
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
        
        // Slight rotation for visual feedback
        this.player.rotation.x += 0.01;
        this.player.rotation.y += 0.01;
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
