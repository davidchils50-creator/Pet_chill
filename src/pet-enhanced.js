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
        ctx.ellipse(this.x, this.y + 16, 18 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
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
        const legStep = Math.sin(this.walkFrame * 0.5) * 4;

        // Tail
        ctx.save();
        ctx.translate(-18, 2);
        ctx.rotate(this.tailAngle);

        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-11, -4, 12, 8);
        ctx.fillRect(-13, -2, 4, 6);

        ctx.fillStyle = '#f57c20';
        ctx.fillRect(-9, -2, 8, 5);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-12, -2, 4, 5);
        ctx.restore();

        // ==================== LEFT ARM & HAND (BACK ARM) ====================
        ctx.save();
        let leftArmAngle = 0;
        let leftArmX = -13;
        let leftArmY = 0;

        if (!this.isGrounded) {
            // Both hands raised up in joy while jumping!
            leftArmAngle = -0.7;
            leftArmY = -5;
            leftArmX = -12;
        } else if (this.isSpinning) {
            leftArmAngle = -0.85;
            leftArmY = -5;
        } else if (this.isMoving) {
            leftArmAngle = Math.sin(this.walkFrame * 0.5) * 0.45;
            leftArmY = Math.sin(this.walkFrame * 0.5) * 2;
        } else {
            leftArmAngle = Math.sin(Date.now() * 0.005) * 0.08;
        }

        ctx.translate(leftArmX, leftArmY);
        ctx.rotate(leftArmAngle);

        // Left Arm Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-3, 0, 7, 10);
        // Orange Arm Fur
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(-2, 1, 5, 5);
        // White Paw / Hand
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, 6, 5, 3);
        ctx.restore();

        // ==================== 2 WALKING LEGS / FEET ====================
        // Left Leg / Foot
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-12, 12 + legStep, 9, 8);
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(-11, 13 + legStep, 7, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-11, 16 + legStep, 7, 3);

        // Right Leg / Foot
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(3, 12 - legStep, 9, 8);
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(4, 13 - legStep, 7, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 16 - legStep, 7, 3);

        // ==================== BODY & HEAD ====================
        // Body Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-19, -15, 38, 28);
        ctx.clearRect(-19, -15, 2, 2);
        ctx.clearRect(17, -15, 2, 2);
        ctx.clearRect(-19, 11, 2, 2);
        ctx.clearRect(17, 11, 2, 2);

        // Orange Body
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(-17, -13, 34, 24);

        // Highlight & Shadow
        ctx.fillStyle = '#ffa756';
        ctx.fillRect(-15, -13, 30, 3);
        ctx.fillStyle = '#c0520b';
        ctx.fillRect(-17, 7, 34, 4);

        // White Chest & Face
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -13, 14, 24);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-3, 7, 14, 4);

        // ==================== RIGHT ARM & HAND (FRONT ARM) ====================
        ctx.save();
        let rightArmAngle = 0;
        let rightArmX = 8;
        let rightArmY = 0;

        if (!this.isGrounded) {
            // Both hands raised up in joy!
            rightArmAngle = 0.7;
            rightArmY = -5;
            rightArmX = 9;
        } else if (this.isSpinning) {
            rightArmAngle = 0.85;
            rightArmY = -5;
        } else if (this.isMoving) {
            rightArmAngle = -Math.sin(this.walkFrame * 0.5) * 0.45;
            rightArmY = -Math.sin(this.walkFrame * 0.5) * 2;
        } else {
            rightArmAngle = -Math.sin(Date.now() * 0.005) * 0.08;
        }

        ctx.translate(rightArmX, rightArmY);
        ctx.rotate(rightArmAngle);

        // Right Arm Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-2, 0, 7, 10);
        // Orange Arm Fur
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(-1, 1, 5, 5);
        // White Paw / Hand
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, 6, 5, 3);
        // Tiny cute pink paw pad
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(0, 7, 3, 1);
        ctx.restore();

        // Ears
        ctx.fillStyle = '#1e0c05';
        ctx.beginPath();
        ctx.moveTo(-16, -15);
        ctx.lineTo(-10, -28);
        ctx.lineTo(-3, -15);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(3, -15);
        ctx.lineTo(10, -28);
        ctx.lineTo(16, -15);
        ctx.fill();

        ctx.fillStyle = '#f57c20';
        ctx.beginPath();
        ctx.moveTo(-15, -15);
        ctx.lineTo(-10, -26);
        ctx.lineTo(-4, -15);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(4, -15);
        ctx.lineTo(10, -26);
        ctx.lineTo(15, -15);
        ctx.fill();

        ctx.fillStyle = '#ffb3c1';
        ctx.fillRect(-11, -22, 3, 7);
        ctx.fillRect(8, -22, 3, 7);

        // Anime Eyes
        this.renderCatEye(-8, -2);
        this.renderCatEye(8, -2);

        // Nose & Blush
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(2, 4, 3, 2);

        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.fillRect(-13, 3, 4, 3);
        ctx.fillRect(12, 3, 4, 3);
    }

    renderCatEye(x, y) {
        const ctx = this.ctx;
        const w = 9;
        const h = 11;

        if (this.eyeState === 'open') {
            ctx.fillStyle = '#10172a';
            ctx.fillRect(x - 4, y - 5, w, h);

            ctx.fillStyle = '#0f294d';
            ctx.fillRect(x - 3, y - 4, w - 2, h - 2);

            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x - 3, y, w - 2, 4);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 3, y - 4, 3, 3);
            ctx.fillRect(x + 1, y + 1, 2, 2);
        } else {
            ctx.fillStyle = '#10172a';
            ctx.fillRect(x - 4, y, w, 2);
            ctx.fillRect(x - 2, y - 2, w - 4, 2);
        }
    }
}
