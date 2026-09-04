/* ===================================
   PET-ENHANCED.JS - Adorable Pixel Art Cat
   Optimized with Particle Pooling & Delta-Time for 60 FPS
   =================================== */

export class PetEnhanced {
    constructor(canvas, terrain, startX, startY, soundManager = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.terrain = terrain;
        this.soundManager = soundManager;

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
        if (this.isGrounded) {
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
        if (this.terrain) this.terrain.addExp(8);
        if (this.soundManager) this.soundManager.playAct();
    }

    update(dtFactor = 1.0) {
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

        // 4. Jump Physics
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

        // 5. Spin Animation (Act B Key)
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

        // 7. Coin Pickup Check
        if (this.terrain.checkCoinPickup(this.x, this.y)) {
            if (this.soundManager) this.soundManager.playCoin();
            this.createHeartParticles(this.x, this.y - 25, 3, '#fde047');
        }

        // 8. Eye Blinking
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

        // 9. Tail Wagging
        this.tailAngle = Math.sin(now * 0.008) * 0.35;

        // 10. Update Particles
        this.updateParticles(dtFactor);
    }

    updateAI(dtFactor) {
        this.aiTimer -= dtFactor;
        if (this.aiTimer <= 0) {
            if (this.aiState === 'IDLE') {
                this.aiState = 'WALK';
                this.aiTimer = 80 + Math.floor(Math.random() * 100);
                const angles = [0, 45, 90, 135, 180, 225, 270, 315];
                const angle = (angles[Math.floor(Math.random() * angles.length)] * Math.PI) / 180;
                this.aiDirX = Math.cos(angle);
                this.aiDirY = Math.sin(angle);
                if (this.aiDirX > 0) this.facingRight = true;
                if (this.aiDirX < 0) this.facingRight = false;
            } else {
                this.aiState = 'IDLE';
                this.aiTimer = 50 + Math.floor(Math.random() * 80);
                this.aiDirX = 0;
                this.aiDirY = 0;
            }
        }

        this.vx = this.aiDirX * (this.speed * 0.7);
        this.vy = this.aiDirY * (this.speed * 0.7);
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

        for (let i = this.heartParticles.length - 1; i >= 0; i--) {
            const h = this.heartParticles[i];
            h.x += h.vx * dtFactor;
            h.y += h.vy * dtFactor;
            h.alpha -= 0.03 * dtFactor;
            if (h.alpha <= 0) {
                this.heartParticles.splice(i, 1);
            }
        }
    }

    render() {
        const ctx = this.ctx;

        // 1. Dust Particles
        this.renderDustParticles();

        // 2. Ground Shadow
        this.renderShadow();

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

        // 4. Hearts / Sparkles
        this.renderHearts();
    }

    renderShadow() {
        const ctx = this.ctx;
        const shadowScale = Math.max(0.4, 1 - Math.abs(this.jumpY) / 100);
        ctx.fillStyle = 'rgba(20, 60, 20, 0.4)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 19, 18 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
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
        const legStep = isMoving ? Math.sin(walkCycle) * 4 : 0;
        const bodyBob = isMoving ? Math.abs(Math.sin(walkCycle)) * 1.5 : Math.sin(now * 0.003) * 0.8;
        const headBob = isMoving ? Math.sin(walkCycle) * 1.0 : Math.sin(now * 0.003 + 0.4) * 0.6;

        // Arm swing & pose calculations
        let backArmAngle = 0;
        let frontArmAngle = 0;
        let armOffsetY = -bodyBob;

        if (!this.isGrounded) {
            // Jumping: both hands joyfully raised up high!
            backArmAngle = -2.2;
            frontArmAngle = -2.4;
            armOffsetY -= 2;
        } else if (this.isSpinning) {
            // Spinning Act (B): arms spread out wide celebrating
            backArmAngle = -1.4;
            frontArmAngle = 1.4;
        } else if (isMoving) {
            // Walking: natural arm swing opposing legs
            backArmAngle = Math.sin(walkCycle) * 0.65;
            frontArmAngle = -Math.sin(walkCycle) * 0.65;
        } else {
            // Idle: front paw resting cutely on chest/belly, back paw slightly back
            const idleBreathe = Math.sin(now * 0.003) * 0.08;
            backArmAngle = 0.25 + idleBreathe;
            frontArmAngle = -0.35 - idleBreathe; // bent forward cutely onto chest
        }

        // ==========================================
        // 1. EKOR (TAIL) - Attached to lower back
        // ==========================================
        this.drawTail(ctx, -10, 5 - bodyBob);

        // ==========================================
        // 2. LENGAN BELAKANG (BACK ARM & PAW) - Behind body
        // ==========================================
        this.drawArm(ctx, -5, 0 + armOffsetY, backArmAngle, true);

        // ==========================================
        // 3. 2 KAKI (2 BIPEDAL LEGS & FEET)
        // ==========================================
        this.drawLegs(ctx, legStep, bodyBob);

        // ==========================================
        // 4. BADAN (TORSO & WHITE BELLY)
        // ==========================================
        this.drawTorso(ctx, bodyBob);

        // ==========================================
        // 5. KEPALA (HEAD, EARS, ANIME EYES, BLUSH)
        // ==========================================
        this.drawHead(ctx, headBob);

        // ==========================================
        // 6. LENGAN DEPAN (FRONT ARM & PAW) - In front of torso
        // ==========================================
        this.drawArm(ctx, 4, 0 + armOffsetY, frontArmAngle, false);
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
    drawArm(ctx, shoulderX, shoulderY, angle, isBackArm) {
        ctx.save();
        ctx.translate(shoulderX, shoulderY);
        ctx.rotate(angle);

        // Proportional chibi arm: ~8px total length
        // Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-2, 0, 5, 8);
        ctx.fillRect(-1, 8, 3, 2);

        // Orange Upper Arm
        ctx.fillStyle = isBackArm ? '#d96411' : '#f57c20';
        ctx.fillRect(-1, 1, 3, 4);

        // Round White Paw / Hand
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, 4, 5, 4);

        // Tiny Pink Paw Pad on front arm
        if (!isBackArm) {
            ctx.fillStyle = '#fda4af';
            ctx.fillRect(-1, 5, 3, 2);
        }

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
    }

    renderCatEye(ctx, x, y) {
        const w = 8;
        const h = 9;

        if (this.eyeState === 'open') {
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
