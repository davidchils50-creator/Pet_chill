/* ===================================
   PET-ENHANCED.JS - Adorable Pixel Art Cat
   Exact match to the orange & white anime-eyed cat in screenshot
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

        // Dust Particle System (Puffs behind feet like in screenshot)
        this.dustParticles = [];
        // Heart / Star particles for Act (B key)
        this.heartParticles = [];
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
            this.createDustBurst(this.x, this.y, 5);
            if (this.soundManager) this.soundManager.playJump();
        }
    }

    act() {
        // Happy spin + meow + hearts effect + EXP
        this.isSpinning = true;
        this.spinAngle = 0;
        this.createHeartParticles(this.x, this.y - 30);
        if (this.terrain) this.terrain.addExp(8);
        if (this.soundManager) this.soundManager.playAct();
    }

    update() {
        // 1. Handle Manual vs AI Wander Transition
        const now = Date.now();
        if (this.manualControl) {
            if (now - this.lastInputTime > 1200) {
                // Return to AI Wander after 1.2 seconds of no keypress
                this.manualControl = false;
                this.aiTimer = 30;
                this.aiState = 'IDLE';
            }
        }

        // 2. AI Wander if not manually controlled
        if (!this.manualControl) {
            this.updateAI();
        }

        // 3. Move Position & Collision Detection
        const targetX = this.x + this.vx;
        const targetY = this.y + this.vy;

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
            this.jumpY += this.jumpVelocity;
            this.jumpVelocity += this.gravity;

            if (this.jumpY >= 0) {
                this.jumpY = 0;
                this.jumpVelocity = 0;
                this.isGrounded = true;
                this.createDustBurst(this.x, this.y, 4);
                if (this.soundManager) this.soundManager.playFootstep();
            }
        }

        // 5. Spin Animation (Act B Key)
        if (this.isSpinning) {
            this.spinAngle += 0.35;
            if (this.spinAngle >= Math.PI * 2) {
                this.spinAngle = 0;
                this.isSpinning = false;
            }
        }

        // 6. Walking Dust Puffs (Screenshot feature: puffs behind moving cat)
        if (this.isMoving && this.isGrounded) {
            this.walkFrame++;
            if (this.walkFrame % 6 === 0) {
                const offsetX = this.facingRight ? -14 : 14;
                this.addDustParticle(this.x + offsetX, this.y + 14);
                if (this.soundManager && this.walkFrame % 18 === 0) {
                    this.soundManager.playFootstep();
                }
            }
        } else {
            this.walkFrame = 0;
        }

        // 7. Check Coin Pickup
        if (this.terrain.checkCoinPickup(this.x, this.y)) {
            if (this.soundManager) this.soundManager.playCoin();
            this.createHeartParticles(this.x, this.y - 25, 3, '#fde047');
        }

        // 8. Eye Blinking Logic
        this.blinkTimer++;
        if (this.eyeState === 'open') {
            if (this.blinkTimer >= this.blinkInterval) {
                this.eyeState = 'closed';
                this.closedFrames = 0;
                this.blinkTimer = 0;
                if (this.soundManager && Math.random() < 0.25) {
                    this.soundManager.playBlink();
                }
            }
        } else {
            this.closedFrames++;
            if (this.closedFrames >= 8) {
                this.eyeState = 'open';
                this.blinkTimer = 0;
                this.blinkInterval = 140 + Math.random() * 220;
            }
        }

        // 9. Tail Wagging
        this.tailAngle = Math.sin(Date.now() * 0.008) * 0.35;

        // 10. Update Particles
        this.updateParticles();
    }

    updateAI() {
        this.aiTimer--;
        if (this.aiTimer <= 0) {
            if (this.aiState === 'IDLE') {
                // Switch to Walk
                this.aiState = 'WALK';
                this.aiTimer = 90 + Math.floor(Math.random() * 120); // 1.5 - 3.5 sec
                const angles = [0, 45, 90, 135, 180, 225, 270, 315];
                const angle = (angles[Math.floor(Math.random() * angles.length)] * Math.PI) / 180;
                this.aiDirX = Math.cos(angle);
                this.aiDirY = Math.sin(angle);
                if (this.aiDirX > 0) this.facingRight = true;
                if (this.aiDirX < 0) this.facingRight = false;
            } else {
                // Switch to Idle
                this.aiState = 'IDLE';
                this.aiTimer = 60 + Math.floor(Math.random() * 90); // 1 - 2.5 sec
                this.aiDirX = 0;
                this.aiDirY = 0;
            }
        }

        this.vx = this.aiDirX * (this.speed * 0.7);
        this.vy = this.aiDirY * (this.speed * 0.7);
    }

    addDustParticle(x, y) {
        this.dustParticles.push({
            x: x + (Math.random() * 4 - 2),
            y: y + (Math.random() * 3 - 1),
            size: 5 + Math.random() * 4,
            alpha: 0.8,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.2 - Math.random() * 0.3
        });
    }

    createDustBurst(x, y, count = 4) {
        for (let i = 0; i < count; i++) {
            this.dustParticles.push({
                x: x + (Math.random() * 16 - 8),
                y: y + 14 + (Math.random() * 4 - 2),
                size: 6 + Math.random() * 4,
                alpha: 0.9,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -0.5 - Math.random() * 0.8
            });
        }
    }

    createHeartParticles(x, y, count = 4, color = '#f43f5e') {
        for (let i = 0; i < count; i++) {
            this.heartParticles.push({
                x: x + (Math.random() * 20 - 10),
                y: y,
                alpha: 1,
                vy: -1.2 - Math.random() * 1.2,
                vx: (Math.random() - 0.5) * 0.8,
                color: color,
                scale: 0.8 + Math.random() * 0.5
            });
        }
    }

    updateParticles() {
        // Dust
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const p = this.dustParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.035;
            p.size += 0.15;
            if (p.alpha <= 0) {
                this.dustParticles.splice(i, 1);
            }
        }

        // Hearts / Stars
        for (let i = this.heartParticles.length - 1; i >= 0; i--) {
            const h = this.heartParticles[i];
            h.x += h.vx;
            h.y += h.vy;
            h.alpha -= 0.025;
            if (h.alpha <= 0) {
                this.heartParticles.splice(i, 1);
            }
        }
    }

    render() {
        const ctx = this.ctx;

        // 1. Render Dust Particles Behind Pet
        this.renderDustParticles();

        // 2. Render Pet Ground Shadow
        this.renderShadow();

        // 3. Render Pet Sprite (with jump offset & facing flip)
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

        // 4. Render Floating Hearts/Sparkles
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
            ctx.fillStyle = `rgba(230, 218, 200, ${p.alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(p.x - 1, p.y - 1, p.size * 0.6, 0, Math.PI * 2);
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

        // ==================== TAIL ====================
        ctx.save();
        ctx.translate(-18, 2);
        ctx.rotate(this.tailAngle);

        // Tail Outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-11, -4, 12, 8);
        ctx.fillRect(-13, -2, 4, 6);

        // Tail Orange Body
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(-9, -2, 8, 5);

        // Tail White Tip
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-12, -2, 4, 5);

        ctx.restore();

        // ==================== FEET / LEGS ====================
        // Back Foot
        ctx.fillStyle = '#1e0c05'; // outline
        ctx.fillRect(-14, 12 + legStep, 10, 8);
        ctx.fillStyle = '#f57c20'; // orange cuff
        ctx.fillRect(-13, 13 + legStep, 8, 3);
        ctx.fillStyle = '#ffffff'; // white paw
        ctx.fillRect(-13, 16 + legStep, 8, 3);

        // Front Foot
        ctx.fillStyle = '#1e0c05'; // outline
        ctx.fillRect(4, 12 - legStep, 10, 8);
        ctx.fillStyle = '#f57c20'; // orange cuff
        ctx.fillRect(5, 13 - legStep, 8, 3);
        ctx.fillStyle = '#ffffff'; // white paw
        ctx.fillRect(5, 16 - legStep, 8, 3);

        // ==================== CAT BODY ====================
        // Outer black/dark brown outline
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(-19, -15, 38, 28);
        // Rounded corners
        ctx.clearRect(-19, -15, 2, 2);
        ctx.clearRect(17, -15, 2, 2);
        ctx.clearRect(-19, 11, 2, 2);
        ctx.clearRect(17, 11, 2, 2);

        // Main Orange Fur
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(-17, -13, 34, 24);

        // Orange Fur Top Highlight
        ctx.fillStyle = '#ffa756';
        ctx.fillRect(-15, -13, 30, 3);

        // Bottom Orange Shadow
        ctx.fillStyle = '#c0520b';
        ctx.fillRect(-17, 7, 34, 4);

        // ==================== WHITE CHEST & FACE STRIPE ====================
        // White patch in the middle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -13, 14, 24);

        // White shadow at bottom
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-3, 7, 14, 4);

        // ==================== CAT EARS ====================
        // Left Ear Outline
        ctx.fillStyle = '#1e0c05';
        ctx.beginPath();
        ctx.moveTo(-16, -15);
        ctx.lineTo(-10, -28);
        ctx.lineTo(-3, -15);
        ctx.fill();

        // Right Ear Outline
        ctx.beginPath();
        ctx.moveTo(3, -15);
        ctx.lineTo(10, -28);
        ctx.lineTo(16, -15);
        ctx.fill();

        // Left Ear Orange
        ctx.fillStyle = '#f57c20';
        ctx.beginPath();
        ctx.moveTo(-15, -15);
        ctx.lineTo(-10, -26);
        ctx.lineTo(-4, -15);
        ctx.fill();

        // Right Ear Orange
        ctx.beginPath();
        ctx.moveTo(4, -15);
        ctx.lineTo(10, -26);
        ctx.lineTo(15, -15);
        ctx.fill();

        // Left Ear Pink Inner
        ctx.fillStyle = '#ffb3c1';
        ctx.fillRect(-11, -22, 3, 7);

        // Right Ear Pink Inner
        ctx.fillRect(8, -22, 3, 7);

        // ==================== ANIME EYES ====================
        // Left Eye
        this.renderCatEye(-8, -2);
        // Right Eye
        this.renderCatEye(8, -2);

        // ==================== NOSE & BLUSH ====================
        // Black Nose
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(2, 4, 3, 2);

        // Cheerful Pink Blush Cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.fillRect(-13, 3, 4, 3);
        ctx.fillRect(12, 3, 4, 3);
    }

    renderCatEye(x, y) {
        const ctx = this.ctx;
        const w = 9;
        const h = 11;

        if (this.eyeState === 'open') {
            // Dark Outline
            ctx.fillStyle = '#10172a';
            ctx.fillRect(x - 4, y - 5, w, h);

            // Deep Navy Top Iris
            ctx.fillStyle = '#0f294d';
            ctx.fillRect(x - 3, y - 4, w - 2, h - 2);

            // Vibrant Cyan Bottom Iris
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x - 3, y, w - 2, 4);

            // Big White Specular Sparkle (Upper-left)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 3, y - 4, 3, 3);

            // Small White Secondary Sparkle (Lower-right)
            ctx.fillRect(x + 1, y + 1, 2, 2);
        } else {
            // Closed Eye (Happy Curved Arc `^`)
            ctx.fillStyle = '#10172a';
            ctx.fillRect(x - 4, y, w, 2);
            ctx.fillRect(x - 2, y - 2, w - 4, 2);
        }
    }
}
