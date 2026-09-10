# 🐾 Pet Chill - Neuromorphic Pixel Art Virtual Pet Game

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Pet Chill** adalah game virtual pet 2D bergaya retro 16-bit pixel art interaktif yang ditenagai oleh simulasi **Neuromorphic Spiking Neural Network (SNN)** berbasis biologi komputasi. Pet Anda tidak digerakkan oleh bot percakapan berbasis aturan (*rule-based if-else*), melainkan memiliki jaringan otak biologis dinamis dengan lebih dari 2.000 neuron Izhikevich, plastisitas sinaptik homeostatis (HSPC), neuromodulasi dopamin & serotonin, memori terdistribusi jarang (*Sparse Distributed Representation*), serta sintesis kalimat alami bahasa Indonesia.

---

## 🌟 Fitur Utama

### 🧠 1. Arsitektur Otak Neuromorfik SNN (`src/brain.js`)
* **Model Neuron Biologis Izhikevich**: Mensimulasikan dinamika potensial membran ($v$), pemulihan ($u$), dan penembakan impuls saraf (*spiking*) secara real-time pada 60 FPS.
* **Topologi Korteks Berlapis (2.000+ Neuron)**:
  * **Sensory Cortex (Neuron 0 - 399)**: Menerima input visual delta posisi, kontak tanah/tabrakan, rasa lapar (*hunger*), energi, dan stimulus kata suara/teks.
  * **Working Memory & Association Cortex (Neuron 400 - 1199)**: Mempertahankan jejak stimulus terkini dan mengintegrasikan konteks antar-modalitas.
  * **Hippocampal & Reasoning Area (Neuron 1200 - 1599)**: Pemrosesan asosiasi jangka panjang dan konsolidasi memori.
  * **Pre-Motor & Motor Cortex (Neuron 1600 - 1899)**: Mengontrol keputusan gerak motorik mandiri (jalan, diam, tidur, makan).
  * **Speech & Vocalization Cortex (Neuron 1900 - 1999)**: Korteks artikulasi vokal untuk memicu produksi ujaran kata.
* **Plastisitas Sinaptik Homeostatis (HSPC - Homeostatic Synaptic Plasticity & Scaling)**:
  * Mempertahankan laju penembakan target kortikal (~8-12 Hz) agar jaringan tidak mengalami saturasi (*epileptiform runaway excitation*) ataupun mati suri (*quiescence*).
* **Neuromodulasi Tiga Faktor & STDP (Spike-Timing-Dependent Plasticity)**:
  * Modulasi berbasis **Dopamin** (pemberian hadiah/makanan) dan **Serotonin** (elusan/ketenangan) yang mengontrol penguatan (*LTP*) atau pelemahan (*LTD*) sinapsis secara biologis.
* **Sparse Distributed Representation (SDR)**:
  * Setiap konsep kata dienkodekan ke dalam pola jarang 100 neuron spesifik untuk toleransi gangguan (*noise-tolerance*) dan kapasitas asosiasi tinggi.
* **Generasi Bahasa Alami Berbasis Transisi Sinaptik (N-Gram SNN Synthesis)**:
  * Mampu mengenali frasa multi-kata (misal: *"siapa kamu"*, *"apa kabar"*, *"terima kasih"*, *"ayo main"*, *"lapar nih"*, *"tidur dulu"*).
  * Menyusun kalimat alami beruntun dengan integrasi energi transisi asosiasi sekuensial ($w_{\text{seq}} \times 3.2 + w_{\text{stim}} \times 0.7$) dan reduplikasi baku (misal: *"Sama-sama"*, *"Nyam-nyam"*).
* **Konsolidasi Memori Jangka Panjang (LTM)**:
  * Menghubungkan pengalaman belajar dengan persistensi lokal sehingga pembelajaran hewan peliharaan tersimpan permanen antar-sesi.

---

### 🔬 2. Visualizer Aktivitas Korteks Real-Time (`src/brain-visualizer.js`)
* **HUD Monitor Aktivitas Saraf**:
  * Tampilan visual interaktif untuk mengamati firing rate per korteks (Sensory, Working Memory, Reasoner, Motor, Speech).
  * Indikator neurotransmiter biologis aktif: **Dopamin** (reward/gairah) dan **Serotonin** (afeksi/ketenangan).
  * Diagnostik kestabilan sinapsis dan total asosiasi kata yang telah dipelajari.

---

### 🏡 3. Dunia Game Ganda (Taman Terbuka & Rumah Interior)
* **Eksterior / Grass Terrain (`src/terrain.js` & `src/house-exterior.js`)**:
  * Taman rumput hijau prosedural dengan bunga berwarna-warni, tekstur tanah alami, dinding pembatas batu, dan bangunan rumah pixel art yang estetik.
* **Interior Rumah Nyaman (`src/interior.js`)**:
  * Transisi pintu mulus saat memasuki rumah.
  * Dilengkapi kasur tidur pet, mangkuk makanan (*feeding bowl*), mainan bola interaktif, karpet, meja, dan perabotan hangat.
* **Smooth Follow Camera (`src/camera.js`)**:
  * Kamera cerdas dengan interpolasi lerp lembut, pencegah sentakan, dan pembatasan batas peta (*boundary clamping*).

---

### 🐾 4. Karakter Pet Pixel Art Responsif (`src/pet-enhanced.js`)
* **Anatomi & Animasi Lengkap 16-bit**:
  * Ayunan kepala saat melangkah (*head bob*), gerakan kaki bipedal tersinkronisasi dengan bantalan telapak (*paw pads*), kibasan ekor halus (*sine-wave tail wagging*), dan kedipan mata berkilau (*sparkle blink*).
* **Status Vital & Emosi Hidup**:
  * **Lapar (Hunger)**: Meningkat seiring waktu; pet mencari makanan atau meminta makan saat lapar.
  * **Energi (Energy)**: Berkurang saat aktif bergerak; pet dapat tidur di kasur untuk memulihkan tenaga.
  * **Afeksi (Affection)**: Meningkat saat dielus atau diberi kata-kata positif.
  * **Mood & Suasana Hati**: Berubah dinamis dipengaruhi neurotransmiter dopamin dan serotonin.

---

### 🔊 5. Sistem Audio Prosedural (`src/sound-manager.js`)
* 100% disintesis secara dinamis menggunakan **Web Audio API** tanpa memerlukan file audio eksternal yang berat:
  * Suara langkah kaki bertekstur (*bandpass filtered noise*).
  * Suara mengeong & mendengkur (*procedural meow & purr synthesis*).
  * Suara makan kriuk renyah saat memakan ikan (*eating crunch sound*).
  * Suara tabrakan dinding & nada gembira saat dipuji.

---

## 🎮 Kontrol & Interaksi

| Kontrol | Tindakan |
|---|---|
| **W, A, S, D** / **Panah** | Gerakan langsung / panduan arah pet |
| **Klik & Seret Pet** | Mengangkat atau memindahkan pet di layar |
| **Klik Elus Pet** | Mengelus pet untuk menaikkan serotonin & rasa sayang |
| **Tombol Makanan / P** | Menjatuhkan ikan lezat ke dekat pet untuk dimakan |
| **Tombol Pujian (Reward)** | Memberi dopamin positif saat pet melakukan hal baik |
| **Tombol Tegur (Scold)** | Mengurangi dopamin dan memicu pembelajaran aversif jika pet nakal |
| **Input Obrolan / Suara** | Berbicara bahasa Indonesia langsung ke pet melalui input teks |
| **Tombol Brain HUD** | Membuka/menutup monitor visualisasi korteks otak neuromorfik |
| **Tombol M** | Mematikan / Menyalakan audio latar dan efek suara |

---

## 📁 Struktur Proyek

```text
Pet_chill/
├── index.html              # Entry point utama dengan UI HUD, chat input, dan brain modal
├── style.css               # Styling retro pixel art dan monitor cybernetic neuromorfik
├── metadata.json           # Konfigurasi aplikasi & metadata Google AI Studio
├── vite.config.ts          # Konfigurasi build Vite & plugin TailwindCSS
├── tsconfig.json           # Konfigurasi compiler TypeScript
├── package.json            # Daftar dependensi dan scripts (React 19, Tailwind, Vite)
├── src/
│   ├── main.js             # Game loop utama 60 FPS, orkestrasi input, audio, & physics
│   ├── brain.js            # Simulasi Neuromorphic Spiking Neural Network (SNN) 2000+ neuron
│   ├── brain-visualizer.js # Visualizer korteks real-time, grafik firing rate, & neurotransmiter
│   ├── pet-enhanced.js     # Logika karakter pet, anatomi sprite, emosi, & status vital
│   ├── terrain.js          # Generator terrain taman rumput dan deteksi tabrakan
│   ├── house-exterior.js   # Rendering eksterior rumah dan transisi pintu masuk
│   ├── interior.js         # Lingkungan dalam rumah, kasur, mangkuk makanan, & mainan
│   ├── camera.js           # Sistem kamera viewport dengan lerp tracking
│   ├── sound-manager.js    # Sintesis audio prosedural Web Audio API
│   ├── audio.js            # Modul audio fallback
│   ├── map.js              # Peta data layout
│   └── pet.js              # Karakter pet legacy
└── README.md               # Dokumentasi lengkap proyek
```

---

## 🚀 Menjalankan Proyek Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau yang lebih baru
- npm atau bun

### Instalasi & Menjalankan Dev Server
```bash
# 1. Clone repositori
git clone https://github.com/davidchils50-creator/Pet_chill.git
cd Pet_chill

# 2. Install dependensi
npm install

# 3. Jalankan server pengembang (Vite)
npm run dev
```

Buka browser Anda di `http://localhost:3000` untuk mulai bermain!

### Membangun untuk Produksi
```bash
npm run build
```
File siap saji akan dibuat di direktori `dist/`.

---

## 🔬 Konsep Sains di Balik Pet Chill

1. **Izhikevich Spiking Model**: Memadukan efisiensi komputasi model *Integrate-and-Fire* dengan kekayaan dinamika biologis model *Hodgkin-Huxley*.
2. **Three-Factor Hebbian Learning**: Sinapsis diperkuat bukan hanya karena dua neuron aktif bersamaan (*cells that fire together, wire together*), tetapi memerlukan faktor ketiga berupa modulator biokimia (Dopamin/Serotonin).
3. **Homeostatic Scaling**: Mencegah efek bola salju bobot sinaptik dengan penyesuaian otomatis terhadap batas ambang penembakan neuron.
4. **Natural Associative Synthesis**: Dialog dihasilkan murni dari gradien potensial korteks ujaran dan bobot sinapsis frasa tanpa bergantung pada bot teks statis.

---

## 📝 Lisensi

Proyek ini dilisensikan di bawah lisensi [MIT](LICENSE). Bebas digunakan, dipelajari, dan dikembangkan untuk keperluan personal maupun edukasi sains kecerdasan buatan.

---

Dibuat dengan ❤️ dan dedikasi pada sains komputasi biologis & pixel art oleh **David Chill**! 🐾✨
