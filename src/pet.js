/* ===================================
   PET.JS - Class Pet dengan AI Wander
   =================================== */

class Pet {
    constructor(canvas, map, startX, startY) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = map;

        // Posisi & ukuran
        this.x = startX;
        this.y = startY;
        this.size = 40; // Ukuran balok pixel (40x40px)

        // Pergerakan
        this.speed = 1.5; // Pixel per frame
        this.directionX = 0; // -1, 0, atau 1
        this.directionY = 0; // -1, 0, atau 1
        this.currentDirection = 'idle'; // Untuk tracking arah saat ini

        // AI Wander System - State Machine sederhana
        this.isWalking = false;
        this.walkDuration = 0; // Frame counter untuk durasi walk
        this.idleDuration = 0; // Frame counter untuk durasi idle
        this.maxWalkFrames = 0; // Durasi walk acak (akan di-set di changeDirection)
        this.maxIdleFrames = 0; // Durasi idle acak (akan di-set di changeDirection)

        // Animasi mata berkedip
        this.eyeState = 'open'; // 'open' atau 'closed'
        this.eyeBlinkTimer = 0; // Counter untuk interval berkedip
        this.eyeBlinkInterval = this.getRandomBlinkInterval(); // Interval acak berkedip (frame)
        this.eyeClosedFrames = 0; // Counter mata tertutup

        // Warna balok
        this.bodyColor = '#ff6b9d'; // Pink/merah muda cerah
        this.bodyColorDark = '#d63384'; // Warna lebih gelap untuk kontras

        // Randomisasi awal
        this.changeDirection();
    }

    /**
     * Ambil interval acak untuk berkedip (3-8 detik = 180-480 frame @ 60fps)
     */
    getRandomBlinkInterval() {
        return Math.floor(Math.random() * 300) + 180; // 180-480 frames
    }

    /**
     * WANDER AI - Ganti arah pergerakan secara acak
     * Menggunakan simple state machine: WALKING -> IDLE -> WALKING
     */
    changeDirection() {
        if (this.isWalking) {
            // Jika sedang berjalan, hentikan dan mulai idle
            this.isWalking = false;
            this.directionX = 0;
            this.directionY = 0;
            this.maxIdleFrames = Math.floor(Math.random() * 120) + 60; // Idle 1-2 detik
            this.idleDuration = 0;
        } else {
            // Jika idle, mulai berjalan ke arah acak
            this.isWalking = true;
            
            // Pilih arah acak (8 arah + idle)
            const directions = [
                { x: 1, y: 0 },   // Kanan
                { x: -1, y: 0 },  // Kiri
                { x: 0, y: 1 },   // Bawah
                { x: 0, y: -1 },  // Atas
                { x: 1, y: 1 },   // Kanan-bawah
                { x: -1, y: -1 }, // Kiri-atas
                { x: 1, y: -1 },  // Kanan-atas
                { x: -1, y: 1 }   // Kiri-bawah
            ];
            
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            this.directionX = randomDir.x;
            this.directionY = randomDir.y;
            
            // Durasi berjalan acak (2-5 detik = 120-300 frames @ 60fps)
            this.maxWalkFrames = Math.floor(Math.random() * 180) + 120;
            this.walkDuration = 0;
        }
    }

    /**
     * Update logika pet setiap frame
     */
    update() {
        // ==================== UPDATE PERGERAKAN ====================
        if (this.isWalking) {
            this.walkDuration++;
            
            // Hitung posisi baru
            const newX = this.x + this.directionX * this.speed;
            const newY = this.y + this.directionY * this.speed;
            
            // Cek collision dengan tembok
            if (!this.map.isWall(newX, newY, this.size)) {
                this.x = newX;
                this.y = newY;
            } else {
                // Jika menyentuh tembok, balik arah
                this.directionX *= -1;
                this.directionY *= -1;
            }
            
            // Check apakah waktu berjalan habis
            if (this.walkDuration >= this.maxWalkFrames) {
                this.changeDirection();
            }
        } else {
            // IDLE STATE
            this.idleDuration++;
            
            if (this.idleDuration >= this.maxIdleFrames) {
                this.changeDirection();
            }
        }

        // ==================== UPDATE ANIMASI MATA BERKEDIP ====================
        this.eyeBlinkTimer++;
        
        if (this.eyeState === 'open') {
            // Jika mata terbuka dan timer mencapai interval, tutup mata
            if (this.eyeBlinkTimer >= this.eyeBlinkInterval) {
                this.eyeState = 'closed';
                this.eyeClosedFrames = 0;
                this.eyeBlinkTimer = 0;
            }
        } else if (this.eyeState === 'closed') {
            // Mata tertutup selama 6-8 frame (100-133ms @ 60fps)
            this.eyeClosedFrames++;
            if (this.eyeClosedFrames >= 8) {
                this.eyeState = 'open';
                this.eyeBlinkTimer = 0;
                this.eyeBlinkInterval = this.getRandomBlinkInterval(); // Set interval baru
            }
        }
    }

    /**
     * Render pet: balok dengan mata, tangan, dan kaki
     */
    render() {
        const ctx = this.ctx;
        const size = this.size;
        const x = this.x;
        const y = this.y;

        // ==================== BADAN BALOK ====================
        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        
        // Border/outline untuk kontras pixel art
        ctx.strokeStyle = this.bodyColorDark;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);

        // ==================== MATA (2 buah) ====================
        const eyeSize = 6;
        const eyeOffsetX = 10;
        const eyeOffsetY = -8;

        // Mata kiri
        this.renderEye(x - eyeOffsetX, y + eyeOffsetY, eyeSize);
        
        // Mata kanan
        this.renderEye(x + eyeOffsetX, y + eyeOffsetY, eyeSize);

        // ==================== TANGAN (2 buah) ====================
        const handWidth = 5;
        const handHeight = 12;
        const handOffsetX = 18;
        const handOffsetY = -2;

        ctx.fillStyle = this.bodyColorDark;
        
        // Tangan kiri
        ctx.fillRect(x - handOffsetX - handWidth / 2, y + handOffsetY, handWidth, handHeight);
        
        // Tangan kanan
        ctx.fillRect(x + handOffsetX - handWidth / 2, y + handOffsetY, handWidth, handHeight);

        // ==================== KAKI (2 buah) ====================
        const footWidth = 8;
        const footHeight = 8;
        const footOffsetX = 10;
        const footOffsetY = 18;

        ctx.fillStyle = this.bodyColorDark;
        
        // Kaki kiri
        ctx.fillRect(x - footOffsetX - footWidth / 2, y + footOffsetY, footWidth, footHeight);
        
        // Kaki kanan
        ctx.fillRect(x + footOffsetX - footWidth / 2, y + footOffsetY, footWidth, footHeight);
    }

    /**
     * Helper function untuk render mata
     * Mata berkedip dengan garis horizontal saat tertutup
     * 
     * @param {number} x - Posisi X mata
     * @param {number} y - Posisi Y mata
     * @param {number} size - Ukuran mata
     */
    renderEye(x, y, size) {
        const ctx = this.ctx;

        if (this.eyeState === 'open') {
            // Mata terbuka: lingkaran putih dengan pupil hitam
            
            // Bagian putih mata
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Border mata
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.stroke();
            
            // Pupil (mata hitam di tengah)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Mata tertutup: garis horizontal
            ctx.strokeStyle = this.bodyColorDark;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - size, y);
            ctx.lineTo(x + size, y);
            ctx.stroke();
        }
    }

    /**
     * Check apakah pet berada di area yang valid
     */
    isInBounds() {
        const walkable = this.map.getWalkableArea();
        return (
            this.x >= walkable.minX &&
            this.x <= walkable.maxX &&
            this.y >= walkable.minY &&
            this.y <= walkable.maxY
        );
    }
}
