# 🐾 Pet Chill - Enhanced Pixel Art Game

Game pet virtual 2D yang hidup dengan grass terrain, karakter pixel art detail, dan sound effects procedural.

## ✨ Fitur Utama

✅ **Grass Terrain** - Latar belakang rumput natural dengan flower details & stone border  
✅ **Enhanced Pet** - Karakter pixel art dengan head bob, leg animation, tail movement & detailed eyes  
✅ **Procedural Sounds** - Web Audio API sound effects: footstep, blink, collision, idle, happy  
✅ **AI Wander** - Pet bergerak acak dengan state machine (Walking ↔ Idle)  
✅ **Smooth Animation** - 60 FPS dengan leg sync & realistic movement  
✅ **Responsive Design** - Works on desktop & mobile dengan pixel-perfect rendering  
✅ **Sound Controls** - Toggle sound, volume control (M key, +/- keys)  

## 🎮 Controls

| Key | Fungsi |
|-----|--------|
| **SPACE** | Pause/Resume |
| **M** | Toggle Sound On/Off |
| **+ (Plus)** | Volume Up |
| **- (Minus)** | Volume Down |

## 📁 Struktur File

```
Pet_chill/
├── index.html              # Entry point dengan updated UI
├── style.css               # Dark theme responsive styling
├── src/
│   ├── main.js            # Enhanced game loop
│   ├── terrain.js         # Grass terrain & collision system
│   ├── pet-enhanced.js    # Advanced pet dengan pixel art
│   ├── sound-manager.js   # Procedural audio effects
│   ├── audio.js           # Legacy audio (optional)
│   ├── map.js             # Original map (legacy)
│   └── pet.js             # Original pet (legacy)
└── README.md              # Dokumentasi
```

## 🚀 Quick Start

### Opsi 1: Buka Langsung
```bash
# Double-click index.html
# atau drag ke browser
```

### Opsi 2: Live Server
```bash
# VS Code: Install "Live Server" extension
# Klik kanan index.html → "Open with Live Server"

# atau Python:
python -m http.server 8000
# Buka http://localhost:8000

# atau Node:
npm install -g http-server
http-server
```

## 🎨 Fitur Detail

### 🌿 Grass Terrain
- **Procedural generation** dengan dithering natural
- **Multiple green shades** untuk texture realism
- **Random flowers** dengan 5 warna berbeda
- **Stone border wall** dengan texture detail
- **Collision detection** untuk pet movement
- **Seamless tiling** untuk visual natural

### 🐾 Enhanced Pet Character
- **Pixel art 32x32** dengan detailed features
- **Head bobbing animation** saat berjalan
- **Leg animation cycle** sync dengan movement
- **Tail wave effect** yang bergerak smooth
- **Detailed eyes** dengan shine & blink animation
- **Ears & facial features** untuk personality lebih
- **Body shading** untuk depth & dimension
- **Natural walk cycle** dengan offset timing

### 🔊 Sound System (Procedural)
- **Footstep sounds** - noise filtering untuk realistic steps
- **Blink sounds** - high-pitched beep saat mata berkedip
- **Collision sounds** - pitch drop saat nabrak tembok
- **Happy sounds** - chirping melody untuk joy expression
- **Idle sounds** - relaxing tone saat santai
- **Volume control** - adjustable master volume (0-100%)
- **No external files** - semua generated real-time

### 🤖 AI Wander System
- **State machine** dengan Walking & Idle states
- **8 directional movement** (up, down, left, right + diagonals)
- **Random direction changes** setiap 2-4 detik
- **Collision avoidance** bounce off walls
- **Natural timing** dengan idle duration 1-3 detik
- **Smooth transitions** antar state

## 🎯 What's New in v2

| Fitur | v1 (Simple) | v2 (Enhanced) |
|-------|------------|---------------|
| Background | Solid color | Procedural grass dengan flowers |
| Pet Model | Pink block | Detailed pixel art (32x32) |
| Pet Animation | Static | Head bob + leg cycle + tail wave |
| Eyes | Simple circles | Shine effect + blink animation |
| Sounds | None | 5 procedural sound types |
| UI | Minimal | Dark theme + controls display |
| Responsiveness | Fixed | Mobile-friendly |
| Code Quality | Basic | Modular dengan OOP |

## 🔧 Technologies

- **HTML5 Canvas 2D** - Graphics rendering
- **Web Audio API** - Procedural sound generation
- **JavaScript ES6** - Object-oriented design
- **Procedural generation** - Terrain & sound synthesis
- **Game loop pattern** - Update + Render cycle
- **State machine** - AI behavior management

## 📊 Performance

- **60 FPS** - Smooth animation dengan requestAnimationFrame
- **Lightweight** - ~30KB JavaScript (no dependencies)
- **Instant load** - No external assets
- **Cross-browser** - Works di semua modern browsers
- **Mobile optimized** - Responsive canvas scaling

## 🌟 Key Improvements

1. **Visual Polish** - Grass tiles dengan realistic texture
2. **Character Design** - Pet lebih expressive dengan animations
3. **Audio Immersion** - 5 sound effects untuk liveliness
4. **Better Controls** - Improved UI dengan clear instructions
5. **Code Organization** - Modular architecture dengan separate files
6. **Mobile Support** - Responsive design untuk semua ukuran layar
7. **Performance** - Optimized rendering & audio generation

## 🎓 How It Works

### Game Loop
```
1. Update → Pet AI moves, animates, blinks
2. Render → Draw terrain, pet, UI
3. Sound → Trigger audio based on events
4. Repeat @ 60 FPS
```

### Terrain Generation
```
1. For each tile (40x40px)
   - Pick base green color
   - Add random shade variation
   - Randomly place flowers (3% chance)
   - Render to offscreen canvas
2. Draw all tiles to main canvas
3. Draw stone border with texture
```

### Pet Animation
```
1. Walk cycle: legs move opposite directions
2. Head bob: up/down while moving
3. Tail wave: sine wave animation
4. Eye blink: random intervals (3-8 sec)
5. Collision: bounce off walls
```

### Sound Synthesis
```
1. Footstep: White noise → low-pass filter
2. Blink: Oscillator frequency drop
3. Collision: Pitch slide down
4. Happy: Double note chirp
5. Idle: Smooth descending tone
```

## 🚀 Future Ideas

- [ ] Multiple pets interacting
- [ ] Pet hunger/happiness meters
- [ ] Food items & feeding system
- [ ] Different pet skins/colors
- [ ] Day/night cycle with lighting
- [ ] Rain/snow weather effects
- [ ] Pause menu UI screen
- [ ] Save/load game state
- [ ] Mobile touch controls
- [ ] Leaderboard system
- [ ] Pet age/growth system
- [ ] Accessories/clothing

## 🐛 Known Issues

- None currently! Game is stable and optimized

## 📝 License

MIT License - Bebas digunakan & dimodifikasi untuk project personal maupun komersial

## 🎬 Live Demo

🎮 **Play Now:** https://davidchils50-creator.github.io/Pet_chill

📖 **Repository:** https://github.com/davidchils50-creator/Pet_chill

## 🙏 Credits

Dibuat dengan ❤️ menggunakan Vanilla JavaScript, HTML5 Canvas & Web Audio API

Referensi:
- Pixel art techniques
- Game loop patterns
- Procedural audio synthesis
- State machine AI

---

**Enjoy your Pet Chill experience! 🐾✨**

Amati pet Anda bergerak, bermain, dan berkembang dalam dunia pixel art yang hidup dan interaktif!
