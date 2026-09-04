/* ===================================
   PET-ENHANCED.JS - Advanced Pet dengan Pixel Art Detail
   =================================== */

class PetEnhanced {
    constructor(canvas, terrain, startX, startY) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.terrain = terrain;

        // Posisi & ukuran
        this.x = startX;
        this.y = startY;
        this.size = 32; // Lebih kecil untuk pixel art lebih detail

        // Pergerakan
        this.speed = 1.2;
        this.directionX = 0;
        this.directionY = 0;
        this.moving = false;

        // AI Wander
        this.isWalking = false;
        this.walkDuration = 0;
        this.idleDuration = 0;
        this.maxWalkFrames = 0;
        this.maxIdleFrames = 0;

        // Animasi
        this.walkAnimFrame = 0;  // Untuk leg animation
        this.eyeBlinkTimer = 0;
        this.eyeState = 'open';
        this.eyeBlinkInterval = this.getRandomBlinkInterval();
        this.eyeClosedFrames = 0;
        this.headBobAngle = 0;  // Untuk head bobbing saat jalan

        // Color palette untuk pixel art
        this.colorMain = '#ff6b9d';      // Pink body
        this.colorDark = '#d63384';      // Dark pink
        this.colorLight = '#ffb3d9';     // Light pink
        this.colorSkin = '#ffc9e3';      // Skin tone

        this.changeDirection();
    }

    getRandomBlinkInterval() {
        return Math.floor(Math.random() * 300) + 180;
    }

    changeDirection() {
        if (this.isWalking) {
            this.isWalking = false;
            this.directionX = 0;
            this.directionY = 0;
            this.maxIdleFrames = Math.floor(Math.random() * 120) + 60;
            this.idleDuration = 0;
        } else {
            this.isWalking = true;
            
            const directions = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 },
                { x: 1, y: 1 },
                { x: -1, y: -1 },
                { x: 1, y: -1 },
                { x: -1, y: 1 }
            ];
            
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            this.directionX = randomDir.x;
            this.directionY = randomDir.y;
            
            this.maxWalkFrames = Math.floor(Math.random() * 180) + 120;
            this.walkDuration = 0;
        }
    }

    update() {
        // Update pergerakan
        if (this.isWalking) {
            this.walkDuration++;
            
            const newX = this.x + this.directionX * this.speed;
            const newY = this.y + this.directionY * this.speed;
            
            if (!this.terrain.isWall(newX, newY, this.size)) {
                this.x = newX;
                this.y = newY;
                this.moving = true;
            } else {
                this.directionX *= -1;
                this.directionY *= -1;
            }
            
            if (this.walkDuration >= this.maxWalkFrames) {
                this.changeDirection();
            }

            // Animasi head bob saat berjalan
            this.headBobAngle += 0.15;
        } else {
            this.idleDuration++;
            this.moving = false;
            
            if (this.idleDuration >= this.maxIdleFrames) {
                this.changeDirection();
            }
        }

        // Update animasi mata
        this.eyeBlinkTimer++;
        
        if (this.eyeState === 'open') {
            if (this.eyeBlinkTimer >= this.eyeBlinkInterval) {
                this.eyeState = 'closed';
                this.eyeClosedFrames = 0;
                this.eyeBlinkTimer = 0;
            }
        } else if (this.eyeState === 'closed') {
            this.eyeClosedFrames++;
            if (this.eyeClosedFrames >= 8) {
                this.eyeState = 'open';
                this.eyeBlinkTimer = 0;
                this.eyeBlinkInterval = this.getRandomBlinkInterval();
            }
        }

        // Update walk animation
        if (this.moving) {
            this.walkAnimFrame = (this.walkAnimFrame + 0.1) % 2;
        } else {
            this.walkAnimFrame = 0;
        }
    }

    render() {
        const x = this.x;
        const y = this.y;
        const size = this.size;
        const ctx = this.ctx;

        // Head bob effect saat berjalan
        const bobOffset = this.moving ? Math.sin(this.headBobAngle) * 2 : 0;
        const headY = y - 8 + bobOffset;

        // ==================== BODY (32x24px) ====================
        ctx.fillStyle = this.colorMain;
        ctx.fillRect(x - 10, y, 20, 24);
        
        // Body shading
        ctx.fillStyle = this.colorDark;
        ctx.fillRect(x - 10, y + 20, 20, 4);

        // ==================== HEAD (20x20px) ====================
        ctx.fillStyle = this.colorSkin;
        ctx.fillRect(x - 10, headY - 20, 20, 20);
        
        // Head border
        ctx.strokeStyle = this.colorDark;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 10, headY - 20, 20, 20);

        // ==================== EARS (simple squares) ====================
        ctx.fillStyle = this.colorMain;
        
        // Left ear
        ctx.fillRect(x - 12, headY - 22, 4, 6);
        ctx.strokeStyle = this.colorDark;
        ctx.strokeRect(x - 12, headY - 22, 4, 6);
        
        // Right ear
        ctx.fillRect(x + 8, headY - 22, 4, 6);
        ctx.strokeRect(x + 8, headY - 22, 4, 6);

        // ==================== EYES ====================
        this.renderEyes(x, headY);

        // ==================== MOUTH ====================
        ctx.strokeStyle = this.colorDark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, headY - 3, 2, 0, Math.PI);
        ctx.stroke();

        // ==================== ARMS (leg animation) ====================
        const armOffset = this.moving ? Math.sin(this.walkAnimFrame * Math.PI) * 3 : 0;
        
        ctx.fillStyle = this.colorMain;
        
        // Left arm
        ctx.fillRect(x - 12, y + 4 + armOffset, 4, 14);
        
        // Right arm
        ctx.fillRect(x + 8, y + 4 - armOffset, 4, 14);

        // ==================== LEGS (berjalan) ====================
        const legOffset = this.moving ? Math.sin(this.walkAnimFrame * Math.PI) * 2 : 0;
        
        ctx.fillStyle = this.colorDark;
        
        // Left leg
        ctx.fillRect(x - 6, y + 24 + legOffset, 4, 10);
        
        // Right leg
        ctx.fillRect(x + 2, y + 24 - legOffset, 4, 10);

        // ==================== FEET ====================
        ctx.fillStyle = this.colorDark;
        
        // Left foot
        ctx.fillRect(x - 8, y + 34, 6, 3);
        
        // Right foot
        ctx.fillRect(x + 2, y + 34, 6, 3);

        // ==================== TAIL (bergerak) ====================
        this.renderTail(x, y);
    }

    /**
     * Render mata dengan detail lebih
     */
    renderEyes(x, y) {
        const ctx = this.ctx;
        const eyeY = y - 10;
        const leftEyeX = x - 4;
        const rightEyeX = x + 4;

        if (this.eyeState === 'open') {
            // Mata putih
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(leftEyeX - 2, eyeY - 2, 4, 4);
            ctx.fillRect(rightEyeX - 2, eyeY - 2, 4, 4);
            
            // Pupil
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(leftEyeX - 1, eyeY - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(rightEyeX - 1, eyeY - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Shine
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(leftEyeX - 0.5, eyeY - 1.5, 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(rightEyeX - 0.5, eyeY - 1.5, 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Mata tertutup - garis
            ctx.strokeStyle = this.colorDark;
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.moveTo(leftEyeX - 2, eyeY);
            ctx.lineTo(leftEyeX + 2, eyeY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(rightEyeX - 2, eyeY);
            ctx.lineTo(rightEyeX + 2, eyeY);
            ctx.stroke();
        }
    }

    /**
     * Render tail dengan animasi bergerak
     */
    renderTail(x, y) {
        const ctx = this.ctx;
        const tailWave = Math.sin(this.walkAnimFrame * Math.PI) * 4;
        
        ctx.strokeStyle = this.colorMain;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 12);
        ctx.quadraticCurveTo(x + 15 + tailWave, y + 8, x + 16, y + 2);
        ctx.stroke();
        
        // Tail outline
        ctx.strokeStyle = this.colorDark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 12);
        ctx.quadraticCurveTo(x + 15 + tailWave, y + 8, x + 16, y + 2);
        ctx.stroke();
    }

    isInBounds() {
        const walkable = this.terrain.getWalkableArea();
        return (
            this.x >= walkable.minX &&
            this.x <= walkable.maxX &&
            this.y >= walkable.minY &&
            this.y <= walkable.maxY
        );
    }
}
