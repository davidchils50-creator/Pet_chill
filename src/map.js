/* ===================================
   MAP.JS - Class untuk rendering map 2D
   =================================== */

class Map {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Ukuran grid untuk pixel art
        this.gridSize = 40; // 40px per tile untuk pixel art yang terlihat jelas
        this.cols = Math.floor(canvas.width / this.gridSize);
        this.rows = Math.floor(canvas.height / this.gridSize);
        
        // Warna tema
        this.floorColor = '#2d3561';      // Lantai gelap
        this.wallColor = '#4a5f8f';       // Tembok biru
        this.gridColor = '#1a1a2e';       // Grid line gelap
    }

    /**
     * Render map dengan lantai, tembok pembatas, dan grid
     * Dijalankan setiap frame dalam game loop
     */
    render() {
        // Clear canvas dengan warna latar
        this.ctx.fillStyle = this.gridColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Gambar lantai
        this.ctx.fillStyle = this.floorColor;
        // Biarkan border (1 tile) untuk tembok pembatas
        this.ctx.fillRect(
            this.gridSize,
            this.gridSize,
            this.canvas.width - this.gridSize * 2,
            this.canvas.height - this.gridSize * 2
        );

        // Gambar tembok pembatas (border)
        this.ctx.fillStyle = this.wallColor;
        
        // Tembok atas
        this.ctx.fillRect(0, 0, this.canvas.width, this.gridSize);
        
        // Tembok bawah
        this.ctx.fillRect(0, this.canvas.height - this.gridSize, this.canvas.width, this.gridSize);
        
        // Tembok kiri
        this.ctx.fillRect(0, 0, this.gridSize, this.canvas.height);
        
        // Tembok kanan
        this.ctx.fillRect(this.canvas.width - this.gridSize, 0, this.gridSize, this.canvas.height);

        // Opsional: Gambar grid lines untuk debugging/visual reference
        this.renderGridLines();
    }

    /**
     * Render grid lines (opsional untuk visual reference)
     */
    renderGridLines() {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Cek apakah posisi (x, y) menyentuh tembok pembatas
     * Digunakan untuk collision detection pet
     * 
     * @param {number} x - Posisi X pusat object
     * @param {number} y - Posisi Y pusat object
     * @param {number} size - Ukuran (width/height) object
     * @returns {boolean} true jika menyentuh tembok
     */
    isWall(x, y, size) {
        // Hitung batas kiri, kanan, atas, bawah dari object
        const left = x - size / 2;
        const right = x + size / 2;
        const top = y - size / 2;
        const bottom = y + size / 2;

        // Cek jika menyentuh tembok pembatas
        return (
            left <= this.gridSize ||           // Tembok kiri
            right >= this.canvas.width - this.gridSize ||  // Tembok kanan
            top <= this.gridSize ||            // Tembok atas
            bottom >= this.canvas.height - this.gridSize   // Tembok bawah
        );
    }

    /**
     * Get area walkable (area yang aman dari tembok)
     * Berguna untuk validasi pergerakan
     */
    getWalkableArea() {
        return {
            minX: this.gridSize + 20,
            maxX: this.canvas.width - this.gridSize - 20,
            minY: this.gridSize + 20,
            maxY: this.canvas.height - this.gridSize - 20
        };
    }
}
