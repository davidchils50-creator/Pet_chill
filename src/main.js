/* ===================================
   MAIN.JS - Entry point & Game Loop
   =================================== */

// Get canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Inisialisasi game objects
let map;
let pet;
let gameRunning = true;
let frameCount = 0;
let fps = 60; // Target 60 FPS

/**
 * Inisialisasi game - dipanggil saat halaman selesai loading
 */
function initGame() {
    console.log('🎮 Pet Chill Game Initialized');
    console.log(`Canvas: ${canvas.width}x${canvas.height}`);
    
    // Create map instance
    map = new Map(canvas);
    
    // Create pet instance dengan posisi di tengah canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    pet = new Pet(canvas, map, centerX, centerY);
    
    console.log(`✅ Map loaded`);
    console.log(`✅ Pet spawned at (${centerX}, ${centerY})`);
    
    // Mulai game loop
    gameLoop();
}

/**
 * GAME LOOP - Jantung dari game
 * Menggunakan requestAnimationFrame untuk smooth 60 FPS
 * 
 * Flow setiap frame:
 * 1. Update logika game (AI, animasi)
 * 2. Clear canvas
 * 3. Render semua objects
 * 4. Schedule frame berikutnya
 */
function gameLoop() {
    if (!gameRunning) return;

    // REQUEST NEXT FRAME
    // requestAnimationFrame = native browser animation loop (synchronized dengan refresh rate)
    requestAnimationFrame(gameLoop);

    frameCount++;

    // ==================== UPDATE PHASE ====================
    // Update semua logika game sebelum render
    pet.update();

    // ==================== RENDER PHASE ====================
    // Clear canvas dengan warna latar
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render map
    map.render();

    // Render pet
    pet.render();

    // ==================== DEBUG INFO (Optional) ====================
    // Uncomment untuk melihat debug info
    // renderDebugInfo();
}

/**
 * DEBUG - Tampilkan info di canvas
 * Uncomment di gameLoop() jika ingin debugging
 */
function renderDebugInfo() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.fillText(`Frame: ${frameCount}`, 10, 20);
    ctx.fillText(`Pet Pos: (${Math.round(pet.x)}, ${Math.round(pet.y)})`, 10, 35);
    ctx.fillText(`Pet State: ${pet.isWalking ? 'WALKING' : 'IDLE'}`, 10, 50);
    ctx.fillText(`Eye State: ${pet.eyeState}`, 10, 65);
    ctx.fillText(`Dir: (${pet.directionX}, ${pet.directionY})`, 10, 80);
}

/**
 * Handle game pause/resume dengan spacebar
 */
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        gameRunning = !gameRunning;
        console.log(gameRunning ? '▶️ Game resumed' : '⏸️ Game paused');
        if (gameRunning) gameLoop();
    }
});

/**
 * Handle window resize - responsive canvas
 */
window.addEventListener('resize', () => {
    // Optional: Sesuaikan canvas size saat window di-resize
    // Untuk sekarang kita pakai fixed size
});

// ==================== STARTUP ====================
// Tunggu DOM selesai loading sebelum inisialisasi
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

console.log('🎮 Pet Chill - Controls:');
console.log('   SPACE: Pause/Resume game');
console.log('   Game akan berjalan otomatis dengan AI wander pet');
