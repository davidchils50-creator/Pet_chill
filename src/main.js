/* ===================================
   MAIN.JS - Retro Game Controller & Loop
   Integrated with 2D Smooth Camera Tracking & Frustum Culling
   =================================== */

import { Camera } from './camera.js';
import { HouseInterior } from './interior.js';
import { PetEnhanced } from './pet-enhanced.js';
import { SoundManager } from './sound-manager.js';
import { Terrain } from './terrain.js';
import { BrainVisualizer } from './brain-visualizer.js';

// Canvas & Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Game Systems
let terrain;
let houseInterior;
let camera;
let pet;
let soundManager;
let brainVisualizer = null;
let gameRunning = true;
let keysDown = {};

// View Mode State: 'MAP' (Bola Bumi) or 'BRAIN' (Otak Pixel SNN)
let activeView = 'MAP';
let brainViewContainer = null;
let btnViewMap = null;
let btnViewBrain = null;
let zoneSubHint = null;

// Scene State ('OUTDOOR' or 'INDOOR')
let currentScene = 'OUTDOOR';
let isTransitioning = false;
let transitionAlpha = 0;
let transitionPhase = 'none'; // 'none', 'fading_out', 'fading_in'
let transitionBanner = '';
let onTransitionMidpoint = null;

let lastTime = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
let currentFps = 60;

// Gunshot Muzzle Flash & Screen Shake FX
let gunEffects = [];
let screenShakeTimer = 0;
let screenShakeIntensity = 0;

/**
 * Memicu letusan pistol: memutar suara tembakan, shockwave FX, getaran layar, dan memicu amigdala pet
 */
export function triggerGunshot(customX = null, customY = null) {
    if (!pet) return;
    if (soundManager) {
        soundManager.initAudioContext();
        soundManager.playGunshot();
    }

    // Tentukan posisi letusan tembakan di dunia
    let gunX, gunY;
    if (customX !== null && customY !== null) {
        gunX = customX;
        gunY = customY;
    } else {
        // Tembak dari sudut depan/samping pet
        const dist = 160;
        const angle = Math.random() * Math.PI * 2;
        gunX = pet.x + Math.cos(angle) * dist;
        gunY = pet.y + Math.sin(angle) * dist;
    }

    // Guncangan layar dramatis saat peluru meletus
    screenShakeTimer = 15;
    screenShakeIntensity = 7;

    // Visual Shockwave & Flash
    gunEffects.push({
        x: gunX,
        y: gunY,
        radius: 8,
        maxRadius: 75,
        alpha: 1.0,
        flashDuration: 6
    });

    // Pemicu kepanikan amigdala kucing & rasa takut mati
    pet.hearGunshot(gunX, gunY);
}

// Cached DOM HUD elements
let barHunger, barHappy, barEnergy;
let txtHunger, txtHappy, txtEnergy;
let moodBadge, soundIcon;
let zoneBadge, zoneIcon, zoneName;

// Cached Chat Bar & Meja Belajar Modal DOM elements
let inputTalk, btnTalk, btnOpenStudyDesk, modalStudyDesk, btnCloseStudyDesk;
let txtModalMode, btnModalToggleNeuro, txtModalNeurons, txtModalMemory, txtEvolutionNotice, txtModalDopa, txtModalVocab;
let txtCorpusInput, btnModalPretrain, inputCorpusUrl, btnModalImportUrl;
let selectLlmProvider, selectLlmModel, divCustomModelGroup, inputLlmCustomModel, txtTeacherInstructions, inputLlmApiKey, btnSaveLlmConfig, txtTeacherStatus;
let selectLlmShotMode, badgeShotStatus, divCustomShotsContainer, txtCustomShots, btnObedient;

// Auto-Training DOM elements & State
let trainingPanel, trainingStatus, trainingTimer, trainingSteps, btnStopTraining;
let inputAutoTrainTopic, btnStartAutoTrain;
let trainingActive = false;
let trainingStartTime = null;
let trainingStepCount = 0;

const PROVIDER_MODELS = {
    gemini: [
        { value: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Latest Superfast, Recommended)' },
        { value: 'gemini-3.8-pro', label: 'Gemini 3.8 Pro (Reasoning Flagship)' },
        { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash (Hybrid Speed)' },
        { value: 'gemini-3.7-pro', label: 'Gemini 3.7 Pro' },
        { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
        { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
        { value: 'gemini-3.5-pro', label: 'Gemini 3.5 Pro' },
        { value: 'gemini-3.0-flash', label: 'Gemini 3.0 Flash' },
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ],
    openai: [
        { value: 'gpt-4.5-preview', label: 'GPT-4.5 Preview (Next-Gen Flagship)' },
        { value: 'o3-mini', label: 'o3-mini (High-Speed Reasoning)' },
        { value: 'o3', label: 'o3 (Deep Reasoning)' },
        { value: 'o1', label: 'o1 (Full Reasoning)' },
        { value: 'o1-mini', label: 'o1-mini (Compact Reasoning)' },
        { value: 'gpt-4o', label: 'GPT-4o (Omni Flagship)' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Ultra Fast)' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ],
    deepseek: [
        { value: 'deepseek-chat', label: 'DeepSeek V3 (Chat & Code)' },
        { value: 'deepseek-reasoner', label: 'DeepSeek R1 (Deep Reasoning)' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ],
    anthropic: [
        { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet (Hybrid Reasoning)' },
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ],
    groq: [
        { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B (Groq Fast)' },
        { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
        { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
        { value: 'qwen-2.5-32b', label: 'Qwen 2.5 32B' },
        { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ],
    openrouter: [
        { value: 'google/gemini-3.8-flash', label: 'Gemini 3.8 Flash (OpenRouter)' },
        { value: 'google/gemini-3.7-flash', label: 'Gemini 3.7 Flash (OpenRouter)' },
        { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (OpenRouter)' },
        { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (OpenRouter)' },
        { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (OpenRouter)' },
        { value: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet (OpenRouter)' },
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (OpenRouter)' },
        { value: 'openai/gpt-4.5-preview', label: 'GPT-4.5 Preview (OpenRouter)' },
        { value: 'openai/gpt-4o', label: 'GPT-4o (OpenRouter)' },
        { value: 'openai/o3-mini', label: 'o3-mini (OpenRouter)' },
        { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (OpenRouter)' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ],
    mistral: [
        { value: 'mistral-large-latest', label: 'Mistral Large' },
        { value: 'mistral-medium-latest', label: 'Mistral Medium' },
        { value: 'mistral-small-latest', label: 'Mistral Small' },
        { value: 'codestral-latest', label: 'Codestral (Code & Logic)' },
        { value: 'ministral-8b-latest', label: 'Ministral 8B' },
        { value: 'ministral-3b-latest', label: 'Ministral 3B' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ],
    xai: [
        { value: 'grok-3', label: 'Grok 3 (Flagship)' },
        { value: 'grok-3-mini', label: 'Grok 3 Mini' },
        { value: 'grok-2-latest', label: 'Grok 2 Flagship' },
        { value: 'grok-2-vision-1212', label: 'Grok 2 Vision' },
        { value: 'grok-2-mini', label: 'Grok 2 Mini' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ],
    together: [
        { value: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1 (Together)' },
        { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3 (Together)' },
        { value: 'meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo', label: 'Llama 3.3 70B Turbo' },
        { value: 'Qwen/Qwen2.5-72B-Instruct-Turbo', label: 'Qwen 2.5 72B Turbo' },
        { value: 'Qwen/Qwen2.5-Coder-32B-Instruct', label: 'Qwen 2.5 Coder 32B' },
        { value: 'custom', label: '✏️ Ketik Model Sendiri (Custom ID)...' }
    ]
};

function populateModelDropdown(provider, selectedModel = null) {
    if (!selectLlmModel) return;
    const models = PROVIDER_MODELS[provider] || PROVIDER_MODELS.gemini;
    const currentVal = selectLlmModel.value;
    selectLlmModel.innerHTML = '';
    
    let isFound = false;
    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        if (selectedModel && selectedModel === m.value) {
            opt.selected = true;
            isFound = true;
        } else if (!selectedModel && currentVal === m.value) {
            opt.selected = true;
            isFound = true;
        }
        selectLlmModel.appendChild(opt);
    });

    // Handle custom unlisted model
    if (selectedModel && !isFound && selectedModel !== 'custom') {
        selectLlmModel.value = 'custom';
        if (inputLlmCustomModel) inputLlmCustomModel.value = selectedModel;
        if (divCustomModelGroup) divCustomModelGroup.classList.remove('hidden');
    } else if (selectLlmModel.value === 'custom') {
        if (divCustomModelGroup) divCustomModelGroup.classList.remove('hidden');
    } else {
        if (divCustomModelGroup) divCustomModelGroup.classList.add('hidden');
    }
}

function updateShotStatusUI(shotMode) {
    if (!badgeShotStatus) return;
    const mode = shotMode || '3-shot';
    const descriptions = {
        '3-shot': '🎯 3-Shot Aktif (MTK, Kepatuhan, Bahasa)',
        '1-shot': '🎯 1-Shot Aktif (Contoh Ringkas Kepatuhan)',
        '5-shot': '🎯 5-Shot Aktif (Komprehensif 5 Bidang)',
        'zero': '⚡ Zero-Shot Aktif (Instruksi Murni)',
        'custom': '✏️ Custom Shot Aktif (Tentukan Mandiri)'
    };
    badgeShotStatus.textContent = descriptions[mode] || descriptions['3-shot'];

    if (divCustomShotsContainer) {
        if (mode === 'custom') {
            divCustomShotsContainer.classList.remove('hidden');
        } else {
            divCustomShotsContainer.classList.add('hidden');
        }
    }
}

export function updateObedientUI(isObedient) {
    const btn = document.getElementById('btnObedient');
    const icon = document.getElementById('iconObedient');
    const statePill = document.getElementById('txtObedientState');
    if (btn) {
        if (isObedient) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            btn.title = 'Mode Penurut: AKTIF (Tekan 5/O atau Klik untuk Mode Bebas)';
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            btn.title = 'Mode Penurut: MATI (Tekan 5/O atau Klik untuk Mode Penurut)';
        }
    }
    if (icon) {
        icon.textContent = isObedient ? '👑' : '🐾';
    }
    if (statePill) {
        statePill.textContent = isObedient ? 'ON' : 'OFF';
        statePill.style.color = isObedient ? '#fef08a' : '#a7f3d0';
    }
}

export function toggleObedient() {
    if (!pet) return;
    soundManager.initAudioContext();
    const newState = !pet.isObedientMode;
    pet.setObedientMode(newState);
    updateObedientUI(newState);
    if (newState) {
        if (soundManager && typeof soundManager.playPraise === 'function') {
            soundManager.playPraise();
        }
    } else {
        if (soundManager && typeof soundManager.playFeed === 'function') {
            soundManager.playFeed();
        }
    }
}

export function initGame() {
    if (!canvas || !ctx) return;

    // Cache DOM references
    barHunger = document.getElementById('barHunger');
    barHappy = document.getElementById('barHappy');
    barEnergy = document.getElementById('barEnergy');
    txtHunger = document.getElementById('txtHunger');
    txtHappy = document.getElementById('txtHappy');
    txtEnergy = document.getElementById('txtEnergy');
    moodBadge = document.getElementById('moodBadge');
    soundIcon = document.getElementById('soundIcon');
    zoneBadge = document.getElementById('zoneBadge');
    zoneIcon = document.getElementById('zoneIcon');
    zoneName = document.getElementById('zoneName');

    // Chat Bar & Study Desk Modal references
    inputTalk = document.getElementById('inputTalk');
    btnTalk = document.getElementById('btnTalk');
    btnOpenStudyDesk = document.getElementById('btnOpenStudyDesk');
    modalStudyDesk = document.getElementById('modalStudyDesk');
    btnCloseStudyDesk = document.getElementById('btnCloseStudyDesk');

    txtModalMode = document.getElementById('txtModalMode');
    btnModalToggleNeuro = document.getElementById('btnModalToggleNeuro');
    txtModalNeurons = document.getElementById('txtModalNeurons');
    txtModalMemory = document.getElementById('txtModalMemory');
    txtEvolutionNotice = document.getElementById('txtEvolutionNotice');
    txtModalDopa = document.getElementById('txtModalDopa');
    txtModalVocab = document.getElementById('txtModalVocab');

    txtCorpusInput = document.getElementById('txtCorpusInput');
    btnModalPretrain = document.getElementById('btnModalPretrain');
    inputCorpusUrl = document.getElementById('inputCorpusUrl');
    btnModalImportUrl = document.getElementById('btnModalImportUrl');

    selectLlmProvider = document.getElementById('selectLlmProvider');
    selectLlmModel = document.getElementById('selectLlmModel');
    divCustomModelGroup = document.getElementById('divCustomModelGroup');
    inputLlmCustomModel = document.getElementById('inputLlmCustomModel');
    txtTeacherInstructions = document.getElementById('txtTeacherInstructions');
    inputLlmApiKey = document.getElementById('inputLlmApiKey');
    btnSaveLlmConfig = document.getElementById('btnSaveLlmConfig');
    txtTeacherStatus = document.getElementById('txtTeacherStatus');

    selectLlmShotMode = document.getElementById('selectLlmShotMode');
    badgeShotStatus = document.getElementById('badgeShotStatus');
    divCustomShotsContainer = document.getElementById('divCustomShotsContainer');
    txtCustomShots = document.getElementById('txtCustomShots');
    btnObedient = document.getElementById('btnObedient');

    trainingPanel = document.getElementById('training-panel');
    trainingStatus = document.getElementById('training-status');
    trainingTimer = document.getElementById('training-timer');
    trainingSteps = document.getElementById('training-steps');
    btnStopTraining = document.getElementById('btnStopTraining');
    inputAutoTrainTopic = document.getElementById('inputAutoTrainTopic');
    btnStartAutoTrain = document.getElementById('btnStartAutoTrain');

    // High performance 2D context options
    ctx.imageSmoothingEnabled = false;

    // Initialize systems
    soundManager = new SoundManager();
    terrain = new Terrain(canvas);
    houseInterior = new HouseInterior(canvas);
    houseInterior.bindStats(terrain);

    // Initial resize to fill full screen
    resizeCanvas();

    // Initialize Smooth 2D Camera
    camera = new Camera(canvas.width, canvas.height, terrain.worldWidth, terrain.worldHeight);

    // Cache View Switcher DOM elements
    brainViewContainer = document.getElementById('brainViewContainer');
    btnViewMap = document.getElementById('btnViewMap');
    btnViewBrain = document.getElementById('btnViewBrain');
    zoneSubHint = document.getElementById('zoneSubHint');

    // Spawn pet in center of the world (Central Playground Sanctuary)
    const spawnX = 1200;
    const spawnY = 800;
    pet = new PetEnhanced(canvas, terrain, spawnX, spawnY, soundManager);

    // Initialize Real-Time SNN Brain Visualizer
    const brainCanvas = document.getElementById('brainCanvas');
    if (brainCanvas) {
        brainVisualizer = new BrainVisualizer(brainCanvas, pet);
    }

    // Bind scene transition handlers to pet
    pet.onEnterHouse = () => enterHouse();
    pet.onExitHouse = () => exitHouse();

    // Snap camera directly to pet position initially
    camera.follow(pet.x, pet.y, true);

    // Synchronize initial Obedient Mode state
    updateObedientUI(pet.isObedientMode);

    // Setup input listeners & window resize
    window.addEventListener('resize', handleWindowResize);
    setupKeyboardListeners();
    setupTouchListeners();
    setupButtonListeners();

    // Start loop with timestamp
    lastTime = performance.now();
    lastFpsUpdate = lastTime;
    requestAnimationFrame(gameLoop);
}

/**
 * Scene Transition to House Interior
 */
export function enterHouse() {
    if (isTransitioning || currentScene === 'INDOOR') return;

    startSceneTransition('🏡 MASUK RUMAH...', () => {
        currentScene = 'INDOOR';
        const spawn = houseInterior.getSpawnPoint();
        pet.x = spawn.x;
        pet.y = spawn.y;
        pet.setMap(houseInterior, 'HOUSE_INTERIOR');

        if (camera) {
            camera.setWorldSize(houseInterior.worldWidth, houseInterior.worldHeight);
            camera.follow(pet.x, pet.y, true);
        }

        pet.addFloatingText('🏡 Selamat Datang di Rumah!', pet.x, pet.y - 35, '#fbbf24');
        if (soundManager && typeof soundManager.playPraise === 'function') {
            soundManager.playPraise();
        }
    });
}

/**
 * Scene Transition back to Outdoor Garden
 */
export function exitHouse() {
    if (isTransitioning || currentScene === 'OUTDOOR') return;

    startSceneTransition('🌿 KELUAR KE TAMAN...', () => {
        currentScene = 'OUTDOOR';
        // Spawn right at the house front doorstep
        pet.x = 1200;
        pet.y = 665;
        pet.setMap(terrain, 'OUTDOOR');

        if (camera) {
            camera.setWorldSize(terrain.worldWidth, terrain.worldHeight);
            camera.follow(pet.x, pet.y, true);
        }

        pet.addFloatingText('🌿 Kembali ke Taman!', pet.x, pet.y - 35, '#4ade80');
        if (soundManager && typeof soundManager.playDrop === 'function') {
            soundManager.playDrop();
        }
    });
}

/**
 * Toggle View: Bola Bumi (Game Map) vs Otak Pixel (Visualisasi Saraf SNN Real-Time)
 */
export function switchView(mode) {
    if (activeView === mode) return;
    activeView = mode;

    if (!brainViewContainer) brainViewContainer = document.getElementById('brainViewContainer');
    if (!btnViewMap) btnViewMap = document.getElementById('btnViewMap');
    if (!btnViewBrain) btnViewBrain = document.getElementById('btnViewBrain');
    if (!zoneIcon) zoneIcon = document.getElementById('zoneIcon');
    if (!zoneName) zoneName = document.getElementById('zoneName');
    if (!zoneSubHint) zoneSubHint = document.getElementById('zoneSubHint');

    const bottomControls = document.querySelector('.bottom-controls-overlay');

    if (mode === 'MAP') {
        if (canvas) canvas.style.display = 'block';
        if (brainViewContainer) brainViewContainer.classList.add('hidden');
        if (btnViewMap) btnViewMap.classList.add('active');
        if (btnViewBrain) btnViewBrain.classList.remove('active');

        if (zoneIcon) zoneIcon.textContent = currentScene === 'INDOOR' ? '🏠' : '🏡';
        if (zoneName) zoneName.textContent = currentScene === 'INDOOR' ? 'RUMAH NYAMAN' : 'TAMAN UTAMA';
        if (zoneSubHint) {
            zoneSubHint.style.display = 'flex';
            const txt = zoneSubHint.querySelector('.hint-text');
            if (txt) txt.textContent = 'KAMERA MENGIKUTI PET';
        }
        if (bottomControls) bottomControls.style.display = 'flex';

        if (soundManager && typeof soundManager.playDrop === 'function') {
            soundManager.playDrop();
        }
    } else if (mode === 'BRAIN') {
        if (brainViewContainer) brainViewContainer.classList.remove('hidden');
        if (btnViewMap) btnViewMap.classList.remove('active');
        if (btnViewBrain) btnViewBrain.classList.add('active');

        if (zoneIcon) zoneIcon.textContent = '🧠';
        if (zoneName) zoneName.textContent = 'SARAF SNN AKTIF';
        if (zoneSubHint) {
            zoneSubHint.style.display = 'flex';
            const txt = zoneSubHint.querySelector('.hint-text');
            if (txt) txt.textContent = 'AKTIVITAS REAL-TIME';
        }
        if (bottomControls) bottomControls.style.display = 'none';

        if (brainVisualizer) {
            brainVisualizer.zoomFitAll();
            brainVisualizer.updateInspectorUI();
        }

        if (soundManager && typeof soundManager.playPraise === 'function') {
            soundManager.playPraise();
        }
    }
}

/**
 * Smooth Scene Transition Curtain Effect
 */
function startSceneTransition(bannerText, onMidpoint) {
    isTransitioning = true;
    transitionPhase = 'fading_out';
    transitionAlpha = 0;
    transitionBanner = bannerText;
    onTransitionMidpoint = onMidpoint;
}

function resizeCanvas() {
    if (!canvas || !terrain) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;

    ctx.imageSmoothingEnabled = false;

    if (brainVisualizer) {
        brainVisualizer.resize(w, h);
    }

    if (camera) {
        camera.resize(w, h);
        const curWorldW = (currentScene === 'INDOOR' && houseInterior) ? houseInterior.worldWidth : terrain.worldWidth;
        const curWorldH = (currentScene === 'INDOOR' && houseInterior) ? houseInterior.worldHeight : terrain.worldHeight;
        camera.setWorldSize(curWorldW, curWorldH);
    }
}

let resizeTimeout;
function handleWindowResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 50);
}

function gameLoop(now) {
    if (!gameRunning) return;
    requestAnimationFrame(gameLoop);

    const currentTime = now || performance.now();
    const elapsed = currentTime - lastTime;
    lastTime = currentTime;

    // Calculate delta time factor (1.0 = standard 60fps frame of 16.67ms)
    // Clamp to [0.5, 2.0] to prevent huge physics jumps on frame spikes
    const dtFactor = Math.min(2.0, Math.max(0.5, elapsed / 16.667));

    // Calculate rolling FPS
    frameCount++;
    if (currentTime - lastFpsUpdate >= 400) {
        currentFps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        if (terrain) terrain.fps = currentFps;
        frameCount = 0;
        lastFpsUpdate = currentTime;
    }

    // 1. Process player directional input (only when not transitioning)
    if (!isTransitioning) {
        handleMovementInput();
    }

    // 2. Update logic for active scene (Optimization: DO NOT update outdoor world if inside house)
    pet.update(dtFactor);

    if (currentScene === 'OUTDOOR') {
        terrain.updateStats(dtFactor);
    } else if (currentScene === 'INDOOR') {
        houseInterior.update(dtFactor);
        terrain.updateStats(dtFactor); // Pet hunger/energy tick continues
    }

    // 3. Update Camera smooth follow
    if (camera) {
        camera.follow(pet.x, pet.y, false, dtFactor);
    }

    // 4. Sync UI Status Bars & Mood
    syncHUD();

    // 5. Render Scene based on Active View (MAP vs BRAIN)
    if (activeView === 'MAP') {
        // Clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Screen shake logic
        let shakeX = 0;
        let shakeY = 0;
        if (screenShakeTimer > 0) {
            screenShakeTimer -= dtFactor;
            shakeX = (Math.random() - 0.5) * screenShakeIntensity;
            shakeY = (Math.random() - 0.5) * screenShakeIntensity;
        }

        // 6. Render active world in camera space
        ctx.save();
        if (camera) {
            ctx.translate(-Math.round(camera.x) + shakeX, -Math.round(camera.y) + shakeY);
        }

        // HIGH PERFORMANCE SCENE RENDERING:
        // If inside house: Stop total outdoor rendering (trees, lake, grass, decorations are skipped)
        if (currentScene === 'OUTDOOR') {
            terrain.render(camera);
        } else if (currentScene === 'INDOOR') {
            houseInterior.render(ctx, camera);
        }

        // Render pet character, animations & particles in world space
        pet.render();

        // Render Gunshot Shockwave & Muzzle Flash FX
        for (let i = gunEffects.length - 1; i >= 0; i--) {
            const fx = gunEffects[i];
            fx.radius += 6.5 * dtFactor;
            fx.alpha -= 0.08 * dtFactor;

            ctx.save();
            // Muzzle flash burst
            if (fx.flashDuration > 0) {
                fx.flashDuration -= dtFactor;
                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, 16, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(fx.x - 26, fx.y); ctx.lineTo(fx.x + 26, fx.y);
                ctx.moveTo(fx.x, fx.y - 26); ctx.lineTo(fx.x, fx.y + 26);
                ctx.moveTo(fx.x - 18, fx.y - 18); ctx.lineTo(fx.x + 18, fx.y + 18);
                ctx.moveTo(fx.x - 18, fx.y + 18); ctx.lineTo(fx.x + 18, fx.y - 18);
                ctx.stroke();
            }

            // Expanding shockwave rings
            ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, fx.alpha)})`;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(254, 240, 138, ${Math.max(0, fx.alpha * 0.85)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, Math.max(0, fx.radius - 5), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            if (fx.alpha <= 0 || fx.radius >= fx.maxRadius) {
                gunEffects.splice(i, 1);
            }
        }

        ctx.restore();

        // 7. Render Scene Transition Curtain & Banner
        if (isTransitioning) {
            updateAndRenderTransition(dtFactor);
        }
    } else if (activeView === 'BRAIN') {
        if (brainVisualizer) {
            brainVisualizer.render(dtFactor);
        }
    }
}

function updateAndRenderTransition(dtFactor) {
    if (transitionPhase === 'fading_out') {
        transitionAlpha += 0.08 * dtFactor;
        if (transitionAlpha >= 1) {
            transitionAlpha = 1;
            transitionPhase = 'fading_in';
            if (typeof onTransitionMidpoint === 'function') {
                onTransitionMidpoint();
                onTransitionMidpoint = null;
            }
        }
    } else if (transitionPhase === 'fading_in') {
        transitionAlpha -= 0.06 * dtFactor;
        if (transitionAlpha <= 0) {
            transitionAlpha = 0;
            transitionPhase = 'none';
            isTransitioning = false;
        }
    }

    if (transitionAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(15, 23, 42, ${transitionAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Transition Banner Title
        if (transitionAlpha > 0.4 && transitionBanner) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 8;
            ctx.fillText(transitionBanner, canvas.width / 2, canvas.height / 2);
        }
        ctx.restore();
    }
}

function syncHUD() {
    if (!terrain) return;

    // Lapar / Hunger
    const hg = Math.max(0, Math.min(100, Math.round(terrain.hunger)));
    if (barHunger) barHunger.style.width = `${hg}%`;
    if (txtHunger) txtHunger.textContent = `${hg}%`;

    // Senang / Happiness
    const hp = Math.max(0, Math.min(100, Math.round(terrain.happiness)));
    if (barHappy) barHappy.style.width = `${hp}%`;
    if (txtHappy) txtHappy.textContent = `${hp}%`;

    // Energi / Energy
    const en = Math.max(0, Math.min(100, Math.round(terrain.energy)));
    if (barEnergy) barEnergy.style.width = `${en}%`;
    if (txtEnergy) txtEnergy.textContent = `${en}%`;

    // Mood Badge
    if (moodBadge) {
        moodBadge.textContent = terrain.petMood;
        if (terrain.petMood === 'DIANGKAT!') {
            moodBadge.style.color = '#fbbf24';
            moodBadge.style.borderColor = 'rgba(251, 191, 36, 0.6)';
            moodBadge.style.background = 'rgba(251, 191, 36, 0.2)';
        } else if (terrain.petMood === 'BAHAGIA') {
            moodBadge.style.color = '#f43f5e';
            moodBadge.style.borderColor = 'rgba(244, 63, 94, 0.6)';
            moodBadge.style.background = 'rgba(244, 63, 94, 0.2)';
        } else if (terrain.petMood === 'LAPAR' || terrain.petMood === 'KELAPARAN') {
            moodBadge.style.color = '#f59e0b';
            moodBadge.style.borderColor = 'rgba(245, 158, 11, 0.6)';
            moodBadge.style.background = 'rgba(245, 158, 11, 0.2)';
        } else if (terrain.petMood === 'SEDIH') {
            moodBadge.style.color = '#a855f7';
            moodBadge.style.borderColor = 'rgba(168, 85, 247, 0.6)';
            moodBadge.style.background = 'rgba(168, 85, 247, 0.2)';
        } else {
            moodBadge.style.color = '#38bdf8';
            moodBadge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
            moodBadge.style.background = 'rgba(56, 189, 248, 0.15)';
        }
    }

    // Zone Badge
    if (pet) {
        const activeMap = (currentScene === 'INDOOR' && houseInterior) ? houseInterior : terrain;
        if (activeMap) {
            const zone = activeMap.getZoneInfo(pet.x, pet.y);
            if (zoneName && zone) {
                zoneName.textContent = zone.name.toUpperCase();
            }
            if (zoneIcon && zone) {
                const iconMatch = zone.name.match(/^(\p{Extended_Pictographic}|\S+)/u);
                if (iconMatch) {
                    zoneIcon.textContent = iconMatch[1];
                }
            }
            if (zoneBadge && zone) {
                zoneBadge.style.borderColor = zone.color || '#38bdf8';
            }
        }

        // Sync Brain SNN Study Desk Modal stats if visible
        if (pet.brain && modalStudyDesk && !modalStudyDesk.classList.contains('hidden')) {
            updateStudyDeskModalStats();
        }
    }
}

function updateStudyDeskModalStats() {
    if (!pet || !pet.brain) return;
    const b = pet.brain;
    if (txtModalMode) {
        txtModalMode.textContent = b.evolutionEnabled ? `EVOLUSI AKTIF (${b.getNeuronCount().toLocaleString('id-ID')} neuron)` : 'EVOLUSI MATI';
        txtModalMode.style.color = b.evolutionEnabled ? '#fde047' : '#94a3b8';
    }
    if (txtModalNeurons) {
        txtModalNeurons.textContent = `${b.getNeuronCount().toLocaleString('id-ID')} (${b.totalNeurons} Fisik - Reset Saat Reload)`;
    }
    if (txtModalMemory) {
        txtModalMemory.textContent = b.getMemoryUsage() + ' MB';
    }
    if (txtModalDopa) {
        txtModalDopa.textContent = Math.round((b.neuromodulators.dopamine || 0) * 100) + '%';
    }
    if (txtModalVocab) {
        txtModalVocab.textContent = b.vocabulary ? `${b.vocabulary.size} Kata (Tersimpan di Local)` : '0 Kata';
    }
    if (txtEvolutionNotice) {
        if (b.evolutionEnabled) {
            txtEvolutionNotice.textContent = '⚡ Evolusi Unbounded Aktif. Catatan: Total neuron otomatis kereset ke baseline 2.000 fisik saat reload/restart, sedangkan seluruh kosakata tersimpan permanen di local user.';
            txtEvolutionNotice.style.color = '#38bdf8';
        } else {
            txtEvolutionNotice.textContent = 'ℹ️ Mode Evolusi Mati. Kosakata tersimpan permanen di local storage user.';
            txtEvolutionNotice.style.color = '#94a3b8';
        }
    }

    const cfg = b.llmConfig;
    if (selectLlmProvider && document.activeElement !== selectLlmProvider && document.activeElement !== selectLlmModel) {
        const prov = (cfg && cfg.provider) ? cfg.provider : 'gemini';
        if (selectLlmProvider.value !== prov) {
            selectLlmProvider.value = prov;
            populateModelDropdown(prov, cfg ? cfg.model : null);
        } else if (selectLlmModel.options.length === 0) {
            populateModelDropdown(prov, cfg ? cfg.model : null);
        }
    }
    if (txtTeacherInstructions && cfg && cfg.instructions !== undefined && document.activeElement !== txtTeacherInstructions) {
        txtTeacherInstructions.value = cfg.instructions;
    }
    if (inputLlmApiKey && cfg && cfg.apiKey && document.activeElement !== inputLlmApiKey) {
        inputLlmApiKey.value = cfg.apiKey;
    }
    if (selectLlmShotMode && cfg && cfg.shotMode && document.activeElement !== selectLlmShotMode) {
        selectLlmShotMode.value = cfg.shotMode;
        updateShotStatusUI(cfg.shotMode);
    }
    if (txtTeacherStatus) {
        if (cfg && cfg.apiKey) {
            txtTeacherStatus.textContent = `✅ [${cfg.provider.toUpperCase()}] Model: ${cfg.model} Active`;
            txtTeacherStatus.style.color = '#34d399';
        } else {
            txtTeacherStatus.textContent = 'ℹ️ API Key belum terpasang (Mode SNN Offline)';
            txtTeacherStatus.style.color = '#94a3b8';
        }
    }
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
        // Space: Jump or Pet
        if (e.code === 'Space') {
            e.preventDefault();
            soundManager.initAudioContext();
            pet.jump();
            return;
        }

        // '1' or 'KeyF': FEED (Beri Makan)
        if (e.code === 'Digit1' || e.code === 'Numpad1' || e.code === 'KeyF') {
            soundManager.initAudioContext();
            pet.feed();
            return;
        }

        // '2' or 'KeyE' or 'KeyP': PRAISE / PET (Puji / Elus)
        if (e.code === 'Digit2' || e.code === 'Numpad2' || e.code === 'KeyE') {
            soundManager.initAudioContext();
            pet.petCat();
            return;
        }

        // '3' or 'KeyX' or 'KeyC': SCOLD (Marahi)
        if (e.code === 'Digit3' || e.code === 'Numpad3' || e.code === 'KeyX' || e.code === 'KeyC') {
            soundManager.initAudioContext();
            pet.scold();
            return;
        }

        // '4' or 'KeyG': SHOOT (Tembak Pistol - Memicu Amigdala & Takut Mati)
        if (e.code === 'Digit4' || e.code === 'Numpad4' || e.code === 'KeyG') {
            soundManager.initAudioContext();
            triggerGunshot();
            return;
        }

        // '5' or 'KeyO': OBEDIENT / PENURUT Toggle
        if (e.code === 'Digit5' || e.code === 'Numpad5' || e.code === 'KeyO') {
            toggleObedient();
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

    // Helper to get normalized canvas coordinates from Mouse/Pointer/Touch event
    function getCanvasPos(e) {
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    let dragStartX = 0;
    let dragStartY = 0;
    let didDrag = false;

    function onPointerDown(e) {
        if (e.cancelable && e.type.startsWith('touch')) {
            e.preventDefault();
        }
        soundManager.initAudioContext();
        const screenPos = getCanvasPos(e);
        const worldPos = camera ? camera.screenToWorld(screenPos.x, screenPos.y) : screenPos;

        // Check if user clicked/touched directly on the pet (Drag & Drop or Direct Petting)
        const pickedUp = pet.startDrag(worldPos.x, worldPos.y);
        if (pickedUp) {
            didDrag = false;
            dragStartX = worldPos.x;
            dragStartY = worldPos.y;
            document.body.classList.add('is-dragging');
            if (e.pointerId && canvas.setPointerCapture) {
                try {
                    canvas.setPointerCapture(e.pointerId);
                } catch (err) {
                    // Ignore pointer capture failures
                }
            }
            return;
        }

        // Check if user clicked on Meja Belajar inside house
        if (currentScene === 'INDOOR') {
            if (worldPos.x >= 580 && worldPos.x <= 760 && worldPos.y >= 140 && worldPos.y <= 280) {
                if (modalStudyDesk) {
                    modalStudyDesk.classList.remove('hidden');
                    updateStudyDeskModalStats();
                    if (pet) pet.addFloatingText('🎓 MEJA BELAJAR AI', pet.x, pet.y - 36, '#a5b4fc');
                }
                return;
            }
        }

        // IMPORTANT: Clicking on empty grass/ground does NOT command the pet to move.
        // The pet moves completely autonomously on its own!
    }

    function onPointerMove(e) {
        if (!pet.isPickedUp) return;
        if (e.cancelable) e.preventDefault();
        const screenPos = getCanvasPos(e);
        const worldPos = camera ? camera.screenToWorld(screenPos.x, screenPos.y) : screenPos;

        if (Math.hypot(worldPos.x - dragStartX, worldPos.y - dragStartY) > 8) {
            didDrag = true;
        }
        pet.onDragMove(worldPos.x, worldPos.y);
    }

    function onPointerUp(e) {
        if (pet.isPickedUp) {
            document.body.classList.remove('is-dragging');
            pet.releaseDrag();
            if (e.pointerId && canvas.releasePointerCapture) {
                try {
                    if (canvas.hasPointerCapture(e.pointerId)) {
                        canvas.releasePointerCapture(e.pointerId);
                    }
                } catch (err) {
                    // Ignore
                }
            }

            // If the user tapped the pet without dragging it, trigger petting/praise!
            if (!didDrag) {
                pet.petCat();
            }
        }
    }

    // Pointer Events (Primary)
    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });

    // Touch Events (Mobile Safari / Chrome fallback)
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp, { passive: false });
    window.addEventListener('touchcancel', onPointerUp, { passive: false });

    // Window blur safeguard
    window.addEventListener('blur', () => {
        if (pet.isPickedUp) {
            document.body.classList.remove('is-dragging');
            pet.releaseDrag();
        }
    });
}

function setupButtonListeners() {
    function bindAction(btnId, actionFn) {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        let lastTrigger = 0;
        const trigger = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const now = Date.now();
            if (now - lastTrigger < 180) return; // Debounce rapid taps
            lastTrigger = now;

            soundManager.initAudioContext();
            actionFn();

            // Visual active bounce
            btn.classList.add('btn-pressed');
            setTimeout(() => btn.classList.remove('btn-pressed'), 150);
        };

        btn.addEventListener('pointerdown', trigger, { passive: false });
        btn.addEventListener('touchstart', trigger, { passive: false });
    }

    // FEED
    bindAction('btnFeed', () => {
        pet.feed();
    });

    // PRAISE / PET
    bindAction('btnPraise', () => {
        pet.petCat();
    });

    // SCOLD
    bindAction('btnScold', () => {
        pet.scold();
    });

    // GUN / SHOOT (Tembakan Pistol)
    bindAction('btnGun', () => {
        triggerGunshot();
    });

    // PENURUT (Obedient Mode Toggle)
    bindAction('btnObedient', () => {
        toggleObedient();
    });

    // SOUND TOGGLE
    const btnSound = document.getElementById('btnSound');
    if (btnSound) {
        btnSound.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            soundManager.initAudioContext();
            const enabled = soundManager.toggleSound();
            updateAudioUI(enabled);
        });
    }

    // ==========================================
    // TOP VIEW SWITCHER (BOLA BUMI vs OTAK PIXEL)
    // ==========================================
    if (btnViewMap) {
        btnViewMap.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('MAP');
        });
    }

    if (btnViewBrain) {
        btnViewBrain.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('BRAIN');
        });
    }

    // ==========================================
    // BRAIN REAL-TIME VISUALIZER CONTROLS & INSPECTOR
    // ===============================================

    // Single Neuron Inspector Action Buttons
    const btnInspStimulate = document.getElementById('btnInspStimulate');

    if (btnInspStimulate) {
        btnInspStimulate.addEventListener('click', (e) => {
            e.preventDefault();
            soundManager.initAudioContext();
            if (brainVisualizer) {
                brainVisualizer.stimulateSelectedNeuron(2.0);
            }
        });
    }

    // Real-Time Brain Stimulus Bar
    const inputBrainStimulus = document.getElementById('inputBrainStimulus');
    const btnInjectStimulus = document.getElementById('btnInjectStimulus');

    const handleInjectStimulus = () => {
        if (!inputBrainStimulus || !pet || !pet.brain) return;
        const text = inputBrainStimulus.value.trim();
        if (!text) return;
        soundManager.initAudioContext();

        // Encode SDR to sensory cortex and step brain
        pet.brain.encodeTextInput(text);
        pet.brain.step(0.1);
        pet.brain.injectReward('dopamine', 0.4);

        if (brainVisualizer) {
            brainVisualizer.updateInspectorUI();
        }

        pet.addFloatingText(`⚡ STIMULUS: "${text}"`, pet.x, pet.y - 36, '#38bdf8');
        inputBrainStimulus.value = '';
    };

    if (btnInjectStimulus) {
        btnInjectStimulus.addEventListener('click', (e) => {
            e.preventDefault();
            handleInjectStimulus();
        });
    }

    if (inputBrainStimulus) {
        inputBrainStimulus.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleInjectStimulus();
            }
        });
    }

/* ==================== AUTO-TRAINING MODE (LLM GURU OTONOM) ==================== */

function handleInstruction(instruction) {
    if (!pet || !pet.brain) return;

    const topic = instruction.replace(/^ajarin\s*|^ajarkan\s*/i, '').trim() || 'Pengetahuan Umum';
    trainingActive = true;
    trainingStartTime = Date.now();
    trainingStepCount = 0;

    const hasApiKey = Boolean(pet.brain.llmConfig && pet.brain.llmConfig.apiKey);
    if (!hasApiKey) {
        pet.addFloatingText('🎓 Auto-Training: Mode Guru Otonom', pet.x, pet.y - 36, '#38bdf8');
    } else {
        pet.addFloatingText('🤖 Auto-Training: Mode LLM API', pet.x, pet.y - 36, '#34d399');
    }

    updateTrainingUI();
    runTrainingLoop(topic);
}

async function runTrainingLoop(topic) {
    if (!pet || !pet.brain) return;
    const brain = pet.brain;

    pet.addFloatingText(`🎓 AUTONOMOUS TRAINING: ${topic.toUpperCase()}`, pet.x, pet.y - 48, '#38bdf8');
    soundManager.initAudioContext();

    try {
        let stepIdx = 0;
        let lastTaught = '';
        while (trainingActive) {
            const initialState = brain.getSummary();
            const prompt = (stepIdx === 0) 
                ? buildInitialPrompt(topic, initialState) 
                : buildFeedbackPrompt(topic, initialState, stepIdx, lastTaught);
            
            let response = null;
            try {
                response = await brain.callLLM(prompt, topic, stepIdx);
            } catch (err) {
                console.warn('API LLM call error, using curriculum fallback:', err);
                pet.addFloatingText(`⚠️ API: ${err.message || 'Koreksi'}`, pet.x, pet.y - 36, '#f87171');
                response = brain.getAutonomousCurriculum(topic, stepIdx, initialState);
            }

            // Ensure response contains valid, executable actions
            if (!response || !Array.isArray(response.actions) || response.actions.length === 0) {
                // If API returned empty actions, retrieve fallback curriculum so training continues actively
                response = brain.getAutonomousCurriculum(topic, stepIdx, initialState);
            }

            if (response && Array.isArray(response.actions) && response.actions.length > 0) {
                // Find any taught text to pass forward in conversation context
                const textAct = response.actions.find(a => (a.text || a.content || a.input || a.message || a.soal || a.kata));
                if (textAct) {
                    lastTaught = textAct.text || textAct.content || textAct.input || textAct.message || textAct.soal || textAct.kata;
                }

                const executedCount = await executeActions(response.actions, topic);
                if (executedCount > 0) {
                    trainingStepCount += executedCount;
                    updateTrainingUI();
                }
            }

            stepIdx++;
            // Pause 2.5s between steps to prevent hitting rate limits and allow smooth training
            await new Promise(r => setTimeout(r, 2500));
        }
    } catch (err) {
        console.warn('Auto-Training error:', err);
        if (pet) pet.addFloatingText(`⚠️ RECOVERY TRAINING`, pet.x, pet.y - 36, '#f87171');
    }

    stopTraining();
    if (pet && pet.brain) pet.brain.save();
}

function buildInitialPrompt(topic, state) {
    const teacherInstructions = (pet && pet.brain && pet.brain.llmConfig && pet.brain.llmConfig.instructions)
        ? pet.brain.llmConfig.instructions
        : '';

    return `Kamu adalah Guru AI (LLM Teacher) yang melatih Pet AI berbasis SNN (Spiking Neural Network) secara adaptif dan interaktif.
Topik Pembelajaran: "${topic}".
${teacherInstructions ? 'Kurikulum khusus: ' + teacherInstructions : ''}

Kondisi awal SNN Pet:
- Jumlah Neuron: ${state.neuronCount}
- Average Firing Rate: ${state.averageFiringRate}
- Prediction Error: ${state.predictionError}
- Output Terakhir Pet: ${JSON.stringify(state.lastOutput)}

Rancang langkah awal pengajaran materi "${topic}". Kamu dapat mendidik lewat kata-kata serta berinteraksi langsung secara fisik (memberi makan, membelai, menegur, dan menyuntik reward biokimia).

Aksi yang BISA dan WAJIB kamu gunakan:
1. "sendInput": Mengirimkan materi dasar/rumus/kata/soal ke SNN pet. Contoh: { "action": "sendInput", "text": "1 + 1 = 2" }
2. "feed": Memberi makan pet 🍗 agar senang dan memiliki energi belajar. Contoh: { "action": "feed" }
3. "pet": Membelai pet 💖 dengan kasih sayang untuk memuji dan menaikkan serotonin/dopamin. Contoh: { "action": "pet" }
4. "scold": Menegur pet 💢 jika pet salah konsep atau tidak fokus. Contoh: { "action": "scold" }
5. "reward": Menyuntikkan reward biokimia ("dopamine" untuk apresiasi, "cortisol" untuk koreksi). Contoh: { "action": "reward", "type": "dopamine", "amount": 0.7 }
6. "setLearningRate": Mengatur plastisitas area sinapsis (sensorik, asosiasi, reasoning, memori). Contoh: { "action": "setLearningRate", "area": "reasoning", "value": 0.05 }
7. "evaluateOutput": Menguji dan mendengarkan respon suara/kata dari pet. Contoh: { "action": "evaluateOutput" }

FORMAT BALASAN HARUS HANYA JSON VALID:
{
  "actions": [
    { "action": "setLearningRate", "area": "reasoning", "value": 0.04 },
    { "action": "sendInput", "text": "1 + 1 = 2" },
    { "action": "pet" },
    { "action": "reward", "type": "dopamine", "amount": 0.6 },
    { "action": "evaluateOutput" }
  ]
}`;
}

function buildFeedbackPrompt(topic, state, stepIdx, lastTaught = '') {
    const teacherInstructions = (pet && pet.brain && pet.brain.llmConfig && pet.brain.llmConfig.instructions)
        ? pet.brain.llmConfig.instructions
        : '';

    return `Kamu adalah Guru AI (LLM Teacher) yang sedang mengajarkan topik: "${topic}".
Tahap Saat Ini: Langkah ke-${stepIdx + 1}.
${teacherInstructions ? 'Instruksi Kurikulum Khusus: ' + teacherInstructions : ''}
${lastTaught ? 'Materi Terakhir yang Baru Saja Kamu Ajarkan: "' + lastTaught + '"' : ''}

Kondisi SNN Pet Terkini:
- Respon Kata Pet: ${state.lastOutput?.speech ? `"${state.lastOutput.speech}"` : '(sedang memproses impuls saraf)'}
- Average Firing Rate: ${state.averageFiringRate}
- Prediction Error: ${state.predictionError}

TUGAS KAMU:
Lanjutkan pengajaran secara berkesinambungan dan bervariasi untuk topik "${topic}".
Proses pengajaran ini berjalan terus (auto-training) sampai pengguna menekan tombol stop.
Berikan aksi pengajaran konkret seperti "sendInput" (materi/soal baru), diselingi aksi interaksi ("feed", "pet", atau "scold") dan "reward".

Aksi yang BISA kamu gunakan:
- "sendInput": { "action": "sendInput", "text": "soal / rumus / penjelasan baru" }
- "feed": { "action": "feed" }  (memberi makan 🍗)
- "pet": { "action": "pet" }    (membelai kasih sayang 💖)
- "scold": { "action": "scold" } (menegur jika salah 💢)
- "reward": { "action": "reward", "type": "dopamine", "amount": 0.8 }
- "requestReplay": { "action": "requestReplay", "slot": 0 }
- "evaluateOutput": { "action": "evaluateOutput" }

FORMAT BALASAN HARUS HANYA JSON VALID:
{
  "actions": [
    { "action": "sendInput", "text": "..." },
    { "action": "feed" },
    { "action": "reward", "type": "dopamine", "amount": 0.7 },
    { "action": "evaluateOutput" }
  ]
}`;
}

async function executeActions(actions, topic = '') {
    if (!pet || !pet.brain || !Array.isArray(actions)) return 0;
    const brain = pet.brain;
    let validCount = 0;

    for (const act of actions) {
        if (!trainingActive) break;
        if (!act || typeof act !== 'object') continue;

        const actionType = (act.action || act.type || '').toString().toLowerCase().trim();
        const textVal = act.text || act.content || act.input || act.message || act.stimulus || act.soal || act.kata || '';

        switch (actionType) {
            case "sendinput":
            case "input":
            case "teach":
            case "say":
            case "speak":
            case "stimulus":
            case "kiriminput":
            case "materi":
                if (textVal) {
                    pet.talkToBrain(textVal);
                    if (brain.registerTokenToSDR) brain.registerTokenToSDR(textVal);
                    // Jalankan simulasi SNN kognitif langsung dengan input guru
                    const sensory = {
                        x: pet.x, y: pet.y, vx: pet.vx, vy: pet.vy,
                        isMoving: pet.isMoving, aiState: pet.aiState,
                        isGrounded: pet.isGrounded,
                        hunger: terrain ? terrain.hunger : 100,
                        happy: terrain ? terrain.happiness : 100,
                        energy: terrain ? terrain.energy : 100,
                        isSwimming: pet.isSwimming, isHeld: pet.isPickedUp,
                        inHouse: currentScene === 'HOUSE_INTERIOR',
                        isFrightened: pet.isFrightened
                    };
                    const stepRes = brain.step(sensory, textVal, 1.0);
                    pet.queuedTextInput = null;
                    if (stepRes && stepRes.speechOutput) {
                        pet.showSpeechBubble(stepRes.speechOutput, 240, false);
                    }
                    if (brain.applySTDP) brain.applySTDP(0.04);
                    pet.addFloatingText(`📖 Guru: "${textVal}"`, pet.x, pet.y - 36, '#34d399');
                    if (trainingStatus) trainingStatus.textContent = `Guru Mengajar: "${textVal}"`;
                    validCount++;
                }
                break;

            case "feed":
            case "feedpet":
            case "makan":
            case "givefood":
            case "snack":
                pet.feed();
                if (trainingStatus) trainingStatus.textContent = `🍗 Guru AI: Memberi Makan Pet`;
                validCount++;
                break;

            case "pet":
            case "petcat":
            case "belai":
            case "praise":
            case "elus":
            case "sayang":
                pet.petCat();
                if (trainingStatus) trainingStatus.textContent = `💖 Guru AI: Membelai Pet`;
                validCount++;
                break;

            case "scold":
            case "tegur":
            case "marah":
            case "discipline":
            case "koreksi":
                pet.scold();
                if (trainingStatus) trainingStatus.textContent = `💢 Guru AI: Menegur Pet`;
                validCount++;
                break;

            case "reward":
            case "hadiah":
            case "dopamine":
            case "cortisol":
                const rType = (act.type || (actionType === 'cortisol' ? 'cortisol' : 'dopamine')).toLowerCase();
                const rAmt = act.amount !== undefined ? Number(act.amount) : 0.5;
                brain.injectReward(rType, rAmt);
                if (brain.applySTDP) brain.applySTDP(Math.abs(rAmt) * 0.08);
                if (rType === 'dopamine' || rAmt > 0) {
                    pet.addFloatingText(`✨ +DOPAMINE ${Math.round(rAmt * 100)}%`, pet.x, pet.y - 36, '#fde047');
                } else {
                    pet.addFloatingText(`💢 KORTISOL ${Math.round(Math.abs(rAmt) * 100)}%`, pet.x, pet.y - 36, '#f87171');
                }
                validCount++;
                break;

            case "setlearningrate":
            case "learningrate":
                const area = act.area || 'reasoning';
                const val = Number(act.value) || 0.02;
                brain.setLearningRate(area, val);
                pet.addFloatingText(`⚙️ LR ${area}: ${val}`, pet.x, pet.y - 36, '#c084fc');
                validCount++;
                break;

            case "requestreplay":
            case "replay":
                const slot = Number(act.slot) || 0;
                brain.replayMemory(slot);
                pet.addFloatingText(`🔄 REPLAY MEMORI #${slot}`, pet.x, pet.y - 36, '#38bdf8');
                validCount++;
                break;

            case "evaluateoutput":
            case "evaluate":
            case "eval":
            case "cek":
            case "dengar":
                const out = brain.getLastOutput();
                if (out && out.speech) {
                    pet.showSpeechBubble(out.speech, 240, false);
                    pet.addFloatingText(`🗣️ Pet: "${out.speech}"`, pet.x, pet.y - 36, '#a7f3d0');
                    if (trainingStatus) trainingStatus.textContent = `Respon Pet: "${out.speech}"`;
                } else {
                    pet.addFloatingText(`🧠 SNN Merespon Sinyal`, pet.x, pet.y - 36, '#7dd3fc');
                }
                validCount++;
                break;

            default:
                if (textVal) {
                    pet.talkToBrain(textVal);
                    if (brain.registerTokenToSDR) brain.registerTokenToSDR(textVal);
                    brain.step({}, textVal, 16);
                    if (brain.applySTDP) brain.applySTDP(0.04);
                    pet.addFloatingText(`📖 "${textVal}"`, pet.x, pet.y - 36, '#34d399');
                    validCount++;
                } else {
                    console.warn("Aksi tidak dikenal dilewati:", act);
                }
        }
        await new Promise(resolve => setTimeout(resolve, 450));
    }
    return validCount;
}

function stopTraining() {
    trainingActive = false;
    updateTrainingUI();
    if (pet) pet.addFloatingText('✅ TRAINING SELESAI', pet.x, pet.y - 36, '#34d399');
}

function updateTrainingUI() {
    if (!trainingStatus) {
        trainingPanel = document.getElementById('training-panel');
        trainingStatus = document.getElementById('training-status');
        trainingTimer = document.getElementById('training-timer');
        trainingSteps = document.getElementById('training-steps');
        btnStopTraining = document.getElementById('btnStopTraining');
    }

    if (!trainingActive) {
        if (trainingStatus) trainingStatus.textContent = "Tidak aktif";
        if (trainingTimer) trainingTimer.textContent = "00:00";
        if (trainingSteps) trainingSteps.textContent = "0";
        if (trainingPanel) trainingPanel.classList.remove('active');
        if (btnStopTraining) btnStopTraining.classList.add('hidden');
        return;
    }

    if (trainingPanel) trainingPanel.classList.add('active');
    if (btnStopTraining) btnStopTraining.classList.remove('hidden');

    const elapsed = Math.floor((Date.now() - (trainingStartTime || Date.now())) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    if (trainingTimer) trainingTimer.textContent = `${minutes}:${seconds}`;
    if (trainingSteps) trainingSteps.textContent = trainingStepCount;
    if (trainingStatus) trainingStatus.textContent = "Sedang belajar...";
}

setInterval(() => {
    if (trainingActive) updateTrainingUI();
}, 1000);

    // TALK TO PET BRAIN
    const handleTalk = () => {
        if (!inputTalk || !pet) return;
        const text = inputTalk.value.trim();
        if (text.length > 0) {
            inputTalk.value = '';
            soundManager.initAudioContext();
            const lower = text.toLowerCase();

            // Reaksi kata langsung pengguna untuk interaksi & mendidik pet:
            if (lower === 'shot' || lower === 'dor' || lower === 'tembak' || lower === 'bang' || lower.startsWith('shot!') || lower.startsWith('dor!')) {
                // Tembak pistol (shot) langsung untuk mendisiplinkan / mentraumatkan ucapan buruk pet
                triggerGunshot();
                pet.talkToBrain(text);
            } else if (lower === 'salah' || lower === 'bukan' || lower === 'bego' || lower === 'bodoh' || lower === 'jangan' || lower === 'hukum' || lower === 'bad') {
                // Teguran keras verbal
                pet.scold();
                pet.talkToBrain(text);
            } else if (lower === 'pinter' || lower === 'pintar' || lower === 'bagus' || lower === 'good' || lower === 'mantap' || lower === 'hebat' || lower === 'sip' || lower === 'keren') {
                // Pujian verbal
                pet.petCat();
                pet.talkToBrain(text);
            } else if (lower.startsWith('ajarin') || lower.startsWith('ajarkan')) {
                handleInstruction(text);
            } else {
                pet.talkToBrain(text);
                if (soundManager.playPraise) soundManager.playPraise();
            }
        }
    };

    if (btnTalk) {
        btnTalk.addEventListener('click', (e) => {
            e.preventDefault();
            handleTalk();
        });
    }

    if (inputTalk) {
        inputTalk.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleTalk();
            }
        });
    }

    // OPEN / CLOSE STUDY DESK MODAL
    if (btnOpenStudyDesk) {
        btnOpenStudyDesk.addEventListener('click', (e) => {
            e.preventDefault();
            soundManager.initAudioContext();
            if (modalStudyDesk) {
                modalStudyDesk.classList.remove('hidden');
                if (pet && pet.brain) {
                    const cfg = pet.brain.llmConfig;
                    const prov = (cfg && cfg.provider) ? cfg.provider : 'gemini';
                    if (selectLlmProvider) selectLlmProvider.value = prov;
                    populateModelDropdown(prov, cfg ? cfg.model : null);
                    if (txtTeacherInstructions && cfg && cfg.instructions !== undefined) {
                        txtTeacherInstructions.value = cfg.instructions;
                    }
                    if (inputLlmApiKey && cfg && cfg.apiKey) {
                        inputLlmApiKey.value = cfg.apiKey;
                    }
                    if (selectLlmShotMode && cfg && cfg.shotMode) {
                        selectLlmShotMode.value = cfg.shotMode;
                        updateShotStatusUI(cfg.shotMode);
                    }
                    if (txtCustomShots && cfg && cfg.customShots) {
                        txtCustomShots.value = cfg.customShots;
                    }
                }
                updateStudyDeskModalStats();
            }
        });
    }

    if (btnCloseStudyDesk) {
        btnCloseStudyDesk.addEventListener('click', (e) => {
            e.preventDefault();
            if (modalStudyDesk) modalStudyDesk.classList.add('hidden');
        });
    }

    if (modalStudyDesk) {
        modalStudyDesk.addEventListener('click', (e) => {
            if (e.target === modalStudyDesk) {
                modalStudyDesk.classList.add('hidden');
            }
        });
    }

    // MODAL: TOGGLE MODE EVOLUSI
    if (btnModalToggleNeuro) {
        btnModalToggleNeuro.addEventListener('click', (e) => {
            e.preventDefault();
            if (pet && pet.brain) {
                const isEvo = pet.brain.setEvolutionEnabled(!pet.brain.evolutionEnabled);
                soundManager.initAudioContext();
                pet.addFloatingText(
                    isEvo ? '🧠 EVOLUSI AKTIF' : '🧠 EVOLUSI MATI',
                    pet.x, pet.y - 36,
                    isEvo ? '#fde047' : '#94a3b8'
                );
                updateStudyDeskModalStats();
            }
        });
    }

    // MODAL: PURGE KATA ACAK / BUATAN SAMPAH
    const btnModalPurgeVocab = document.getElementById('btnModalPurgeVocab');
    if (btnModalPurgeVocab) {
        btnModalPurgeVocab.addEventListener('click', (e) => {
            e.preventDefault();
            if (pet && pet.brain) {
                soundManager.initAudioContext();
                const res = pet.brain.purgeCorruptedAndInventedWords();
                pet.addFloatingText(`🧹 ${res.purgedWordsCount} KATA ACAK DIBERSIHKAN!`, pet.x, pet.y - 36, '#38bdf8');
                updateStudyDeskModalStats();
            }
        });
    }

    // MODAL: PRE-TRAIN CORPUS
    if (btnModalPretrain) {
        btnModalPretrain.addEventListener('click', (e) => {
            e.preventDefault();
            if (pet && pet.brain) {
                const rawText = txtCorpusInput ? txtCorpusInput.value.trim() : '';
                const corpusText = rawText.length > 0 ? rawText : 'halo pet kawan teman nyam makan lapar senang suka taman rumah berenang air belajar meja 1 2 3 4 5 6 7 8 9 0 + = puji pintar maaf tidur main pagi malam';
                
                soundManager.initAudioContext();
                pet.addFloatingText('📚 BELAJAR KORPUS BAHASA...', pet.x, pet.y - 36, '#34d399');
                btnModalPretrain.textContent = '⏳ MEMPROSES...';
                
                pet.brain.preTrain(corpusText).then(res => {
                    pet.addFloatingText(`✨ +${res.tokensProcessed} TOKEN PRE-TRAINED!`, pet.x, pet.y - 36, '#fde047');
                    btnModalPretrain.textContent = '📚 JALANKAN PRE-TRAIN KORPUS';
                    updateStudyDeskModalStats();
                });
            }
        });
    }

    // MODAL: IMPORT LINK / VIDEO KORPUS
    if (btnModalImportUrl) {
        btnModalImportUrl.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!pet || !pet.brain) return;
            const urlText = inputCorpusUrl ? inputCorpusUrl.value.trim() : '';
            if (!urlText) return;

            soundManager.initAudioContext();
            pet.addFloatingText('🔗 MEMBACA LINK KORPUS...', pet.x, pet.y - 36, '#38bdf8');
            btnModalImportUrl.textContent = '⏳ MEMBACA...';

            // Clean domain and words from URL as immediate corpus tokens
            const extractedWords = urlText.replace(/https?:\/\//g, '').replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2);
            const corpus = extractedWords.join(' ') + ' materi video dokumentasi pelajaran belajar ilmu pengetahuan sains matematika';

            await pet.brain.preTrain(corpus);
            pet.brain.injectReward('dopamine', 0.5);
            pet.addFloatingText('✨ KORPUS LINK DITAMBAHKAN!', pet.x, pet.y - 36, '#fde047');
            btnModalImportUrl.textContent = '📥 IMPORT LINK';
            if (inputCorpusUrl) inputCorpusUrl.value = '';
            updateStudyDeskModalStats();
        });
    }

    // MODAL: PROVIDER DROPDOWN CHANGE
    if (selectLlmProvider) {
        selectLlmProvider.addEventListener('change', () => {
            populateModelDropdown(selectLlmProvider.value);
        });
    }

    // MODAL: MODEL DROPDOWN CHANGE
    if (selectLlmModel) {
        selectLlmModel.addEventListener('change', () => {
            if (selectLlmModel.value === 'custom') {
                if (divCustomModelGroup) divCustomModelGroup.classList.remove('hidden');
                if (inputLlmCustomModel) inputLlmCustomModel.focus();
            } else {
                if (divCustomModelGroup) divCustomModelGroup.classList.add('hidden');
            }
        });
    }

    // MODAL: SHOT MODE DROPDOWN CHANGE
    if (selectLlmShotMode) {
        selectLlmShotMode.addEventListener('change', () => {
            const mode = selectLlmShotMode.value;
            updateShotStatusUI(mode);
        });
    }

    // MODAL: TEST PING & SAVE LLM CONFIG
    if (btnSaveLlmConfig) {
        btnSaveLlmConfig.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!pet || !pet.brain) return;

            const provider = selectLlmProvider ? selectLlmProvider.value : 'gemini';
            let model = selectLlmModel ? selectLlmModel.value : 'gemini-3.8-flash';
            if (model === 'custom') {
                model = inputLlmCustomModel ? inputLlmCustomModel.value.trim() : '';
                if (!model) {
                    if (txtTeacherStatus) {
                        txtTeacherStatus.textContent = '❌ Masukkan ID model kustom pada kolom yang tersedia.';
                        txtTeacherStatus.style.color = '#f87171';
                    }
                    return;
                }
            }

            const instructions = txtTeacherInstructions ? txtTeacherInstructions.value.trim() : '';
            const apiKey = inputLlmApiKey ? inputLlmApiKey.value.trim() : '';
            const shotMode = selectLlmShotMode ? selectLlmShotMode.value : '3-shot';
            const customShots = txtCustomShots ? txtCustomShots.value.trim() : '';

            soundManager.initAudioContext();

            if (!apiKey) {
                pet.brain.setLlmConfig(null);
                if (txtTeacherStatus) {
                    txtTeacherStatus.textContent = 'ℹ️ Key Dihapus (Mode Offline)';
                    txtTeacherStatus.style.color = '#94a3b8';
                }
                pet.addFloatingText('ℹ️ MODE SNN OFFLINE', pet.x, pet.y - 36, '#94a3b8');
                updateStudyDeskModalStats();
                return;
            }

            btnSaveLlmConfig.disabled = true;
            btnSaveLlmConfig.textContent = '⏳ TES PING PROVIDER...';
            if (txtTeacherStatus) {
                txtTeacherStatus.textContent = `⏳ Melakukan tes ping koneksi ke web provider ${provider.toUpperCase()} (${model})...`;
                txtTeacherStatus.style.color = '#38bdf8';
            }

            try {
                const BrainClass = pet.brain.constructor;
                await BrainClass.testPingLlmApi({ provider, model, apiKey });

                // Ping successful -> Save configuration with shotMode
                pet.brain.setLlmConfig({ provider, model, apiKey, instructions, shotMode, customShots });
                pet.addFloatingText('⚡ PING OK & GURU AI AKTIF!', pet.x, pet.y - 36, '#34d399');
                if (txtTeacherStatus) {
                    txtTeacherStatus.textContent = `✅ TES PING BERHASIL! [${provider.toUpperCase()}] Model: ${model} (${shotMode.toUpperCase()}) Terhubung!`;
                    txtTeacherStatus.style.color = '#34d399';
                }
            } catch (err) {
                if (txtTeacherStatus) {
                    txtTeacherStatus.textContent = `❌ TES PING GAGAL: ${err.message || 'Koneksi ke provider gagal'}`;
                    txtTeacherStatus.style.color = '#f87171';
                }
                pet.addFloatingText('❌ PING GAGAL', pet.x, pet.y - 36, '#ef4444');
            } finally {
                btnSaveLlmConfig.disabled = false;
                btnSaveLlmConfig.textContent = '⚡ TES PING & SIMPAN';
            }
        });
    }

    // AUTO-TRAINING STOP BUTTON
    if (btnStopTraining) {
        btnStopTraining.addEventListener('click', (e) => {
            e.preventDefault();
            stopTraining();
        });
    }

    // AUTO-TRAINING START BUTTON FROM MEJA BELAJAR MODAL
    if (btnStartAutoTrain) {
        btnStartAutoTrain.addEventListener('click', (e) => {
            e.preventDefault();
            const topic = inputAutoTrainTopic ? inputAutoTrainTopic.value.trim() : '';
            if (topic) {
                handleInstruction('ajarin ' + topic);
                if (modalStudyDesk) modalStudyDesk.classList.add('hidden');
            } else {
                handleInstruction('ajarin Pengetahuan Umum');
                if (modalStudyDesk) modalStudyDesk.classList.add('hidden');
            }
        });
    }
}

function updateAudioUI(enabled) {
    if (soundIcon) {
        soundIcon.textContent = enabled ? '🔊' : '🔇';
    }
}

// Boot game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
