/* ===================================
   TERRAIN.JS - Pixel Art Scenery & Ultra-Fast Cached HUD
   Optimized with Offscreen Pre-rendering for solid 60 FPS
   =================================== */

export class Terrain {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Dimensions
        this.width = canvas.width;
        this.height = canvas.height;

        // Fenced playpen boundaries
        this.fenceTopY = 82;
        this.fenceLeftX = 28;
        this.fenceRightX = this.width - 28;
        this.fenceBottomY = this.height - 18;

        // Tile configuration inside fence
        this.tileSize = 40;

        // Game stats
        this.worldName = "WORLD 1-1";
        this.coins = 45;
        this.maxCoins = 999;
        this.hp = 100;
        this.maxHp = 100;
        this.lvl = 3;
        this.exp = 72; // out of 100
        this.fps = 60;

        // Collectible coins on field
        this.groundCoins = [];
        this.coinAnimFrame = 0;
        this.initCoins();

        // Meadow Flowers
        this.flowers = [
            { x: 120, y: 35, color: '#f43f5e', center: '#fbbf24' },
            { x: 280, y: 55, color: '#f43f5e', center: '#fbbf24' },
            { x: 390, y: 48, color: '#fbbf24', center: '#ea580c' },
            { x: 450, y: 30, color: '#f43f5e', center: '#fbbf24' },
            { x: 580, y: 45, color: '#fbbf24', center: '#ea580c' },
            { x: 210, y: 40, color: '#fbbf24', center: '#ea580c' },
        ];

        // Meadow Trees
        this.trees = [
            { x: 80, y: 15 },
            { x: 330, y: 12 },
            { x: 520, y: 14 },
        ];

        // Grass tufts inside pen
        this.grassTufts = [];
        for (let x = this.fenceLeftX + 20; x < this.fenceRightX - 20; x += 36) {
            for (let y = this.fenceTopY + 36; y < this.fenceBottomY - 20; y += 36) {
                if ((x + y) % 3 !== 0) {
                    this.grassTufts.push({
                        x: x + ((x * 7) % 18) - 9,
                        y: y + ((y * 11) % 18) - 9,
                    });
                }
            }
        }

        // ===============================================
        // OFFSCREEN CACHING BUFFERS FOR 60 FPS PERFORMANCE
        // ===============================================
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this.bgCtx = this.bgCanvas.getContext('2d');

        this.hudCanvas = document.createElement('canvas');
        this.hudCanvas.width = this.width;
        this.hudCanvas.height = this.height;
        this.hudCtx = this.hudCanvas.getContext('2d');

        // Pre-render once
        this.preRenderBackground();
        this.preRenderStaticHUD();
    }

    initCoins() {
        this.groundCoins = [
            { x: 220, y: 220, collected: false },
            { x: 620, y: 280, collected: false },
            { x: 360, y: 340, collected: false },
            { x: 540, y: 180, collected: false },
        ];
    }

    addCoin(amount = 1) {
        this.coins = Math.min(this.maxCoins, this.coins + amount);
    }

    addExp(amount = 15) {
        this.exp += amount;
        if (this.exp >= 100) {
            this.exp -= 100;
            this.lvl += 1;
            // Update static level text in HUD cache
            this.preRenderStaticHUD();
        }
    }

    // ==========================================
    // 1. PRE-RENDER STATIC SCENERY (RUNS ONCE)
    // ==========================================
    preRenderBackground() {
        const ctx = this.bgCtx;

        // Outer Meadow Base
        ctx.fillStyle = '#52b83b';
        ctx.fillRect(0, 0, this.width, this.height);

        // Subtle dark grass horizontal striping in top meadow
        ctx.fillStyle = '#49a834';
        for (let y = 0; y < this.fenceTopY + 20; y += 8) {
            ctx.fillRect(0, y, this.width, 2);
        }

        // Trees in top meadow
        for (const tree of this.trees) {
            this.drawTree(ctx, tree.x, tree.y);
        }

        // Wildflowers in top meadow
        for (const f of this.flowers) {
            this.drawFlower(ctx, f.x, f.y, f.color, f.center);
        }

        // Inner Checkered Lawn Playfield
        const left = this.fenceLeftX;
        const right = this.fenceRightX;
        const top = this.fenceTopY + 28;
        const bottom = this.fenceBottomY;

        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, right - left, bottom - top);
        ctx.clip();

        const cols = Math.ceil((right - left) / this.tileSize);
        const rows = Math.ceil((bottom - top) / this.tileSize);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const tx = left + c * this.tileSize;
                const ty = top + r * this.tileSize;
                ctx.fillStyle = ((r + c) % 2 === 0) ? '#66cc44' : '#5ec03e';
                ctx.fillRect(tx, ty, this.tileSize, this.tileSize);

                ctx.strokeStyle = 'rgba(40, 120, 30, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(tx, ty, this.tileSize, this.tileSize);
            }
        }

        // Grass tufts
        for (const tuft of this.grassTufts) {
            ctx.fillStyle = '#429e28';
            ctx.fillRect(tuft.x, tuft.y, 2, 5);
            ctx.fillRect(tuft.x + 3, tuft.y - 2, 2, 7);
            ctx.fillRect(tuft.x + 6, tuft.y + 1, 2, 4);

            ctx.fillStyle = '#8cf266';
            ctx.fillRect(tuft.x, tuft.y, 2, 1);
            ctx.fillRect(tuft.x + 3, tuft.y - 2, 2, 1);
            ctx.fillRect(tuft.x + 6, tuft.y + 1, 2, 1);
        }

        ctx.restore();

        // Wooden Picket Fence Surrounding Yard
        this.renderFence(ctx);
    }

    drawTree(ctx, x, y) {
        // Trunk
        ctx.fillStyle = '#1e0f07';
        ctx.fillRect(x + 15, y + 42, 14, 22);
        ctx.fillRect(x + 11, y + 58, 22, 6);

        ctx.fillStyle = '#522915';
        ctx.fillRect(x + 17, y + 44, 10, 18);
        ctx.fillRect(x + 13, y + 58, 18, 4);

        ctx.fillStyle = '#7a3f22';
        ctx.fillRect(x + 18, y + 44, 3, 16);

        // Shadow under tree
        ctx.fillStyle = 'rgba(20, 60, 15, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x + 22, y + 63, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Foliage layers
        ctx.fillStyle = '#1b5614';
        ctx.beginPath();
        ctx.arc(x + 22, y + 25, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#26701c';
        ctx.beginPath();
        ctx.arc(x + 22, y + 24, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#44a331';
        ctx.beginPath();
        ctx.arc(x + 21, y + 22, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6ad14d';
        ctx.beginPath();
        ctx.arc(x + 19, y + 18, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#82e663';
        ctx.fillRect(x + 14, y + 14, 8, 4);
        ctx.fillRect(x + 24, y + 20, 6, 4);
    }

    drawFlower(ctx, x, y, petalColor, centerColor) {
        ctx.fillStyle = '#2b781e';
        ctx.fillRect(x + 1, y + 3, 2, 6);

        ctx.fillStyle = petalColor;
        ctx.fillRect(x - 2, y, 2, 2);
        ctx.fillRect(x + 4, y, 2, 2);
        ctx.fillRect(x + 1, y - 3, 2, 2);
        ctx.fillRect(x + 1, y + 3, 2, 2);

        ctx.fillStyle = centerColor;
        ctx.fillRect(x, y - 1, 4, 4);
    }

    renderFence(ctx) {
        const topY = this.fenceTopY;
        const leftX = this.fenceLeftX;
        const rightX = this.fenceRightX;
        const bottomY = this.fenceBottomY;

        // Shadow cast by top fence
        ctx.fillStyle = 'rgba(15, 45, 15, 0.35)';
        ctx.fillRect(leftX, topY + 28, rightX - leftX, 12);

        // Rails
        this.drawHorizontalRail(ctx, leftX - 4, topY + 12, rightX - leftX + 8, 8);
        this.drawHorizontalRail(ctx, leftX - 4, topY + 26, rightX - leftX + 8, 8);

        // Vertical Fence Posts across top
        const postSpacing = 20.5;
        const numTopPosts = Math.floor((rightX - leftX) / postSpacing);
        for (let i = 0; i <= numTopPosts; i++) {
            const px = leftX + i * postSpacing;
            this.drawFencePost(ctx, px, topY, 14, 42);
        }

        // Left vertical line
        for (let y = topY + 36; y < bottomY; y += 26) {
            this.drawFencePost(ctx, leftX, y, 14, 28);
        }
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(leftX + 3, topY + 30, 8, bottomY - topY - 30);
        ctx.fillStyle = '#652d14';
        ctx.fillRect(leftX + 4, topY + 30, 6, bottomY - topY - 30);

        // Right vertical line
        const rX = rightX - 14;
        for (let y = topY + 36; y < bottomY; y += 26) {
            this.drawFencePost(ctx, rX, y, 14, 28);
        }
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(rX + 3, topY + 30, 8, bottomY - topY - 30);
        ctx.fillStyle = '#652d14';
        ctx.fillRect(rX + 4, topY + 30, 6, bottomY - topY - 30);

        // Bottom border posts
        for (let px = leftX; px <= rightX; px += 28) {
            this.drawFencePost(ctx, px, bottomY - 14, 14, 20);
        }
        this.drawHorizontalRail(ctx, leftX, bottomY - 10, rightX - leftX, 8);
    }

    drawHorizontalRail(ctx, x, y, width, height) {
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = '#652d14';
        ctx.fillRect(x, y + 1, width, height - 2);
        ctx.fillStyle = '#8f4420';
        ctx.fillRect(x, y + 1, width, 2);
    }

    drawFencePost(ctx, x, y, w, h) {
        ctx.fillStyle = '#1e0c05';
        ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
        ctx.fillRect(x + 2, y - 4, w - 4, 4);

        ctx.fillStyle = '#532313';
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = '#7a371c';
        ctx.fillRect(x + 2, y, w - 4, h);
        ctx.fillRect(x + 3, y - 3, w - 6, 4);

        ctx.fillStyle = '#9e4e2a';
        ctx.fillRect(x + 3, y + 2, 3, h - 4);
        ctx.fillRect(x + 4, y - 2, 3, 3);

        ctx.fillStyle = '#3a160a';
        ctx.fillRect(x + 3, y + Math.floor(h * 0.4), 6, 2);
    }

    // ==========================================
    // 2. PRE-RENDER STATIC HUD FRAMES (RUNS ONCE)
    // ==========================================
    preRenderStaticHUD() {
        const ctx = this.hudCtx;
        ctx.clearRect(0, 0, this.width, this.height);

        // --- HUD 1 (TOP LEFT) ---
        const hud1X = 16;
        const hud1Y = 12;
        const hud1W = 230;
        const hud1H = 46;
        this.drawRetroBox(ctx, hud1X, hud1Y, hud1W, hud1H);

        ctx.font = 'bold 15px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#000000';
        ctx.fillText(this.worldName, hud1X + 16, hud1Y + 24);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.worldName, hud1X + 14, hud1Y + 22);

        const coinX = hud1X + 152;
        const coinY = hud1Y + 22;
        this.drawHUDCoin(ctx, coinX, coinY);

        // --- HUD 2 (TOP RIGHT) ---
        const hud2W = 240;
        const hud2H = 68;
        const hud2X = this.width - hud2W - 16;
        const hud2Y = 12;
        this.drawRetroBox(ctx, hud2X, hud2Y, hud2W, hud2H);

        const pSize = 46;
        const pX = hud2X + 10;
        const pY = hud2Y + 11;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(pX, pY, pSize, pSize);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(pX, pY, pSize, pSize);

        this.drawCatPortrait(ctx, pX + pSize / 2, pY + pSize / 2);
        this.drawMiniPetBadge(ctx, pX + pSize - 12, pY + pSize + 2);

        const barX = hud2X + 68;
        const barY = hud2Y + 14;
        const barW = 156;

        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('HP', barX, barY + 7);

        // HP Background slot
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(barX, barY + 12, barW, 10);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY + 12, barW, 10);

        // LVL label & EXP background slot
        const lvlY = barY + 28;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`LVL ${this.lvl}`, barX, lvlY + 7);

        const expX = barX + 56;
        const expW = barW - 56;
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(expX, lvlY + 1, expW, 9);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(expX, lvlY + 1, expW, 9);

        // --- HUD 3 (BOTTOM RIGHT CONTROLS) ---
        const hud3W = 194;
        const hud3H = 72;
        const hud3X = this.width - hud3W - 16;
        const hud3Y = this.height - hud3H - 14;
        this.drawRetroBox(ctx, hud3X, hud3Y, hud3W, hud3H);

        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(hud3X + hud3W - 40, hud3Y - 5);
        ctx.lineTo(hud3X + hud3W - 35, hud3Y);
        ctx.lineTo(hud3X + hud3W - 45, hud3Y);
        ctx.fill();

        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.textAlign = 'right';

        ctx.fillStyle = '#000000';
        ctx.fillText('A: JUMP', hud3X + hud3W - 13, hud3Y + 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('A: JUMP', hud3X + hud3W - 14, hud3Y + 17);

        ctx.fillStyle = '#000000';
        ctx.fillText('B: ACT', hud3X + hud3W - 13, hud3Y + 36);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('B: ACT', hud3X + hud3W - 14, hud3Y + 35);

        ctx.fillStyle = '#000000';
        ctx.fillText('ARROWS: MOVE', hud3X + hud3W - 13, hud3Y + 54);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('ARROWS: MOVE', hud3X + hud3W - 14, hud3Y + 53);

        ctx.textAlign = 'left';
    }

    drawRetroBox(ctx, x, y, w, h) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
        ctx.fillStyle = '#151b3b';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    }

    drawHUDCoin(ctx, x, y) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 1, y - 1, 2, 2);
    }

    drawCatPortrait(ctx, cx, cy) {
        // Ears
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(cx - 15, cy - 8);
        ctx.lineTo(cx - 10, cy - 20);
        ctx.lineTo(cx - 4, cy - 8);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 4, cy - 8);
        ctx.lineTo(cx + 10, cy - 20);
        ctx.lineTo(cx + 15, cy - 8);
        ctx.fill();

        ctx.fillStyle = '#f57c20';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 9);
        ctx.lineTo(-10 + cx, cy - 18);
        ctx.lineTo(cx - 5, cy - 9);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 5, cy - 9);
        ctx.lineTo(cx + 10, cy - 18);
        ctx.lineTo(cx + 14, cy - 9);
        ctx.fill();

        ctx.fillStyle = '#fda4af';
        ctx.fillRect(cx - 11, cy - 14, 3, 4);
        ctx.fillRect(cx + 8, cy - 14, 3, 4);

        // Head Base
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx - 16, cy - 10, 32, 24);
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(cx - 14, cy - 8, 28, 20);

        // White Face Stripe
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 5, cy - 8, 10, 20);

        // Eyes
        this.drawAnimeEye(ctx, cx - 8, cy - 1, 6, 7);
        this.drawAnimeEye(ctx, cx + 8, cy - 1, 6, 7);

        // Nose & Blush
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx - 1, cy + 5, 2, 2);

        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.fillRect(cx - 12, cy + 4, 3, 2);
        ctx.fillRect(cx + 9, cy + 4, 3, 2);
    }

    drawAnimeEye(ctx, x, y, w, h) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.fillStyle = '#0f2b5c';
        ctx.fillRect(x - w / 2 + 1, y - h / 2 + 1, w - 2, h - 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x - w / 2 + 1, y, w - 2, Math.floor(h / 2) - 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - w / 2 + 1, y - h / 2 + 1, 2, 2);
        ctx.fillRect(x + 1, y + 1, 1, 1);
    }

    drawMiniPetBadge(ctx, x, y) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 1, y - 1, 14, 14);
        ctx.fillStyle = '#151b3b';
        ctx.fillRect(x, y, 12, 12);
        ctx.fillStyle = '#f57c20';
        ctx.fillRect(x + 2, y + 3, 8, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y + 3, 2, 7);
    }

    // ==========================================
    // 3. MAIN RENDER - ULTRA LIGHTWEIGHT BLITTING
    // ==========================================
    render() {
        this.coinAnimFrame++;

        // 1. Instantly draw pre-rendered background (1 GPU call)
        this.ctx.drawImage(this.bgCanvas, 0, 0);

        // 2. Render floating coins
        this.renderGroundCoins();

        // 3. Render pre-rendered HUD + dynamic bars
        this.renderHUD();
    }

    renderGroundCoins() {
        const ctx = this.ctx;
        const bounce = Math.sin(this.coinAnimFrame * 0.08) * 3;

        for (const coin of this.groundCoins) {
            if (coin.collected) continue;

            const cx = coin.x;
            const cy = coin.y + bounce;

            // Shadow
            ctx.fillStyle = 'rgba(20, 60, 20, 0.35)';
            ctx.beginPath();
            ctx.ellipse(coin.x, coin.y + 10, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Coin outer
            ctx.fillStyle = '#8a5000';
            ctx.fillRect(cx - 6, cy - 6, 12, 12);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(cx - 5, cy - 5, 10, 10);
            ctx.fillStyle = '#fde047';
            ctx.fillRect(cx - 3, cy - 3, 6, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - 2, cy - 2, 2, 2);
        }
    }

    renderHUD() {
        const ctx = this.ctx;

        // 1. Draw static HUD chrome (1 GPU call)
        ctx.drawImage(this.hudCanvas, 0, 0);

        // 2. Dynamic Coin text
        const hud1X = 16;
        const hud1Y = 12;
        const coinX = hud1X + 152;
        const coinY = hud1Y + 22;
        const coinStr = `× ${String(this.coins).padStart(3, '0')}`;

        ctx.font = 'bold 15px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(coinStr, coinX + 15, coinY + 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(coinStr, coinX + 13, coinY);

        // 3. Dynamic HP & EXP bars
        const hud2W = 240;
        const hud2X = this.width - hud2W - 16;
        const hud2Y = 12;
        const barX = hud2X + 68;
        const barY = hud2Y + 14;
        const barW = 156;

        // HP numerical text
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${this.hp}/${this.maxHp}`, barX + barW, barY + 7);
        ctx.textAlign = 'left';

        // Green HP fill
        const hpPercent = Math.max(0, Math.min(1, this.hp / this.maxHp));
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(barX + 1, barY + 13, (barW - 2) * hpPercent, 8);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(barX + 1, barY + 13, (barW - 2) * hpPercent, 2);

        // Cyan EXP fill
        const lvlY = barY + 28;
        const expX = barX + 56;
        const expW = barW - 56;
        const expPercent = Math.max(0, Math.min(1, this.exp / 100));
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(expX + 1, lvlY + 2, (expW - 2) * expPercent, 7);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(expX + 1, lvlY + 2, (expW - 2) * expPercent, 2);

        // 4. Subtle 60 FPS Badge in top-center
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.width / 2 - 28, 12, 56, 16);
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`${this.fps} FPS`, this.width / 2, 22);
        ctx.textAlign = 'left';
    }

    isWall(x, y, size) {
        const half = size / 2;
        const minX = this.fenceLeftX + 16;
        const maxX = this.fenceRightX - 16;
        const minY = this.fenceTopY + 36;
        const maxY = this.fenceBottomY - 14;

        return (
            x - half <= minX ||
            x + half >= maxX ||
            y - half <= minY ||
            y + half >= maxY
        );
    }

    checkCoinPickup(x, y, radius = 24) {
        for (const coin of this.groundCoins) {
            if (!coin.collected) {
                const dist = Math.hypot(x - coin.x, y - coin.y);
                if (dist < radius) {
                    coin.collected = true;
                    this.addCoin(1);
                    this.addExp(5);
                    setTimeout(() => {
                        coin.collected = false;
                        coin.x = this.fenceLeftX + 60 + Math.random() * (this.fenceRightX - this.fenceLeftX - 120);
                        coin.y = this.fenceTopY + 60 + Math.random() * (this.fenceBottomY - this.fenceTopY - 90);
                    }, 8000);
                    return true;
                }
            }
        }
        return false;
    }
}
