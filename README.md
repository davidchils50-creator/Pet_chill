# 🐾 Pet Chill - 2D Pixel Art Game

Game pet virtual sederhana berbasis Canvas 2D dengan karakter balok pixel yang bergerak acak (AI Wander), mata yang berkedip otomatis, dan map bergaya grid pixel dengan collision detection.

## 📋 Fitur

✅ **Map 2D Grid Pixel** - Latar belakang bergaya pixel art dengan tembok pembatas  
✅ **Pet Balok Pixel** - Karakter utama dengan wujud balok sederhana  
✅ **Animasi Mata Berkedip** - Mata otomatis berkedip dengan interval acak  
✅ **AI Wander** - Pergerakan pet acak ke segala arah dengan state machine (WALKING ↔ IDLE)  
✅ **Collision Detection** - Pet berbalik arah saat menyentuh tembok pembatas  
✅ **Pixel-Perfect Rendering** - CSS `image-rendering: pixelated` untuk tampilan yang tajam  
✅ **Game Loop 60 FPS** - Menggunakan `requestAnimationFrame` untuk performa optimal  
✅ **Modular Code Structure** - Kode terpisah per file dengan class yang rapi  

## 🎮 Controls

| Kontrol | Fungsi |
|---------|--------|
| **SPACE** | Pause/Resume game |
| (otomatis) | Pet bergerak dan beranimasi otomatis |

## 📁 Struktur Proyek

```
Pet_chill/
├── index.html          # Entry point HTML dengan canvas
├── style.css           # Styling dengan pixel-perfect rendering
├── src/
│   ├── main.js        # Game loop & initialization
│   ├── map.js         # Class Map - rendering & collision
│   └── pet.js         # Class Pet - AI wander & animasi
└── README.md          # Dokumentasi ini
```

## 🚀 Cara Menjalankan

### Lokal (Tanpa Server)
1. Clone atau download repository
2. Buka `index.html` langsung di browser (double-click atau drag ke browser)
3. Game akan mulai otomatis

### Dengan Live Server (Recommended)
```bash
# Gunakan VS Code Live Server extension atau:
python -m http.server 8000
# Buka http://localhost:8000 di browser
```

## 🏗️ Arsitektur Kode

### `src/map.js` - Map Class
Menangani rendering map dan collision detection:
- **Render map** - Tembok pembatas (border), lantai, dan optional grid lines
- **Collision Detection** - Fungsi `isWall()` untuk detect tabrakan dengan tembok
- **Walkable Area** - Mendapatkan area aman untuk pet bergerak

```javascript
map = new Map(canvas);
map.render();                          // Render setiap frame
if (map.isWall(x, y, size)) { ... }   // Cek collision
```

### `src/pet.js` - Pet Class
Karakter pet dengan AI dan animasi:

#### Struktur Pet
- **Badan**: Balok warna pink (#ff6b9d)
- **Mata**: 2 mata putih dengan pupil hitam (berkedip)
- **Tangan**: 2 tangan sederhana di samping badan
- **Kaki**: 2 kaki di bawah badan

#### AI Wander System (State Machine)
```
[IDLE] --maxIdleFrames expired--> [WALKING]
 ↑                                    ↓
 +------maxWalkFrames expired----------+
```

- **IDLE STATE**: Pet berhenti selama 1-2 detik (random)
- **WALKING STATE**: Pet berjalan acak ke 8 arah selama 2-5 detik (random)
- **Direction**: Acak ke 8 arah (atas, bawah, kiri, kanan, diagonal)
- **Collision**: Saat menyentuh tembok, arah dibalik (tidak tembus)

#### Animasi Mata Berkedip
- **Open State**: Mata menampilkan lingkaran putih + pupil hitam
- **Closed State**: Mata menampilkan garis horizontal (tertutup)
- **Interval**: Berkedip setiap 3-8 detik (random)
- **Duration**: Mata tertutup ~8 frame (133ms @ 60fps)

```javascript
pet = new Pet(canvas, map, startX, startY);
pet.update();  // Update logika setiap frame
pet.render();  // Render ke canvas setiap frame
```

### `src/main.js` - Game Loop
Entry point dan game loop utama:

```javascript
function gameLoop() {
    // 1. Request next frame dari browser
    requestAnimationFrame(gameLoop);
    
    // 2. UPDATE - Update logika game
    pet.update();
    
    // 3. RENDER - Render semua objects
    map.render();
    pet.render();
}
```

**requestAnimationFrame** = Browser native animation loop yang synchronized dengan refresh rate monitor (60 FPS di monitor 60Hz)

## 🎨 Styling & Pixel Art

File `style.css` menggunakan properti penting untuk pixel-perfect rendering:

```css
#gameCanvas {
    image-rendering: pixelated;           /* Chrome/Firefox */
    image-rendering: crisp-edges;         /* Safari */
    image-rendering: -webkit-optimize-contrast;  /* Webkit */
    -ms-interpolation-mode: nearest-neighbor;    /* IE/Edge */
}
```

Tanpa ini, canvas akan terlihat blur saat discale di browser modern.

## 🔧 Konfigurasi

Edit nilai di `src/pet.js` dan `src/map.js` untuk customize:

### Pet Configuration (src/pet.js)
```javascript
this.speed = 1.5;              // Kecepatan pet (pixel/frame)
this.maxWalkFrames = 120-300;  // Durasi berjalan (frame)
this.maxIdleFrames = 60-180;   // Durasi idle (frame)
this.bodyColor = '#ff6b9d';    // Warna badan pet
```

### Map Configuration (src/map.js)
```javascript
this.gridSize = 40;            // Ukuran tile/grid (pixel)
this.floorColor = '#2d3561';   // Warna lantai
this.wallColor = '#4a5f8f';    // Warna tembok
```

## 📊 Performance

- **FPS Target**: 60 FPS (stable di semua browser modern)
- **Memory Usage**: Minimal (~5MB)
- **No Dependencies**: Pure vanilla JavaScript, zero npm packages
- **Bundle Size**: ~15KB (HTML + CSS + JS)

## 🐛 Troubleshooting

### Canvas terlihat blur/buram
- ✅ CSS sudah include `image-rendering: pixelated`
- ✅ Canvas tidak di-scale dengan CSS (gunakan canvas width/height attribute)

### Pet tidak bergerak
- ✅ Cek console log untuk error
- ✅ Pastikan `requestAnimationFrame` didukung browser (semua modern browser)

### Pet stuck di tembok
- ✅ Jika terjadi, arah akan dibalik otomatis
- ✅ Adjustment speed atau gridSize jika sering terjadi

## 📚 Best Practices yang Digunakan

1. **Class-based Architecture** - Modular dan OOP design
2. **State Machine Pattern** - AI Wander menggunakan simple state machine
3. **Separation of Concerns** - Setiap file punya tanggung jawab spesifik
4. **requestAnimationFrame** - Native browser animation API terbaik
5. **Pixel-Perfect Rendering** - CSS image-rendering untuk pixel art
6. **Comments & Documentation** - Kode mudah dipahami dan di-maintain
7. **No External Dependencies** - Pure vanilla JS, instant load

## 🎓 Konsep Yang Digunakan

- **Canvas 2D API** - Drawing graphics di browser
- **Game Loop Pattern** - Update → Render cycle
- **State Machine** - AI behavior management
- **Collision Detection** - Hit testing untuk tembok
- **Random Number Generation** - Procedural AI behavior
- **Timer/Counter Pattern** - Animation timing
- **Object-Oriented Programming** - Class design

## 📝 Lisensi

MIT License - Bebas digunakan dan dimodifikasi

## 🚀 Pengembangan Lanjutan

Fitur yang bisa ditambah:
- [ ] Multiple pets dengan AI yang saling interact
- [ ] Food & eating mechanic
- [ ] Health/mood system
- [ ] Sound effects & background music
- [ ] Save/load game state
- [ ] Touch controls untuk mobile
- [ ] Different pet skins/customization
- [ ] Day/night cycle
- [ ] Furniture & decoration placement

---

**Dibuat dengan ❤️ menggunakan Vanilla JavaScript**

Untuk pertanyaan atau kontribusi, silakan buka issue atau pull request di GitHub!
