// Lapsus Somnii - Main Entry Point
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    console.log('Lapsus Somnii - Le Rêve Infini');
    console.log('Initializing dream world...');
    
    // Add touch event listeners for mobile
    document.addEventListener('touchstart', (e) => {
        // Resume audio context on first user interaction
        if (window.audioManager) {
            window.audioManager.resumeContext();
        }
    }, { once: true });
    
    // Add click event listener for desktop
    document.addEventListener('click', (e) => {
        // Resume audio context on first user interaction
        if (window.audioManager) {
            window.audioManager.resumeContext();
        }
    }, { once: true });
    
    // Add keyboard event listener
    document.addEventListener('keydown', (e) => {
        // Resume audio context on first user interaction
        if (window.audioManager) {
            window.audioManager.resumeContext();
        }
    }, { once: true });
    
    // Handle visibility change (pause when tab is not visible)
    document.addEventListener('visibilitychange', () => {
        if (window.game) {
            if (document.hidden && window.game.state === 'playing') {
                window.game.togglePause();
            }
        }
    });
    
    // Handle window focus/blur
    window.addEventListener('blur', () => {
        if (window.game && window.game.state === 'playing') {
            window.game.togglePause();
        }
    });
    
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loadingIndicator';
    loadingIndicator.innerHTML = 'Chargement du rêve...';
    loadingIndicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ffd700;
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.5rem;
        z-index: 1000;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    `;
    document.body.appendChild(loadingIndicator);
    
    // Simulate loading time
    setTimeout(() => {
        loadingIndicator.remove();
        console.log('Dream world ready!');
    }, 2000);
    
    // Add performance monitoring
    let frameCount = 0;
    let lastFPSUpdate = 0;
    
    function updateFPS() {
        frameCount++;
        const now = performance.now();
        
        if (now - lastFPSUpdate >= 1000) {
            const fps = Math.round((frameCount * 1000) / (now - lastFPSUpdate));
            console.log(`FPS: ${fps}`);
            frameCount = 0;
            lastFPSUpdate = now;
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    // Start FPS monitoring in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        updateFPS();
    }
    
    // Add error handling
    window.addEventListener('error', (e) => {
        console.error('Game error:', e.error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: #ff6b6b;
                padding: 20px;
                border-radius: 10px;
                font-family: 'Cormorant Garamond', serif;
                text-align: center;
                z-index: 1000;
                border: 1px solid #ff6b6b;
            ">
                <h3>Erreur du Rêve</h3>
                <p>Le rêve a rencontré une difficulté. Veuillez recharger la page.</p>
                <button onclick="location.reload()" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Recharger</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    });
    
    // Add unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });
    
    // Add service worker registration for PWA capabilities
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
    
    // Add fullscreen support
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // Add fullscreen button to main menu
    document.addEventListener('DOMContentLoaded', () => {
        const fullscreenButton = document.createElement('button');
        fullscreenButton.innerHTML = '⛶ Plein écran';
        fullscreenButton.className = 'menu-button';
        fullscreenButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 100;
            font-size: 0.9rem;
            padding: 8px 15px;
        `;
        fullscreenButton.addEventListener('click', toggleFullscreen);
        document.body.appendChild(fullscreenButton);
    });
    
    // Add keyboard shortcuts info
    const shortcutsInfo = document.createElement('div');
    shortcutsInfo.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: #b8b8b8;
            padding: 10px;
            border-radius: 5px;
            font-family: 'Cormorant Garamond', serif;
            font-size: 0.8rem;
            z-index: 100;
            max-width: 200px;
        ">
            <strong>Raccourcis:</strong><br>
            Échap: Pause<br>
            F11: Plein écran<br>
            Espace: Pouvoir
        </div>
    `;
    document.body.appendChild(shortcutsInfo);
    
    // Handle F11 for fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
    });
    
    console.log('Lapsus Somnii initialized successfully!');
    console.log('Welcome to the infinite dream...');
});
