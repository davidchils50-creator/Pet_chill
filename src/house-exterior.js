/* ===================================
   HOUSE-EXTERIOR.JS - Objek Rumah Mandiri (Outdoor Map)
   Standalone 16-Bit Pixel Art House Object
   With Solid Hitbox & Door Trigger Zone
   =================================== */

export class HouseExterior {
    constructor(x = 1120, y = 480) {
        this.x = x;
        this.y = y;
        this.w = 160;
        this.h = 140;

        // Solid Hitbox (Body & Roof cannot be penetrated)
        // Leaving front porch step open for door trigger
        this.solidHitbox = {
            x: this.x + 4,
            y: this.y + 10,
            w: this.w - 8,
            h: 122
        };

        // Door Trigger Zone (Area Pintu & Keset Rumah)
        this.doorTrigger = {
            x: this.x + 65,
            y: this.y + 115,
            w: 32,
            h: 38
        };

        // Chimney Smoke Particles
        this.smokePuffs = [];
        this.smokeTimer = 0;
    }

    /**
     * Updates animated effects (chimney smoke puffs)
     */
    update(dtFactor) {
        this.smokeTimer += dtFactor;

        // Generate smoke puff every ~22 frames
        if (Math.floor(this.smokeTimer) % 22 === 0 && this.smokePuffs.length < 10) {
            this.smokePuffs.push({
                x: this.x + this.w - 32 + (Math.random() * 4 - 2),
                y: this.y - 12,
                size: 3.5 + Math.random() * 2,
                alpha: 0.85,
                vx: 0.25 + Math.random() * 0.35,
                vy: -0.7 - Math.random() * 0.4
            });
        }

        for (let i = this.smokePuffs.length - 1; i >= 0; i--) {
            const p = this.smokePuffs[i];
            p.x += p.vx * dtFactor;
            p.y += p.vy * dtFactor;
            p.size += 0.08 * dtFactor;
            p.alpha -= 0.018 * dtFactor;
            if (p.alpha <= 0) {
                this.smokePuffs.splice(i, 1);
            }
        }
    }

    /**
     * Solid collision check against house body
     */
    isCollision(x, y, size = 30) {
        const half = size / 2;
        const hb = this.solidHitbox;

        // Check if pet touches the solid building walls
        const touchingBuilding = (
            x + half >= hb.x &&
            x - half <= hb.x + hb.w &&
            y + half >= hb.y &&
            y - half <= hb.y + hb.h
        );

        if (!touchingBuilding) return false;

        // Allow entering the door threshold trigger without getting blocked by wall
        if (this.isDoorTrigger(x, y)) {
            return false;
        }

        return true;
    }

    /**
     * Checks if coordinates fall within Door Trigger Zone
     */
    isDoorTrigger(x, y) {
        const dt = this.doorTrigger;
        return (
            x >= dt.x - 12 &&
            x <= dt.x + dt.w + 12 &&
            y >= dt.y - 8 &&
            y <= dt.y + dt.h + 20
        );
    }

    /**
     * Render high-contrast 16-bit standalone pixel art house
     */
    render(ctx, vL = -9999, vT = -9999, vR = 9999, vB = 9999) {
        if (!ctx) return;
        if (this.x + this.w < vL || this.x > vR || this.y + this.h + 20 < vT || this.y > vB) return;

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // 1. Ground Ambient Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(this.x - 10, this.y + this.h - 12, this.w + 20, 26);

        // 2. Stone Foundation Base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(this.x + 6, this.y + this.h - 18, this.w - 12, 18);
        ctx.fillStyle = '#475569';
        ctx.fillRect(this.x + 8, this.y + this.h - 16, this.w - 16, 14);
        // Stone brick seams
        ctx.fillStyle = '#334155';
        for (let bx = this.x + 16; bx < this.x + this.w - 16; bx += 24) {
            ctx.fillRect(bx, this.y + this.h - 16, 2, 14);
        }

        // 3. Main Timber House Wall (Warm Cedar Log Siding)
        ctx.fillStyle = '#451a03'; // Dark boundary outline
        ctx.fillRect(this.x + 10, this.y + 36, this.w - 20, this.h - 52);

        // Timber siding planks
        const plankH = 14;
        let plankIndex = 0;
        for (let py = this.y + 38; py < this.y + this.h - 18; py += plankH) {
            ctx.fillStyle = (plankIndex % 2 === 0) ? '#d97706' : '#b45309';
            ctx.fillRect(this.x + 12, py, this.w - 24, plankH - 2);

            // Dark wood seam groove
            ctx.fillStyle = '#78350f';
            ctx.fillRect(this.x + 12, py + plankH - 2, this.w - 24, 2);

            // Wood knots & grain highlights
            ctx.fillStyle = '#fde68a';
            ctx.fillRect(this.x + 24 + (plankIndex * 37) % 80, py + 3, 6, 2);
            plankIndex++;
        }

        // Corner Post Timbers (Dark Walnut pillars)
        ctx.fillStyle = '#291406';
        ctx.fillRect(this.x + 10, this.y + 36, 12, this.h - 52);
        ctx.fillRect(this.x + this.w - 22, this.y + 36, 12, this.h - 52);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(this.x + 12, this.y + 36, 8, this.h - 52);
        ctx.fillRect(this.x + this.w - 20, this.y + 36, 8, this.h - 52);

        // 4. Chimney (Stone Bricks with Mortar)
        const chimX = this.x + this.w - 38;
        const chimY = this.y - 18;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(chimX - 2, chimY - 2, 22, 54);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(chimX, chimY, 18, 50);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(chimX + 2, chimY + 2, 14, 6); // Chimney cap
        // Chimney brick texture
        ctx.fillStyle = '#334155';
        ctx.fillRect(chimX + 2, chimY + 14, 14, 2);
        ctx.fillRect(chimX + 2, chimY + 26, 14, 2);
        ctx.fillRect(chimX + 2, chimY + 38, 14, 2);
        ctx.fillRect(chimX + 8, chimY + 8, 2, 6);
        ctx.fillRect(chimX + 10, chimY + 20, 2, 6);
        ctx.fillRect(chimX + 6, chimY + 32, 2, 6);

        // 5. Chimney Smoke Puffs (Animated Floating Clouds)
        for (const p of this.smokePuffs) {
            ctx.fillStyle = `rgba(241, 245, 249, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            // Soft highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
            ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        }

        // 6. Gabled Terracotta Shingle Roof with 3D Depth
        const peakX = this.x + this.w / 2;
        const peakY = this.y - 10;
        const roofLeft = this.x - 8;
        const roofRight = this.x + this.w + 8;
        const eaveY = this.y + 44;

        // Roof Dark Shadow Underhang
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(this.x + 6, eaveY - 4, this.w - 12, 10);

        // Main Roof Triangle (Rich Crimson / Terracotta)
        ctx.fillStyle = '#7f1d1d'; // Dark roof border
        ctx.beginPath();
        ctx.moveTo(roofLeft - 2, eaveY + 2);
        ctx.lineTo(peakX, peakY - 3);
        ctx.lineTo(roofRight + 2, eaveY + 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#dc2626'; // Terracotta Red Roof
        ctx.beginPath();
        ctx.moveTo(roofLeft, eaveY);
        ctx.lineTo(peakX, peakY);
        ctx.lineTo(roofRight, eaveY);
        ctx.closePath();
        ctx.fill();

        // Shingle Rows (Overlapping Terracotta Tile Lines)
        const roofH = eaveY - peakY;
        const numRows = 5;
        for (let r = 1; r <= numRows; r++) {
            const frac = r / numRows;
            const curY = peakY + roofH * frac;
            const curL = peakX - (peakX - roofLeft) * frac;
            const curR = peakX + (roofRight - peakX) * frac;

            ctx.fillStyle = (r % 2 === 0) ? '#b91c1c' : '#ef4444';
            ctx.beginPath();
            ctx.moveTo(curL, curY);
            ctx.lineTo(curR, curY);
            ctx.lineTo(curR + 2, curY + 6);
            ctx.lineTo(curL - 2, curY + 6);
            ctx.closePath();
            ctx.fill();

            // Shingle vertical grooves
            ctx.fillStyle = '#7f1d1d';
            for (let sx = curL + 12; sx < curR - 12; sx += 18) {
                ctx.fillRect(sx, curY, 2, 7);
            }
        }

        // Roof Ridge Eaves Board (Gold & Chestnut trim)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(roofLeft - 4, eaveY, roofRight - roofLeft + 8, 8);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(roofLeft - 2, eaveY + 2, roofRight - roofLeft + 4, 4);

        // 7. Attic Circular Window (Top Center of Gable)
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(peakX, peakY + 28, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24'; // Warm Glowing Amber Glass
        ctx.beginPath();
        ctx.arc(peakX, peakY + 28, 11, 0, Math.PI * 2);
        ctx.fill();
        // Cross Mullion (Dark timber)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(peakX - 11, peakY + 27, 22, 2);
        ctx.fillRect(peakX - 1, peakY + 17, 2, 22);

        // 8. Ground Floor Window with Flower Planter Box (Left Side)
        const winX = this.x + 28;
        const winY = this.y + 60;
        const winW = 30;
        const winH = 34;

        // Window Frame
        ctx.fillStyle = '#451a03';
        ctx.fillRect(winX - 3, winY - 3, winW + 6, winH + 6);
        ctx.fillStyle = '#38bdf8'; // Sky Blue Glass with Sun Glare
        ctx.fillRect(winX, winY, winW, winH);

        // Glass glare diagonal streak
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(winX + 4, winY + 4, 18, 4);
        ctx.fillRect(winX + 4, winY + 12, 10, 3);

        // Window Pane Dividers
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(winX + winW / 2 - 1, winY, 2, winH);
        ctx.fillRect(winX, winY + winH / 2 - 1, winW, 2);

        // Flower Planter Window Box
        ctx.fillStyle = '#78350f';
        ctx.fillRect(winX - 4, winY + winH - 2, winW + 8, 12);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(winX - 2, winY + winH, winW + 4, 8);

        // Blooming Window Box Flowers (Red, Yellow, Pink)
        ctx.fillStyle = '#15803d'; // Leaves
        ctx.fillRect(winX - 2, winY + winH - 6, winW + 4, 6);
        ctx.fillStyle = '#ef4444'; // Red Tulip
        ctx.fillRect(winX + 2, winY + winH - 8, 5, 5);
        ctx.fillStyle = '#fde047'; // Yellow Daisy
        ctx.fillRect(winX + 11, winY + winH - 9, 6, 6);
        ctx.fillStyle = '#ec4899'; // Pink Rose
        ctx.fillRect(winX + 21, winY + winH - 8, 5, 5);

        // 9. Arched Entrance Door (Center-Right)
        const doorX = this.x + 72;
        const doorY = this.y + 64;
        const doorW = 34;
        const doorH = 58;

        // Door Frame (Arched Dark Walnut Timber)
        ctx.fillStyle = '#291406';
        ctx.beginPath();
        ctx.arc(doorX + doorW / 2, doorY + 12, doorW / 2 + 4, Math.PI, 0);
        ctx.rect(doorX - 4, doorY + 12, doorW + 8, doorH - 10);
        ctx.fill();

        // Inner Door Wood Panel (Rich Mahogany)
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(doorX + doorW / 2, doorY + 12, doorW / 2, Math.PI, 0);
        ctx.rect(doorX, doorY + 12, doorW, doorH - 12);
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.fillRect(doorX + 4, doorY + 16, doorW - 8, doorH - 22);

        // Cute Cat Silhouette Knocker
        ctx.fillStyle = '#fde047';
        ctx.fillRect(doorX + doorW / 2 - 4, doorY + 18, 8, 7);
        ctx.fillRect(doorX + doorW / 2 - 5, doorY + 14, 3, 4);
        ctx.fillRect(doorX + doorW / 2 + 2, doorY + 14, 3, 4);

        // Brass Door Knob
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(doorX + 6, doorY + 36, 3, 0, Math.PI * 2);
        ctx.fill();

        // 10. Glowing Wall Lantern beside Door
        const lampX = doorX - 16;
        const lampY = doorY + 14;
        ctx.fillStyle = '#1e293b'; // Iron Bracket
        ctx.fillRect(lampX + 3, lampY - 2, 4, 16);
        ctx.fillRect(lampX - 2, lampY + 2, 10, 3);
        // Lantern Glass & Warm Glow
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(lampX - 2, lampY + 5, 8, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(lampX, lampY + 7, 3, 3);

        // 11. Stone Front Porch Step & "WELCOME" Mat (Door Trigger Zone)
        const matX = this.x + 64;
        const matY = this.y + this.h - 16;
        const matW = 50;
        const matH = 22;

        // Stone Porch Pavers
        ctx.fillStyle = '#64748b';
        ctx.fillRect(matX - 6, matY - 2, matW + 12, matH + 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(matX - 4, matY, matW + 8, matH);

        // Checkered Green & Gold Welcome Mat
        ctx.fillStyle = '#15803d'; // Green Mat
        ctx.fillRect(matX, matY + 2, matW, matH - 4);
        ctx.fillStyle = '#fde047'; // Gold Trim
        ctx.fillRect(matX + 2, matY + 4, matW - 4, matH - 8);
        ctx.fillStyle = '#166534';
        ctx.fillRect(matX + 4, matY + 6, matW - 8, matH - 12);

        // "MASUK" Door Sign Hint
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🚪 MASUK', matX + matW / 2, matY + 13);

        ctx.restore();
    }
}
