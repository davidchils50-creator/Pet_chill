/* ===================================
   PET-ENHANCED.JS - Adorable Pixel Art Cat
   Optimized with Particle Pooling & Delta-Time for 60 FPS
   =================================== */

import { Brain } from './brain.js';

export class PetEnhanced {
    constructor(canvas, terrain, startX, startY, soundManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.terrain = terrain;
        this.soundManager = soundManager;

        // Initialize Neuromorphic Spiking Neural Network Brain
        this.brain = new Brain();
        this.queuedTextInput = null;

        // Position & dimensions
        this.x = startX;
        this.y = startY;
        this.width = 46;
        this.height = 42;

        // Physics & Jump
        this.jumpY = 0;
        this.jumpVelocity = 0;
        this.gravity = 0.55;
        this.isGrounded = true;

        // Movement & Speed
        this.speed = 2.2;
        this.vx = 0;
        this.vy = 0;
        this.facingRight = true;
        this.isMoving = false;

        // Manual vs AI Wander
        this.manualControl = false;
        this.lastInputTime = 0;
        this.aiState = 'IDLE'; // 'IDLE' or 'WALK'
        this.aiTimer = 60;
        this.aiDirX = 0;
        this.aiDirY = 0;

        // Animation counters
        this.walkFrame = 0;
        this.tailAngle = 0;
        this.spinAngle = 0;
        this.isSpinning = false;

        // Eye Blink Animation
        this.eyeState = 'open';
        this.blinkTimer = 0;
        this.blinkInterval = 180 + Math.random() * 200;
        this.closedFrames = 0;

        // Capped particle systems to prevent GC stutter
        this.dustParticles = [];
        this.maxDust = 16;
        this.heartParticles = [];
        this.maxHearts = 12;

        // Swimming mode & water particle systems
        this.isSwimming = false;
        this.swimFrame = 0;
        this.swimBob = 0;
        this.waterRipples = [];
        this.maxWaterRipples = 14;
        this.waterSplashes = [];
        this.maxWaterSplashes = 18;

        // Virtual Pet Picked Up (Diangkat) state
        this.isPickedUp = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.pickupFrame = 0;

        // Scene Context & Transition Callbacks
        this.currentScene = 'OUTDOOR'; // 'OUTDOOR' or 'HOUSE_INTERIOR'
        this.onEnterHouse = null;
        this.onExitHouse = null;

        // Floating message popups (+25 🍗, etc.)
        this.floatingTexts = [];

        // Speech Bubble (Balon Chat) above pet head
        this.speechBubble = null;

        // Curiosity Drive & Novelty Seeking System (Agar Pet Aktif & Tidak Malas)
        this.curiosityTimer = 0;
        this.curiosityInterval = 180; // Setiap ~3 detik stimulus penasaran

        // Gunshot & Amygdala Fear States (Respon Tembakan Pistol & Takut Mati)
        this.isFrightened = false;
        this.fearTimer = 0;
        this.fearEscapeSpeed = 4.8;

        // Mode Penurut & Kepatuhan Belajar (Obedience & Plasticity Mode)
        this.isObedientMode = false;
        this.obedienceAuraAngle = 0;
        this.obedienceStarParticles = [];
    }

    /**
     * TOGGLE MODE PENURUT (OBEDIENCE & HYPER-LEARNING SNN MODE)
     * Saat Aktif:
     * - Memicu stimulus saraf plastisitas tinggi (ACh 95%)
     * - Mengurangi wandering acak liar, memfokuskan pet ke instruksi pemilik & guru
     * - Memancarkan aura emas & partikel fokus kepatuhan
     */
    setObedientMode(enabled) {
        this.isObedientMode = Boolean(enabled);
        if (this.brain && typeof this.brain.setObedientMode === 'function') {
            this.brain.setObedientMode(this.isObedientMode);
        }
        if (this.isObedientMode) {
            this.addFloatingText("👑 PENURUT: ON", this.x, this.y - 32, "#f59e0b");
            this.addFloatingText("✨ ACh 95% - Fokus Belajar!", this.x, this.y - 48, "#10b981");
            this.aiState = 'ATTENTIVE_SIT';
            this.stateTimer = 240;
            this.speedX = 0;
            this.createObedienceBurst(this.x, this.y - 15, 12);
        } else {
            this.addFloatingText("🕊️ BEBAS: OFF", this.x, this.y - 32, "#60a5fa");
            this.aiState = 'IDLE';
            this.stateTimer = 120;
        }
    }

    createObedienceBurst(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            this.obedienceStarParticles.push({
                x: x + (Math.random() - 0.5) * 36,
                y: y + (Math.random() - 0.5) * 24,
                vx: (Math.random() - 0.5) * 2.2,
                vy: -1.2 - Math.random() * 2.5,
                size: 3 + Math.random() * 4,
                alpha: 1.0,
                color: Math.random() < 0.65 ? '#fbbf24' : '#34d399',
                life: 50 + Math.random() * 30
            });
        }
        if (this.obedienceStarParticles.length > 28) {
            this.obedienceStarParticles.splice(0, this.obedienceStarParticles.length - 28);
        }
    }

    /**
     * Respon Tembakan Pistol: Pet mendengar letusan senjata, amigdala terpicu maksimal, takut mati!
     * Murni respon biologis saraf & refleks fisik (badai amigdala, jeritan kucing, lari sprint panik)
     * TANPA teks atau kata-kata buatan karena pet belum mempelajari bahasa manusia!
     */
    hearGunshot(gunX = 0, gunY = 0) {
        this.isFrightened = true;
        this.fearTimer = 340; // ~5.5 detik panik ketakutan intens
        this.aiState = 'PANIC_FLEE';

        // Panggil SNN brain untuk memicu badai amigdala & lonjakan kortisol/norepinefrin 100%
        if (this.brain && typeof this.brain.triggerGunshotFear === 'function') {
            this.brain.triggerGunshotFear(gunX, gunY, this.x, this.y);
        }

        // Hukuman operan trauma berat atas kata/ucapan terkini pet (jika ada)
        if (this.brain && typeof this.brain.punishSpeechAssociation === 'function') {
            const assoc = this.brain.punishSpeechAssociation(2.5);
            if (assoc) {
                this.addFloatingText(`💥 SHOT! "${assoc.outputToken.toUpperCase()}" TRAUMA (${assoc.weight.toFixed(1)})`, this.x, this.y - 56, '#ef4444');
            }
        }

        // Lompatan kaget refleks seketika (Startle reflex jump)
        if (this.isGrounded && !this.isPickedUp) {
            this.jumpVelocity = -9.2;
            this.isGrounded = false;
            this.createDustBurst(this.x, this.y, 6);
        }

        // Efek suara jeritan kucing ketakutan / screech audio
        if (this.soundManager && typeof this.soundManager.playFearScreech === 'function') {
            this.soundManager.playFearScreech();
        }

        // Turunkan rasa senang & set status mood ketakutan di terrain
        if (this.terrain) {
            this.terrain.happiness = Math.max(5, this.terrain.happiness - 25);
            this.terrain.currentMood = 'KETAKUTAN (AMIGDALA AKTIF!)';
        }

        // Tentukan vektor arah lari kabur menjauhi titik tembakan
        const dx = this.x - gunX;
        const dy = this.y - gunY;
        const dist = Math.hypot(dx, dy) || 1;
        this.aiDirX = dx / dist;
        this.aiDirY = dy / dist;
        this.facingRight = this.aiDirX >= 0;
        this.aiTimer = 340;
    }

    /**
     * Switch the active map context (Outdoor World vs House Interior)
     */
    setMap(map, sceneType = 'OUTDOOR') {
        this.terrain = map;
        this.currentScene = sceneType;
        this.isSwimming = false;
        this.vx = 0;
        this.vy = 0;
        this.aiDirX = 0;
        this.aiDirY = 0;
        this.aiState = 'IDLE';
        this.aiTimer = 40;
    }

    // ===============================================
    // VIRTUAL PET INTERACTIONS (FEED, PET, SCOLD & TALK)
    // ===============================================
    feed() {
        if (this.terrain) this.terrain.feed(25);
        if (this.brain) {
            this.brain.injectReward('dopamine', 0.8);
            const assoc = this.brain.reinforceSpeechAssociation(1.0);
            if (assoc) {
                this.addFloatingText(`✨ "${assoc.inputToken.toUpperCase()}" ➔ "${assoc.outputToken.toUpperCase()}" (+${assoc.weight.toFixed(1)})`, this.x, this.y - 48, '#34d399');
            }
        }

        this.createHeartParticles(this.x, this.y - 25, 4, '#fbbf24');
        this.addFloatingText('+25 🍗', this.x, this.y - 32, '#fde047');
        if (this.soundManager) this.soundManager.playFeed();
        // Happy mini jump
        if (this.isGrounded && !this.isPickedUp) {
            this.jumpVelocity = -4.5;
            this.isGrounded = false;
        }
    }

    petCat() {
        if (this.terrain) this.terrain.petCat(20);
        if (this.brain) {
            this.brain.injectReward('serotonin', 0.6);
            this.brain.injectReward('dopamine', 0.4);
            const assoc = this.brain.reinforceSpeechAssociation(1.0);
            if (assoc) {
                this.addFloatingText(`💖 "${assoc.inputToken.toUpperCase()}" ➔ "${assoc.outputToken.toUpperCase()}" (+${assoc.weight.toFixed(1)})`, this.x, this.y - 48, '#f43f5e');
            }
        }

        this.createHeartParticles(this.x, this.y - 25, 6, '#f43f5e');
        this.addFloatingText('+20 💖', this.x, this.y - 32, '#fda4af');
        if (this.soundManager) this.soundManager.playPraise();
        // Joyful spin if on ground
        if (this.isGrounded && !this.isPickedUp) {
            this.isSpinning = true;
            this.spinAngle = 0;
        }
    }

    scold() {
        if (this.terrain) this.terrain.scold(15);
        if (this.brain) {
            this.brain.injectReward('cortisol', 0.7);
            const assoc = this.brain.punishSpeechAssociation(1.2);
            if (assoc) {
                this.addFloatingText(`💢 "${assoc.inputToken.toUpperCase()}" ➔ "${assoc.outputToken.toUpperCase()}" DIHUKUM (${assoc.weight.toFixed(1)})`, this.x, this.y - 48, '#f87171');
            }
        }

        this.addFloatingText('-15 💢', this.x, this.y - 32, '#94a3b8');
        if (this.soundManager) this.soundManager.playScold();
    }

    showSpeechBubble(text, duration = 210, isUser = false) {
        if (!text) return;
        this.speechBubble = {
            text: text,
            timer: duration,
            maxTimer: duration,
            alpha: 1.0,
            isUser: isUser
        };
    }

    updateSpeechBubble(dtFactor = 1.0) {
        if (!this.speechBubble) return;
        this.speechBubble.timer -= dtFactor;
        if (this.speechBubble.timer <= 40) {
            this.speechBubble.alpha = Math.max(0, this.speechBubble.timer / 40);
        } else {
            this.speechBubble.alpha = 1.0;
        }
        if (this.speechBubble.timer <= 0) {
            this.speechBubble = null;
        }
    }

    talkToBrain(text) {
        if (!text || typeof text !== 'string') return;
        const trimmed = text.trim();
        if (trimmed.length === 0) return;

        this.queuedTextInput = trimmed;
        // Display user chat bubble above pet head
        this.showSpeechBubble(`"${trimmed}"`, 180, true);
    }

    // ===============================================
    // DRAG AND DROP (DIANGKAT & DIPINDAH)
    // ===============================================
    startDrag(pointerX, pointerY) {
        // Hit test: check if pointer clicked/touched inside pet bounding circle or box
        const petScreenY = this.y + this.jumpY - 6; // Center near torso/head
        const dx = pointerX - this.x;
        const dy = pointerY - petScreenY;
        const dist = Math.hypot(dx, dy);

        // Generous hitbox (55px radius or 80x80 box) for easy mouse/touch grabbing
        if (dist <= 55 || (Math.abs(dx) <= 40 && Math.abs(dy) <= 45)) {
            this.isPickedUp = true;
            this.manualControl = true;
            this.vx = 0;
            this.vy = 0;
            this.jumpVelocity = 0;
            this.jumpY = 0;
            this.isGrounded = true;
            this.pickupFrame = 0;
            this.dragOffsetX = this.x - pointerX;
            this.dragOffsetY = this.y - pointerY;

            if (this.terrain) {
                this.terrain.isPetHeld = true;
                this.terrain.updateMood();
            }
            if (this.soundManager) this.soundManager.playPickup();
            return true;
        }
        return false;
    }

    onDragMove(pointerX, pointerY) {
        if (!this.isPickedUp) return;

        const newX = pointerX + this.dragOffsetX;
        const newY = pointerY + this.dragOffsetY;

        // Clamp inside large open world boundaries
        const worldW = this.terrain ? this.terrain.worldWidth : 2400;
        const worldH = this.terrain ? this.terrain.worldHeight : 1600;
        const minX = 55;
        const maxX = worldW - 55;
        const minY = 55;
        const maxY = worldH - 55;

        if (newX > this.x + 0.8) this.facingRight = true;
        else if (newX < this.x - 0.8) this.facingRight = false;

        this.x = Math.max(minX, Math.min(maxX, newX));
        this.y = Math.max(minY, Math.min(maxY, newY));
    }

    releaseDrag() {
        if (!this.isPickedUp) return;

        this.isPickedUp = false;
        if (this.terrain) {
            this.terrain.isPetHeld = false;
            this.terrain.updateMood();
        }

        if (this.soundManager) this.soundManager.playDrop();

        // Drop down with physics
        this.isGrounded = false;
        this.jumpY = -15;
        this.jumpVelocity = 1.5;

        // Resume AI wander state
        this.manualControl = false;
        this.aiTimer = 60;
        this.aiState = 'IDLE';

        // Check if pet was dropped at Outdoor House Door Trigger Zone
        if (this.currentScene === 'OUTDOOR' && this.terrain && typeof this.terrain.isHouseDoorTrigger === 'function' && this.terrain.isHouseDoorTrigger(this.x, this.y)) {
            if (typeof this.onEnterHouse === 'function') {
                this.onEnterHouse();
                return;
            }
        }

        // Check if pet was dropped at Indoor Exit Door Trigger Zone
        if (this.currentScene === 'HOUSE_INTERIOR' && this.terrain && typeof this.terrain.isDoorExitTrigger === 'function' && this.terrain.isDoorExitTrigger(this.x, this.y)) {
            if (typeof this.onExitHouse === 'function') {
                this.onExitHouse();
                return;
            }
        }

        // Check if pet was dropped onto the Meja Belajar (Study Desk)
        if (this.terrain && typeof this.terrain.isOverStudyDesk === 'function' && this.terrain.isOverStudyDesk(this.x, this.y)) {
            console.log("Pet ditaruh di meja belajar");

            const desk = this.terrain.getStudyDesk();
            if (desk) {
                // Position pet gently above the study desk surface
                this.x = desk.x + desk.w / 2;
                this.y = desk.y + 12;
            }

            // Display temporary feedback text on screen
            this.addFloatingText("Mode Belajar (Segera Hadir)", this.x, this.y - 32, '#38bdf8');
            this.addFloatingText("📖 MEJA BELAJAR", this.x, this.y - 48, '#fbbf24');

            // Visual response & sound
            this.createHeartParticles(this.x, this.y - 10, 4, '#38bdf8');
            if (this.soundManager) {
                this.soundManager.playPraise();
            }

            // Pet sits quietly and happily at the study desk for a moment
            this.aiState = 'IDLE';
            this.aiTimer = 180;
        }

        // Check if pet was dropped into the Lake / Water
        if (this.terrain && typeof this.terrain.isInWater === 'function' && this.terrain.isInWater(this.x, this.y)) {
            console.log("Pet berenang di danau");
            this.isSwimming = true;
            this.terrain.isPetSwimming = true;
            this.terrain.updateMood();

            // Splash feedback & ripples
            this.createWaterSplashBurst(this.x, this.y + 10, 10);
            this.addWaterRipple(this.x, this.y + 10);
            this.addFloatingText("🏊 Mode Berenang!", this.x, this.y - 32, '#38bdf8');
            this.addFloatingText("💦 BYURRR!", this.x, this.y - 48, '#7dd3fc');
            this.createHeartParticles(this.x, this.y - 15, 3, '#38bdf8');

            if (this.soundManager && typeof this.soundManager.playSplash === 'function') {
                this.soundManager.playSplash();
            }
        }
    }

    addFloatingText(text, x, y, color = '#ffffff') {
        this.floatingTexts.push({
            text: text,
            x: x !== undefined ? x : this.x,
            y: y !== undefined ? y : this.y - 32,
            alpha: 1.0,
            vy: -0.8,
            color: color
        });
    }

    spawnFloatingText(text, color = '#ffffff', x, y) {
        this.addFloatingText(
            text,
            x !== undefined ? x : this.x,
            y !== undefined ? y : this.y - 32,
            color
        );
    }

    updateFloatingTexts(dtFactor) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dtFactor;
            ft.alpha -= 0.02 * dtFactor;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    setManualMovement(dx, dy) {
        this.manualControl = true;
        this.lastInputTime = Date.now();
        this.vx = dx * this.speed;
        this.vy = dy * this.speed;

        if (dx > 0) this.facingRight = true;
        if (dx < 0) this.facingRight = false;
    }

    jump() {
        if (this.isSwimming && !this.isPickedUp) {
            // Joyful splash jump in water
            this.jumpVelocity = -6.5;
            this.isGrounded = false;
            this.createWaterSplashBurst(this.x, this.y + 10, 8);
            this.addWaterRipple(this.x, this.y + 10);
            if (this.soundManager && typeof this.soundManager.playSplash === 'function') {
                this.soundManager.playSplash();
            } else if (this.soundManager) {
                this.soundManager.playJump();
            }
        } else if (this.isGrounded && !this.isPickedUp) {
            this.isGrounded = false;
            this.jumpVelocity = -8.5;
            this.createDustBurst(this.x, this.y, 4);
            if (this.soundManager) this.soundManager.playJump();
        }
    }

    act() {
        this.isSpinning = true;
        this.spinAngle = 0;
        this.createHeartParticles(this.x, this.y - 30);
        if (this.terrain) this.terrain.petCat(10);
        if (this.soundManager) this.soundManager.playAct();
    }

    update(dtFactor = 1.0) {
        // Natural stat decay over time (safely guarded)
        if (this.terrain && typeof this.terrain.updateStats === 'function') {
            this.terrain.updateStats(dtFactor);
        }

        // Update floating texts and speech bubble
        this.updateFloatingTexts(dtFactor);
        this.updateSpeechBubble(dtFactor);

        // If picked up / held by player
        if (this.isPickedUp) {
            this.pickupFrame += dtFactor;
            this.isMoving = false;
            this.jumpY = 0;
            this.updateParticles(dtFactor);
            return;
        }

        // 0. Automatic Water & Swimming Mode Detection
        const inWaterNow = Boolean(
            this.terrain &&
            !this.isPickedUp &&
            typeof this.terrain.isInWater === 'function' &&
            this.terrain.isInWater(this.x, this.y)
        );

        if (inWaterNow && !this.isSwimming) {
            this.isSwimming = true;
            if (this.terrain) {
                this.terrain.isPetSwimming = true;
                this.terrain.updateMood();
            }
            this.createWaterSplashBurst(this.x, this.y + 10, 8);
            this.addWaterRipple(this.x, this.y + 10);
            this.addFloatingText("🏊 Mode Berenang!", this.x, this.y - 32, '#38bdf8');
            this.addFloatingText("💦 BYURRR!", this.x, this.y - 48, '#7dd3fc');
            if (this.soundManager && typeof this.soundManager.playSplash === 'function') {
                this.soundManager.playSplash();
            }
        } else if (!inWaterNow && this.isSwimming) {
            this.isSwimming = false;
            if (this.terrain) {
                this.terrain.isPetSwimming = false;
                this.terrain.updateMood();
            }
            this.createWaterSplashBurst(this.x, this.y, 6);
            this.addFloatingText("🐾 Keluar Air", this.x, this.y - 32, '#a7f3d0');
        }

        if (this.isSwimming) {
            this.swimFrame += dtFactor;
            this.swimBob = Math.sin(this.swimFrame * 0.12) * 2.5;

            // Spawn gentle water ripples around the pet
            const rippleInterval = this.isMoving ? 14 : 32;
            if (Math.floor(this.swimFrame) % rippleInterval === 0) {
                this.addWaterRipple(this.x, this.y + 10 + this.swimBob);
            }

            // Spawn paddle splashes when swimming
            if (this.isMoving && Math.floor(this.swimFrame) % 12 === 0) {
                const splashX = this.facingRight ? this.x - 10 : this.x + 10;
                this.createWaterSplashBurst(splashX, this.y + 8 + this.swimBob, 2);
            }
        } else {
            this.swimBob = 0;
        }

        // 1. Manual to AI Transition
        const now = Date.now();
        if (this.manualControl) {
            if (now - this.lastInputTime > 1200) {
                this.manualControl = false;
                this.aiTimer = 30;
                this.aiState = 'IDLE';
            }
        }

        // 2. AI Wander
        if (!this.manualControl) {
            this.updateAI(dtFactor);
        }

        // 3. Move Position with Collision
        const targetX = this.x + this.vx * dtFactor;
        const targetY = this.y + this.vy * dtFactor;

        if (this.terrain.isWall(targetX, this.y, this.width)) {
            this.vx = -this.vx;
            if (!this.manualControl) this.aiDirX = -this.aiDirX;
        } else {
            this.x = targetX;
        }

        if (this.terrain.isWall(this.x, targetY, this.height)) {
            this.vy = -this.vy;
            if (!this.manualControl) this.aiDirY = -this.aiDirY;
        } else {
            this.y = targetY;
        }

        this.isMoving = Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1;

        // Check door trigger zones while walking
        if (!this.isPickedUp) {
            if (this.currentScene === 'OUTDOOR' && this.terrain && typeof this.terrain.isHouseDoorTrigger === 'function' && this.terrain.isHouseDoorTrigger(this.x, this.y)) {
                if (typeof this.onEnterHouse === 'function') {
                    this.onEnterHouse();
                    return;
                }
            } else if (this.currentScene === 'HOUSE_INTERIOR' && this.terrain && typeof this.terrain.isDoorExitTrigger === 'function' && this.terrain.isDoorExitTrigger(this.x, this.y)) {
                if (typeof this.onExitHouse === 'function') {
                    this.onExitHouse();
                    return;
                }
            }
        }

        // 4. Jump & Drop Physics
        if (!this.isGrounded) {
            this.jumpY += this.jumpVelocity * dtFactor;
            this.jumpVelocity += this.gravity * dtFactor;

            if (this.jumpY >= 0) {
                this.jumpY = 0;
                this.jumpVelocity = 0;
                this.isGrounded = true;
                this.createDustBurst(this.x, this.y, 3);
                if (this.soundManager) this.soundManager.playFootstep();
            }
        }

        // 5. Spin Animation
        if (this.isSpinning) {
            this.spinAngle += 0.35 * dtFactor;
            if (this.spinAngle >= Math.PI * 2) {
                this.spinAngle = 0;
                this.isSpinning = false;
            }
        }

        // 6. Walking Dust Puffs
        if (this.isMoving && this.isGrounded) {
            this.walkFrame += dtFactor;
            if (Math.floor(this.walkFrame) % 7 === 0) {
                const offsetX = this.facingRight ? -14 : 14;
                this.addDustParticle(this.x + offsetX, this.y + 14);
                if (this.soundManager && Math.floor(this.walkFrame) % 21 === 0) {
                    this.soundManager.playFootstep();
                }
            }
        } else {
            this.walkFrame = 0;
        }

        // 7. Eye Blinking
        this.blinkTimer += dtFactor;
        if (this.eyeState === 'open') {
            if (this.blinkTimer >= this.blinkInterval) {
                this.eyeState = 'closed';
                this.closedFrames = 0;
                this.blinkTimer = 0;
                if (this.soundManager && Math.random() < 0.2) {
                    this.soundManager.playBlink();
                }
            }
        } else {
            this.closedFrames += dtFactor;
            if (this.closedFrames >= 8) {
                this.eyeState = 'open';
                this.blinkTimer = 0;
                this.blinkInterval = 140 + Math.random() * 220;
            }
        }

        // 8. Tail Wagging
        this.tailAngle = Math.sin(now * 0.008) * 0.35;

        // 9. Update Particles
        this.updateParticles(dtFactor);
    }

    updateAI(dtFactor) {
        // Step Neuromorphic SNN Brain
        if (this.brain) {
            const sensoryInput = {
                x: this.x,
                y: this.y,
                vx: this.vx,
                vy: this.vy,
                isMoving: this.isMoving,
                aiState: this.aiState,
                isGrounded: this.isGrounded,
                hunger: this.terrain ? this.terrain.hunger : 100,
                happy: this.terrain ? this.terrain.happiness : 100,
                energy: this.terrain ? this.terrain.energy : 100,
                isSwimming: this.isSwimming,
                isHeld: this.isPickedUp,
                inHouse: this.currentScene === 'HOUSE_INTERIOR',
                isFrightened: this.isFrightened || this.fearTimer > 0
            };

            const brainResult = this.brain.step(sensoryInput, this.queuedTextInput, dtFactor);
            this.queuedTextInput = null; // Clear queued text

            if (brainResult && brainResult.speechOutput) {
                this.showSpeechBubble(brainResult.speechOutput, 240, false);
            }

            if (brainResult && brainResult.motorOutput) {
                const mo = brainResult.motorOutput;
                if (mo.shouldJump && this.isGrounded && !this.isPickedUp) {
                    this.jumpVelocity = -4.2;
                    this.isGrounded = false;
                }

                // Neuromorphic SNN Motor Steering:
                // Aktivitas populasi neuron motorik (1800..1899) membelokkan arah eksplorasi pet
                if (this.aiState === 'WALK' && !this.isManualMoving && !this.isPickedUp) {
                    if (Math.abs(mo.dx) > 0.25) {
                        this.aiDirX = 0.65 * this.aiDirX + 0.35 * Math.sign(mo.dx);
                        this.facingRight = this.aiDirX >= 0;
                    }
                    if (Math.abs(mo.dy) > 0.25) {
                        this.aiDirY = 0.65 * this.aiDirY + 0.35 * Math.sign(mo.dy);
                    }
                }
            }
        }

        this.aiTimer -= dtFactor;

        // ====================================================
        // STATE 1: PANIK KETAKUTAN AMIGDALA (AKIBAT SUARA TEMBAKAN PISTOL)
        // ====================================================
        if (this.fearTimer > 0) {
            this.fearTimer -= dtFactor;
            this.isFrightened = true;
            this.aiState = 'PANIC_FLEE';

            // Kecepatan lari kabur maksimal (Sprint Panic)
            this.vx = this.aiDirX * this.fearEscapeSpeed;
            this.vy = this.aiDirY * this.fearEscapeSpeed;

            // Efek partikel debu lari panik
            if (Math.random() < 0.35 && this.isGrounded) {
                this.addDustParticle(this.x, this.y + 12);
            }

            // Jika mentok dinding/tepi, belok cepat ke arah lain agar terus kabur
            const worldW = this.terrain ? this.terrain.worldWidth : 2400;
            const worldH = this.terrain ? this.terrain.worldHeight : 1600;
            if (this.x < 100 || this.x > worldW - 100 || this.y < 100 || this.y > worldH - 100) {
                this.aiDirX = -this.aiDirX + (Math.random() - 0.5) * 0.5;
                this.aiDirY = -this.aiDirY + (Math.random() - 0.5) * 0.5;
                const d = Math.hypot(this.aiDirX, this.aiDirY) || 1;
                this.aiDirX /= d;
                this.aiDirY /= d;
                this.facingRight = this.aiDirX >= 0;
            }

            if (this.fearTimer <= 0) {
                this.isFrightened = false;
                this.aiState = 'IDLE';
                this.aiTimer = 50;
                if (this.terrain) {
                    this.terrain.updateMood();
                }
            }
            return;
        }

        // ====================================================
        // STATE 2: CURIOSITY DRIVE (STIMULUS AKTIF AGAR TIDAK PERNAH MALAS!)
        // Murni stimulus motorik eksplorasi tanpa kata-kata/teks buatan
        // ====================================================
        this.curiosityTimer += dtFactor;
        if (this.curiosityTimer >= this.curiosityInterval) {
            this.curiosityTimer = 0;

            // Lompatan kecil penuh antusias jika di tanah
            if (this.isGrounded && !this.isPickedUp && Math.random() < 0.6) {
                this.jumpVelocity = -4.8;
                this.isGrounded = false;
                this.createDustBurst(this.x, this.y, 2);
            }

            // Pacu eksplorasi aktif ke arah baru
            this.aiState = 'WALK';
            this.aiTimer = 80 + Math.floor(Math.random() * 80);
        }

        const worldW = this.terrain ? this.terrain.worldWidth : 2400;
        const worldH = this.terrain ? this.terrain.worldHeight : 1600;
        const minX = 70;
        const maxX = worldW - 70;
        const minY = 70;
        const maxY = worldH - 70;

        const nearEdge = this.x <= minX + 30 || this.x >= maxX - 30 || this.y <= minY + 30 || this.y >= maxY - 30;
        if (nearEdge && this.aiState === 'WALK' && this.aiTimer > 20) {
            // Steer away from outer edges towards center of world
            const centerX = worldW / 2;
            const centerY = worldH / 2;
            const dx = centerX - this.x;
            const dy = centerY - this.y;
            const dist = Math.hypot(dx, dy) || 1;
            this.aiDirX = dx / dist;
            this.aiDirY = dy / dist;
            this.facingRight = this.aiDirX >= 0;
            this.aiTimer = 60 + Math.floor(Math.random() * 60);
        }

        if (this.aiTimer <= 0) {
            const rand = Math.random();

            // 85% WAKTU AKTIF BERJALAN & MENJELAJAH (PET TIDAK MALAS)
            if (rand < 0.85 || this.aiState === 'IDLE') {
                this.aiState = 'WALK';
                this.aiTimer = 90 + Math.floor(Math.random() * 120); // 1.5 - 3.5 detik aktif jalan

                // Eksplorasi beragam: baik objek dekat maupun perjalanan jauh
                let targetX, targetY;
                if (Math.random() < 0.65) {
                    targetX = Math.max(minX, Math.min(maxX, this.x + (Math.random() - 0.5) * 500));
                    targetY = Math.max(minY, Math.min(maxY, this.y + (Math.random() - 0.5) * 450));
                } else {
                    targetX = minX + 120 + Math.random() * (maxX - minX - 240);
                    targetY = minY + 120 + Math.random() * (maxY - minY - 240);
                }

                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const dist = Math.hypot(dx, dy) || 1;

                this.aiDirX = dx / dist;
                this.aiDirY = dy / dist;

                if (this.aiDirX > 0.1) this.facingRight = true;
                if (this.aiDirX < -0.1) this.facingRight = false;
            } else {
                // Hentakan singkat mengendus/menyelidiki (HANYA 15-25 frame, TIDAK DIAM LAMA)
                this.aiDirX = 0;
                this.aiDirY = 0;

                if (rand < 0.93) {
                    // Sniff tanah/bunga dengan penasaran
                    this.aiState = 'SNIFF';
                    this.aiTimer = 18 + Math.floor(Math.random() * 15);
                    if (Math.random() < 0.5) this.facingRight = !this.facingRight;
                } else {
                    // Mini hop rasa ingin tahu
                    this.aiState = 'IDLE';
                    this.aiTimer = 15 + Math.floor(Math.random() * 12);
                    if (this.isGrounded && !this.isPickedUp) {
                        this.jumpVelocity = -3.8;
                        this.isGrounded = false;
                        this.createDustBurst(this.x, this.y, 2);
                    }
                }
            }
        }

        // Kecepatan jalan lebih gesit dan antusias
        this.vx = this.aiDirX * (this.speed * 1.1);
        this.vy = this.aiDirY * (this.speed * 1.1);
    }

    addDustParticle(x, y) {
        if (this.dustParticles.length >= this.maxDust) {
            this.dustParticles.shift();
        }
        this.dustParticles.push({
            x: x + (Math.random() * 4 - 2),
            y: y + (Math.random() * 3 - 1),
            size: 5 + Math.random() * 3,
            alpha: 0.8,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.2 - Math.random() * 0.2
        });
    }

    createDustBurst(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            if (this.dustParticles.length >= this.maxDust) {
                this.dustParticles.shift();
            }
            this.dustParticles.push({
                x: x + (Math.random() * 16 - 8),
                y: y + 14,
                size: 6 + Math.random() * 3,
                alpha: 0.85,
                vx: (Math.random() - 0.5) * 1.2,
                vy: -0.5 - Math.random() * 0.6
            });
        }
    }

    addWaterRipple(x, y) {
        if (this.waterRipples.length >= this.maxWaterRipples) {
            this.waterRipples.shift();
        }
        this.waterRipples.push({
            x: x,
            y: y,
            radius: 4,
            maxRadius: 22 + Math.random() * 10,
            alpha: 0.85,
            growth: 0.75 + Math.random() * 0.4
        });
    }

    createWaterSplashBurst(x, y, count = 6) {
        for (let i = 0; i < count; i++) {
            if (this.waterSplashes.length >= this.maxWaterSplashes) {
                this.waterSplashes.shift();
            }
            this.waterSplashes.push({
                x: x + (Math.random() * 14 - 7),
                y: y + (Math.random() * 6 - 3),
                size: 2.5 + Math.random() * 3,
                alpha: 0.95,
                vx: (Math.random() - 0.5) * 2.2,
                vy: -1.8 - Math.random() * 2.2,
                gravity: 0.18
            });
        }
    }

    createHeartParticles(x, y, count = 3, color = '#f43f5e') {
        for (let i = 0; i < count; i++) {
            if (this.heartParticles.length >= this.maxHearts) {
                this.heartParticles.shift();
            }
            this.heartParticles.push({
                x: x + (Math.random() * 20 - 10),
                y: y,
                alpha: 1,
                vy: -1.2 - Math.random() * 1.0,
                vx: (Math.random() - 0.5) * 0.6,
                color: color,
                scale: 0.8 + Math.random() * 0.4
            });
        }
    }

    updateParticles(dtFactor) {
        // 1. Dust particles
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const p = this.dustParticles[i];
            p.x += p.vx * dtFactor;
            p.y += p.vy * dtFactor;
            p.alpha -= 0.04 * dtFactor;
            p.size += 0.12 * dtFactor;
            if (p.alpha <= 0) {
                this.dustParticles.splice(i, 1);
            }
        }

        // 2. Heart particles
        for (let i = this.heartParticles.length - 1; i >= 0; i--) {
            const h = this.heartParticles[i];
            h.x += h.vx * dtFactor;
            h.y += h.vy * dtFactor;
            h.alpha -= 0.03 * dtFactor;
            if (h.alpha <= 0) {
                this.heartParticles.splice(i, 1);
            }
        }

        // 3. Water ripple rings
        for (let i = this.waterRipples.length - 1; i >= 0; i--) {
            const r = this.waterRipples[i];
            r.radius += r.growth * dtFactor;
            r.alpha -= (0.025 * (r.radius / r.maxRadius)) * dtFactor;
            if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                this.waterRipples.splice(i, 1);
            }
        }

        // 4. Water splash droplets
        for (let i = this.waterSplashes.length - 1; i >= 0; i--) {
            const s = this.waterSplashes[i];
            s.x += s.vx * dtFactor;
            s.y += s.vy * dtFactor;
            s.vy += s.gravity * dtFactor;
            s.alpha -= 0.035 * dtFactor;
            if (s.alpha <= 0) {
                this.waterSplashes.splice(i, 1);
            }
        }

        // 5. Obedience focus star particles
        for (let i = this.obedienceStarParticles.length - 1; i >= 0; i--) {
            const p = this.obedienceStarParticles[i];
            p.x += p.vx * dtFactor;
            p.y += p.vy * dtFactor;
            p.life -= dtFactor;
            p.alpha = Math.max(0, p.life / 60);
            if (p.life <= 0) {
                this.obedienceStarParticles.splice(i, 1);
            }
        }
    }

    render() {
        const ctx = this.ctx;

        // 1. Dust & Water ripples on ground/water surface
        this.renderDustParticles();
        this.renderWaterRipples();

        // 2. Ground / Water Shadow (subtle and shrinking if picked up)
        this.renderShadow();

        // 2b. Obedience Focus Halo & Glowing Ring (Behind/Under Cat)
        if (this.isObedientMode) {
            this.renderObedienceAura();
        }

        // 3. Cat Sprite
        ctx.save();
        ctx.translate(this.x, this.y + this.jumpY);

        if (this.isSpinning) {
            ctx.rotate(this.spinAngle);
        }

        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        this.drawCatSprite();
        ctx.restore();

        // 4. Water splash droplets (over cat)
        this.renderWaterSplashes();

        // 5. Hearts & Obedience Star Sparkles
        this.renderHearts();
        this.renderObedienceParticles();

        // 6. Floating Text Popups & Speech Bubble
        this.renderFloatingTexts();
        this.renderSpeechBubble();
    }

    renderObedienceAura() {
        const ctx = this.ctx;
        const now = Date.now();
        const pulse = Math.sin(now * 0.005) * 0.2 + 0.8;
        const headY = this.y + this.jumpY - 26 + (this.isSwimming ? -this.swimBob : 0);

        ctx.save();
        // Golden Focus Halo above head
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.75 * pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(this.x, headY, 14 * pulse, 5 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner halo glow
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.9 * pulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(this.x, headY, 12 * pulse, 4 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Crown/Star symbol above halo
        ctx.font = '8px monospace';
        ctx.fillStyle = `rgba(245, 158, 11, ${0.9 * pulse})`;
        ctx.textAlign = 'center';
        ctx.fillText('👑', this.x, headY - 4);
        ctx.restore();
    }

    renderObedienceParticles() {
        const ctx = this.ctx;
        for (const p of this.obedienceStarParticles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Tiny sparkle core
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(p.x - 0.5, p.y - 0.5, 1.2, 1.2);
            ctx.restore();
        }
    }

    renderShadow() {
        const ctx = this.ctx;
        let shadowScale = Math.max(0.4, 1 - Math.abs(this.jumpY) / 100);
        if (this.isPickedUp) {
            shadowScale = 0.5 + Math.sin(this.pickupFrame * 0.2) * 0.05;
        }

        if (this.isSwimming) {
            // Soft deep water shadow with gentle water caustics effect
            ctx.fillStyle = 'rgba(2, 44, 74, 0.45)';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + 14 + this.swimBob, 20 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = 'rgba(20, 60, 20, 0.35)';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + 19, 18 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderWaterRipples() {
        const ctx = this.ctx;
        for (const r of this.waterRipples) {
            ctx.save();
            ctx.strokeStyle = `rgba(186, 230, 253, ${r.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, r.radius * 1.5, r.radius * 0.65, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Inner highlight ripple ring
            if (r.radius > 6) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.65})`;
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.ellipse(r.x, r.y, (r.radius - 4) * 1.5, (r.radius - 4) * 0.65, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    renderWaterSplashes() {
        const ctx = this.ctx;
        for (const s of this.waterSplashes) {
            ctx.fillStyle = `rgba(186, 230, 253, ${s.alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();

            // Sparkle core
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fillRect(s.x - 0.5, s.y - 0.5, 1, 1);
        }
    }

    renderFloatingTexts() {
        const ctx = this.ctx;
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));

            // Shadow
            ctx.fillStyle = '#000000';
            ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

            // Colored text
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    renderSpeechBubble() {
        if (!this.speechBubble || !this.speechBubble.text) return;
        const sb = this.speechBubble;
        if (sb.alpha <= 0) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, sb.alpha));

        ctx.font = 'bold 8.5px "Press Start 2P", monospace';

        const text = sb.text;
        const metrics = ctx.measureText(text);
        const textWidth = Math.min(320, Math.max(36, metrics.width));

        // Position bubble above cat's head
        const headOffset = this.isSwimming ? -this.swimBob : 0;
        const bubbleX = this.x;
        const bubbleY = this.y + this.jumpY - 58 - headOffset;

        const padX = 10;
        const padY = 6;
        const boxWidth = textWidth + padX * 2;
        const boxHeight = 22;
        const boxLeft = bubbleX - boxWidth / 2;
        const boxTop = bubbleY - boxHeight / 2;

        const drawBubbleBox = (x, y, w, h, r) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };

        // 1. Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        drawBubbleBox(boxLeft + 2, boxTop + 2, boxWidth, boxHeight, 6);
        ctx.fill();

        // 2. Bubble background fill
        ctx.fillStyle = sb.isUser ? '#f3e8ff' : '#ffffff';
        drawBubbleBox(boxLeft, boxTop, boxWidth, boxHeight, 6);
        ctx.fill();

        // 3. Bubble border
        ctx.strokeStyle = sb.isUser ? '#7e22ce' : '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. Tail Pointer pointing down to pet head
        const tailX = bubbleX;
        const tailY = boxTop + boxHeight;

        ctx.fillStyle = sb.isUser ? '#f3e8ff' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(tailX - 5, tailY - 1);
        ctx.lineTo(tailX + 5, tailY - 1);
        ctx.lineTo(tailX, tailY + 6);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = sb.isUser ? '#7e22ce' : '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tailX - 5, tailY);
        ctx.lineTo(tailX, tailY + 6);
        ctx.lineTo(tailX + 5, tailY);
        ctx.stroke();

        // 5. Text content inside bubble
        ctx.fillStyle = sb.isUser ? '#581c87' : '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, bubbleX, boxTop + boxHeight / 2 + 0.5);

        ctx.restore();
    }

    renderDustParticles() {
        const ctx = this.ctx;
        for (const p of this.dustParticles) {
            ctx.fillStyle = `rgba(196, 178, 155, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderHearts() {
        const ctx = this.ctx;
        for (const h of this.heartParticles) {
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.scale(h.scale, h.scale);
            ctx.fillStyle = h.color;
            ctx.globalAlpha = h.alpha;

            // Pixel Heart
            ctx.fillRect(-3, -2, 2, 2);
            ctx.fillRect(1, -2, 2, 2);
            ctx.fillRect(-4, -1, 8, 3);
            ctx.fillRect(-3, 2, 6, 2);
            ctx.fillRect(-2, 4, 4, 1);
            ctx.fillRect(-1, 5, 2, 1);

            ctx.restore();
        }
    }

    drawCatSprite() {
        const ctx = this.ctx;
        const now = Date.now();
        const walkCycle = this.walkFrame * 0.45;
        const isMoving = this.isMoving;

        // Synchronized bipedal animation factors
        let legStep = isMoving ? Math.sin(walkCycle) * 4 : 0;
        let bodyBob = isMoving ? Math.abs(Math.sin(walkCycle)) * 1.5 : Math.sin(now * 0.003) * 0.8;
        let headBob = isMoving ? Math.sin(walkCycle) * 1.0 : Math.sin(now * 0.003 + 0.4) * 0.6;

        // Arm swing & pose calculations
        let leftArmAngle = 0;
        let rightArmAngle = 0;
        const shoulderY = -1 - bodyBob;

        if (this.isFrightened) {
            // STATE KETAKUTAN TEMBAKAN PISTOL (AMIGDALA PANIK TAKUT MATI):
            // Kaki sprint kocar-kacir, tangan terangkat histeris, tubuh gemetar ketakutan!
            legStep = Math.sin(walkCycle * 2.2) * 6;
            leftArmAngle = -2.6 + Math.sin(now * 0.04) * 0.3;
            rightArmAngle = 2.6 - Math.sin(now * 0.04) * 0.3;
            const shiver = (Math.random() - 0.5) * 2.5;
            bodyBob = Math.abs(Math.sin(walkCycle * 2.2)) * 2 + shiver;
            headBob = Math.sin(walkCycle * 2.2) * 1.5 + shiver;
        } else if (this.isPickedUp) {
            // STATE DIANGKAT (PICKED UP): Kaki & tangan mengayun kaget di udara!
            legStep = Math.sin(this.pickupFrame * 0.4) * 6;
            leftArmAngle = -2.1 + Math.sin(this.pickupFrame * 0.35) * 0.4;
            rightArmAngle = 2.1 - Math.sin(this.pickupFrame * 0.35) * 0.4;
            headBob = Math.sin(this.pickupFrame * 0.3) * 1.2;
            bodyBob = Math.sin(this.pickupFrame * 0.25) * 0.6;
        } else if (this.isSwimming) {
            // STATE BERENANG (SWIMMING): Bobbing on water waves, animated paddle arms & leg kicks!
            bodyBob = this.swimBob;
            headBob = this.swimBob * 0.85;
            legStep = Math.sin(this.swimFrame * 0.32) * 5;

            // Cute doggy-paddle arm motion forward and backward!
            const paddleCycle = this.swimFrame * 0.26;
            leftArmAngle = Math.sin(paddleCycle) * 0.85 + 0.4;
            rightArmAngle = -Math.sin(paddleCycle) * 0.85 + 0.4;
        } else if (!this.isGrounded) {
            // Jumping: both hands joyfully raised up high on both sides!
            leftArmAngle = -2.4;
            rightArmAngle = 2.4;
        } else if (this.isSpinning) {
            // Spinning Act: arms spread out wide celebrating
            leftArmAngle = -1.4;
            rightArmAngle = 1.4;
        } else if (isMoving) {
            // Walking: natural bipedal arm swing opposing legs
            leftArmAngle = Math.sin(walkCycle) * 0.55;
            rightArmAngle = -Math.sin(walkCycle) * 0.55;
        } else {
            // Idle: both arms resting cutely and symmetrically on left and right flanks
            const idleBreathe = Math.sin(now * 0.003) * 0.05;
            leftArmAngle = 0.12 + idleBreathe;
            rightArmAngle = -0.12 - idleBreathe;
        }

        // ==========================================
        // 1. EKOR (TAIL) - Attached to lower back
        // ==========================================
        this.drawTail(ctx, -10, (this.isSwimming ? 3 : 5) - bodyBob);

        // ==========================================
        // 2. 2 KAKI (2 BIPEDAL LEGS & FEET)
        // ==========================================
        this.drawLegs(ctx, legStep, bodyBob);

        // ==========================================
        // 3. BADAN (TORSO & WHITE BELLY)
        // ==========================================
        this.drawTorso(ctx, bodyBob);

        // ==========================================
        // 3b. PELAMPUNG & BUSA AIR (SWIM FLOAT & WATER FOAM IF SWIMMING)
        // ==========================================
        if (this.isSwimming) {
            this.drawSwimFloat(ctx, bodyBob);
        }

        // ==========================================
        // 4. KEPALA (HEAD, EARS, ANIME EYES, BLUSH)
        // ==========================================
        this.drawHead(ctx, headBob);

        // ==========================================
        // 5. 2 TANGAN (LEFT & RIGHT ARMS SYMMETRICALLY ON FLANKS)
        // ==========================================
        // Left Arm (on left flank of body)
        this.drawArm(ctx, -11, shoulderY, leftArmAngle, true);
        // Right Arm (on right flank of body)
        this.drawArm(ctx, 11, shoulderY, rightArmAngle, false);
    }

    // ====================================================
    // SUB-ROUTINE: PELAMPUNG RENANG & BUSA AIR (SWIM FLOAT)
    // ====================================================
    drawSwimFloat(ctx, bodyBob) {
        const floatY = 4 - bodyBob;

        // 1. Water Ripple & Foam Ring (Around waist contact line)
        const waveOffset = Math.sin(this.swimFrame * 0.2) * 2;
        ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
        ctx.fillRect(-17 + waveOffset, floatY + 3, 34, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-13 - waveOffset, floatY + 4, 26, 2);

        // 2. Adorable Inflatable Swim Float / Donut Lifebuoy (Yellow & Pink Ring)
        // Float Outer Border
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-16, floatY - 3, 32, 10);

        // Float Main Golden Yellow Tube
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-15, floatY - 2, 30, 8);

        // Float Bright Highlight (Top surface)
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(-14, floatY - 2, 28, 2);

        // Coral Pink / Red Decorative Stripes
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(-11, floatY - 2, 5, 8);
        ctx.fillRect(6, floatY - 2, 5, 8);

        // White Sparkle Highlights on Float
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, floatY - 2, 2, 2);
        ctx.fillRect(7, floatY - 2, 2, 2);

        // Cute Mini Rubber Duck Head on Front of Float
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(13, floatY - 4, 6, 6);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(14, floatY - 3, 4, 4);

        // Duck Orange Bill
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(18, floatY - 2, 3, 3);

        // Duck Tiny Pixel Eye
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(15, floatY - 3, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(15, floatY - 3, 1, 1);
    }

    // ====================================================
    // SUB-ROUTINE: EKOR (TAIL)
    // ====================================================
    drawTail(ctx, originX, originY) {
        ctx.save();
        ctx.translate(originX, originY);
        ctx.rotate(this.tailAngle);

        // Tail Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-12, -4, 13, 8);
        ctx.fillRect(-14, -2, 4, 6);

        // Orange Base Fur
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(-10, -2, 9, 5);

        // Fluffy White Tail Tip
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-13, -2, 4, 5);

        ctx.restore();
    }

    // ====================================================
    // SUB-ROUTINE: 2 TANGAN (CHIBI ARMS & CUTE WHITE PAWS)
    // ====================================================
    drawArm(ctx, shoulderX, shoulderY, angle, isLeft) {
        ctx.save();
        ctx.translate(shoulderX, shoulderY);
        ctx.rotate(angle);

        const offsetX = isLeft ? -2 : -3;

        // Proportional chibi arm: ~8px total length
        // Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(offsetX, 0, 5, 8);
        ctx.fillRect(offsetX + 1, 8, 3, 2);

        // Orange Upper Arm
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(offsetX + 1, 1, 3, 4);

        // Round White Paw / Hand
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX, 4, 5, 4);

        // Tiny Pink Paw Pad
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(offsetX + 1, 5, 3, 2);

        ctx.restore();
    }

    // ====================================================
    // SUB-ROUTINE: 2 KAKI (LEGS & FEET)
    // ====================================================
    drawLegs(ctx, legStep, bodyBob) {
        const baseY = 10 - bodyBob;

        // Left Leg & Paw (Back Leg)
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-9, baseY + legStep, 7, 9);
        ctx.fillStyle = '#d96411';
        ctx.fillRect(-8, baseY + legStep + 1, 5, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, baseY + legStep + 5, 5, 4);

        // Right Leg & Paw (Front Leg)
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(2, baseY - legStep, 7, 9);
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(3, baseY - legStep + 1, 5, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3, baseY - legStep + 5, 5, 4);
    }

    // ====================================================
    // SUB-ROUTINE: BADAN (TORSO / BODY)
    // ====================================================
    drawTorso(ctx, bodyBob) {
        const topY = -3 - bodyBob;
        const width = 22;
        const height = 15;
        const leftX = -11;

        // Torso Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(leftX, topY, width, height);
        // Rounded pixel corners
        ctx.clearRect(leftX, topY, 1, 1);
        ctx.clearRect(leftX + width - 1, topY, 1, 1);
        ctx.clearRect(leftX, topY + height - 1, 1, 1);
        ctx.clearRect(leftX + width - 1, topY + height - 1, 1, 1);

        // Main Orange Fur Body
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(leftX + 2, topY + 1, width - 4, height - 2);

        // Body Highlight (Top)
        ctx.fillStyle = '#ffa756';
        ctx.fillRect(leftX + 2, topY + 1, width - 4, 2);

        // Body Shadow (Bottom)
        ctx.fillStyle = '#c0520b';
        ctx.fillRect(leftX + 2, topY + height - 3, width - 4, 2);

        // White Tummy / Belly Patch (Centered)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, topY + 2, 8, height - 3);

        // Tummy Shadow (Bottom of belly)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-4, topY + height - 3, 8, 2);
    }

    // ====================================================
    // SUB-ROUTINE: KEPALA (HEAD, EARS, EYES, NOSE, BLUSH)
    // ====================================================
    drawHead(ctx, headBob) {
        const headTopY = -24 - headBob;
        const headW = 30;
        const headH = 21;
        const headX = -15;

        // ----- CAT EARS (On top of head) -----
        // Left Ear
        ctx.fillStyle = '#1e0c05';
        ctx.beginPath();
        ctx.moveTo(-14, headTopY);
        ctx.lineTo(-9, headTopY - 11);
        ctx.lineTo(-3, headTopY);
        ctx.fill();

        ctx.fillStyle = '#f57c20';
        ctx.beginPath();
        ctx.moveTo(-13, headTopY);
        ctx.lineTo(-9, headTopY - 9);
        ctx.lineTo(-4, headTopY);
        ctx.fill();

        ctx.fillStyle = '#ffb3c1';
        ctx.fillRect(-10, headTopY - 7, 3, 5);

        // Right Ear
        ctx.fillStyle = '#1e0c05';
        ctx.beginPath();
        ctx.moveTo(3, headTopY);
        ctx.lineTo(9, headTopY - 11);
        ctx.lineTo(14, headTopY);
        ctx.fill();

        ctx.fillStyle = '#f57c20';
        ctx.beginPath();
        ctx.moveTo(4, headTopY);
        ctx.lineTo(9, headTopY - 9);
        ctx.lineTo(13, headTopY);
        ctx.fill();

        ctx.fillStyle = '#ffb3c1';
        ctx.fillRect(7, headTopY - 7, 3, 5);

        // ----- HEAD BASE -----
        // Head Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(headX, headTopY, headW, headH);
        // Rounded corners
        ctx.clearRect(headX, headTopY, 2, 2);
        ctx.clearRect(headX + headW - 2, headTopY, 2, 2);
        ctx.clearRect(headX, headTopY + headH - 2, 2, 2);
        ctx.clearRect(headX + headW - 2, headTopY + headH - 2, 2, 2);

        // Main Orange Fur
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(headX + 2, headTopY + 2, headW - 4, headH - 4);

        // Head Top Highlight
        ctx.fillStyle = '#ffa756';
        ctx.fillRect(headX + 3, headTopY + 2, headW - 6, 2);

        // Head Bottom Chin Shadow
        ctx.fillStyle = '#c0520b';
        ctx.fillRect(headX + 2, headTopY + headH - 3, headW - 4, 2);

        // White Face Stripe / Muzzle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, headTopY + 3, 8, headH - 4);

        // ----- SPARKLING ANIME EYES -----
        const eyeY = headTopY + 9;
        this.renderCatEye(ctx, -7, eyeY);
        this.renderCatEye(ctx, 7, eyeY);

        // ----- NOSE & MOUTH -----
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-1, headTopY + 14, 2, 2); // Black nose
        ctx.fillStyle = '#d96411';
        ctx.fillRect(-1, headTopY + 16, 2, 1); // Tiny mouth line

        // ----- CHEERFUL BLUSH CHEEKS -----
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.fillRect(-11, headTopY + 12, 3, 2);
        ctx.fillRect(8, headTopY + 12, 3, 2);

        // ----- SURPRISED SWEAT DROP IF PICKED UP -----
        if (this.isPickedUp) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(headX + headW + 2, headTopY + 4, 2.5, 4, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(headX + headW + 1, headTopY + 2, 1, 1);
        }

        // ----- RETRO SWIM GOGGLES (ON FOREHEAD IF SWIMMING) -----
        if (this.isSwimming) {
            const goggleY = headTopY + 3;
            // Elastic Strap around head
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(headX + 1, goggleY + 1, headW - 2, 2);

            // Left Goggle Frame & Glass
            ctx.fillStyle = '#0369a1';
            ctx.fillRect(-11, goggleY - 1, 9, 6);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-10, goggleY, 7, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-9, goggleY, 2, 2);

            // Right Goggle Frame & Glass
            ctx.fillStyle = '#0369a1';
            ctx.fillRect(2, goggleY - 1, 9, 6);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(3, goggleY, 7, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(4, goggleY, 2, 2);

            // Goggle Nose Bridge
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-2, goggleY + 1, 4, 2);
        }
    }

    renderCatEye(ctx, x, y) {
        const w = 8;
        const h = 9;

        if (this.isFrightened) {
            // MATA PANIK KETAKUTAN EKSTREM: Putih mata melebar, pupil hitam kecil bergetar, air mata panik
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x - 4, y - 5, w + 2, h + 2); // Border mata lebar

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 3, y - 4, w, h); // Sclera putih lebar

            // Pinprick shock pupil hitam kecil panik bergetar
            const pupilJitterX = (Math.random() - 0.5) * 1.5;
            const pupilJitterY = (Math.random() - 0.5) * 1.5;
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x - 1 + pupilJitterX, y - 1 + pupilJitterY, 3, 3);

            // Tetesan air mata panik biru muda di sudut mata bawah
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x - 3, y + 4, 2, 3);
        } else if (this.isPickedUp) {
            // Surprised Wide Eye Expression O_O
            ctx.fillStyle = '#10172a';
            ctx.fillRect(x - 3, y - 4, w, h);

            ctx.fillStyle = '#0f294d';
            ctx.fillRect(x - 2, y - 3, w - 2, h - 2);

            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x - 2, y, w - 2, 3);

            // Wide Round Sparkle Center
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 2, y - 3, 3, 3);
            ctx.fillRect(x + 1, y + 1, 1, 1);
        } else if (this.eyeState === 'open') {
            // Eye Outline
            ctx.fillStyle = '#10172a';
            ctx.fillRect(x - 3, y - 4, w, h);

            // Deep Navy Top Iris
            ctx.fillStyle = '#0f294d';
            ctx.fillRect(x - 2, y - 3, w - 2, h - 2);

            // Vibrant Cyan Bottom Iris
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x - 2, y, w - 2, 3);

            // Big White Sparkle
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 2, y - 3, 2, 2);

            // Small White Secondary Sparkle
            ctx.fillRect(x + 1, y + 1, 1, 1);
        } else {
            // Closed Eye (Happy Curved Arc `^`)
            ctx.fillStyle = '#10172a';
            ctx.fillRect(x - 3, y, w, 2);
            ctx.fillRect(x - 1, y - 2, w - 4, 2);
        }
    }
}
