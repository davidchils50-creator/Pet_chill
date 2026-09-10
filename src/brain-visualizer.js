/* ========================================================================
   BRAIN-VISUALIZER.JS - Visualisator Saraf & Neuromorphic SNN Real-Time
   
   Arsitektur Visual:
   1. Anatomi Korteks Biologis Organik (Dua Hemisfer Otak, Gyrus/Sulcus, & 6 Zona Fungsional)
   2. Morfologi Neuron Nyata (Soma Berdendrit, Akson, & Terminal Sinapsis)
   3. Dinamika Luminesensi Nyata:
      - Semakin keras kerja neuron (Tegangan V, Firing Rate, Spike) -> Semakin TERANG MENYALA / BERCORONA
      - Semakin pasif/rendah nilainya -> Semakin GELAP / TEMBUS PANDANG redup ke latar belakang
   4. Penyaluran Listrik Bio-Elektrik & Percikan Pulsa Aksi (Action Potential Plasma Spikes)
   5. Interaktivitas Pan & Smooth Zoom: Dari Peta Seluruh Hemisfer hingga Inspeksi 1 Neuron Spesifik
   ======================================================================== */

export class BrainVisualizer {
    constructor(canvas, pet) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pet = pet;
        this.brain = pet.brain;

        // Dimensi Ruang Koordinat Virtual Otak
        this.worldWidth = 2600;
        this.worldHeight = 1600;

        // Kamera & Transformasi Zoom
        this.zoom = 0.52;
        this.targetZoom = 0.52;
        this.minZoom = 0.22;
        this.maxZoom = 22.0;

        this.camX = this.worldWidth / 2;
        this.camY = this.worldHeight / 2;
        this.targetCamX = this.camX;
        this.targetCamY = this.camY;

        // Interaksi Drag & Pan
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.camStartX = 0;
        this.camStartY = 0;

        // Seleksi 1 Neuron
        this.selectedNeuronId = 1820; // Default: salah satu neuron motorik/kognitif
        this.hoveredNeuronId = null;

        // Buffer Riwayat Osiloskop untuk 1 Neuron Terpilih (80 sampel V(t))
        this.oscilloscopeHistory = new Float32Array(80);
        this.oscillatorIndex = 0;

        // Partikel Bio-Elektrik & Pulsa Aksi Sinapsis (Action Potential Energy Sparks)
        this.spikePackets = [];
        this.maxSpikePackets = 160;

        // Partikel Ambien Bio-Fluida / Neurotransmiter Melayang di Cairan Otak
        this.ambientParticles = [];
        this.initAmbientParticles(60);

        // Flash Petir Sinaptik Global
        this.synapticLightningArcs = [];

        // Definisi 6 Zona Korteks Biologis Organik
        this.activeAreas = [
            {
                id: 'sensorik',
                name: 'KORTEKS SENSORIK & SDR',
                color: '#22c55e',
                glowColor: 'rgba(34, 197, 94, 0.4)',
                range: [0, 399],
                cx: 480,
                cy: 800,
                rx: 340,
                ry: 480,
                currentActivity: 0
            },
            {
                id: 'asosiasi',
                name: 'KORTEKS ASOSIASI & PREDIKSI',
                color: '#06b6d4',
                glowColor: 'rgba(6, 182, 212, 0.4)',
                range: [400, 1199],
                cx: 1040,
                cy: 520,
                rx: 380,
                ry: 420,
                currentActivity: 0
            },
            {
                id: 'amigdala',
                name: 'NUKLEUS AMIGDALA & EMOSI',
                color: '#f43f5e',
                glowColor: 'rgba(244, 63, 94, 0.5)',
                range: [1200, 1399],
                cx: 1300,
                cy: 880,
                rx: 230,
                ry: 210,
                currentActivity: 0
            },
            {
                id: 'atensi',
                name: 'SALIENCE MAP & ATENSI',
                color: '#c084fc',
                glowColor: 'rgba(192, 132, 252, 0.4)',
                range: [1400, 1599],
                cx: 1300,
                cy: 1240,
                rx: 290,
                ry: 240,
                currentActivity: 0
            },
            {
                id: 'memori',
                name: 'HIPOKAMPUS & SDM MEMORI',
                color: '#eab308',
                glowColor: 'rgba(234, 179, 8, 0.4)',
                range: [1600, 1799],
                cx: 1680,
                cy: 540,
                rx: 320,
                ry: 400,
                currentActivity: 0
            },
            {
                id: 'output',
                name: 'KORTEKS MOTORIK & WERNICKE',
                color: '#fb7185',
                glowColor: 'rgba(251, 113, 133, 0.45)',
                range: [1800, 1999],
                cx: 2140,
                cy: 800,
                rx: 320,
                ry: 480,
                currentActivity: 0
            }
        ];

        this.dominantArea = this.activeAreas[0];
        this.maxAreaActivity = 0;
        this.animTick = 0;

        // Inisialisasi Koordinat Morfologi Neuron Organik
        this.nodes = [];
        this.initOrganicNodePositions();

        this.bindEvents();
        this.viewMode = 'ALL';
    }

    /**
     * Inisialisasi partikel halus cairan serebrospinal
     */
    initAmbientParticles(count = 60) {
        this.ambientParticles = [];
        for (let i = 0; i < count; i++) {
            this.ambientParticles.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: 1.0 + Math.random() * 2.2,
                alpha: 0.15 + Math.random() * 0.35,
                pulseSpeed: 0.02 + Math.random() * 0.03,
                color: Math.random() > 0.6 ? '#38bdf8' : (Math.random() > 0.5 ? '#34d399' : '#c084fc')
            });
        }
    }

    /**
     * SEED KONTINU RANDOM UNTUK BENTUK BIOLOGIS ORGANIK
     */
    pseudoRandom(seed) {
        const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return x - Math.floor(x);
    }

    /**
     * Tentukan koordinat spasial (x, y) setiap neuron secara ORGANIK ANATOMIS
     * Menyusun 2.000 neuron dalam 6 lobus korteks anatomis & lapisan laminar bercelah (Layer I-VI)
     * Rapi, organik, bergelombang seperti lipatan otak (gyrus/sulcus), TANPA menjadi matriks/tabel kaku!
     */
    initOrganicNodePositions() {
        const total = this.brain.totalNeurons || 2000;
        this.nodes = new Array(total);

        // Definisi Pusat Anatomis 6 Lobus Otak (Dalam Ruang Virtual 2600 x 1600)
        // Hemisfer Kiri (Sensorik & SDR), Pusat (Asosiasi & Amigdala), Hemisfer Kanan (Memori & Motorik/Speech)
        const lobeConfigs = {
            sensorik_phys: { cx: 420, cy: 560, rx: 220, ry: 260, area: 'sensorik' },
            sensorik_sdr:  { cx: 500, cy: 980, rx: 280, ry: 340, area: 'sensorik' },
            asosiasi_l1:   { cx: 880, cy: 460, rx: 240, ry: 240, area: 'asosiasi' },
            asosiasi_l2:   { cx: 1120, cy: 440, rx: 260, ry: 260, area: 'asosiasi' },
            asosiasi_l3:   { cx: 1040, cy: 780, rx: 220, ry: 220, area: 'asosiasi' },
            amigdala:      { cx: 1300, cy: 880, rx: 180, ry: 160, area: 'amigdala' },
            atensi:        { cx: 1300, cy: 1240, rx: 240, ry: 200, area: 'atensi' },
            memori_epis:   { cx: 1560, cy: 460, rx: 240, ry: 260, area: 'memori' },
            memori_sdm:    { cx: 1760, cy: 700, rx: 240, ry: 260, area: 'memori' },
            output_motor:  { cx: 2080, cy: 600, rx: 240, ry: 280, area: 'output' },
            output_speech: { cx: 2200, cy: 1020, rx: 260, ry: 300, area: 'output' }
        };

        for (let i = 0; i < total; i++) {
            let areaId = 'sensorik';
            let cfg = lobeConfigs.sensorik_phys;
            let label = `Neuron #${i}`;
            let subIndex = i;

            if (i < 100) {
                cfg = lobeConfigs.sensorik_phys;
                areaId = 'sensorik';
                subIndex = i;
                if (i === 10) label = 'Posisi X';
                else if (i === 20) label = 'Posisi Y';
                else if (i === 30) label = 'Lapar (Hunger)';
                else if (i === 40) label = 'Senang (Happy)';
                else if (i === 50) label = 'Energi';
                else if (i === 60) label = 'Berenang';
                else if (i === 70) label = 'Diangkat';
                else label = `Sensorik Fisik #${i}`;
            } else if (i < 400) {
                cfg = lobeConfigs.sensorik_sdr;
                areaId = 'sensorik';
                subIndex = i - 100;
                label = `SDR Teks #${i}`;
            } else if (i < 700) {
                cfg = lobeConfigs.asosiasi_l1;
                areaId = 'asosiasi';
                subIndex = i - 400;
                label = `Asosiasi L1 #${i}`;
            } else if (i < 1000) {
                cfg = lobeConfigs.asosiasi_l2;
                areaId = 'asosiasi';
                subIndex = i - 700;
                label = `Sequence Mem L2 #${i}`;
            } else if (i < 1200) {
                cfg = lobeConfigs.asosiasi_l3;
                areaId = 'asosiasi';
                subIndex = i - 1000;
                label = `Working Mem L3 #${i}`;
            } else if (i < 1400) {
                cfg = lobeConfigs.amigdala;
                areaId = 'amigdala';
                subIndex = i - 1200;
                label = `Amigdala / Emosi #${i}`;
            } else if (i < 1600) {
                cfg = lobeConfigs.atensi;
                areaId = 'atensi';
                subIndex = i - 1400;
                label = `Salience Atensi #${i}`;
            } else if (i < 1700) {
                cfg = lobeConfigs.memori_epis;
                areaId = 'memori';
                subIndex = i - 1600;
                label = `Episodic Loop #${i}`;
            } else if (i < 1800) {
                cfg = lobeConfigs.memori_sdm;
                areaId = 'memori';
                subIndex = i - 1700;
                label = `SDM Hash Gate #${i}`;
            } else if (i < 1900) {
                cfg = lobeConfigs.output_motor;
                areaId = 'output';
                subIndex = i - 1800;
                if (i < 1825) label = 'Motor Belok Kiri';
                else if (i < 1850) label = 'Motor Belok Kanan';
                else if (i < 1875) label = 'Motor Maju Atas';
                else if (i < 1890) label = 'Motor Renang';
                else label = 'Motor Lompat';
            } else if (i < 2000) {
                cfg = lobeConfigs.output_speech;
                areaId = 'output';
                subIndex = i - 1900;
                label = `Kognitif Speech #${i}`;
            } else {
                cfg = { cx: 1300, cy: 1460, rx: 360, ry: 180, area: 'atensi' };
                areaId = 'atensi';
                subIndex = i - 2000;
                label = `Neuron Evolusi #${i}`;
            }

            // SUSUNAN LAMINAR KORTEKS ANATOMIS (Layer I s/d Layer VI)
            // Menggunakan struktur busur melengkung bertingkat (Curved Cortical Arches)
            const layerCount = 6;
            const layerIndex = subIndex % layerCount; // Layer 0..5
            const positionInLayer = Math.floor(subIndex / layerCount);
            const totalInLayer = Math.ceil(300 / layerCount);

            // Radius radial bertingkat per layer (Lapisan korteks luar ke dalam)
            const layerRadiusFactor = 0.35 + (layerIndex / (layerCount - 1)) * 0.65;
            
            // Sudut distribusi lengkungan busur gyrus (Arc range 220 derajat)
            const arcStart = -Math.PI * 0.65;
            const arcRange = Math.PI * 1.3;
            const baseAngle = arcStart + (positionInLayer / Math.max(1, totalInLayer)) * arcRange;

            // Gelombang jitter sinusoide organik agar tidak kaku/matriks
            const waveJitter = Math.sin(positionInLayer * 0.7 + layerIndex * 1.3) * 16 + Math.cos(i * 0.3) * 10;
            const radialDist = (cfg.rx * layerRadiusFactor) + waveJitter;

            const x = cfg.cx + Math.cos(baseAngle) * radialDist;
            const y = cfg.cy + Math.sin(baseAngle) * (cfg.ry * layerRadiusFactor) + (waveJitter * 0.6);

            // Cabang dendrit mikro
            const dendriteCount = 3 + (i % 3);
            const dendrites = [];
            for (let d = 0; d < dendriteCount; d++) {
                const dAngle = (d / dendriteCount) * Math.PI * 2 + (this.pseudoRandom(i * 10 + d) - 0.5) * 0.8;
                const dLen = 14 + this.pseudoRandom(i * 7 + d) * 22;
                dendrites.push({
                    angle: dAngle,
                    len: dLen,
                    bend: (this.pseudoRandom(i * 13 + d) - 0.5) * 0.6
                });
            }

            this.nodes[i] = {
                id: i,
                x,
                y,
                area: areaId,
                label,
                layer: layerIndex + 1,
                dendrites,
                somaType: i % 4 === 0 ? 'pyramidal' : (i % 3 === 0 ? 'multipolar' : 'stellate'),
                basePulsePhase: (i * 0.17) % (Math.PI * 2)
            };
        }
    }

    /**
     * Tangani Event Interaksi Pengguna (Mouse / Touch)
     */
    bindEvents() {
        if (!this.canvas) return;

        // 1. Wheel Zooming (Smooth zoom terpusat pada kursor)
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mouseScreenX = e.clientX - rect.left;
            const mouseScreenY = e.clientY - rect.top;

            const worldBeforeX = this.screenToWorldX(mouseScreenX);
            const worldBeforeY = this.screenToWorldY(mouseScreenY);

            const zoomDelta = e.deltaY < 0 ? 1.25 : 0.80;
            const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.targetZoom * zoomDelta));
            this.targetZoom = newZoom;

            this.targetCamX = worldBeforeX - (mouseScreenX - this.canvas.width / 2) / newZoom;
            this.targetCamY = worldBeforeY - (mouseScreenY - this.canvas.height / 2) / newZoom;
            this.updateZoomSliderUI();
        }, { passive: false });

        // 2. Drag / Pan Peta Otak
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.camStartX = this.targetCamX;
            this.camStartY = this.targetCamY;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = (e.clientX - this.dragStartX) / this.zoom;
                const dy = (e.clientY - this.dragStartY) / this.zoom;
                this.targetCamX = this.camStartX - dx;
                this.targetCamY = this.camStartY - dy;
            } else if (this.canvas) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                this.hoveredNeuronId = this.findClosestNeuron(mouseX, mouseY);
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // 3. Klik untuk Seleksi & Inspeksi 1 Neuron Spesifik
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            this.handlePointerClick(clickX, clickY);
        });

        // 4. Touch Handlers untuk Mobile / Layar Sentuh
        let touchStartDist = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.dragStartX = e.touches[0].clientX;
                this.dragStartY = e.touches[0].clientY;
                this.camStartX = this.targetCamX;
                this.camStartY = this.targetCamY;
            } else if (e.touches.length === 2) {
                this.isDragging = false;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                touchStartDist = Math.hypot(dx, dy);
            }
        }, { passive: true });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.isDragging) {
                const dx = (e.touches[0].clientX - this.dragStartX) / this.zoom;
                const dy = (e.touches[0].clientY - this.dragStartY) / this.zoom;
                this.targetCamX = this.camStartX - dx;
                this.targetCamY = this.camStartY - dy;
            } else if (e.touches.length === 2 && touchStartDist > 0) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDist = Math.hypot(dx, dy);
                const factor = currentDist / touchStartDist;
                this.targetZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.targetZoom * factor));
                touchStartDist = currentDist;
                this.updateZoomSliderUI();
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                this.isDragging = false;
                touchStartDist = 0;
            }
        });

        // 5. Tombol Close di Kartu Inspektor
        const btnClose = document.getElementById('btnCloseInspector');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                this.deselectNeuron();
            });
        }

        // 6. Tombol Stimulasi Manual di Inspektor
        const btnStim = document.getElementById('btnInspStimulate');
        if (btnStim) {
            btnStim.addEventListener('click', () => {
                this.stimulateSelectedNeuron(1.8);
            });
        }
    }

    screenToWorldX(screenX) {
        return (screenX - this.canvas.width / 2) / this.zoom + this.camX;
    }

    screenToWorldY(screenY) {
        return (screenY - this.canvas.height / 2) / this.zoom + this.camY;
    }

    worldToScreenX(worldX) {
        return (worldX - this.camX) * this.zoom + this.canvas.width / 2;
    }

    worldToScreenY(worldY) {
        return (worldY - this.camY) * this.zoom + this.canvas.height / 2;
    }

    findClosestNeuron(screenX, screenY) {
        const worldX = this.screenToWorldX(screenX);
        const worldY = this.screenToWorldY(screenY);
        const hitRadius = Math.max(18, 30 / this.zoom);

        let closestId = null;
        let minDistSq = hitRadius * hitRadius;

        const total = Math.min(this.nodes.length, this.brain.totalNeurons);
        for (let i = 0; i < total; i++) {
            const node = this.nodes[i];
            if (!node) continue;
            const dx = node.x - worldX;
            const dy = node.y - worldY;
            const distSq = dx * dx + dy * dy;
            if (distSq < minDistSq) {
                minDistSq = distSq;
                closestId = i;
            }
        }
        return closestId;
    }

    handlePointerClick(clientX, clientY) {
        const found = this.findClosestNeuron(clientX, clientY);
        if (found !== null) {
            this.selectNeuron(found);
        } else {
            this.deselectNeuron();
        }
    }

    deselectNeuron() {
        this.selectedNeuronId = null;
        const card = document.getElementById('neuronInspectorCard');
        if (card) card.classList.add('hidden');
    }

    selectNeuron(id) {
        if (id < 0 || id >= this.brain.totalNeurons) return;
        this.selectedNeuronId = id;
        this.selectedNeuronChanged = true;
        const card = document.getElementById('neuronInspectorCard');
        if (card) card.classList.remove('hidden');
        this.updateInspectorUI();
    }

    zoomFitAll() {
        this.viewMode = 'ALL';
        const margin = 100;
        const scaleX = (this.canvas.width - margin * 2) / this.worldWidth;
        const scaleY = (this.canvas.height - margin * 2) / this.worldHeight;
        this.targetZoom = Math.max(this.minZoom, Math.min(0.95, Math.min(scaleX, scaleY)));
        this.targetCamX = this.worldWidth / 2;
        this.targetCamY = this.worldHeight / 2;
        this.updateZoomSliderUI();
    }

    zoomFocusSingle(neuronId = null) {
        const targetId = neuronId !== null ? neuronId : this.selectedNeuronId;
        this.selectNeuron(targetId);

        const node = this.nodes[targetId];
        if (node) {
            this.viewMode = 'SINGLE';
            this.targetZoom = 15.0;
            this.targetCamX = node.x;
            this.targetCamY = node.y;
            this.updateZoomSliderUI();
        }
    }

    updateZoomSliderUI() {
        const slider = document.getElementById('sliderZoom');
        const badge = document.getElementById('txtZoomLevel');
        if (slider) {
            slider.value = Math.round(this.targetZoom * 100);
        }
        if (badge) {
            badge.textContent = `${Math.round(this.targetZoom * 100)}%`;
        }
    }

    setZoomBySlider(pctValue) {
        const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, pctValue / 100));
        this.targetZoom = newZoom;
        const badge = document.getElementById('txtZoomLevel');
        if (badge) badge.textContent = `${Math.round(newZoom * 100)}%`;
    }

    zoomIn() {
        this.targetZoom = Math.min(this.maxZoom, this.targetZoom * 1.35);
        this.updateZoomSliderUI();
    }

    zoomOut() {
        this.targetZoom = Math.max(this.minZoom, this.targetZoom * 0.75);
        this.updateZoomSliderUI();
    }

    resetZoom() {
        this.targetZoom = 1.0;
        this.updateZoomSliderUI();
    }

    jumpToArea(areaId) {
        const area = this.activeAreas.find(a => a.id === areaId);
        if (area) {
            this.targetCamX = area.cx;
            this.targetCamY = area.cy;
            this.targetZoom = 1.15;
            this.updateZoomSliderUI();
        }
    }

    stimulateSelectedNeuron(amount = 1.8) {
        if (this.selectedNeuronId !== null && this.selectedNeuronId < this.brain.totalNeurons) {
            this.brain.v[this.selectedNeuronId] += amount;
            this.updateInspectorUI();
        }
    }

    updateInspectorUI() {
        const id = this.selectedNeuronId;
        if (id === null || id >= this.brain.totalNeurons) return;

        const b = this.brain;
        const node = this.nodes[id] || { label: `Neuron #${id}`, area: 'unknown' };

        const elId = document.getElementById('inspNeuronId');
        const elArea = document.getElementById('inspNeuronArea');
        const elV = document.getElementById('inspNeuronV');
        const elBarV = document.getElementById('inspBarV');
        const elVth = document.getElementById('inspNeuronVth');
        const elRate = document.getElementById('inspNeuronRate');
        const elStatus = document.getElementById('inspNeuronStatus');
        const elSynIn = document.getElementById('inspSynIn');
        const elSynOut = document.getElementById('inspSynOut');

        const v = b.v[id] || 0;
        const vth = (b.v_th && b.v_th[id] > 0) ? b.v_th[id] : 1.0;
        const rate = b.recentRate[id] || 0;
        const isRefractory = b.refractoryTimer[id] > 0;
        const isSpiking = b.spikeState[id] === 1;

        if (elId) elId.textContent = `#${id} (${node.label})`;
        if (elArea) {
            elArea.textContent = b.getNeuronArea(id).toUpperCase();
            const colorMap = { sensorik: '#22c55e', asosiasi: '#06b6d4', amigdala: '#f43f5e', atensi: '#c084fc', memori: '#eab308', output: '#fb7185' };
            elArea.style.color = colorMap[b.getNeuronArea(id)] || '#38bdf8';
        }
        if (elV) elV.textContent = `${v.toFixed(2)} V`;
        if (elBarV) {
            const pct = Math.min(100, Math.max(0, (v / vth) * 100));
            elBarV.style.width = `${pct}%`;
            elBarV.style.background = isSpiking ? '#ffffff' : (pct > 75 ? '#fbbf24' : (pct > 30 ? '#38bdf8' : '#64748b'));
        }
        if (elVth) elVth.textContent = `${vth.toFixed(2)} V`;
        if (elRate) elRate.textContent = `${rate.toFixed(1)} Hz`;
        if (elStatus) {
            if (isSpiking) {
                elStatus.textContent = '⚡ SPIKING (POTENSIAL AKSI)';
                elStatus.style.color = '#fef08a';
            } else if (isRefractory) {
                elStatus.textContent = '⏳ REFRAKTORI (PEMULIHAN)';
                elStatus.style.color = '#94a3b8';
            } else if (v >= 0.7) {
                elStatus.textContent = '🔥 PRA-LETUPAN (EKSITATORI)';
                elStatus.style.color = '#f59e0b';
            } else if (v >= 0.25) {
                elStatus.textContent = '🌊 TERDEPOLARISASI (AKTIF)';
                elStatus.style.color = '#38bdf8';
            } else if (v >= 0.08) {
                elStatus.textContent = '⚡ ARUS BASAL (TONIK)';
                elStatus.style.color = '#818cf8';
            } else {
                elStatus.textContent = '💤 RESTING (POTENSIAL ISTIRAHAT)';
                elStatus.style.color = '#4ade80';
            }
        }

        // Hitung sinapsis masuk & keluar jika neuron baru dipilih
        if (this.selectedNeuronChanged || this.cachedInspectorId !== id) {
            this.cachedInspectorId = id;
            this.selectedNeuronChanged = false;
            let inCount = 0;
            let outCount = 0;
            const totalSyn = b.synapseCount;
            for (let s = 0; s < totalSyn; s++) {
                if (b.synPre[s] === id) outCount++;
                if (b.synPost[s] === id) inCount++;
            }
            if (elSynIn) elSynIn.textContent = `${(inCount * b.virtualMultiplier).toLocaleString('id-ID')} Sinapsis`;
            if (elSynOut) elSynOut.textContent = `${(outCount * b.virtualMultiplier).toLocaleString('id-ID')} Sinapsis`;
        }
    }

    computeAreaActivities() {
        const b = this.brain;
        if (!b) return;

        let maxScore = -1;
        let dominant = this.activeAreas[0];
        const time = this.animTick || 0;

        for (let idx = 0; idx < this.activeAreas.length; idx++) {
            const area = this.activeAreas[idx];
            let spikeCount = 0;
            let vSum = 0;
            let rateSum = 0;
            const [start, end] = area.range;
            const count = Math.max(1, end - start + 1);

            for (let i = start; i <= end && i < b.totalNeurons; i++) {
                if (b.spikeState[i] === 1) spikeCount++;
                vSum += b.v[i] || 0;
                rateSum += b.recentRate[i] || 0;
            }

            const avgV = vSum / count;
            const avgRate = rateSum / count;

            // Biological baseline oscillations (rhythm gelombang otak hidup 15-35%)
            const bioOscillation = 18 + Math.sin(time * 1.5 + idx * 1.1) * 8 + Math.cos(time * 0.8 + idx * 2.3) * 5;

            let stressBonus = 0;
            if (area.id === 'amigdala' && b.neuromodulators.cortisol > 0.2) {
                stressBonus = b.neuromodulators.cortisol * 60;
            } else if (area.id === 'atensi' && b.neuromodulators.acetylcholine > 0.5) {
                stressBonus = b.neuromodulators.acetylcholine * 35;
            } else if (area.id === 'memori' && b.vocabulary && b.vocabulary.size > 0) {
                stressBonus = Math.min(30, b.vocabulary.size * 1.5);
            }

            const rawScore = Math.round(spikeCount * 9.5 + avgRate * 4.2 + Math.max(0, avgV) * 42 + bioOscillation + stressBonus);
            const score = Math.min(100, Math.max(14, rawScore));
            area.currentActivity = score;
            area.spikeCount = spikeCount;
            area.avgRate = avgRate;

            if (score > maxScore) {
                maxScore = score;
                dominant = area;
            }
        }

        this.dominantArea = dominant;
        this.maxAreaActivity = maxScore;
    }

    /**
     * LOOP RENDER UTAMA VISUALISASI OTAK (60 FPS)
     */
    render(dtFactor = 1.0) {
        if (!this.canvas || !this.ctx || !this.brain) return;

        // 1. Interpolasi Halus Kamera
        const lerpFactor = 0.18;
        this.zoom += (this.targetZoom - this.zoom) * lerpFactor;
        this.camX += (this.targetCamX - this.camX) * lerpFactor;
        this.camY += (this.targetCamY - this.camY) * lerpFactor;

        if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        }

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.animTick = (this.animTick || 0) + 0.035 * dtFactor;
        this.computeAreaActivities();

        // 2. Background Ruang Serebral Kosmik High-Contrast
        this.renderHighContrastBackground(ctx);

        // 3. Terapkan Transformasi Ruang Otak
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.camX, -this.camY);

        // 4. Gambar Siluet Korteks Otak Organik & Garis Medan Saraf
        this.renderBrainSilhouette(ctx);

        // 5. Gambar Partikel Neurotransmiter Melayang (Cairan Serebrospinal)
        this.renderAmbientNeurotransmitters(ctx);

        // 6. Gambar Zona / Lobus Saraf Organik (Glow Field)
        this.renderOrganicBrainLobes(ctx);

        // 7. Gambar Jaringan Sinapsis & Penyaluran Listrik Bio-Elektrik
        this.renderSynapsesAndElectricalFlow(ctx);

        // 8. Gambar Kumpulan Neuron Nyata dengan Skala Terang/Gelap Sesuai Beban Kerja
        this.renderBiologicalNeurons(ctx);

        // 9. Jika sedang Zoom Tinggi (Single Neuron Mode), Gambar Anatomi Mendalam 1 Sel
        if (this.zoom > 5.0 && this.selectedNeuronId !== null) {
            this.renderSingleNeuronDeepInspect(ctx, this.selectedNeuronId);
        }

        ctx.restore();

        // 10. Overlay Legenda Warna & Struktur Sinapsis SNN
        this.renderVisualLegend(ctx);

        // 11. Rekam Osiloskop untuk Neuron Terpilih
        if (this.selectedNeuronId !== null && this.selectedNeuronId < this.brain.totalNeurons) {
            this.oscilloscopeHistory[this.oscillatorIndex] = this.brain.v[this.selectedNeuronId];
            this.oscillatorIndex = (this.oscillatorIndex + 1) % this.oscilloscopeHistory.length;
        }

        // 12. Update Real-Time HUD Neuromodulator & Stats
        this.syncNeuromorphicHUD();
    }

    /**
     * RENDER SILUET BIOLOGIS ORGANIK DUA HEMISFER OTAK
     */
    renderBrainSilhouette(ctx) {
        ctx.save();
        const time = this.animTick;

        // Hemisfer Kiri & Kanan dengan Fisura Longitudinal Sagittal di Tengah
        const centerX = this.worldWidth / 2;
        const centerY = this.worldHeight / 2;

        // Ethereal Meninges Outer Aura Glow
        const meningesGrad = ctx.createRadialGradient(centerX, centerY, 300, centerX, centerY, 1150);
        meningesGrad.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
        meningesGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.04)');
        meningesGrad.addColorStop(0.85, 'rgba(168, 85, 247, 0.02)');
        meningesGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = meningesGrad;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 1150, 720, 0, 0, Math.PI * 2);
        ctx.fill();

        // Garis Lekukan Gyrus & Sulcus Organik (Neocortical Foldings)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 12]);

        for (let fold = 0; fold < 6; fold++) {
            const rx = 850 + fold * 45 + Math.sin(time + fold) * 10;
            const ry = 520 + fold * 35 + Math.cos(time + fold) * 10;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Fisura Sagittal Tengah (Longitudinal Fissure / Corpus Callosum Conduit)
        const fissGrad = ctx.createLinearGradient(centerX, centerY - 650, centerX, centerY + 650);
        fissGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        fissGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.18)');
        fissGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.strokeStyle = fissGrad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 650);
        ctx.bezierCurveTo(centerX - 35, centerY - 200, centerX + 35, centerY + 200, centerX, centerY + 650);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * RENDER PARTIKEL AMBIEN BIO-FLUIDA (NEUROTRANSMITER MELAYANG)
     */
    renderAmbientNeurotransmitters(ctx) {
        ctx.save();
        for (const p of this.ambientParticles) {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around world boundary
            if (p.x < 0) p.x = this.worldWidth;
            if (p.x > this.worldWidth) p.x = 0;
            if (p.y < 0) p.y = this.worldHeight;
            if (p.y > this.worldHeight) p.y = 0;

            const pulse = Math.sin(this.animTick * 2 + p.pulseSpeed * 100) * 0.5 + 0.5;
            const currentAlpha = p.alpha * (0.6 + pulse * 0.4);

            ctx.fillStyle = p.color;
            ctx.globalAlpha = currentAlpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * RENDER LOBUS & ORGAN OTAK ORGANIK (ORGANIC NEBULA GLOW FIELD)
     */
    renderOrganicBrainLobes(ctx) {
        ctx.save();
        const pulse = Math.sin(this.animTick * 3) * 0.5 + 0.5;

        for (const area of this.activeAreas) {
            const isDominant = this.dominantArea === area;
            const isHighActivity = area.currentActivity >= 35 || isDominant;
            const isAmigdalaUnderStress = area.id === 'amigdala' && (this.brain.neuromodulators.cortisol > 0.25 || area.currentActivity > 35);

            // Radius dinamis berdenyut sesuai aktivitas
            const actFactor = Math.min(1.0, area.currentActivity / 100);
            const dynamicRx = area.rx * (1.0 + actFactor * 0.15 + (isHighActivity ? pulse * 0.06 : 0));
            const dynamicRy = area.ry * (1.0 + actFactor * 0.15 + (isHighActivity ? pulse * 0.06 : 0));

            // Radial Glow Field Organik
            const grad = ctx.createRadialGradient(area.cx, area.cy, dynamicRx * 0.2, area.cx, area.cy, dynamicRx * 1.35);
            if (isAmigdalaUnderStress) {
                grad.addColorStop(0, `rgba(239, 68, 68, ${0.28 + pulse * 0.15})`);
                grad.addColorStop(0.5, 'rgba(220, 38, 38, 0.14)');
                grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            } else if (isHighActivity) {
                grad.addColorStop(0, `${area.glowColor}`);
                grad.addColorStop(0.5, `rgba(56, 189, 248, ${0.12 + actFactor * 0.1})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                grad.addColorStop(0, `rgba(30, 41, 59, 0.15)`);
                grad.addColorStop(0.6, `rgba(15, 23, 42, 0.05)`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(area.cx, area.cy, dynamicRx, dynamicRy, 0, 0, Math.PI * 2);
            ctx.fill();

            // Garis Kontur Ethereal Korteks Organik (tanpa kotak kaku)
            ctx.strokeStyle = isAmigdalaUnderStress ? '#ef4444' : (isHighActivity ? area.color : 'rgba(51, 65, 85, 0.4)');
            ctx.lineWidth = isHighActivity ? 2.5 : 1.2;
            ctx.beginPath();
            ctx.ellipse(area.cx, area.cy, dynamicRx, dynamicRy, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Ethereal Area Floating Title Tag
            const titleY = area.cy - dynamicRy - 18;
            ctx.fillStyle = isAmigdalaUnderStress ? '#fca5a5' : (isHighActivity ? '#fde047' : '#94a3b8');
            ctx.font = isHighActivity ? 'bold 12px "Press Start 2P", monospace' : '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(area.name, area.cx, titleY);

            // Sub-status Aktivitas %
            ctx.font = '10px monospace';
            ctx.fillStyle = isAmigdalaUnderStress ? '#fef08a' : (isHighActivity ? '#38bdf8' : '#64748b');
            ctx.fillText(`Aktivitas: ${area.currentActivity}% | Spikes: ${area.spikeCount || 0}`, area.cx, titleY + 14);
        }
        ctx.restore();
    }

    /**
     * RENDER BACKGROUND RUANG SEREBRAL KOSMIK HIGH-CONTRAST (TECH-ORGANIC GRID MESH)
     */
    renderHighContrastBackground(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 1. Base Ultra-Dark Midnight Canvas
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);

        // 2. Grid Mesh Bio-Teknologis Halus
        ctx.save();
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.28)';
        ctx.lineWidth = 1;

        const gridSize = 48 * this.zoom;
        const offsetX = (w / 2 - this.camX * this.zoom) % gridSize;
        const offsetY = (h / 2 - this.camY * this.zoom) % gridSize;

        ctx.beginPath();
        for (let x = offsetX; x < w; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let y = offsetY; y < h; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    /**
     * RENDER SAMBUNGAN SINAPSIS & PENYALURAN LISTRIK BERCAHAYA (ACTION POTENTIAL CURRENTS)
     * Memperjelas perbedaan antara jalur TERHUBUNG (Eksitatori/Inhibitori/Aktif) vs TIDAK TERHUBUNG/LEMAH
     */
    renderSynapsesAndElectricalFlow(ctx) {
        ctx.save();
        const b = this.brain;
        const synCount = b.synapseCount;
        const time = this.animTick;
        const focusedId = this.hoveredNeuronId !== null ? this.hoveredNeuronId : this.selectedNeuronId;

        // Sampel sinapsis representatif (450 jalur untuk detail jaringan yang lebih jelas)
        const step = Math.max(1, Math.floor(synCount / 450));

        for (let s = 0; s < synCount; s += step) {
            const pre = b.synPre[s];
            const post = b.synPost[s];
            const w = b.synWeight[s];

            if (pre < this.nodes.length && post < this.nodes.length) {
                const nodePre = this.nodes[pre];
                const nodePost = this.nodes[post];
                if (!nodePre || !nodePost) continue;

                // Cek apakah sinapsis terhubung dengan neuron yang sedang di-focus/hover/klik
                const isFocusedPre = focusedId === pre;
                const isFocusedPost = focusedId === post;
                const isFocusedSynapse = isFocusedPre || isFocusedPost;

                const preV = b.v[pre] || 0;
                const postV = b.v[post] || 0;
                const preSpiked = b.spikeState[pre] === 1;
                const postSpiked = b.spikeState[post] === 1;
                const isPreAmigdala = pre >= 1200 && pre < 1400;

                // Titik kontrol kurva lengkungan biologis
                const midX = (nodePre.x + nodePost.x) * 0.5 + Math.sin(pre * 0.5 + post * 0.3) * 32;
                const midY = (nodePre.y + nodePost.y) * 0.5 + Math.cos(pre * 0.3 + post * 0.5) * 32;

                // ==============================================================
                // 1. KONDISI FOCUS MODE (Saat Neuron Di-Klik / Di-Hover)
                // Highlight khusus jalur sinapsis MASUK & KELUAR neuron terpilih
                // ==============================================================
                if (isFocusedSynapse) {
                    const focusColor = isFocusedPre ? '#facc15' : '#38bdf8'; // Gold (Keluar) vs Cyan (Masuk)
                    ctx.strokeStyle = focusColor;
                    ctx.lineWidth = 2.8;
                    ctx.shadowColor = focusColor;
                    ctx.shadowBlur = 10;

                    ctx.beginPath();
                    ctx.moveTo(nodePre.x, nodePre.y);
                    ctx.quadraticCurveTo(midX, midY, nodePost.x, nodePost.y);
                    ctx.stroke();

                    // Bouton Sinapsis Terminal di Ujung Post-Synaptic
                    ctx.fillStyle = focusColor;
                    ctx.beginPath();
                    ctx.arc(nodePost.x, nodePost.y, 4.0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
                // ==============================================================
                // 2. KONDISI LISTRIK AKTIF / SPIKING (BERCAHAYA TERANG BENDERANG)
                // ==============================================================
                else if (preSpiked || postSpiked) {
                    const electricColor = isPreAmigdala ? 'rgba(244, 63, 94, 0.95)' : (w >= 0 ? 'rgba(56, 189, 248, 0.95)' : 'rgba(251, 113, 133, 0.9)');
                    ctx.strokeStyle = electricColor;
                    ctx.lineWidth = 2.4;
                    ctx.shadowColor = isPreAmigdala ? '#ef4444' : '#38bdf8';
                    ctx.shadowBlur = 12;

                    ctx.beginPath();
                    ctx.moveTo(nodePre.x, nodePre.y);
                    ctx.quadraticCurveTo(midX, midY, nodePost.x, nodePost.y);
                    ctx.stroke();

                    // Paket energi potensial aksi meluncur
                    if (this.spikePackets.length < this.maxSpikePackets) {
                        this.spikePackets.push({
                            startX: nodePre.x,
                            startY: nodePre.y,
                            midX: midX,
                            midY: midY,
                            endX: nodePost.x,
                            endY: nodePost.y,
                            progress: 0,
                            speed: 0.09 + Math.random() * 0.06,
                            color: isPreAmigdala ? '#fca5a5' : (w >= 0 ? '#ffffff' : '#fda4af'),
                            coreColor: isPreAmigdala ? '#ef4444' : '#38bdf8',
                            radius: 3.5 + Math.random() * 2.0
                        });
                    }
                    ctx.shadowBlur = 0;
                } 
                // ==============================================================
                // 3. KONDISI AKTIVITAS SEDANG (TEGANGAN DEPOLARISASI)
                // ==============================================================
                else if (preV > 0.3 || postV > 0.3) {
                    const actRatio = Math.max(preV, postV);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = w >= 0 ? `rgba(56, 189, 248, ${0.25 + actRatio * 0.45})` : `rgba(244, 63, 94, ${0.25 + actRatio * 0.45})`;
                    ctx.lineWidth = 1.2 + actRatio * 1.0;

                    ctx.beginPath();
                    ctx.moveTo(nodePre.x, nodePre.y);
                    ctx.quadraticCurveTo(midX, midY, nodePost.x, nodePost.y);
                    ctx.stroke();
                } 
                // ==============================================================
                // 4. KONDISI STRUKTURAL TERHUBUNG (|w| > 0.12) - TAMPILKAN JELAS!
                // ==============================================================
                else if (Math.abs(w) > 0.12) {
                    ctx.shadowBlur = 0;
                    // Warna kontras tinggi untuk jalur terhubung walau dalam posisi resting
                    ctx.strokeStyle = w >= 0 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(244, 63, 94, 0.24)';
                    ctx.lineWidth = 0.9 + Math.abs(w) * 0.6;

                    ctx.beginPath();
                    ctx.moveTo(nodePre.x, nodePre.y);
                    ctx.quadraticCurveTo(midX, midY, nodePost.x, nodePost.y);
                    ctx.stroke();
                }
                // ==============================================================
                // 5. JALUR TIDAK TERHUBUNG / SAMBUNGAN LEMAH (|w| <= 0.12)
                // Tidak digambar garis penuh agar kontras dengan jalur terhubung!
                // ==============================================================
            }
        }

        // RENDER & UPDATE PARTIKEL LISTRIK POTENSIAL AKSI (ENERGY PLASMA PACKETS)
        ctx.shadowBlur = 10;
        for (let p = this.spikePackets.length - 1; p >= 0; p--) {
            const pkt = this.spikePackets[p];
            pkt.progress += pkt.speed;

            if (pkt.progress >= 1.0) {
                this.spikePackets.splice(p, 1);
                continue;
            }

            const t = pkt.progress;
            const invT = 1 - t;
            const curX = invT * invT * pkt.startX + 2 * invT * t * pkt.midX + t * t * pkt.endX;
            const curY = invT * invT * pkt.startY + 2 * invT * t * pkt.midY + t * t * pkt.endY;

            // Ekor Percikan Listrik
            ctx.strokeStyle = pkt.coreColor;
            ctx.lineWidth = pkt.radius * 0.8;
            ctx.shadowColor = pkt.coreColor;
            ctx.beginPath();
            ctx.arc(curX, curY, pkt.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inti Plasma Putih
            ctx.fillStyle = pkt.color;
            ctx.beginPath();
            ctx.arc(curX, curY, pkt.radius * 0.65, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * RENDER NEURON BIOLOGIS ORGANIK DENGAN KONTRAS WARNA TINGGI & MEMBRAN BERCANTAK
     * - Terang Benderang / White-Hot saat Spiking
     * - Ring Neon Menyala Terang dengan Inti Pusat bahkan saat RESTING!
     */
    renderBiologicalNeurons(ctx) {
        ctx.save();
        const b = this.brain;
        const total = Math.min(this.nodes.length, b.totalNeurons);
        const time = this.animTick;

        // Peta Warna Neon Kontras Tinggi per Area Fungsional
        const areaColors = {
            sensorik: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.8)', rim: '#34d399' },
            asosiasi: { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.8)', rim: '#38bdf8' },
            amigdala: { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.85)', rim: '#fb7185' },
            atensi:   { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.8)', rim: '#e879f9' },
            memori:   { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)', rim: '#fde047' },
            output:   { main: '#fb7185', glow: 'rgba(251, 113, 133, 0.8)', rim: '#fda4af' }
        };

        for (let i = 0; i < total; i++) {
            const node = this.nodes[i];
            if (!node) continue;

            const v = b.v[i] || 0;
            const vth = b.v_th[i] || 1.0;
            const isSpiking = b.spikeState[i] === 1;
            const rate = b.recentRate[i] || 0;
            const isSelected = this.selectedNeuronId === i;
            const isHovered = this.hoveredNeuronId === i;

            const areaTheme = areaColors[node.area] || areaColors.sensorik;

            // Rasio Aktivitas Membran Dinamis (0.0 .. 1.0)
            const vRatio = Math.min(1.0, Math.max(0.0, v / vth));
            const rateRatio = Math.min(1.0, rate / 25.0);
            const workload = isSpiking ? 1.0 : Math.max(vRatio, rateRatio);

            // Radius Badan Soma (Jelas & Mudah Dilihat di Semua Mode)
            let baseRadius = isSpiking ? 9.5 : (4.5 + workload * 4.5);
            if (isSelected) baseRadius = Math.max(baseRadius, 9.0);

            // ==============================================================
            // 1. CABANG DENDRIT BIOLOGIS BERCAHAYA
            // ==============================================================
            if (node.dendrites && (workload > 0.1 || this.zoom > 0.8)) {
                for (const d of node.dendrites) {
                    const angle = d.angle + Math.sin(time + node.basePulsePhase) * 0.08;
                    const len = d.len * (0.85 + workload * 0.35);
                    const endX = node.x + Math.cos(angle) * len;
                    const endY = node.y + Math.sin(angle) * len;
                    const bendX = (node.x + endX) * 0.5 + Math.cos(angle + Math.PI * 0.5) * (d.bend * 12);
                    const bendY = (node.y + endY) * 0.5 + Math.sin(angle + Math.PI * 0.5) * (d.bend * 12);

                    if (workload > 0.3 || isSpiking) {
                        ctx.strokeStyle = isSpiking ? '#fef08a' : areaTheme.rim;
                        ctx.lineWidth = 1.6 + workload * 1.2;
                    } else {
                        ctx.strokeStyle = 'rgba(51, 65, 85, 0.45)'; // Dendrit resting terlihat jelas
                        ctx.lineWidth = 0.9;
                    }

                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.quadraticCurveTo(bendX, bendY, endX, endY);
                    ctx.stroke();

                    // Bouton Sinapsis Terminal di Ujung Dendrit
                    ctx.fillStyle = workload > 0.3 ? areaTheme.rim : 'rgba(71, 85, 105, 0.6)';
                    ctx.beginPath();
                    ctx.arc(endX, endY, 1.8 + workload * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // ==============================================================
            // 2. CORONA / AURA NEON TERANG BENDERANG (AKTIF / SPIKING)
            // ==============================================================
            if (workload > 0.25 || isSpiking || isSelected) {
                const auraPulse = Math.sin(time * 4 + node.basePulsePhase) * 0.5 + 0.5;
                const auraRadius = baseRadius + (5 + workload * 14) + (isSpiking ? auraPulse * 8 : 0);

                const grad = ctx.createRadialGradient(node.x, node.y, baseRadius * 0.3, node.x, node.y, auraRadius);
                if (isSpiking) {
                    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                    grad.addColorStop(0.35, 'rgba(254, 240, 138, 0.85)');
                    grad.addColorStop(0.7, areaTheme.glow);
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                } else {
                    grad.addColorStop(0, areaTheme.glow);
                    grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.3)');
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
                ctx.fill();

                // Shockwave Ripple Ring saat Spiking
                if (isSpiking) {
                    ctx.strokeStyle = '#fef08a';
                    ctx.lineWidth = 2.0;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, baseRadius + 6 + auraPulse * 8, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // ==============================================================
            // 3. BADAN SEL SOMA (KONTRASTING SOMA WITH GLOWING RIM & NUCLEUS)
            // ==============================================================
            let somaFill = '#0b1329'; // Deep Navy Center (Resting Baseline)

            if (isSpiking) {
                somaFill = '#ffffff'; // White-hot plasma
            } else if (workload > 0.75) {
                somaFill = '#fef08a'; // Light gold
            } else if (workload > 0.4) {
                somaFill = areaTheme.main; // Solid Area Neon
            } else if (workload > 0.15) {
                somaFill = '#1e293b'; // Slate active
            } else {
                somaFill = '#0b132c'; // High-contrast navy center for resting
            }

            // Gambar Badan Soma
            ctx.fillStyle = somaFill;
            ctx.beginPath();
            ctx.arc(node.x, node.y, baseRadius, 0, Math.PI * 2);
            ctx.fill();

            // Membran Sel Lipida / Ring Outer Kontras Tinggi (MENYALA BAHKAN SAAT RESTING)
            ctx.strokeStyle = isSpiking ? '#ffffff' : (isSelected ? '#ec4899' : areaTheme.rim);
            ctx.lineWidth = isSpiking ? 2.8 : (isSelected ? 3.0 : 1.6);
            ctx.stroke();

            // Inti Sel Nucleus Dot (Mencegah neuron telihat kosong)
            ctx.fillStyle = isSpiking ? '#ffffff' : areaTheme.rim;
            ctx.beginPath();
            ctx.arc(node.x, node.y, isSpiking ? 3.0 : 1.5, 0, Math.PI * 2);
            ctx.fill();

            // ==============================================================
            // 4. CROSSHAIR HIGHLIGHT SAAT NEURON TERPILIH / HOVER
            // ==============================================================
            if (isSelected || isHovered) {
                ctx.strokeStyle = isSelected ? '#f43f5e' : '#38bdf8';
                ctx.lineWidth = 2.2;
                const arm = 16;
                ctx.beginPath();
                ctx.moveTo(node.x - arm, node.y);
                ctx.lineTo(node.x + arm, node.y);
                ctx.moveTo(node.x, node.y - arm);
                ctx.lineTo(node.x, node.y + arm);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(node.x, node.y, baseRadius + 6, 0, Math.PI * 2);
                ctx.stroke();
            }

            // ==============================================================
            // 5. LABEL TEKS NEURON (HANYA MUNCUL SAAT DI-KLIK / TERPILIH)
            // ==============================================================
            if (isSelected) {
                const labelText = `Neuron #${i}: ${node.label}`;
                const subText = `${node.area.toUpperCase()} L${node.layer || 1} | ${v.toFixed(2)}V (${Math.round(workload * 100)}%)`;
                
                ctx.font = 'bold 11px monospace';
                const textWidth = Math.max(ctx.measureText(labelText).width, ctx.measureText(subText).width);
                const pillW = textWidth + 18;
                const pillH = 34;
                const pillX = node.x - pillW / 2;
                const pillY = node.y - baseRadius - pillH - 10;

                ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
                ctx.strokeStyle = '#f43f5e';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(pillX, pillY, pillW, pillH, 6);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
                ctx.beginPath();
                ctx.moveTo(node.x - 5, pillY + pillH);
                ctx.lineTo(node.x + 5, pillY + pillH);
                ctx.lineTo(node.x, pillY + pillH + 6);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#f43f5e';
                ctx.stroke();

                ctx.fillStyle = '#fde047';
                ctx.textAlign = 'center';
                ctx.fillText(labelText, node.x, pillY + 14);

                ctx.fillStyle = '#93c5fd';
                ctx.font = '9px monospace';
                ctx.fillText(subText, node.x, pillY + 27);
            }
        }
        ctx.restore();
    }

    /**
     * RENDER OVERLAY LEGENDA STRUKTUR & SINAPSIS SNN (CANVAS OVERLAY UI)
     * Memberikan indikator visual warna lobus, status spike, dan jalur terhubung
     */
    renderVisualLegend(ctx) {
        ctx.save();
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Kartu Legenda di Sudut Kiri Bawah Canvas
        const cardX = 16;
        const cardY = h - 145;
        const cardW = 270;
        const cardH = 130;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('🧠 LEGENDA SNN & STRUKTUR KORTEKS', cardX + 12, cardY + 18);

        // Grid Items
        const items = [
            { label: 'Sensorik & SDR', color: '#10b981' },
            { label: 'Asosiasi & Prediksi', color: '#06b6d4' },
            { label: 'Amigdala & Emosi', color: '#f43f5e' },
            { label: 'Atensi & Salience', color: '#c084fc' },
            { label: 'Hipokampus Memori', color: '#f59e0b' },
            { label: 'Motorik & Speech', color: '#fb7185' }
        ];

        ctx.font = '9px monospace';
        for (let i = 0; i < items.length; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const ix = cardX + 12 + col * 130;
            const iy = cardY + 36 + row * 18;

            ctx.fillStyle = items[i].color;
            ctx.beginPath();
            ctx.arc(ix + 4, iy - 3, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(items[i].label, ix + 14, iy);
        }

        // Indicator Lines
        const lineY = cardY + 98;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardX + 12, lineY);
        ctx.lineTo(cardX + 32, lineY);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Sinapsis Terhubung (+)', cardX + 38, lineY + 3);

        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardX + 148, lineY);
        ctx.lineTo(cardX + 168, lineY);
        ctx.stroke();
        ctx.fillText('Inhibitori (-)', cardX + 174, lineY + 3);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('⚡ WHITE = SPIKE AKSI', cardX + 12, cardY + 118);

        ctx.restore();
    }

    /**
     * MODE SINGLE NEURON DEEP INSPECT
     * Gambar Diagram Anatomis & Biofisika Mendalam untuk 1 Neuron Spesifik
     */
    renderSingleNeuronDeepInspect(ctx, id) {
        const node = this.nodes[id];
        if (!node) return;

        const b = this.brain;
        const v = b.v[id] || 0;
        const vth = b.v_th[id] || 1.0;
        const rate = b.recentRate[id] || 0;
        const isSpiking = b.spikeState[id] === 1;

        const cx = node.x;
        const cy = node.y;

        ctx.save();

        // 1. Pohon Dendrit Masuk (Dendritic Arbor)
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3.5;
        for (let angle = 0.7; angle <= 2.5; angle += 0.36) {
            const dx = Math.cos(angle * Math.PI) * 80;
            const dy = Math.sin(angle * Math.PI) * 80;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + dx, cy + dy);
            ctx.stroke();

            // Sinapsis Input Bouton
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(cx + dx, cy + dy, 5.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Akson Hillock & Serat Akson Keluar
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 95, cy);
        ctx.stroke();

        // Terminal Akson
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(cx + 95, cy, 7.0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Badan Sel Membran Besar (Soma)
        const somaRadius = 40;
        const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, somaRadius);
        grad.addColorStop(0, isSpiking ? '#ffffff' : (v > 0.6 ? '#facc15' : '#38bdf8'));
        grad.addColorStop(0.7, isSpiking ? '#fde047' : '#0284c7');
        grad.addColorStop(1, '#0f172a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, somaRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSpiking ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.arc(cx, cy, somaRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inti Sel (Nucleus) Berdenyut Sesuai Frekuensi
        const nucleusPulse = 11 + Math.sin(Date.now() * 0.01) * Math.min(6, rate * 0.4);
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(cx, cy, nucleusPulse, 0, Math.PI * 2);
        ctx.fill();

        // Cincin Ambang Adaptif (v_th ring)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.0;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, somaRadius + (vth - 1.0) * 25 + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Floating Info Card Langsung di Samping Neuron
        const cardX = cx + 85;
        const cardY = cy - 85;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fillRect(cardX, cardY, 220, 145);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(cardX, cardY, 220, 145);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`NEURON #${id}`, cardX + 10, cardY + 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`Area: ${node.area.toUpperCase()}`, cardX + 10, cardY + 42);
        ctx.fillText(`Tegangan V: ${v.toFixed(3)} V`, cardX + 10, cardY + 62);
        ctx.fillText(`Ambang Vth: ${vth.toFixed(3)} V`, cardX + 10, cardY + 82);
        ctx.fillText(`Firing Rate: ${rate.toFixed(1)} Hz`, cardX + 10, cardY + 102);

        ctx.fillStyle = isSpiking ? '#fef08a' : (v > 0.6 ? '#38bdf8' : '#4ade80');
        ctx.fillText(`Status: ${isSpiking ? '⚡ SPIKE (AKSI)' : (v > 0.6 ? '🔥 DEPOLARISASI' : '💤 RESTING')}`, cardX + 10, cardY + 126);

        ctx.restore();
    }

    /**
     * SINKRONISASI METER NEUROMODULATOR & STATUS GLOBAL SNN
     */
    syncNeuromorphicHUD() {
        const b = this.brain;
        if (!b) return;

        const d = b.neuromodulators.dopamine || 0;
        const c = b.neuromodulators.cortisol || 0;
        const n = b.neuromodulators.norepinephrine || 0;
        const s = b.neuromodulators.serotonin || 0;
        const a = b.neuromodulators.acetylcholine || 0;

        const setBar = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.style.width = `${Math.min(100, Math.max(0, val * 100))}%`;
        };

        const setTxt = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setBar('barDopa', d);
        setBar('barCort', c);
        setBar('barNore', n);
        setBar('barSero', s);
        setBar('barAchy', a);

        setTxt('txtDopaVal', `${Math.round(d * 100)}%`);
        setTxt('txtCortVal', `${Math.round(c * 100)}%`);
        setTxt('txtNoreVal', `${Math.round(n * 100)}%`);
        setTxt('txtSeroVal', `${Math.round(s * 100)}%`);
        setTxt('txtAchyVal', `${Math.round(a * 100)}%`);

        // Stats Brain
        setTxt('txtBrainSpikes', `${b.stats.spikesPerTick || 0}`);
        setTxt('txtBrainAvgRate', `${b.calcAvgFiringRate()} Hz`);
        setTxt('txtBrainPredErr', `${b.calcPredictionError()}`);
        setTxt('txtBrainTotalNeurons', `${b.getNeuronCount().toLocaleString('id-ID')}`);
        setTxt('txtBrainVirtualSynapses', `${(b.synapseCount * b.virtualMultiplier).toLocaleString('id-ID')}`);
        setTxt('txtBrainLastThought', b.stats.lastEmittedSpeech || (b.lastSpeechOutput || 'HENING / MENGAMATI'));
        setTxt('txtBrainNeuronStatus', `${b.getNeuronCount().toLocaleString('id-ID')} (${b.totalNeurons} Fisik)`);
        setTxt('txtBrainSynapseStatus', `${(b.synapseCount * b.virtualMultiplier).toLocaleString('id-ID')} Sinapsis`);
        setTxt('txtBrainVocabStatus', `${b.vocabulary ? b.vocabulary.size : 0} Kata (Tersimpan)`);

        if (this.dominantArea) {
            const cleanName = this.dominantArea.name.replace(/^\d+\.\s*/, '');
            setTxt('txtBrainDominantOrgan', `${cleanName} (${this.dominantArea.currentActivity}%)`);
            const domEl = document.getElementById('txtBrainDominantOrgan');
            if (domEl && domEl.parentElement) {
                domEl.parentElement.style.borderColor = this.dominantArea.color;
            }
        }

        this.updateInspectorUI();
        this.renderOscilloscopeCanvas();
    }

    /**
     * Render grafik gelombang osiloskop V(t) di panel inspektor
     */
    renderOscilloscopeCanvas() {
        const oscCanvas = document.getElementById('oscCanvas');
        if (!oscCanvas) return;
        const ctx = oscCanvas.getContext('2d');
        const w = oscCanvas.width;
        const h = oscCanvas.height;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const len = this.oscilloscopeHistory.length;
        for (let i = 0; i < len; i++) {
            const idx = (this.oscillatorIndex + i) % len;
            const val = this.oscilloscopeHistory[idx];
            const x = (i / (len - 1)) * w;
            const y = h - Math.min(h - 4, Math.max(4, (val / 1.5) * h));

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    resize(w, h) {
        if (!this.canvas) return;
        this.canvas.width = w;
        this.canvas.height = h;
    }
}
