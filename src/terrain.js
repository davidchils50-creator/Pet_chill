/* ===================================
   TERRAIN.JS - Grass & Environment Rendering
   Referensi: Pixel art grass patterns
   =================================== */

class Terrain {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Grass tile configuration
        this.tileSize = 40;
        this.cols = Math.floor(canvas.width / this.tileSize);
        this.rows = Math.floor(canvas.height / this.tileSize);
        
        // Grass color palette - berbagai shade hijau
        this.grassPalette = [
            '#3d8b40',  // Dark green
            '#4a9e52',  // Medium-dark green
            '#5ab763',  // Medium green
            '#2d7a35',  // Forest green
            '#5ec46d',  // Light green
            '#669b70',  // Sage green
        ];
        
        // Flower colors untuk detail
        this.flowerColors = [
            '#ff6b6b',  // Red
            '#ffd93d',  // Yellow
            '#ff9ff3',  // Pink
            '#74b9ff',  // Blue
            '#a29bfe',  // Purple
        ];
        
        // Generate grass tiles
        this.grassTiles = this.generateGrassTiles();
    }

    /**
     * Generate grass tile pattern dengan natural dithering
     */
    generateGrassTiles() {
        const tiles = [];
        
        for (let row = 0; row < this.rows; row++) {
            tiles[row] = [];
            for (let col = 0; col < this.cols; col++) {
                tiles[row][col] = this.generateSingleTile();
            }
        }
        
        return tiles;
    }

    /**
     * Generate satu tile rumput dengan pattern detail
     */
    generateSingleTile() {
        const size = this.tileSize;
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = size;
        tileCanvas.height = size;
        const tileCtx = tileCanvas.getContext('2d');
        
        // Base grass color
        const baseColor = this.grassPalette[Math.floor(Math.random() * this.grassPalette.length)];
        tileCtx.fillStyle = baseColor;
        tileCtx.fillRect(0, 0, size, size);
        
        // Add grass texture dengan pattern acak
        for (let i = 0; i < size * size / 8; i++) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            
            // Shade variation
            if (Math.random() < 0.6) {
                const shade = this.grassPalette[Math.floor(Math.random() * this.grassPalette.length)];
                tileCtx.fillStyle = shade;
                tileCtx.fillRect(x, y, 2, 2);
            }
            
            // Random flowers - 3% chance per pixel
            if (Math.random() < 0.03) {
                const flowerColor = this.flowerColors[Math.floor(Math.random() * this.flowerColors.length)];
                tileCtx.fillStyle = flowerColor;
                
                // Flower pattern (simple cross)
                tileCtx.fillRect(x, y - 1, 1, 3);
                tileCtx.fillRect(x - 1, y, 3, 1);
            }
        }
        
        return tileCanvas;
    }

    /**
     * Render seluruh terrain/grass background
     */
    render() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                this.ctx.drawImage(this.grassTiles[row][col], x, y);
            }
        }
        
        // Render border/wall
        this.renderBorder();
    }

    /**
     * Render tembok pembatas di sekitar map
     */
    renderBorder() {
        const borderThickness = this.tileSize;
        const borderColor = '#8b4513';  // Brown untuk stone/dirt wall
        
        // Tembok atas
        this.ctx.fillStyle = borderColor;
        this.ctx.fillRect(0, 0, this.canvas.width, borderThickness);
        
        // Tembok bawah
        this.ctx.fillRect(0, this.canvas.height - borderThickness, this.canvas.width, borderThickness);
        
        // Tembok kiri
        this.ctx.fillRect(0, 0, borderThickness, this.canvas.height);
        
        // Tembok kanan
        this.ctx.fillRect(this.canvas.width - borderThickness, 0, borderThickness, this.canvas.height);
        
        // Add stone texture ke border
        this.renderBorderTexture();
    }

    /**
     * Render texture detail di border
     */
    renderBorderTexture() {
        const borderThickness = this.tileSize;
        
        // Top border texture
        for (let x = 0; x < this.canvas.width; x += 8) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(x, 0, 4, borderThickness);
        }
        
        // Bottom border texture
        for (let x = 0; x < this.canvas.width; x += 8) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(x, this.canvas.height - borderThickness, 4, borderThickness);
        }
        
        // Left border texture
        for (let y = 0; y < this.canvas.height; y += 8) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, y, borderThickness, 4);
        }
        
        // Right border texture
        for (let y = 0; y < this.canvas.height; y += 8) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(this.canvas.width - borderThickness, y, borderThickness, 4);
        }
    }

    /**
     * Get batas area yang aman dari tembok
     */
    getWalkableArea() {
        const borderThickness = this.tileSize;
        return {
            minX: borderThickness + 20,
            maxX: this.canvas.width - borderThickness - 20,
            minY: borderThickness + 20,
            maxY: this.canvas.height - borderThickness - 20
        };
    }

    /**
     * Cek collision dengan tembok
     */
    isWall(x, y, size) {
        const borderThickness = this.tileSize;
        const left = x - size / 2;
        const right = x + size / 2;
        const top = y - size / 2;
        const bottom = y + size / 2;

        return (
            left <= borderThickness ||
            right >= this.canvas.width - borderThickness ||
            top <= borderThickness ||
            bottom >= this.canvas.height - borderThickness
        );
    }
}
