/* ===================================
   TERRAIN.JS - Expansive Pixel Art Open World
   World Dimensions: 2400 x 1600 px with 5 Distinct Themed Biomes
   Optimized with Frustum Viewport Culling for 60 FPS
   =================================== */

import { HouseExterior } from './house-exterior.js';

export class Terrain {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Large Open World Dimensions
        this.worldWidth = 2400;
        this.worldHeight = 1600;

        // Tile size
        this.tileSize = 48;

        // Standalone Outdoor House Object (Separated from background, with solid hitbox & trigger)
        this.house = new HouseExterior(1120, 480);

        // Virtual Pet Status & Stats
        this.hunger = 80;       // 0 - 100 (Lapar)
        this.happiness = 85;    // 0 - 100 (Senang)
        this.energy = 90;       // 0 - 100 (Energi)
        this.petMood = 'SENANG';
        this.isPetHeld = false;
        this.isPetSwimming = false;
        this.currentZoneName = '🏡 Taman Utama';
        this.waterAnimTimer = 0;

        // Central Playpen bounds (Safe central area)
        this.centerArea = {
            x1: 850,
            y1: 520,
            x2: 1550,
            y2: 1080
        };

        // Zone Definitions
        this.zones = [
            {
                id: 'center',
                name: '🏡 Taman Utama',
                subtitle: 'Tempat Bermain & Istirahat Kucing',
                color: '#10b981',
                x1: 800, y1: 450, x2: 1600, y2: 1150
            },
            {
                id: 'blossom',
                name: '🌸 Taman Sakura',
                subtitle: 'Pohon Bunga Mekar & Air Mancur',
                color: '#f43f5e',
                x1: 1550, y1: 0, x2: 2400, y2: 800
            },
            {
                id: 'forest',
                name: '🌲 Hutan Pinus & Jamur',
                subtitle: 'Hutan Asri dengan Jamur Liar',
                color: '#14b8a6',
                x1: 0, y1: 0, x2: 850, y2: 800
            },
            {
                id: 'lake',
                name: '🌊 Danau Ikan Koi',
                subtitle: 'Danau Jernih, Bunga Lotus & Dermaga',
                color: '#0284c7',
                x1: 0, y1: 800, x2: 900, y2: 1600
            },
            {
                id: 'beach',
                name: '🏖️ Pantai Pasir Santai',
                subtitle: 'Pasir Hangat & Bunga Matahari',
                color: '#f59e0b',
                x1: 1550, y1: 800, x2: 2400, y2: 1600
            }
        ];

        // Scenery element collections
        this.trees = [];
        this.flowers = [];
        this.mushrooms = [];
        this.decorations = [];
        this.grassTufts = [];
        this.pathStones = [];
        this.koiFish = [];

        this.generateWorld();
    }

    generateWorld() {
        this.trees = [];
        this.flowers = [];
        this.mushrooms = [];
        this.decorations = [];
        this.grassTufts = [];
        this.pathStones = [];
        this.koiFish = [];

        // 1. GENERATE COBBLESTONE PATHS CONNECTING ZONES
        this.generatePaths();

        // 2. CENTRAL PLAYPEN (Taman Utama)
        this.studyDesk = {
            type: 'study_desk',
            x: 1010,
            y: 640,
            w: 84,
            h: 58,
            name: 'Meja Belajar'
        };
        this.decorations.push(this.studyDesk);

        this.decorations.push({
            type: 'picnic_mat',
            x: 1040,
            y: 840,
            w: 70,
            h: 50
        });
        this.decorations.push({
            type: 'scratching_post',
            x: 1340,
            y: 720,
            w: 24,
            h: 48
        });
        this.decorations.push({
            type: 'yarn_ball',
            x: 1300,
            y: 880,
            w: 16,
            h: 16,
            color: '#ec4899'
        });

        // 3. FLOWER & SAKURA GARDEN (North-East)
        // Sakura Trees
        const sakuraCoords = [
            { x: 1680, y: 140 }, { x: 1920, y: 100 }, { x: 2180, y: 160 },
            { x: 1750, y: 380 }, { x: 2240, y: 420 }, { x: 1980, y: 600 }
        ];
        for (const pos of sakuraCoords) {
            this.trees.push({ type: 'sakura', x: pos.x, y: pos.y, w: 60, h: 70 });
        }

        // Blossom garden fountain & benches
        this.decorations.push({
            type: 'fountain',
            x: 1960,
            y: 320,
            w: 64,
            h: 50
        });
        this.decorations.push({
            type: 'bench',
            x: 1860,
            y: 330,
            w: 44,
            h: 24
        });
        this.decorations.push({
            type: 'bench',
            x: 2060,
            y: 330,
            w: 44,
            h: 24
        });

        // Colorful tulip/rose flower beds
        const flowerTypes = ['#f43f5e', '#fbbf24', '#a855f7', '#ec4899', '#38bdf8', '#ffffff'];
        for (let i = 0; i < 45; i++) {
            this.flowers.push({
                x: 1620 + Math.random() * 680,
                y: 100 + Math.random() * 600,
                petal: flowerTypes[i % flowerTypes.length],
                center: '#fbbf24',
                size: 6 + Math.random() * 3
            });
        }

        // 4. MUSHROOM & PINE FOREST (North-West)
        const pineCoords = [
            { x: 120, y: 120 }, { x: 340, y: 90 }, { x: 580, y: 140 },
            { x: 180, y: 340 }, { x: 420, y: 290 }, { x: 680, y: 360 },
            { x: 140, y: 560 }, { x: 380, y: 580 }, { x: 620, y: 540 }
        ];
        for (const pos of pineCoords) {
            this.trees.push({ type: 'pine', x: pos.x, y: pos.y, w: 54, h: 78 });
        }

        // Forest Campfire & Log
        this.decorations.push({
            type: 'campfire',
            x: 460,
            y: 440,
            w: 36,
            h: 30
        });
        this.decorations.push({
            type: 'hollow_log',
            x: 320,
            y: 450,
            w: 52,
            h: 26
        });

        // Forest Mushrooms
        for (let i = 0; i < 30; i++) {
            this.mushrooms.push({
                x: 100 + Math.random() * 650,
                y: 120 + Math.random() * 580,
                color: i % 2 === 0 ? '#ef4444' : '#eab308',
                size: 8 + Math.random() * 6
            });
        }

        // 5. LOTUS LAKE & PIER (South-West)
        this.lake = {
            x: 180,
            y: 950,
            w: 580,
            h: 460
        };

        // Wooden pier / dock extending onto lake
        this.decorations.push({
            type: 'pier',
            x: 420,
            y: 920,
            w: 48,
            h: 110
        });

        // Lotus pads on water
        for (let i = 0; i < 14; i++) {
            this.flowers.push({
                type: 'lotus',
                x: 230 + Math.random() * 460,
                y: 990 + Math.random() * 370,
                petal: '#f472b6',
                center: '#fde047',
                size: 10
            });
        }

        // Animated Koi Fish swimming in the lake
        for (let i = 0; i < 6; i++) {
            this.koiFish.push({
                x: 260 + Math.random() * 400,
                y: 1020 + Math.random() * 320,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                color: i % 2 === 0 ? '#ea580c' : '#ffffff',
                size: 10 + Math.random() * 4
            });
        }

        // Willows around lake
        this.trees.push({ type: 'oak', x: 120, y: 920, w: 60, h: 70 });
        this.trees.push({ type: 'oak', x: 740, y: 940, w: 60, h: 70 });
        this.trees.push({ type: 'oak', x: 200, y: 1420, w: 60, h: 70 });
        this.trees.push({ type: 'oak', x: 720, y: 1400, w: 60, h: 70 });

        // 6. GOLDEN BEACH & MEADOW (South-East)
        this.beach = {
            x: 1650,
            y: 950,
            w: 680,
            h: 580
        };

        // Beach Umbrella & Mat
        this.decorations.push({
            type: 'beach_umbrella',
            x: 1980,
            y: 1140,
            w: 60,
            h: 70
        });
        this.decorations.push({
            type: 'beach_mat',
            x: 1940,
            y: 1190,
            w: 50,
            h: 30
        });

        // Palm / Fruit trees & Sunflowers
        this.trees.push({ type: 'palm', x: 1720, y: 980, w: 58, h: 76 });
        this.trees.push({ type: 'palm', x: 2240, y: 1040, w: 58, h: 76 });
        this.trees.push({ type: 'palm', x: 1800, y: 1440, w: 58, h: 76 });

        for (let i = 0; i < 20; i++) {
            this.flowers.push({
                x: 1680 + Math.random() * 600,
                y: 1000 + Math.random() * 500,
                petal: '#eab308',
                center: '#78350f',
                size: 8
            });
        }

        // 7. SCATTERED OAK TREES & FENCES ALONG OUTER BORDERS
        this.generateBorderScenery();
    }

    generatePaths() {
        this.pathStones = [];

        // Horizontal main avenue (from West to East through Central Garden)
        for (let x = 120; x < 2280; x += 22) {
            const y = 800 + Math.sin(x * 0.01) * 16;
            this.pathStones.push({ x, y, size: 14 + (x % 5) * 2, color: ((x % 3) === 0) ? '#d6cfb8' : '#c4bca6' });
            this.pathStones.push({ x: x + 6, y: y + 16, size: 12 + (x % 4) * 2, color: '#b5ab93' });
        }

        // Vertical main avenue (from North to South through Central Garden)
        for (let y = 120; y < 1480; y += 22) {
            const x = 1200 + Math.cos(y * 0.01) * 16;
            this.pathStones.push({ x, y, size: 14 + (y % 5) * 2, color: ((y % 3) === 0) ? '#d6cfb8' : '#c4bca6' });
            this.pathStones.push({ x: x + 16, y: y + 6, size: 12 + (y % 4) * 2, color: '#b5ab93' });
        }
    }

    generateBorderScenery() {
        // Outer dense border trees to naturally enclose the map
        for (let x = 60; x < this.worldWidth; x += 110) {
            this.trees.push({ type: 'oak', x, y: 20, w: 56, h: 68 });
            this.trees.push({ type: 'oak', x, y: this.worldHeight - 80, w: 56, h: 68 });
        }
        for (let y = 80; y < this.worldHeight - 80; y += 110) {
            this.trees.push({ type: 'oak', x: 20, y, w: 56, h: 68 });
            this.trees.push({ type: 'oak', x: this.worldWidth - 80, y, w: 56, h: 68 });
        }
    }

    feed(amount = 25) {
        this.hunger = Math.min(100, this.hunger + amount);
        this.happiness = Math.min(100, this.happiness + 8);
        this.updateMood();
        return this.hunger;
    }

    petCat(amount = 20) {
        this.happiness = Math.min(100, this.happiness + amount);
        this.energy = Math.min(100, this.energy + 5);
        this.updateMood();
        return this.happiness;
    }

    scold(amount = 15) {
        this.happiness = Math.max(0, this.happiness - amount);
        this.updateMood();
        return this.happiness;
    }

    updateMood() {
        if (this.isPetHeld) {
            this.petMood = 'DIANGKAT!';
        } else if (this.isPetSwimming) {
            this.petMood = 'BERENANG! 🏊';
        } else if (this.hunger < 25) {
            this.petMood = 'KELAPARAN';
        } else if (this.hunger < 50) {
            this.petMood = 'LAPAR';
        } else if (this.energy < 25) {
            this.petMood = 'MENGANTUK';
        } else if (this.happiness < 30) {
            this.petMood = 'SEDIH';
        } else if (this.happiness > 75 && this.hunger > 60) {
            this.petMood = 'BAHAGIA';
        } else {
            this.petMood = 'SENANG';
        }
    }

    updateStats(dtFactor = 1.0) {
        this.hunger = Math.max(0, this.hunger - 0.003 * dtFactor);
        if (this.hunger < 30) {
            this.happiness = Math.max(0, this.happiness - 0.004 * dtFactor);
        }
        this.energy = Math.max(0, this.energy - 0.002 * dtFactor);
        this.updateMood();

        // Animate water ripples
        this.waterAnimTimer += 0.03 * dtFactor;

        // Animate outdoor house chimney smoke
        if (this.house) {
            this.house.update(dtFactor);
        }

        // Animate koi fish
        if (this.lake) {
            for (const fish of this.koiFish) {
                fish.x += fish.vx * dtFactor;
                fish.y += fish.vy * dtFactor;

                if (fish.x < this.lake.x + 40 || fish.x > this.lake.x + this.lake.w - 40) fish.vx = -fish.vx;
                if (fish.y < this.lake.y + 40 || fish.y > this.lake.y + this.lake.h - 40) fish.vy = -fish.vy;
            }
        }
    }

    getZoneInfo(x, y) {
        for (const zone of this.zones) {
            if (x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2) {
                this.currentZoneName = zone.name;
                return zone;
            }
        }
        return this.zones[0];
    }

    // ==========================================
    // MAIN RENDER WITH VIEWPORT CULLING
    // ==========================================
    render(camera) {
        const ctx = this.ctx;

        // 1. Calculate visible bounds in world space
        const vLeft = camera ? camera.x - 60 : 0;
        const vTop = camera ? camera.y - 60 : 0;
        const vRight = camera ? camera.x + camera.viewportWidth + 60 : this.worldWidth;
        const vBottom = camera ? camera.y + camera.viewportHeight + 60 : this.worldHeight;

        // 2. Base Green Grass Terrain
        ctx.fillStyle = '#4eaf36';
        ctx.fillRect(vLeft, vTop, vRight - vLeft, vBottom - vTop);

        // 3. Render Zone Biome Grounds (Only if in view)
        this.renderBiomeGrounds(ctx, vLeft, vTop, vRight, vBottom);

        // 4. Render Cobblestone Path Network
        this.renderPaths(ctx, vLeft, vTop, vRight, vBottom);

        // 5. Central Checkered Lawn Area
        this.renderCentralLawn(ctx, vLeft, vTop, vRight, vBottom);

        // 6. Lake & Water Surface with Swimming Koi
        this.renderLake(ctx, vLeft, vTop, vRight, vBottom);

        // 7. Ground Flowers, Mushrooms & Props
        this.renderGroundProps(ctx, vLeft, vTop, vRight, vBottom);

        // 8. Interactive & Architectural Buildings (Cat House, Pier, Fountain, etc.)
        this.renderDecorations(ctx, vLeft, vTop, vRight, vBottom);

        // 9. Trees (Oak, Sakura, Pine, Palm)
        this.renderTrees(ctx, vLeft, vTop, vRight, vBottom);
    }

    renderBiomeGrounds(ctx, vL, vT, vR, vB) {
        // Golden Beach Ground
        if (this.beach && !(vR < this.beach.x || vL > this.beach.x + this.beach.w || vB < this.beach.y || vT > this.beach.y + this.beach.h)) {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.roundRect(this.beach.x, this.beach.y, this.beach.w, this.beach.h, 40);
            ctx.fill();

            // Sand texture dots
            ctx.fillStyle = '#ca8a04';
            for (let sx = this.beach.x + 30; sx < this.beach.x + this.beach.w - 30; sx += 45) {
                for (let sy = this.beach.y + 30; sy < this.beach.y + this.beach.h - 30; sy += 45) {
                    ctx.fillRect(sx, sy, 3, 3);
                }
            }
        }

        // Sakura Pink Meadow Glow
        const sakX = 1580, sakY = 50, sakW = 780, sakH = 720;
        if (!(vR < sakX || vL > sakX + sakW || vB < sakY || vT > sakY + sakH)) {
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(sakX, sakY, sakW, sakH);
            ctx.fillStyle = 'rgba(251, 113, 133, 0.15)';
            ctx.fillRect(sakX, sakY, sakW, sakH);
        }

        // Pine Forest Dark Grass
        const forX = 50, forY = 50, forW = 780, forH = 720;
        if (!(vR < forX || vL > forX + forW || vB < forY || vT > forY + forH)) {
            ctx.fillStyle = '#3f962b';
            ctx.fillRect(forX, forY, forW, forH);
        }
    }

    renderPaths(ctx, vL, vT, vR, vB) {
        for (const stone of this.pathStones) {
            if (stone.x >= vL - 30 && stone.x <= vR + 30 && stone.y >= vT - 30 && stone.y <= vB + 30) {
                ctx.fillStyle = stone.color;
                ctx.fillRect(stone.x, stone.y, stone.size, stone.size - 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fillRect(stone.x, stone.y + stone.size - 2, stone.size, 2);
            }
        }
    }

    renderCentralLawn(ctx, vL, vT, vR, vB) {
        const area = this.centerArea;
        if (vR < area.x1 || vL > area.x2 || vB < area.y1 || vT > area.y2) return;

        const left = area.x1;
        const right = area.x2;
        const top = area.y1;
        const bottom = area.y2;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(left, top, right - left, bottom - top, 16);
        ctx.clip();

        // Checkered Lawn Pattern
        const cols = Math.ceil((right - left) / this.tileSize);
        const rows = Math.ceil((bottom - top) / this.tileSize);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const tx = left + c * this.tileSize;
                const ty = top + r * this.tileSize;
                ctx.fillStyle = ((r + c) % 2 === 0) ? '#62c43e' : '#57b835';
                ctx.fillRect(tx, ty, this.tileSize, this.tileSize);

                ctx.strokeStyle = 'rgba(30, 100, 20, 0.15)';
                ctx.lineWidth = 1;
                ctx.strokeRect(tx, ty, this.tileSize, this.tileSize);
            }
        }
        ctx.restore();

        // Open Wooden Picket Fence around Central Sanctuary (with 4 open gates)
        this.renderFenceWithGates(ctx, left, top, right, bottom);
    }

    renderFenceWithGates(ctx, left, top, right, bottom) {
        const postW = 6;
        const postH = 26;
        const gap = 20;

        // Top fence with gate in center
        for (let x = left; x <= right; x += gap) {
            if (x > (left + right) / 2 - 40 && x < (left + right) / 2 + 40) continue; // Open Gate
            this.drawFencePost(ctx, x, top);
        }

        // Bottom fence with gate in center
        for (let x = left; x <= right; x += gap) {
            if (x > (left + right) / 2 - 40 && x < (left + right) / 2 + 40) continue; // Open Gate
            this.drawFencePost(ctx, x, bottom);
        }

        // Left fence
        for (let y = top; y <= bottom; y += gap) {
            if (y > (top + bottom) / 2 - 40 && y < (top + bottom) / 2 + 40) continue; // Open Gate
            this.drawFencePost(ctx, left, y);
        }

        // Right fence
        for (let y = top; y <= bottom; y += gap) {
            if (y > (top + bottom) / 2 - 40 && y < (top + bottom) / 2 + 40) continue; // Open Gate
            this.drawFencePost(ctx, right, y);
        }
    }

    drawFencePost(ctx, x, y) {
        ctx.fillStyle = '#6d4224';
        ctx.fillRect(x - 4, y - 14, 8, 22);
        ctx.fillStyle = '#a77247';
        ctx.fillRect(x - 3, y - 13, 6, 20);
        ctx.fillStyle = '#d49b6a';
        ctx.fillRect(x - 2, y - 12, 2, 18);
    }

    renderLake(ctx, vL, vT, vR, vB) {
        if (!this.lake) return;
        const lake = this.lake;
        if (vR < lake.x || vL > lake.x + lake.w || vB < lake.y || vT > lake.y + lake.h) return;

        // Lake Shore Sand Ring
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.ellipse(lake.x + lake.w / 2, lake.y + lake.h / 2, lake.w / 2 + 16, lake.h / 2 + 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water Basin
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(lake.x + lake.w / 2, lake.y + lake.h / 2, lake.w / 2, lake.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water Ripple Highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        for (let i = 0; i < 6; i++) {
            const rx = lake.x + 100 + ((i * 70 + Math.sin(this.waterAnimTimer + i) * 20) % (lake.w - 200));
            const ry = lake.y + 80 + ((i * 55 + Math.cos(this.waterAnimTimer + i) * 15) % (lake.h - 160));
            ctx.fillRect(rx, ry, 28, 3);
            ctx.fillRect(rx + 6, ry + 3, 14, 2);
        }

        // Swimming Koi Fish
        for (const fish of this.koiFish) {
            ctx.save();
            ctx.translate(fish.x, fish.y);
            const angle = Math.atan2(fish.vy, fish.vx);
            ctx.rotate(angle);
            ctx.fillStyle = fish.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, fish.size, fish.size / 2.2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Tail fin
            ctx.fillStyle = '#f97316';
            ctx.fillRect(-fish.size, -2, 4, 4);
            ctx.restore();
        }
    }

    renderGroundProps(ctx, vL, vT, vR, vB) {
        // Flowers
        for (const f of this.flowers) {
            if (f.x >= vL && f.x <= vR && f.y >= vT && f.y <= vB) {
                if (f.type === 'lotus') {
                    // Green pad
                    ctx.fillStyle = '#15803d';
                    ctx.beginPath();
                    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 1.8);
                    ctx.fill();
                    // Pink flower
                    ctx.fillStyle = f.petal;
                    ctx.beginPath();
                    ctx.arc(f.x, f.y - 2, 4, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Standard flower
                    ctx.fillStyle = '#15803d';
                    ctx.fillRect(f.x, f.y, 2, 5);
                    ctx.fillStyle = f.petal;
                    ctx.beginPath();
                    ctx.arc(f.x + 1, f.y - 2, f.size || 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = f.center;
                    ctx.fillRect(f.x, f.y - 3, 2, 2);
                }
            }
        }

        // Mushrooms
        for (const m of this.mushrooms) {
            if (m.x >= vL && m.x <= vR && m.y >= vT && m.y <= vB) {
                // Stalk
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(m.x + 2, m.y + 4, 4, 6);
                // Cap
                ctx.fillStyle = m.color;
                ctx.beginPath();
                ctx.arc(m.x + 4, m.y + 4, m.size || 6, Math.PI, 0);
                ctx.fill();
                // White spots
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(m.x + 2, m.y + 1, 2, 2);
                ctx.fillRect(m.x + 5, m.y + 2, 2, 2);
            }
        }
    }

    renderDecorations(ctx, vL, vT, vR, vB) {
        // Render Standalone Pixel Art House Exterior
        if (this.house) {
            this.house.render(ctx, vL, vT, vR, vB);
        }

        for (const d of this.decorations) {
            if (d.x + (d.w || 40) < vL || d.x > vR || d.y + (d.h || 40) < vT || d.y > vB) continue;

            if (d.type === 'fountain') {
                // Stone Basin
                ctx.fillStyle = '#94a3b8';
                ctx.beginPath();
                ctx.ellipse(d.x + d.w / 2, d.y + d.h / 2, d.w / 2, d.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                // Inner Water
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.ellipse(d.x + d.w / 2, d.y + d.h / 2, d.w / 2 - 6, d.h / 2 - 6, 0, 0, Math.PI * 2);
                ctx.fill();
                // Water Spurt
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(d.x + d.w / 2 - 2, d.y + d.h / 2 - 12, 4, 12);
            } else if (d.type === 'bench') {
                ctx.fillStyle = '#78350f';
                ctx.fillRect(d.x, d.y, d.w, d.h);
                ctx.fillStyle = '#b45309';
                ctx.fillRect(d.x + 2, d.y + 2, d.w - 4, d.h - 8);
            } else if (d.type === 'pier') {
                ctx.fillStyle = '#5c3214';
                ctx.fillRect(d.x, d.y, d.w, d.h);
                ctx.fillStyle = '#8f5223';
                for (let py = d.y; py < d.y + d.h; py += 12) {
                    ctx.fillRect(d.x + 2, py + 2, d.w - 4, 8);
                }
            } else if (d.type === 'campfire') {
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.arc(d.x + 16, d.y + 16, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f97316';
                ctx.fillRect(d.x + 12, d.y + 8, 8, 12);
                ctx.fillStyle = '#fde047';
                ctx.fillRect(d.x + 14, d.y + 10, 4, 8);
            } else if (d.type === 'picnic_mat') {
                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(d.x, d.y, d.w, d.h);
                ctx.fillStyle = '#ffffff';
                for (let mx = d.x; mx < d.x + d.w; mx += 14) {
                    ctx.fillRect(mx, d.y, 7, d.h);
                }
                // Food bowl
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(d.x + 16, d.y + 16, 12, 8);
                // Milk
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(d.x + 18, d.y + 18, 8, 4);
            } else if (d.type === 'scratching_post') {
                ctx.fillStyle = '#854d0e';
                ctx.fillRect(d.x, d.y + d.h - 6, d.w, 6);
                ctx.fillStyle = '#ca8a04';
                ctx.fillRect(d.x + 6, d.y, d.w - 12, d.h - 6);
            } else if (d.type === 'yarn_ball') {
                ctx.fillStyle = d.color || '#ec4899';
                ctx.beginPath();
                ctx.arc(d.x + 8, d.y + 8, 8, 0, Math.PI * 2);
                ctx.fill();
            } else if (d.type === 'study_desk') {
                // ==========================================
                // MEJA BELAJAR (PIXEL STUDY DESK)
                // ==========================================
                // Ground shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
                ctx.fillRect(d.x + 4, d.y + d.h - 6, d.w - 8, 12);

                // Sturdy Desk Legs (Dark Wood)
                ctx.fillStyle = '#451a03';
                ctx.fillRect(d.x + 6, d.y + 18, 10, d.h - 18);
                ctx.fillRect(d.x + d.w - 16, d.y + 18, 10, d.h - 18);
                ctx.fillStyle = '#78350f';
                ctx.fillRect(d.x + 8, d.y + 18, 6, d.h - 20);
                ctx.fillRect(d.x + d.w - 14, d.y + 18, 6, d.h - 20);

                // Crossbeam / Footrest
                ctx.fillStyle = '#451a03';
                ctx.fillRect(d.x + 12, d.y + d.h - 12, d.w - 24, 6);

                // Main Desk Top Slab (Rich Warm Oak/Mahogany)
                ctx.fillStyle = '#92400e';
                ctx.fillRect(d.x, d.y + 14, d.w, 14);
                ctx.fillStyle = '#b45309';
                ctx.fillRect(d.x + 2, d.y + 2, d.w - 4, 14);
                // Top Bevel Highlight
                ctx.fillStyle = '#d97706';
                ctx.fillRect(d.x + 3, d.y + 3, d.w - 6, 4);

                // Desk Writing Mat (Navy Blue)
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(d.x + 22, d.y + 5, 38, 10);
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(d.x + 23, d.y + 5, 36, 2);

                // Open Study Book on the desk
                ctx.fillStyle = '#ef4444'; // Book cover border
                ctx.fillRect(d.x + 28, d.y + 3, 22, 10);
                ctx.fillStyle = '#f8fafc'; // Left & Right open pages
                ctx.fillRect(d.x + 29, d.y + 4, 9, 8);
                ctx.fillRect(d.x + 40, d.y + 4, 9, 8);
                // Book Spine & Text Lines
                ctx.fillStyle = '#cbd5e1';
                ctx.fillRect(d.x + 38, d.y + 4, 2, 8);
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(d.x + 31, d.y + 6, 5, 1);
                ctx.fillRect(d.x + 31, d.y + 8, 5, 1);
                ctx.fillRect(d.x + 42, d.y + 6, 5, 1);
                ctx.fillRect(d.x + 42, d.y + 8, 5, 1);

                // Pencil Holder Cup + Colorful Pencils
                ctx.fillStyle = '#475569';
                ctx.fillRect(d.x + 8, d.y + 4, 8, 10);
                // Pencils sticking out
                ctx.fillStyle = '#ec4899';
                ctx.fillRect(d.x + 9, d.y - 2, 2, 7);
                ctx.fillStyle = '#eab308';
                ctx.fillRect(d.x + 12, d.y - 4, 2, 9);
                ctx.fillStyle = '#10b981';
                ctx.fillRect(d.x + 14, d.y - 1, 2, 6);

                // Cozy Study Lamp (Green Banker's Lamp with Brass base)
                ctx.fillStyle = '#d97706'; // Brass arm
                ctx.fillRect(d.x + d.w - 18, d.y + 2, 4, 8);
                ctx.fillRect(d.x + d.w - 20, d.y + 8, 8, 4);
                // Green lampshade
                ctx.fillStyle = '#15803d';
                ctx.fillRect(d.x + d.w - 24, d.y - 4, 14, 7);
                // Warm bulb glow
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(d.x + d.w - 21, d.y + 2, 8, 2);

                // Nameplate / Sign on Desk
                ctx.fillStyle = '#1f2937';
                ctx.fillRect(d.x + 16, d.y + 18, d.w - 32, 8);
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 5px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('MEJA BELAJAR', d.x + d.w / 2, d.y + 24);
            } else if (d.type === 'beach_umbrella') {
                ctx.fillStyle = '#64748b';
                ctx.fillRect(d.x + d.w / 2 - 2, d.y + 15, 4, d.h - 15);
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(d.x + d.w / 2, d.y + 20, d.w / 2, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = '#fde047';
                ctx.beginPath();
                ctx.arc(d.x + d.w / 2, d.y + 20, d.w / 3.5, Math.PI, 0);
                ctx.fill();
            }
        }
    }

    renderTrees(ctx, vL, vT, vR, vB) {
        for (const t of this.trees) {
            if (t.x + t.w < vL || t.x > vR || t.y + t.h < vT || t.y > vB) continue;

            if (t.type === 'sakura') {
                // Trunk
                ctx.fillStyle = '#451a03';
                ctx.fillRect(t.x + 24, t.y + 35, 12, 30);
                // Blossom Canopy
                ctx.fillStyle = '#f472b6';
                ctx.beginPath();
                ctx.arc(t.x + 30, t.y + 25, 28, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fbcfe8';
                ctx.beginPath();
                ctx.arc(t.x + 25, t.y + 20, 18, 0, Math.PI * 2);
                ctx.fill();
            } else if (t.type === 'pine') {
                // Trunk
                ctx.fillStyle = '#291406';
                ctx.fillRect(t.x + 22, t.y + 45, 10, 28);
                // Pine Needles (Triangles)
                ctx.fillStyle = '#064e3b';
                ctx.beginPath();
                ctx.moveTo(t.x + 27, t.y);
                ctx.lineTo(t.x + 4, t.y + 45);
                ctx.lineTo(t.x + 50, t.y + 45);
                ctx.fill();
                ctx.fillStyle = '#047857';
                ctx.beginPath();
                ctx.moveTo(t.x + 27, t.y + 10);
                ctx.lineTo(t.x + 10, t.y + 45);
                ctx.lineTo(t.x + 44, t.y + 45);
                ctx.fill();
            } else if (t.type === 'palm') {
                // Trunk
                ctx.fillStyle = '#78350f';
                ctx.fillRect(t.x + 24, t.y + 30, 8, 42);
                // Palm Leaves
                ctx.fillStyle = '#15803d';
                ctx.beginPath();
                ctx.ellipse(t.x + 12, t.y + 24, 20, 6, -0.4, 0, Math.PI * 2);
                ctx.ellipse(t.x + 44, t.y + 24, 20, 6, 0.4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Standard Oak Tree
                ctx.fillStyle = '#381c0c';
                ctx.fillRect(t.x + 22, t.y + 38, 12, 28);
                ctx.fillStyle = '#166534';
                ctx.beginPath();
                ctx.arc(t.x + 28, t.y + 26, 26, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(t.x + 25, t.y + 22, 18, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    isWall(x, y, size) {
        const half = size / 2;
        // Outer boundaries of the 2400x1600 world
        if (x - half <= 45 || x + half >= this.worldWidth - 45 ||
            y - half <= 45 || y + half >= this.worldHeight - 45) {
            return true;
        }

        // Check solid collision against standalone House Exterior building
        if (this.house && this.house.isCollision(x, y, size)) {
            return true;
        }

        return false;
    }

    /**
     * Checks if coordinates fall within the House Front Door Trigger Zone
     */
    isHouseDoorTrigger(x, y) {
        return Boolean(this.house && this.house.isDoorTrigger(x, y));
    }

    getHouseExterior() {
        return this.house;
    }

    /**
     * Checks if coordinates fall within the lake water (excluding wooden pier)
     */
    isInWater(x, y) {
        if (!this.lake) return false;
        const lk = this.lake;
        const cx = lk.x + lk.w / 2;
        const cy = lk.y + lk.h / 2;
        const rx = lk.w / 2;
        const ry = lk.h / 2;

        // Wooden pier / dock (x: 420, y: 920, w: 48, h: 110)
        // Pet on wooden pier is walking on wood, not submerged in water
        const onPier = (x >= 405 && x <= 485 && y >= 910 && y <= 1045);
        if (onPier) return false;

        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        return (dx * dx + dy * dy) <= 0.94;
    }

    /**
     * Checks if coordinates fall within the Study Desk drop zone
     */
    isOverStudyDesk(x, y) {
        if (!this.studyDesk) return false;
        const d = this.studyDesk;
        // Bounding box with a generous touch-friendly margin around the desk
        return (
            x >= d.x - 25 &&
            x <= d.x + d.w + 25 &&
            y >= d.y - 25 &&
            y <= d.y + d.h + 30
        );
    }

    getStudyDesk() {
        return this.studyDesk;
    }
}
