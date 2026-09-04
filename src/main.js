/* ===================================
   MAIN.JS - Enhanced Game Loop
   =================================== */

// Get canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
let terrain;
let pet;
let soundManager;
let gameRunning = true;
let frameCount = 0;

/**
 * Initialize game
 */
function initGame() {
    console.log('🎮 Pet Chill Game Initialized');
    console.log(`Canvas: ${canvas.width}x${canvas.height}`);
    
    // Create managers
    soundManager = new SoundManager();
    terrain = new Terrain(canvas);
    
    // Create pet dengan terrain
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    pet = new PetEnhanced(canvas, terrain, centerX, centerY);
    
    console.log(`✅ Terrain loaded`);
    console.log(`✅ Pet spawned at (${centerX}, ${centerY})`);
    console.log('🎮 Controls:');
    console.log('   SPACE: Pause/Resume');
    console.log('   M: Toggle Sound');
    console.log('   +/-: Volume Up/Down');
    
    gameLoop();
}

/**
 * Main game loop
 */
function gameLoop() {
    if (!gameRunning) return;
    
    requestAnimationFrame(gameLoop);
    frameCount++;

    // ==================== UPDATE ====================
    pet.update();

    // ==================== RENDER ====================
    // Clear canvas dengan warna hitam
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render terrain (grass + border)
    terrain.render();
    
    // Render pet
    pet.render();

    // ==================== SOUND TRIGGERS ====================
    // Blink sound setiap beberapa frame
    if (frameCount % 120 === 0) {
        soundManager.playBlink();
    }
    
    // Footstep sound saat walking
    if (pet.moving && frameCount % 10 === 0) {
        soundManager.playFootstep();
    }
    
    // Idle sound
    if (!pet.moving && frameCount % 300 === 0) {
        soundManager.playIdle();
    }

    // ==================== OPTIONAL DEBUG INFO ====================
    // renderDebugInfo();
}

/**
 * Debug info render
 */
function renderDebugInfo() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px monospace';
    ctx.fillText(`Frame: ${frameCount}`, 10, 20);
    ctx.fillText(`Pet: (${Math.round(pet.x)}, ${Math.round(pet.y)})`, 10, 35);
    ctx.fillText(`State: ${pet.isWalking ? 'WALKING' : 'IDLE'}`, 10, 50);
    ctx.fillText(`Eyes: ${pet.eyeState}`, 10, 65);
    ctx.fillText(`Moving: ${pet.moving}`, 10, 80);
}

/**
 * Keyboard controls
 */
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        gameRunning = !gameRunning;
        console.log(gameRunning ? '▶️ Game resumed' : '⏸️ Game paused');
        if (gameRunning) gameLoop();
    }
    
    if (e.code === 'KeyM') {
        soundManager.toggleSound();
    }
    
    if (e.code === 'Equal' || e.code === 'Plus') {
        soundManager.setVolume(soundManager.masterVolume + 0.1);
        console.log(`🔊 Volume: ${Math.round(soundManager.masterVolume * 100)}%`);
    }
    
    if (e.code === 'Minus') {
        soundManager.setVolume(soundManager.masterVolume - 0.1);
        console.log(`🔊 Volume: ${Math.round(soundManager.masterVolume * 100)}%`);
    }
});

/**
 * Start game
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
