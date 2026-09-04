/* ===================================
   MAIN.JS - Retro Game Controller & Loop
   =================================== */

import { PetEnhanced } from './pet-enhanced.js';
import { SoundManager } from './sound-manager.js';
import { Terrain } from './terrain.js';

// Canvas & Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Game Systems
let terrain;
let pet;
let soundManager;
let gameRunning = true;
let keysDown = {};

export function initGame() {
    if (!canvas || !ctx) return;

    // Set canvas dimensions to 16:9 retro arcade ratio (800x450)
    canvas.width = 800;
    canvas.height = 450;

    // Initialize systems
    soundManager = new SoundManager();
    terrain = new Terrain(canvas);

    // Spawn pet in center of playfield
    const spawnX = canvas.width / 2;
    const spawnY = (terrain.fenceTopY + terrain.fenceBottomY) / 2 + 10;
    pet = new PetEnhanced(canvas, terrain, spawnX, spawnY, soundManager);

    // Setup input listeners
    setupKeyboardListeners();
    setupTouchListeners();
    setupButtonListeners();

    // Start loop
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;
    requestAnimationFrame(gameLoop);

    // 1. Process player directional input
    handleMovementInput();

    // 2. Update pet & game state
    pet.update();

    // 3. Clear canvas & render frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render terrain, fence, and HUD
    terrain.render();

    // Render pet character & dust
    pet.render();
}

function handleMovementInput() {
    let dx = 0;
    let dy = 0;

    if (keysDown['ArrowLeft'] || keysDown['KeyA']) dx -= 1;
    if (keysDown['ArrowRight'] || keysDown['KeyD']) dx += 1;
    if (keysDown['ArrowUp'] || keysDown['KeyW']) dy -= 1;
    if (keysDown['ArrowDown'] || keysDown['KeyS']) dy += 1;

    if (dx !== 0 || dy !== 0) {
        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            const factor = 0.7071;
            dx *= factor;
            dy *= factor;
        }
        pet.setManualMovement(dx, dy);
    }
}

function setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
        // Space / Pause or Jump
        if (e.code === 'Space') {
            e.preventDefault();
            pet.jump();
            return;
        }

        // 'A' Key or 'KeyZ': JUMP
        if (e.code === 'KeyJ' || (e.code === 'KeyA' && (keysDown['ArrowUp'] || keysDown['ArrowDown'] || keysDown['ArrowLeft'] || keysDown['ArrowRight']))) {
            // If arrow keys aren't used for movement, A is Jump
        }
        if (e.code === 'KeyZ') {
            pet.jump();
            return;
        }

        // 'B' Key or 'KeyX' or 'KeyE': ACT
        if (e.code === 'KeyB' || e.code === 'KeyX' || e.code === 'KeyE') {
            pet.act();
            return;
        }

        // 'P': Pause / Resume
        if (e.code === 'KeyP') {
            gameRunning = !gameRunning;
            if (gameRunning) gameLoop();
            return;
        }

        // 'M': Toggle Sound
        if (e.code === 'KeyM') {
            const enabled = soundManager.toggleSound();
            updateAudioUI(enabled);
            return;
        }

        // '+' or '=': Volume Up
        if (e.code === 'Equal' || e.code === 'NumpadAdd') {
            soundManager.adjustVolume(0.1);
            return;
        }

        // '-': Volume Down
        if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
            soundManager.adjustVolume(-0.1);
            return;
        }

        keysDown[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
        delete keysDown[e.code];
    });
}

function setupTouchListeners() {
    if (!canvas) return;

    // Click/Tap on canvas to walk pet or collect coin
    canvas.addEventListener('pointerdown', (e) => {
        soundManager.initAudioContext();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        // Calculate direction towards tap
        const dirX = clickX - pet.x;
        const dirY = clickY - pet.y;
        const dist = Math.hypot(dirX, dirY);

        if (dist > 15) {
            pet.setManualMovement(dirX / dist, dirY / dist);
        } else {
            // Tap directly on cat = Pet/Act!
            pet.act();
        }
    });
}

function setupButtonListeners() {
    // Jump button (A)
    const btnJump = document.getElementById('btnJump');
    if (btnJump) {
        btnJump.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            soundManager.initAudioContext();
            pet.jump();
        });
    }

    // Act button (B)
    const btnAct = document.getElementById('btnAct');
    if (btnAct) {
        btnAct.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            soundManager.initAudioContext();
            pet.act();
        });
    }

    // Sound toggle button
    const btnSound = document.getElementById('btnSound');
    if (btnSound) {
        btnSound.addEventListener('click', () => {
            const enabled = soundManager.toggleSound();
            updateAudioUI(enabled);
        });
    }
}

function updateAudioUI(enabled) {
    const soundDesc = document.getElementById('soundStatus');
    if (soundDesc) {
        soundDesc.textContent = enabled ? 'Sound: ON' : 'Sound: MUTED';
    }
}

// Auto bootstrap when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
