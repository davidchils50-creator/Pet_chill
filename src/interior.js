/* ===================================
   INTERIOR.JS - Map Interior Rumah Kucing
   High-Performance, Crisp 16-Bit Pixel Art Room
   With Solid Furniture Hitboxes & Exit Trigger Zone
   =================================== */

export class HouseInterior {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas ? canvas.getContext('2d') : null;

        // Interior Room Dimensions
        this.worldWidth = 860;
        this.worldHeight = 640;

        // Wall Boundaries (Inner Playable Area)
        this.minX = 75;
        this.maxX = this.worldWidth - 75;
        this.minY = 120;
        this.maxY = this.worldHeight - 85;

        // Exit Door Trigger Zone (Keset Pintu Bawah)
        this.exitDoor = {
            x: 380,
            y: this.worldHeight - 110,
            w: 100,
            h: 55,
            name: 'Pintu Keluar'
        };

        // Solid Furniture with Precise Hitboxes (Pet cannot penetrate)
        this.furniture = [
            // 1. Tempat Tidur Pixel Kucing (Plush Cat Bed)
            {
                id: 'cat_bed',
                x: 110,
                y: 155,
                w: 135,
                h: 95,
                hitbox: { x: 105, y: 150, w: 145, h: 105 },
                name: 'Tempat Tidur Kucing'
            },
            // 2. Meja Belajar & Makan Kayu (Wooden Desk & Banker Lamp)
            {
                id: 'study_desk',
                x: 605,
                y: 155,
                w: 145,
                h: 105,
                hitbox: { x: 595, y: 150, w: 165, h: 115 },
                name: 'Meja Belajar'
            },
            // 3. Mangkuk Makan & Air Kucing (Pet Food Bowls)
            {
                id: 'food_station',
                x: 120,
                y: 395,
                w: 105,
                h: 55,
                hitbox: { x: 115, y: 390, w: 115, h: 65 },
                name: 'Mangkuk Makanan'
            },
            // 4. Rak Buku Sudut & Tanaman Hias (Bookshelf & Potted Plant)
            {
                id: 'bookshelf_corner',
                x: 645,
                y: 385,
                w: 105,
                h: 70,
                hitbox: { x: 635, y: 380, w: 125, h: 80 },
                name: 'Rak Buku'
            }
        ];

        // Animated interior effects
        this.animTimer = 0;
        this.clockAngle = 0;
        this.steamPuffs = [];
        this.dustMotes = [];

        // Seed ambient dust motes catching sunlight
        for (let i = 0; i < 16; i++) {
            this.dustMotes.push({
                x: 200 + Math.random() * 460,
                y: 160 + Math.random() * 320,
                size: 1 + Math.random() * 1.5,
                alpha: 0.3 + Math.random() * 0.5,
                vx: (Math.random() - 0.5) * 0.2,
                vy: -0.15 - Math.random() * 0.2
            });
        }

        // Shared terrain stats reference
        this.terrainRef = null;
    }

    bindStats(terrain) {
        this.terrainRef = terrain;
    }

    getZoneInfo(x, y) {
        return {
            id: 'interior',
            name: '🏠 Interior Rumah',
            subtitle: 'Kamar Nyaman & Meja Belajar',
            color: '#f59e0b',
            x1: 0, y1: 0, x2: this.worldWidth, y2: this.worldHeight
        };
    }

    feed(amount = 25) {
        if (this.terrainRef) return this.terrainRef.feed(amount);
        return 100;
    }

    petCat(amount = 20) {
        if (this.terrainRef) return this.terrainRef.petCat(amount);
        return 100;
    }

    scold(amount = 15) {
        if (this.terrainRef) return this.terrainRef.scold(amount);
        return 100;
    }

    updateMood() {
        if (this.terrainRef) this.terrainRef.updateMood();
    }

    updateStats(dtFactor = 1.0) {
        if (this.terrainRef && typeof this.terrainRef.updateStats === 'function') {
            this.terrainRef.updateStats(dtFactor);
        }
    }

    get hunger() {
        return this.terrainRef ? this.terrainRef.hunger : 100;
    }

    get happiness() {
        return this.terrainRef ? this.terrainRef.happiness : 100;
    }

    get energy() {
        return this.terrainRef ? this.terrainRef.energy : 100;
    }

    get petMood() {
        return this.terrainRef ? this.terrainRef.petMood : 'BAHAGIA';
    }

    set isPetHeld(val) {
        if (this.terrainRef) this.terrainRef.isPetHeld = val;
    }

    get isPetHeld() {
        return this.terrainRef ? this.terrainRef.isPetHeld : false;
    }

    set isPetSwimming(val) {
        if (this.terrainRef) this.terrainRef.isPetSwimming = val;
    }

    get isPetSwimming() {
        return this.terrainRef ? this.terrainRef.isPetSwimming : false;
    }

    isOverStudyDesk(x, y) {
        const desk = this.furniture.find(f => f.id === 'study_desk');
        if (!desk) return false;
        return (
            x >= desk.x - 20 &&
            x <= desk.x + desk.w + 20 &&
            y >= desk.y - 20 &&
            y <= desk.y + desk.h + 25
        );
    }

    getStudyDesk() {
        return this.furniture.find(f => f.id === 'study_desk');
    }

    isOverBed(x, y) {
        const bed = this.furniture.find(f => f.id === 'cat_bed');
        if (!bed) return false;
        return (
            x >= bed.x - 20 &&
            x <= bed.x + bed.w + 20 &&
            y >= bed.y - 20 &&
            y <= bed.y + bed.h + 25
        );
    }

    getBed() {
        return this.furniture.find(f => f.id === 'cat_bed');
    }

    /**
     * Spawn position inside the house (near entrance looking into room)
     */
    getSpawnPoint() {
        return {
            x: 430,
            y: this.worldHeight - 165
        };
    }

    /**
     * Updates interior animations (steam, clock, sunbeam dust)
     */
    update(dtFactor) {
        this.animTimer += dtFactor;

        // Clock pendulum swing
        this.clockAngle = Math.sin(this.animTimer * 0.08) * 0.25;

        // Steaming teacup on desk
        if (Math.floor(this.animTimer) % 18 === 0 && this.steamPuffs.length < 8) {
            this.steamPuffs.push({
                x: 645 + (Math.random() * 4 - 2),
                y: 185,
                size: 2,
                alpha: 0.8,
                vy: -0.5 - Math.random() * 0.4
            });
        }

        for (let i = this.steamPuffs.length - 1; i >= 0; i--) {
            const p = this.steamPuffs[i];
            p.y += p.vy * dtFactor;
            p.x += Math.sin(this.animTimer * 0.1 + i) * 0.3 * dtFactor;
            p.alpha -= 0.02 * dtFactor;
            p.size += 0.05 * dtFactor;
            if (p.alpha <= 0) {
                this.steamPuffs.splice(i, 1);
            }
        }

        // Sunbeam dust motes drifting
        for (const m of this.dustMotes) {
            m.x += m.vx * dtFactor;
            m.y += m.vy * dtFactor;
            if (m.y < 150) {
                m.y = 480;
                m.x = 220 + Math.random() * 420;
            }
        }
    }

    /**
     * Hitbox collision detection (Walls + Furniture)
     */
    isWall(x, y, size = 30) {
        const half = size / 2;

        // 1. Room Boundary Walls
        if (x - half <= this.minX || x + half >= this.maxX || y - half <= this.minY) {
            return true;
        }

        // Bottom wall: Solid except for the door passage
        if (y + half >= this.maxY) {
            const inDoorPassage = (x >= this.exitDoor.x && x <= this.exitDoor.x + this.exitDoor.w);
            if (!inDoorPassage) {
                return true;
            }
            // If in door passage, clamp so pet doesn't walk completely out of screen bounds
            if (y + half >= this.worldHeight - 40) {
                return true;
            }
        }

        // 2. Solid Furniture Hitboxes
        for (const item of this.furniture) {
            const hb = item.hitbox;
            if (
                x + half >= hb.x &&
                x - half <= hb.x + hb.w &&
                y + half >= hb.y &&
                y - half <= hb.y + hb.h
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if coordinates fall within the Exit Door Trigger Zone (Keset Pintu)
     */
    isDoorExitTrigger(x, y) {
        const d = this.exitDoor;
        return (
            x >= d.x - 10 &&
            x <= d.x + d.w + 10 &&
            y >= d.y - 10 &&
            y <= d.y + d.h + 25
        );
    }

    /**
     * Rendering loop for House Interior
     * Renders crisp 16-bit pixel art room with sharp outlines
     */
    render(ctx, camera) {
        if (!ctx) return;

        // High contrast pixel sharpness
        ctx.imageSmoothingEnabled = false;

        // 1. Dark Room Backdrop Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);

        // 2. Wall Section (Top Wallpaper + Wainscot Panels)
        this.renderWalls(ctx);

        // 3. Wooden Plank Flooring
        this.renderWoodFloor(ctx);

        // 4. Diagonal Sunbeam Stream from Window
        this.renderSunbeam(ctx);

        // 5. Exit Door Mat (Keset Pintu Keluar)
        this.renderExitDoorMat(ctx);

        // 6. Wall Decorations (Painting, Clock, Window)
        this.renderWallDecorations(ctx);

        // 7. Furniture Items (Bed, Desk, Food Bowl, Bookshelf)
        this.renderFurniture(ctx);

        // 8. Foreground Dust Motes in Sunbeam
        this.renderDustMotes(ctx);
    }

    renderWalls(ctx) {
        const wallH = 135;

        // Upper Wall Wallpaper (Warm Cream retro wallpaper with vertical pinstripes)
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(this.minX - 10, 20, (this.maxX - this.minX) + 20, wallH);

        // Subtle wallpaper stripes
        ctx.fillStyle = '#fde68a';
        for (let wx = this.minX; wx < this.maxX; wx += 24) {
            ctx.fillRect(wx, 20, 3, wallH);
        }

        // Top Crown Molding (Dark Walnut)
        ctx.fillStyle = '#271206';
        ctx.fillRect(this.minX - 14, 18, (this.maxX - this.minX) + 28, 8);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(this.minX - 12, 22, (this.maxX - this.minX) + 24, 4);

        // Wainscot Wooden Lower Baseboard Divider
        ctx.fillStyle = '#78350f';
        ctx.fillRect(this.minX - 12, wallH + 12, (this.maxX - this.minX) + 24, 16);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(this.minX - 12, wallH + 24, (this.maxX - this.minX) + 24, 4);

        // Outer Wall Frame Borders (Solid High Contrast Dark Timber)
        ctx.fillStyle = '#1e0c05';
        // Left Timber Wall
        ctx.fillRect(0, 0, this.minX - 6, this.worldHeight);
        // Right Timber Wall
        ctx.fillRect(this.maxX + 6, 0, this.worldWidth - (this.maxX + 6), this.worldHeight);
        // Top Dark Ceiling
        ctx.fillRect(0, 0, this.worldWidth, 20);
        // Bottom Foundation (except door)
        ctx.fillRect(0, this.maxY + 15, this.exitDoor.x - 10, this.worldHeight - (this.maxY + 15));
        ctx.fillRect(this.exitDoor.x + this.exitDoor.w + 10, this.maxY + 15, this.worldWidth - (this.exitDoor.x + this.exitDoor.w + 10), this.worldHeight - (this.maxY + 15));
    }

    renderWoodFloor(ctx) {
        const floorY = 145;
        const floorH = this.maxY - floorY + 20;
        const floorW = (this.maxX - this.minX) + 12;

        // Base Warm Honey Oak Wood Floor
        ctx.fillStyle = '#b45309';
        ctx.fillRect(this.minX - 6, floorY, floorW, floorH);

        // Individual Wooden Planks with Crisp Grooves & Bevels
        const plankH = 28;
        let rowIndex = 0;
        for (let py = floorY; py < floorY + floorH; py += plankH) {
            const isAlt = (rowIndex % 2 === 1);
            ctx.fillStyle = isAlt ? '#d97706' : '#b45309';
            ctx.fillRect(this.minX - 6, py, floorW, plankH - 2);

            // Dark Plank Seam Groove
            ctx.fillStyle = '#451a03';
            ctx.fillRect(this.minX - 6, py + plankH - 2, floorW, 2);

            // Vertical Staggered Plank Joints
            const offset = (rowIndex % 3) * 75;
            for (let px = this.minX + offset; px < this.maxX; px += 180) {
                ctx.fillStyle = '#451a03';
                ctx.fillRect(px, py, 2, plankH - 2);
                // Nail dots on plank ends
                ctx.fillStyle = '#291406';
                ctx.fillRect(px - 4, py + 4, 2, 2);
                ctx.fillRect(px + 4, py + 4, 2, 2);
            }
            rowIndex++;
        }

        // Cozy Ornamental Center Rug (Persian Style Carpet in middle of living room)
        const rugX = 290;
        const rugY = 280;
        const rugW = 280;
        const rugH = 170;

        // Rug Fringe & Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(rugX - 4, rugY + 4, rugW + 8, rugH + 8);

        // Rug Base (Deep Crimson)
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(rugX, rugY, rugW, rugH);

        // Gold & Navy Intricate Border
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(rugX + 8, rugY + 8, rugW - 16, rugH - 16);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(rugX + 14, rugY + 14, rugW - 28, rugH - 28);
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(rugX + 22, rugY + 22, rugW - 44, rugH - 44);

        // Center Medallion Pixel Motif (Diamond Paw Print)
        const medX = rugX + rugW / 2;
        const medY = rugY + rugH / 2;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(medX, medY - 24);
        ctx.lineTo(medX + 32, medY);
        ctx.lineTo(medX, medY + 24);
        ctx.lineTo(medX - 32, medY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#451a03';
        // Center Cute Paw Stamp
        ctx.fillRect(medX - 6, medY - 2, 12, 10);
        ctx.fillRect(medX - 8, medY - 8, 4, 4);
        ctx.fillRect(medX - 2, medY - 11, 4, 4);
        ctx.fillRect(medX + 4, medY - 8, 4, 4);

        // White Fringe Tassels on Rug Top & Bottom
        ctx.fillStyle = '#fef08a';
        for (let fx = rugX + 2; fx < rugX + rugW - 2; fx += 8) {
            ctx.fillRect(fx, rugY - 4, 4, 4);
            ctx.fillRect(fx, rugY + rugH, 4, 4);
        }
    }

    renderSunbeam(ctx) {
        ctx.save();
        // Warm soft sunlight beam coming from the window
        const gradient = ctx.createLinearGradient(380, 50, 580, 520);
        gradient.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
        gradient.addColorStop(0.4, 'rgba(253, 224, 71, 0.18)');
        gradient.addColorStop(1, 'rgba(253, 224, 71, 0.0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(350, 30);
        ctx.lineTo(470, 30);
        ctx.lineTo(650, 480);
        ctx.lineTo(390, 480);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    renderExitDoorMat(ctx) {
        const d = this.exitDoor;

        // Open Doorway Arch Threshold leading back to Garden
        ctx.fillStyle = '#15803d'; // Garden green grass preview in doorway
        ctx.fillRect(d.x, d.y + 20, d.w, 40);

        // Door Frame Jambs
        ctx.fillStyle = '#451a03';
        ctx.fillRect(d.x - 8, d.y + 10, 8, 50);
        ctx.fillRect(d.x + d.w, d.y + 10, 8, 50);

        // Checkered Red & Cream "WELCOME / EXIT" Mat
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(d.x - 4, d.y + 4, d.w + 8, d.h + 4);

        ctx.fillStyle = '#dc2626'; // Red Mat
        ctx.fillRect(d.x, d.y, d.w, d.h);

        ctx.fillStyle = '#fef08a'; // Golden Border
        ctx.fillRect(d.x + 3, d.y + 3, d.w - 6, d.h - 6);
        ctx.fillStyle = '#991b1b'; // Inner Mat
        ctx.fillRect(d.x + 6, d.y + 6, d.w - 12, d.h - 12);

        // Glowing Exit Indicator Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🚪 KELUAR', d.x + d.w / 2, d.y + 24);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 6px "Press Start 2P", monospace';
        ctx.fillText('▼ KE TAMAN ▼', d.x + d.w / 2, d.y + 38);
    }

    renderWallDecorations(ctx) {
        // 1. Large Sunlit Arched Window (Center Wall)
        const winX = 350;
        const winY = 28;
        const winW = 120;
        const winH = 92;

        // Window Frame (Dark Oak)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(winX - 6, winY - 6, winW + 12, winH + 12);

        // Glass Pane (Sky Blue & Sun)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(winX, winY, winW, winH);

        // Distant pixel fluffy cloud & hill in window view
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(winX + 40, winY + winH, 30, Math.PI, 0);
        ctx.arc(winX + 90, winY + winH, 35, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(winX + 20, winY + 20, 24, 8);
        ctx.fillRect(winX + 26, winY + 16, 12, 4);

        // Golden Sun in window
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(winX + 95, winY + 25, 12, 0, Math.PI * 2);
        ctx.fill();

        // White Window Mullions & Crossbars
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(winX + winW / 2 - 3, winY, 6, winH);
        ctx.fillRect(winX, winY + winH / 2 - 2, winW, 5);

        // Coral Drapery Curtains on Sides
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(winX - 10, winY - 4, 16, winH + 8);
        ctx.fillRect(winX + winW - 6, winY - 4, 16, winH + 8);
        // Curtain Tiebacks (Gold)
        ctx.fillStyle = '#fde047';
        ctx.fillRect(winX - 10, winY + winH / 2, 16, 4);
        ctx.fillRect(winX + winW - 6, winY + winH / 2, 16, 4);

        // 2. Framed Cat Portrait Painting (Left Wall)
        const frameX = 140;
        const frameY = 40;
        ctx.fillStyle = '#ca8a04'; // Gold Frame
        ctx.fillRect(frameX, frameY, 64, 52);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(frameX + 4, frameY + 4, 56, 44);
        ctx.fillStyle = '#0f766e'; // Canvas Teal
        ctx.fillRect(frameX + 6, frameY + 6, 52, 40);

        // Mini Pixel Cat Portrait
        ctx.fillStyle = '#f97316'; // Orange Cat
        ctx.fillRect(frameX + 26, frameY + 18, 14, 16);
        ctx.fillRect(frameX + 24, frameY + 12, 6, 6);
        ctx.fillRect(frameX + 36, frameY + 12, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(frameX + 28, frameY + 22, 3, 3);
        ctx.fillRect(frameX + 35, frameY + 22, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(frameX + 29, frameY + 23, 2, 2);
        ctx.fillRect(frameX + 36, frameY + 23, 2, 2);

        // 3. Vintage Grandfather Pendulum Clock (Right Wall)
        const clockX = 540;
        const clockY = 32;
        ctx.fillStyle = '#451a03';
        ctx.fillRect(clockX, clockY, 32, 64);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(clockX + 3, clockY + 3, 26, 58);

        // Clock Face
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(clockX + 16, clockY + 18, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(clockX + 15, clockY + 12, 2, 6); // Clock hands
        ctx.fillRect(clockX + 15, clockY + 17, 5, 2);

        // Swinging Brass Pendulum
        ctx.save();
        ctx.translate(clockX + 16, clockY + 34);
        ctx.rotate(this.clockAngle);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-1.5, 0, 3, 18);
        ctx.beginPath();
        ctx.arc(0, 18, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    renderFurniture(ctx) {
        // ==========================================
        // 1. TEMPAT TIDUR PIXEL KUCING (CAT BED)
        // ==========================================
        const bed = this.furniture[0];
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(bed.x - 4, bed.y + bed.h - 14, bed.w + 8, 20);

        // Bed Wooden Frame (Carved Oak)
        ctx.fillStyle = '#291406';
        ctx.fillRect(bed.x, bed.y, bed.w, bed.h);
        ctx.fillStyle = '#5c2b09';
        ctx.fillRect(bed.x + 4, bed.y + 4, bed.w - 8, bed.h - 8);

        // Bed Headboard (Tall timber back)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(bed.x + 4, bed.y + 4, bed.w - 8, 24);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bed.x + 8, bed.y + 8, bed.w - 16, 16);
        // Cat Paw Carving on Headboard
        ctx.fillStyle = '#fde047';
        ctx.fillRect(bed.x + bed.w / 2 - 4, bed.y + 12, 8, 6);
        ctx.fillRect(bed.x + bed.w / 2 - 6, bed.y + 8, 3, 3);
        ctx.fillRect(bed.x + bed.w / 2 + 3, bed.y + 8, 3, 3);

        // Soft Coral-Pink Mattress
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(bed.x + 8, bed.y + 28, bed.w - 16, bed.h - 36);

        // Plump White Pillows
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bed.x + 14, bed.y + 32, 45, 22);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bed.x + 18, bed.y + 36, 37, 14);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bed.x + 68, bed.y + 32, 45, 22);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bed.x + 72, bed.y + 36, 37, 14);

        // Cozy Checkered Blanket (Aqua & Cyan Quilt)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(bed.x + 8, bed.y + 50, bed.w - 16, bed.h - 58);
        ctx.fillStyle = '#38bdf8';
        for (let bx = bed.x + 12; bx < bed.x + bed.w - 16; bx += 20) {
            ctx.fillRect(bx, bed.y + 52, 10, bed.h - 62);
        }

        // ==========================================
        // 2. MEJA BELAJAR & MAKAN KAYU (STUDY DESK)
        // ==========================================
        const desk = this.furniture[1];
        // Desk Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(desk.x - 4, desk.y + desk.h - 10, desk.w + 8, 16);

        // Desk Wooden Surface & Legs
        ctx.fillStyle = '#291406';
        ctx.fillRect(desk.x, desk.y, desk.w, desk.h);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(desk.x + 4, desk.y + 4, desk.w - 8, desk.h - 8);

        // Desk Tabletop Plank (Honey Oak)
        ctx.fillStyle = '#b45309';
        ctx.fillRect(desk.x + 4, desk.y + 4, desk.w - 8, 48);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(desk.x + 6, desk.y + 6, desk.w - 12, 12);

        // Drawer units on bottom left & right
        ctx.fillStyle = '#451a03';
        ctx.fillRect(desk.x + 10, desk.y + 52, 36, 44);
        ctx.fillRect(desk.x + desk.w - 46, desk.y + 52, 36, 44);
        // Brass Drawer Knobs
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(desk.x + 26, desk.y + 64, 4, 4);
        ctx.fillRect(desk.x + 26, desk.y + 80, 4, 4);
        ctx.fillRect(desk.x + desk.w - 30, desk.y + 64, 4, 4);
        ctx.fillRect(desk.x + desk.w - 30, desk.y + 80, 4, 4);

        // Open Book / Journal on Desk
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(desk.x + 35, desk.y + 14, 34, 24);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(desk.x + 51, desk.y + 14, 2, 24); // Spine
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(desk.x + 38, desk.y + 18, 10, 2);
        ctx.fillRect(desk.x + 38, desk.y + 22, 10, 2);
        ctx.fillRect(desk.x + 38, desk.y + 26, 10, 2);
        ctx.fillRect(desk.x + 56, desk.y + 18, 10, 2);
        ctx.fillRect(desk.x + 56, desk.y + 22, 10, 2);

        // Steaming Ceramic Cup
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(desk.x + 78, desk.y + 16, 12, 14);
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(desk.x + 88, desk.y + 19, 4, 8);

        // Animated Steam Puffs
        for (const p of this.steamPuffs) {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Green Banker's Lamp (with warm amber bulb glow)
        ctx.fillStyle = '#d97706'; // Brass Stem
        ctx.fillRect(desk.x + desk.w - 32, desk.y + 10, 4, 18);
        ctx.fillRect(desk.x + desk.w - 36, desk.y + 24, 12, 5);
        // Emerald Green Shade
        ctx.fillStyle = '#15803d';
        ctx.fillRect(desk.x + desk.w - 44, desk.y + 6, 26, 10);
        // Glowing bulb underside
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(desk.x + desk.w - 40, desk.y + 14, 18, 4);

        // ==========================================
        // 3. MANGKUK MAKANAN & AIR KUCING (FOOD BOWLS)
        // ==========================================
        const food = this.furniture[2];
        // Food Mat (Fish Silhouette)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(food.x, food.y, food.w, food.h);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(food.x + 3, food.y + 3, food.w - 6, food.h - 6);

        // Food Bowl (Left)
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(food.x + 28, food.y + 28, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(food.x + 28, food.y + 28, 16, 0, Math.PI * 2);
        ctx.fill();
        // Golden Fish Kibble
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(food.x + 28, food.y + 28, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(food.x + 24, food.y + 24, 4, 3);
        ctx.fillRect(food.x + 28, food.y + 28, 4, 3);

        // Water Bowl (Right)
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(food.x + food.w - 28, food.y + 28, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(food.x + food.w - 28, food.y + 28, 16, 0, Math.PI * 2);
        ctx.fill();
        // Sparkling Fresh Water
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(food.x + food.w - 28, food.y + 28, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(food.x + food.w - 32, food.y + 24, 3, 3);
        ctx.fillRect(food.x + food.w - 26, food.y + 28, 2, 2);

        // ==========================================
        // 4. RAK BUKU & TANAMAN HIAS (BOOKSHELF)
        // ==========================================
        const shelf = this.furniture[3];
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(shelf.x - 4, shelf.y + shelf.h - 8, shelf.w + 8, 14);

        // Shelf Frame
        ctx.fillStyle = '#291406';
        ctx.fillRect(shelf.x, shelf.y, shelf.w, shelf.h);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8);

        // Shelves divider
        ctx.fillStyle = '#451a03';
        ctx.fillRect(shelf.x + 4, shelf.y + 32, shelf.w - 8, 4);

        // Top Shelf Books (Colorful Spines)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(shelf.x + 10, shelf.y + 10, 8, 22);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(shelf.x + 19, shelf.y + 8, 10, 24);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(shelf.x + 30, shelf.y + 12, 8, 20);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(shelf.x + 39, shelf.y + 9, 9, 23);

        // Potted Succulent Plant on Bottom Shelf
        ctx.fillStyle = '#ea580c'; // Terracotta pot
        ctx.fillRect(shelf.x + 18, shelf.y + 44, 18, 14);
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(shelf.x + 16, shelf.y + 42, 22, 4);
        // Lush Green Ivy Leaves
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(shelf.x + 27, shelf.y + 38, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(shelf.x + 25, shelf.y + 36, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    renderDustMotes(ctx) {
        for (const m of this.dustMotes) {
            ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
            ctx.fillRect(m.x, m.y, m.size, m.size);
        }
    }
}
