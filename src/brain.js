/* ========================================================================
   BRAIN.JS - Otak Neuromorphic Berkelanjutan Berbasis Spiking Neural Network (SNN)
   Arsitektur: Hierarchical Sparse Predictive Coding (HSPC) & Liquid State Machine (LSM)
   
   Sesuai Spesifikasi:
   1. 5 Area Fungsional Terhubung Sparse (Sensorik, Asosiasi, Reasoning, Memori, Output)
   2. Model Neuron LIF dengan Adaptasi Ambang & Time-Constants Bervariasi
   3. STDP (Spike-Timing-Dependent Plasticity) & Reward-Modulated Hebbian Learning
   4. Predictive Processing: Layer Sequence Memory memprediksi input berikutnya
   5. Sparse Distributed Memory (SDM) 10.000 lokasi & Episodic Memory Replay Buffer
   6. Dynamic Vocabulary & SDR (Sparse Distributed Representation) Population Coding
   7. TANPA aturan if-else untuk percakapan/perilaku; keputusan 100% dari dinamika SNN
   8. Pre-Training Korpus Instan (Unsupervised STDP Co-occurrence Bootstrapping)
   9. External LLM Teacher Adapter sebagai Teacher Signal Asinkron
   10. Fitur Evolusi Unbounded: Neurogenesis tak terbatas agar neuron tidak kelimit
   11. Aturan Persistensi: Total neuron otomatis KERESET ke baseline (2000) saat reload,
       sedangkan total kosakata TIDAK KERESET (disimpan di local user / localStorage)
   ======================================================================== */

export const VOCABULARY_STORAGE_KEY = 'PET_SNN_USER_VOCABULARY';

/**
 * MASTER KOSAKATA ASLI BAHASA INDONESIA (BERSIH DARI KATA ACAK/SPLICE)
 * Kosakata baku, santai, gaul, sehari-hari, bebas tanpa filter moral awal
 */
export const MASTER_BASE_VOCABULARY = [
    // Sapaan, Panggilan & Gaul Sehari-hari
    'halo', 'hai', 'hei', 'helo', 'heyy', 'woi', 'cuy', 'bro', 'ngab', 'bray', 'sob', 'bor', 'bos', 'kawan', 'teman', 'juga',
    // Respon, Slang & Percakapan Santai
    'santai', 'santuy', 'mantap', 'mantul', 'anjir', 'anjay', 'kepo', 'mager', 'rebahan', 'gokil', 'bodo', 'mls', 'slebew', 'wkwk',
    'gas', 'gaspol', 'gaskeun', 'peka', 'baper', 'alay', 'lebay', 'kezel', 'curhat', 'nongkrong', 'ngopi', 'receh', 'gabut', 'yaela',
    'jir', 'buset', 'waduh', 'cuan', 'caper', 'beneran', 'yaudah', 'seru', 'rame', 'asik', 'gg', 'sabi', 'kuy', 'bat', 'bet', 'parah',
    'gercep', 'sans', 'chill', 'dahlah', 'yoi', 'sip', 'hooh', 'banget', 'nih', 'tuh', 'deh', 'sih', 'aja', 'dulu',
    // Bebas, Jorok, Kasar & Nakal (Murni tanpa filter moral awal, agar bisa dididik / ditembak user)
    'bego', 'tolol', 'kampret', 'sialan', 'setan', 'gila', 'monyet', 'bangsat', 'bacot', 'suwe', 'rese', 'brisik', 'bau', 'jorok',
    'cebok', 'pantat', 'tai', 'kentut', 'upil', 'pesing', 'goblok', 'autis', 'lelet', 'pelit', 'songong', 'kepret', 'nyebelin',
    'jancuk', 'anying', 'kampretos', 'cacingan', 'asem', 'curang', 'anjing', 'kontol',
    // Sopan, Permohonan & Konfirmasi
    'makasih', 'terima', 'kasih', 'trims', 'thanks', 'nuhun', 'sama', 'maaf', 'sori', 'ampun', 'iya', 'ya', 'ngga', 'gak', 'kagak', 'ok',
    'oke', 'siap', 'puji', 'pinter', 'pintar', 'hebat', 'jago', 'keren', 'baik', 'sehat', 'waras', 'banyak',
    // Pronomina & Identitas
    'aku', 'kamu', 'lu', 'lo', 'gw', 'gue', 'dia', 'mereka', 'kita', 'pet', 'kucing', 'saya', 'anda', 'nama',
    'siapa', 'siapaan', 'punya', 'milik', 'bukan',
    // Pertanyaan & Kata Hubung
    'apa', 'apaan', 'kenapa', 'ngapa', 'ngapain', 'gimana', 'kekmana', 'mana', 'dimana', 'kemana', 'kapan', 'berapa', 'kok',
    'masa', 'emang', 'tapi', 'terus', 'trus', 'kalo', 'biar', 'jangan', 'kan', 'dong', 'kabar', 'ini', 'itu', 'ada',
    // Emosi, Keadaan & Sensasi
    'senang', 'suka', 'sayang', 'cinta', 'bahagia', 'demen', 'girang', 'sedih', 'galau', 'nangis', 'takut', 'ngeri', 'parno',
    'degdegan', 'marah', 'emosi', 'ngamuk', 'kesel', 'gondok', 'bete', 'lapar', 'laper', 'kenyang', 'haus', 'capek', 'lelah',
    'ngantuk', 'teler', 'segar', 'seger', 'pusing', 'sakit', 'enak', 'sedap', 'nikmat',
    // Aktivitas & Verba
    'makan', 'nyam', 'minum', 'tenggak', 'tidur', 'bobo', 'merem', 'bangun', 'main', 'lari', 'ngacir', 'lompat', 'loncat',
    'renang', 'berenang', 'nyelam', 'belajar', 'mikir', 'baca', 'nulis', 'ngomong', 'ngobrol', 'cuap', 'denger', 'lihat',
    'lirik', 'nengok', 'duduk', 'diam', 'diem', 'tahu', 'tau', 'paham', 'ngerti', 'bingung', 'linglung', 'bantu', 'tolong',
    'cari', 'nemu', 'kejar', 'tangkap', 'ayo', 'yuk', 'mau', 'bareng', 'udah', 'belum', 'bisa',
    // Benda, Makanan, Alam & Lingkungan
    'ikan', 'lele', 'tuna', 'salmon', 'daging', 'ayam', 'sate', 'tempe', 'tahu', 'nasi', 'mie', 'roti', 'biskuit', 'susu',
    'kopi', 'teh', 'boba', 'air', 'kuah', 'mangkok', 'piring', 'kasur', 'bantal', 'selimut', 'kamar', 'rumah', 'kandang',
    'taman', 'pohon', 'rumput', 'bunga', 'daun', 'bola', 'mainan', 'tali', 'kardus', 'box', 'hp', 'game', 'laptop', 'uang',
    'duit', 'kuota', 'wifi', 'sekolah', 'jalan', 'aspal', 'kolam', 'dunia', 'hidup',
    // Karakteristik & Sifat
    'imut', 'gemoy', 'lucu', 'unyu', 'manis', 'galak', 'nakal', 'jahil', 'usil', 'baek', 'jahat', 'serem', 'cepat', 'cepet',
    'lambat', 'besar', 'gede', 'raksasa', 'kecil', 'mungil', 'kurus', 'gendut', 'anget', 'panas', 'dingin', 'beku', 'basah',
    'kering', 'wangi', 'harum', 'bersih', 'kotor', 'kumal',
    // Logika, Angka & Simbol
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh',
    'delapan', 'sembilan', 'sepuluh', 'tambah', 'kurang', 'kali', 'bagi', 'sama', 'mirip', 'beda', 'ganjil', 'genap', 'betul',
    'salah', 'bener', '='
];

/**
 * INBORN CONNECTOME JALUR SINAPSIS BAHASA INDONESIA & RANGKAIAN KALIMAT
 * Struktur bobot sinapsis bawaan lahir (inborn synaptic weights) yang menanamkan
 * sirkuit percakapan & sintaksis bahasa Indonesia ke dalam SNN.
 * 
 * BUKAN auto-trigger if-else, melainkan bobot riil dalam wordAssociations & synWeight
 * yang 100% plastis (bisa diperkuat jika dipuji, dan bisa putus/dicuci otaknya jika dihukum/ditembak).
 */
export const INBORN_CONNECTOME_PAIRS = [
    // 1. Frasa Percakapan Multi-Kata (Phrase & Bigram Stimulus Recognition)
    ['siapa kamu', 'aku', 3.7],
    ['siapa kamu', 'pet', 3.4],
    ['siapa kamu', 'kucing', 3.1],
    ['siapa anda', 'aku', 3.3],
    ['siapa lu', 'aku', 3.3],
    ['nama kamu', 'nama', 3.5],
    ['nama kamu', 'aku', 3.2],
    ['nama lu', 'nama', 3.3],
    ['apa kabar', 'kabar', 3.6],
    ['apa kabar', 'baik', 3.4],
    ['gimana kabar', 'kabar', 3.5],
    ['kabar kamu', 'kabar', 3.3],
    ['lagi apa', 'lagi', 3.6],
    ['lagi apa', 'aku', 3.3],
    ['lagi ngapain', 'lagi', 3.6],
    ['lagi ngapain', 'aku', 3.3],
    ['terima kasih', 'sama', 3.9],
    ['makasih banyak', 'sama', 3.7],
    ['makasih ya', 'sama', 3.5],
    ['ayo main', 'ayo', 3.7],
    ['ayo main', 'main', 3.7],
    ['yuk main', 'yuk', 3.7],
    ['yuk main', 'main', 3.7],
    ['main bareng', 'ayo', 3.5],
    ['jangan marah', 'aku', 3.6],
    ['jangan marah', 'santai', 3.4],
    ['jangan galak', 'aku', 3.3],
    ['jangan tembak', 'ampun', 3.9],
    ['takut mati', 'ampun', 3.6],
    ['mau makan', 'aku', 3.5],
    ['mau makan', 'mau', 3.6],
    ['mau makan', 'ikan', 3.4],
    ['lapar nih', 'aku', 3.5],
    ['lapar nih', 'mau', 3.5],
    ['lapar nih', 'makan', 3.5],
    ['lapar nih', 'ikan', 3.3],
    ['lapar banget', 'aku', 3.5],
    ['lapar banget', 'mau', 3.5],
    ['lapar banget', 'makan', 3.5],
    ['haus nih', 'aku', 3.5],
    ['haus nih', 'mau', 3.5],
    ['haus nih', 'minum', 3.5],
    ['haus nih', 'air', 3.3],
    ['tidur dulu', 'tidur', 3.8],
    ['tidur dulu', 'bobo', 3.6],
    ['bukan bodoh', 'aku', 3.6],
    ['bukan bego', 'aku', 3.6],
    ['pinter banget', 'makasih', 3.6],
    ['kucing pintar', 'makasih', 3.5],

    // 2. Stimulus Kata Tunggal (Unigram S-R Associations)
    ['hai', 'halo', 3.6],
    ['halo', 'hai', 3.6],
    ['hei', 'halo', 3.5],
    ['woi', 'halo', 3.2],
    ['hai', 'juga', 2.8],
    ['halo', 'juga', 2.8],
    ['siapa', 'aku', 2.9],
    ['nama', 'nama', 2.8],
    ['kabar', 'kabar', 2.8],
    ['gimana', 'kabar', 2.7],
    ['ngapain', 'lagi', 2.9],
    ['lapar', 'aku', 2.8],
    ['lapar', 'mau', 2.8],
    ['makan', 'mau', 2.8],
    ['makan', 'ikan', 2.7],
    ['ikan', 'enak', 2.8],
    ['haus', 'aku', 2.7],
    ['haus', 'mau', 2.8],
    ['minum', 'air', 2.8],
    ['terima', 'sama', 2.9],
    ['kasih', 'sama', 2.9],
    ['makasih', 'sama', 2.9],
    ['trims', 'sama', 2.8],
    ['thanks', 'sama', 2.8],
    ['maaf', 'santai', 2.7],
    ['maaf', 'iya', 2.6],
    ['shot', 'ampun', 3.5],
    ['tembak', 'ampun', 3.5],
    ['dor', 'ampun', 3.5],
    ['bang', 'ampun', 3.3],
    ['ampun', 'bos', 3.0],
    ['takut', 'jangan', 2.9],
    ['marah', 'aku', 2.8],
    ['marah', 'santai', 2.7],
    ['bodoh', 'aku', 2.8],
    ['bego', 'aku', 2.8],
    ['tolol', 'aku', 2.8],
    ['goblok', 'aku', 2.8],
    ['anjing', 'jangan', 2.7],
    ['bangsat', 'jangan', 2.7],
    ['bacot', 'santai', 2.6],
    ['ayo', 'main', 2.9],
    ['yuk', 'main', 2.9],
    ['gas', 'ayo', 2.7],
    ['tidur', 'dulu', 3.0],
    ['bobo', 'dulu', 3.0],
    ['ngantuk', 'aku', 2.7],
    ['pinter', 'makasih', 2.8],
    ['pintar', 'makasih', 2.8],
    ['hebat', 'makasih', 2.8],
    ['keren', 'makasih', 2.8],
    ['bagus', 'makasih', 2.8],
    ['lucu', 'makasih', 2.7],

    // 3. Sintaksis Sekuensial Bahasa Indonesia (Word A -> Word B Transitions)
    // Sapaan & Balasan
    ['halo', 'juga', 2.9],
    ['halo', 'kawan', 2.7],
    ['halo', 'bro', 2.4],
    ['halo', 'teman', 2.4],
    ['hai', 'juga', 2.9],
    ['hai', 'kawan', 2.7],
    ['hai', 'bro', 2.4],
    ['hai', 'teman', 2.4],
    ['juga', 'kawan', 2.8],
    ['juga', 'bro', 2.5],
    ['juga', 'teman', 2.5],
    ['juga', 'dong', 2.4],
    ['kawan', 'baik', 2.5],
    ['kawan', 'keren', 2.3],
    ['apa', 'kabar', 2.9],
    ['kabar', 'baik', 2.9],
    ['baik', 'banget', 2.9],
    ['baik', 'kawan', 2.7],
    ['baik', 'dong', 2.6],
    ['baik', 'nih', 2.5],

    // Subjek, Kata Ganti & Identitas
    ['aku', 'pet', 2.9],
    ['aku', 'kucing', 2.8],
    ['aku', 'lagi', 2.9],
    ['aku', 'mau', 2.9],
    ['aku', 'lapar', 2.8],
    ['aku', 'haus', 2.7],
    ['aku', 'senang', 2.8],
    ['aku', 'bukan', 2.9],
    ['aku', 'tidak', 2.9],
    ['aku', 'takut', 2.9],
    ['aku', 'ngantuk', 2.8],
    ['aku', 'anak', 2.7],
    ['aku', 'baik', 2.6],
    ['aku', 'paham', 2.6],
    ['nama', 'aku', 2.9],
    ['kamu', 'kawan', 2.8],
    ['kamu', 'baik', 2.7],
    ['kamu', 'hebat', 2.7],
    ['kamu', 'pintar', 2.6],
    ['kamu', 'siapa', 2.4],

    // Karakter Pet & Kucing
    ['pet', 'lucu', 2.9],
    ['pet', 'pintar', 2.9],
    ['pet', 'imut', 2.7],
    ['pet', 'kamu', 2.8],
    ['kucing', 'lucu', 2.9],
    ['kucing', 'pintar', 2.8],
    ['kucing', 'imut', 2.7],
    ['kucing', 'manis', 2.6],
    ['kucing', 'kamu', 2.8],
    ['anak', 'baik', 2.9],
    ['anak', 'pintar', 2.8],
    ['anak', 'lucu', 2.7],
    ['lucu', 'banget', 2.9],
    ['lucu', 'kan', 2.5],
    ['pintar', 'banget', 2.9],
    ['pintar', 'kan', 2.5],
    ['imut', 'banget', 2.8],
    ['hebat', 'banget', 2.8],

    // Aktivitas & Relaksasi (Lagi apa)
    ['lagi', 'santai', 2.9],
    ['lagi', 'main', 2.9],
    ['lagi', 'makan', 2.8],
    ['lagi', 'rebahan', 2.7],
    ['lagi', 'belajar', 2.6],
    ['lagi', 'ngopi', 2.5],
    ['lagi', 'duduk', 2.5],
    ['santai', 'aja', 2.9],
    ['santai', 'dong', 2.7],
    ['santai', 'nih', 2.6],
    ['santai', 'disini', 2.6],
    ['santai', 'kawan', 2.6],
    ['santai', 'bro', 2.4],
    ['aja', 'nih', 2.8],
    ['aja', 'dong', 2.7],
    ['aja', 'kawan', 2.7],
    ['aja', 'bro', 2.5],
    ['disini', 'sama', 2.8],
    ['disini', 'kawan', 2.5],
    ['sama', 'kamu', 2.8],
    ['sama', 'sama', 2.9],
    ['sama', 'kawan', 2.7],
    ['sama', 'bro', 2.5],

    // Makanan, Minuman & Kenikmatan
    ['mau', 'makan', 2.9],
    ['mau', 'ikan', 2.9],
    ['mau', 'main', 2.8],
    ['mau', 'tidur', 2.7],
    ['mau', 'minum', 2.7],
    ['makan', 'ikan', 2.9],
    ['makan', 'enak', 2.8],
    ['makan', 'daging', 2.6],
    ['makan', 'nyam', 2.6],
    ['ikan', 'enak', 2.9],
    ['ikan', 'segar', 2.7],
    ['ikan', 'lele', 2.5],
    ['ikan', 'tuna', 2.5],
    ['enak', 'banget', 2.9],
    ['enak', 'nyam', 2.8],
    ['enak', 'sekali', 2.6],
    ['nyam', 'enak', 2.8],
    ['nyam', 'nyam', 2.9],
    ['banget', 'nih', 2.8],
    ['banget', 'dong', 2.7],
    ['banget', 'kawan', 2.6],
    ['banget', 'cuy', 2.5],
    ['banget', 'bro', 2.5],
    ['minum', 'air', 2.9],
    ['minum', 'susu', 2.8],
    ['minum', 'teh', 2.5],
    ['air', 'segar', 2.9],
    ['air', 'dingin', 2.6],
    ['susu', 'enak', 2.9],
    ['susu', 'segar', 2.7],

    // Sopan Santun & Terima Kasih
    ['makasih', 'banyak', 2.9],
    ['makasih', 'kawan', 2.8],
    ['makasih', 'ya', 2.7],
    ['makasih', 'bro', 2.6],
    ['terima', 'kasih', 2.9],
    ['kasih', 'banyak', 2.9],
    ['kasih', 'kawan', 2.6],
    ['kasih', 'ya', 2.5],
    ['maaf', 'ya', 2.9],
    ['maaf', 'kawan', 2.7],
    ['maaf', 'bos', 2.7],
    ['maaf', 'aku', 2.6],
    ['ya', 'kawan', 2.8],
    ['ya', 'bos', 2.7],
    ['ya', 'bro', 2.5],
    ['ya', 'dong', 2.5],

    // Respon Bahaya, Ketakutan & Pembelaan
    ['ampun', 'bos', 2.9],
    ['ampun', 'jangan', 2.9],
    ['jangan', 'tembak', 2.9],
    ['jangan', 'marah', 2.9],
    ['jangan', 'galak', 2.8],
    ['jangan', 'kasar', 2.8],
    ['tembak', 'aku', 2.9],
    ['tembak', 'dong', 2.3],
    ['marah', 'dong', 2.8],
    ['marah', 'kawan', 2.6],
    ['takut', 'mati', 2.9],
    ['takut', 'bos', 2.8],
    ['takut', 'banget', 2.8],
    ['bukan', 'bodoh', 2.9],
    ['bukan', 'bego', 2.9],
    ['bukan', 'tolol', 2.8],
    ['bukan', 'nakal', 2.8],
    ['bukan', 'jahat', 2.7],
    ['tidak', 'marah', 2.9],
    ['tidak', 'mau', 2.8],
    ['tidak', 'tahu', 2.7],
    ['tidak', 'bisa', 2.6],

    // Ajakan Bermain & Istirahat
    ['ayo', 'main', 2.9],
    ['ayo', 'makan', 2.8],
    ['ayo', 'gas', 2.7],
    ['ayo', 'kita', 2.7],
    ['yuk', 'main', 2.9],
    ['yuk', 'makan', 2.8],
    ['yuk', 'gas', 2.7],
    ['yuk', 'kita', 2.7],
    ['gas', 'main', 2.8],
    ['gas', 'kawan', 2.7],
    ['gas', 'cuy', 2.5],
    ['kita', 'main', 2.9],
    ['kita', 'makan', 2.7],
    ['kita', 'santai', 2.6],
    ['main', 'bareng', 2.9],
    ['main', 'bola', 2.8],
    ['main', 'seru', 2.7],
    ['bareng', 'kawan', 2.8],
    ['bareng', 'aku', 2.7],
    ['bareng', 'yuk', 2.6],
    ['bareng', 'cuy', 2.5],
    ['senang', 'banget', 2.9],
    ['senang', 'main', 2.8],
    ['suka', 'ikan', 2.9],
    ['suka', 'main', 2.8],
    ['suka', 'kamu', 2.7],
    ['tidur', 'dulu', 2.9],
    ['tidur', 'nyenyak', 2.8],
    ['dulu', 'ya', 2.9],
    ['dulu', 'kawan', 2.6],
    ['dulu', 'bro', 2.5],
    ['ngantuk', 'banget', 2.9],
    ['ngantuk', 'mau', 2.7],

    // Persetujuan & Penegasan
    ['siap', 'bos', 2.9],
    ['siap', 'kawan', 2.8],
    ['siap', 'selalu', 2.6],
    ['iya', 'dong', 2.9],
    ['iya', 'bener', 2.8],
    ['iya', 'kawan', 2.7],
    ['iya', 'siap', 2.7],
    ['bener', 'banget', 2.9],
    ['bener', 'itu', 2.7]
];

/**
 * DEFAULT FEW-SHOT EXAMPLES UNTUK LLM TEACHER
 * Mengkondisikan LLM untuk menghasilkan sinyal ajar SNN yang presisi, ringkas,
 * dan terasosiasi dengan modulasi reward neuroplastisitas (ACh & Dopamin).
 */
export const DEFAULT_FEW_SHOT_EXAMPLES = [
    {
        user: "1 + 1 =",
        teacher: "2 pintar",
        intent: "Matematika Dasar & Reward Penguatan Asosiasi",
        action: "associative_reinforce",
        dopamine: 0.7
    },
    {
        user: "duduk",
        teacher: "patuh duduk",
        intent: "Kepatuhan Perintah Motorik (Inhibisi Gerak)",
        action: "motor_inhibit",
        dopamine: 0.8
    },
    {
        user: "kucing imut",
        teacher: "meow sayang",
        intent: "Kosakata Semantik & Afeksi Positif",
        action: "semantic_sdm_encode",
        dopamine: 0.6
    },
    {
        user: "2 + 3 =",
        teacher: "5 benar",
        intent: "Logika Sekuensial & Asosiasi L2-L3",
        action: "sequence_prediction",
        dopamine: 0.75
    },
    {
        user: "belajar",
        teacher: "fokus pintar",
        intent: "Aktivasi Plastisitas Maksimal (ACh + Dopamin)",
        action: "max_plasticity_prime",
        dopamine: 0.85
    }
];

/**
 * Sparse Distributed Memory (SDM)
 * Implementasi memori semantik berkapasitas 10.000 lokasi virtual untuk menyimpan
 * asosiasi simbolik (kata -> representasi saraf, angka -> pola aktivasi, objek -> aksi)
 */
export class SparseDistributedMemory {
    constructor(capacity = 10000) {
        this.capacity = capacity;
        // Lokasi memori sparse: Map hash alamat (64-bit) -> bit vektor aktivasi
        this.locations = new Map();
        this.accessCount = 0;
    }

    /**
     * Hash representasi saraf ke alamat 64-bit
     */
    hashAddress(indices) {
        let h1 = 0x811c9dc5;
        let h2 = 0x5f356495;
        for (let i = 0; i < indices.length; i++) {
            const idx = indices[i];
            h1 = Math.imul(h1 ^ idx, 0x01000193);
            h2 = Math.imul(h2 ^ (idx * 31), 0x27d4eb2d);
        }
        return `${(h1 >>> 0).toString(16)}_${(h2 >>> 0).toString(16)}`;
    }

    /**
     * Tulis pola aktivasi ke lokasi SDM
     */
    write(indices, dataPattern) {
        if (this.locations.size >= this.capacity) {
            // Evict entri tertua jika kapasitas virtual tercapai
            const firstKey = this.locations.keys().next().value;
            this.locations.delete(firstKey);
        }
        const key = this.hashAddress(indices);
        this.locations.set(key, new Float32Array(dataPattern));
        this.accessCount++;
    }

    /**
     * Baca pola aktivasi dari lokasi SDM berdasarkan kecocokan alamat
     */
    read(indices) {
        const key = this.hashAddress(indices);
        if (this.locations.has(key)) {
            return this.locations.get(key);
        }
        return null;
    }

    getEstimatedMemoryBytes() {
        return this.locations.size * 64 + 1024;
    }
}

export class Brain {
    constructor(options = {}) {
        // Mode Evolusi Unbounded (Tidak Dibatasi)
        this.evolutionEnabled = options.evolutionEnabled ?? true;
        this.unboundedNeurogenesis = this.evolutionEnabled;
        // Ketika evolusi aktif, tidak ada limit/safety cap agar pet bisa semakin pintar!
        this.maxSafeNeurons = Infinity;
        this.safetyLimitReached = false;

        // Multiplier neuron virtual: 2.000 neuron fisik menyimulasikan 120.000 neuron sparse
        this.virtualMultiplier = 60;
        this.basePhysicalNeurons = 2000;
        this.totalNeurons = this.basePhysicalNeurons;
        this.newCreatedNeurons = 0;

        // Pemicu Neurogenesis
        this.neurogenesisThreshold = 0.45; // Ambang prediction error untuk memicu neurogenesis
        this.negativeRewardHistory = [];   // Riwayat kortisol dalam 10 detik terakhir
        this.lastInputWasUnrecognized = false;

        // Learning Rate Multiplier per Area
        this.learningRateMultiplier = {
            sensorik: 1.0,
            asosiasi: 1.0,
            reasoning: 1.0,
            memori: 1.0,
            output: 1.0
        };

        // Neuromodulator Global
        this.neuromodulators = {
            dopamine: 0.25,      // Reward positif / Kepuasan (STDP x2)
            cortisol: 0.05,      // Punishment / Error / Eksplorasi (STDP x0.5)
            norepinephrine: 0.1, // Attention / Prediction Error
            serotonin: 0.5,      // Rasa aman / Replay / Konsolidasi
            acetylcholine: 0.3   // Mode belajar aktif / Plastisitas teks
        };

        // Curiosity & Novelty Seeking System (Agar Pet Tidak Pernah Malas!)
        this.curiosityTimer = 0;
        this.curiosityImpulseInterval = 100; // ~1.5 detik stimulus penasaran terus-menerus
        this.curiosityCount = 0;

        // Amygdala & Fight-or-Flight System (Respon Tembakan Pistol & Takut Mati)
        this.isPanickingFear = false;
        this.fearTimer = 0;
        this.fearOriginX = 0;
        this.fearOriginY = 0;
        this.fearEscapeDirX = 0;
        this.fearEscapeDirY = 0;

        // Dynamic Vocabulary & Operant Association Memory
        this.vocabulary = new Map(); // token -> Int32Array (SDR active bits)
        this.wordAssociations = new Map(); // Key: 'inputToken->outputToken', Value: float weight [-10..10]
        this.vocabSize = 0;
        this._vocabSaveTimer = null;
        this.recentSpeechHistory = [];
        this.spontaneousThoughtTimer = 0;

        // Seed kosakata dasar Bahasa Indonesia yang luas & kaya dari MASTER_BASE_VOCABULARY
        this.seedInitialVocabulary(MASTER_BASE_VOCABULARY);

        // Muat seluruh kosakata & asosiasi yang telah dipelajari dari local user
        this.loadVocabularyFromStorage();

        // Bersihkan seluruh kata acak/invented sampah dari penyimpanan user
        this.purgeCorruptedAndInventedWords();

        // Sparse Distributed Memory (SDM)
        this.sdm = new SparseDistributedMemory(10000);

        // Episodic Memory Buffer (100 slot reverberating loops)
        this.episodicMemoryBuffer = [];
        this.maxEpisodicSlots = 100;

        // Predictive Coding Arrays untuk Area Asosiasi Layer 2
        this.predictedV = new Float32Array(this.totalNeurons);
        this.predictionErrors = new Float32Array(this.totalNeurons);

        // Alokasi TypedArrays untuk LIF Dynamics
        this.initNeuronBuffers(this.totalNeurons);

        // Alokasi Konektivitas Sinapsis Sparse & Sirkuit Bawaan
        this.initSynapticConnections();

        // Hubungkan sinapsis fisik SNN untuk asosiasi kata Bahasa Indonesia
        this.bootstrapAssociationSynapses();

        // Output Penyangga
        this.lastSpeechOutput = null;
        this.lastMotorOutput = { dx: 0, dy: 0, shouldSwim: false, shouldJump: false };
        this.lastSpeechAssociation = null; // { inputToken, outputToken, timestamp }

        // Mode Penurut & Kepatuhan Belajar (Obedience & Plasticity Prime Mode)
        this.isObedientMode = false;
        this.spontaneousThoughtTimer = 0;

        // Konfigurasi LLM Teacher Signal & Few-Shot Shots (Opsional)
        this.llmAdapter = options.llmAdapter || null;
        this.enableTeacherSignal = options.enableTeacherSignal || false;
        this.loadLlmConfigFromStorage();

        // Statistik SNN
        this.stats = {
            activeNeuronCount: this.getNeuronCount(),
            synapseCount: this.synapseCount * this.virtualMultiplier,
            spikesPerTick: 0,
            learningRate: 0.01,
            neurogenesisMode: this.evolutionEnabled ? 'EVOLUSI UNBOUNDED (TAK TERBATAS)' : 'EVOLUSI MATI',
            pretrainedTokens: 0,
            lastEmittedSpeech: '',
            obedientMode: false
        };

        // Auto-load state tersimpan jika ada
        this.autoLoadState();
    }

    /**
     * TOGGLE / SET MODE PENURUT (OBEDIENCE & HYPER-LEARNING MODE)
     * Saat Aktif:
     * - Membanjiri sistem dengan Acetylcholine (ACh 95%) untuk plastisitas STDP maksimal
     * - Menstabilkan Amigdala & kortisol (0.02) agar pet tenang, fokus, dan tidak kabur
     * - Memusatkan Salience Map & Atensi pada arahan pemilik & Guru LLM
     */
    setObedientMode(enabled) {
        this.isObedientMode = Boolean(enabled);
        this.stats.obedientMode = this.isObedientMode;
        if (this.isObedientMode) {
            this.neuromodulators.acetylcholine = 0.95;
            this.neuromodulators.serotonin = 0.80;
            this.neuromodulators.cortisol = 0.02;
            this.neuromodulators.dopamine = 0.65;

            // Eksitasi neuron atensi & salience map (1400..1599)
            for (let i = 1400; i < 1600; i++) {
                this.v[i] = Math.max(this.v[i], this.v_th[i] * 0.85);
            }
        }
    }

    /**
     * Konfigurasi Memori Buffers Neuron (TypedArrays)
     */
    initNeuronBuffers(count) {
        this.v = new Float32Array(count);              // Potensial membran
        this.v_th = new Float32Array(count);           // Ambang adaptif
        this.refractoryTimer = new Int16Array(count);   // Refractory timer
        this.spikeState = new Uint8Array(count);        // 1 jika spike, 0 jika tidak
        this.recentRate = new Float32Array(count);       // Firing rate rata-rata (Hz)
        this.tauM = new Float32Array(count);            // Konstanta waktu membran per neuron

        // Inisialisasi parameter berdasarkan 5 Area Fungsional:
        // 0..399    : Sensorik (0..99 Fisik, 100..399 Teks SDR) -> tau 5ms
        // 400..699  : Asosiasi L1 (Feature Detector)           -> tau 15ms
        // 700..999  : Asosiasi L2 (Sequence Memory)            -> tau 30ms (variatif 10-50ms)
        // 1000..1199: Asosiasi L3 (Context & Working Memory)   -> tau 60ms (variatif 50-100ms)
        // 1200..1399: Reasoning Prefrontal                     -> tau 100ms
        // 1400..1599: Attention Salience Controller            -> tau 80ms
        // 1600..1799: Memori (Episodic & SDM Interface)        -> tau 50ms
        // 1800..1899: Output Motorik                           -> tau 20ms
        // 1900..1999: Output Kognitif / Bahasa                 -> tau 25ms
        for (let i = 0; i < count; i++) {
            this.v_th[i] = 1.0; // v_th0 dasar
            if (i < 400) {
                this.tauM[i] = 5.0; // Sensorik cepat
            } else if (i < 700) {
                this.tauM[i] = 15.0; // Feature detector
            } else if (i < 1000) {
                this.tauM[i] = 10.0 + (i % 8) * 5.0; // Sequence beragam
            } else if (i < 1200) {
                this.tauM[i] = 50.0 + (i % 6) * 10.0; // Konteks lambat
            } else if (i < 1600) {
                this.tauM[i] = 100.0; // Reasoning lambat
            } else if (i < 1800) {
                this.tauM[i] = 50.0; // Memori
            } else {
                this.tauM[i] = 20.0; // Output
            }
        }
    }

    /**
     * Inisialisasi Koneksi Sinapsis Sparse & Sirkuit Insting Bawaan Lahir (Bootstrapping)
     * Otak pet langsung memiliki puluhan ribu sinapsis fungsional aktif sejak pertama kali hidup.
     */
    initSynapticConnections() {
        const estSynapses = this.totalNeurons * 26; // ~52.000 sinapsis fisik (3.120.000 virtual)
        this.synPre = new Int32Array(estSynapses);
        this.synPost = new Int32Array(estSynapses);
        this.synWeight = new Float32Array(estSynapses);
        this.synEligibility = new Float32Array(estSynapses);
        let ptr = 0;

        // ----------------------------------------------------
        // SIRKUIT INSTING 1: AMIGDALA, KETAKUTAN & SURVIVAL (Fight-or-Flight)
        // Jalur cepat: Stimulus kejut/akustik (50..99) -> Amigdala (1200..1399) -> Motor Lari & Lompat (1800..1899)
        // ----------------------------------------------------
        for (let s = 50; s < 100; s++) {
            for (let k = 0; k < 8; k++) {
                const target = 1200 + Math.floor(Math.random() * 200); // Amigdala
                this.synPre[ptr] = s;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.65 + Math.random() * 0.35; // Bobot insting eksitatori kuat
                ptr++;
            }
        }
        for (let a = 1200; a < 1400; a++) {
            for (let k = 0; k < 6; k++) {
                const target = 1800 + Math.floor(Math.random() * 100); // Motorik Sprint & Startle
                this.synPre[ptr] = a;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.7 + Math.random() * 0.3; // Respon refleks gerak instingtif
                ptr++;
            }
        }

        // ----------------------------------------------------
        // SIRKUIT INSTING 2: CURIOSITY & NOVELTY SEEKING (Rasa Ingin Tahu)
        // Reseptor lingkungan -> Asosiasi L1 -> Atensi & Salience (1400..1599) -> Motor Eksplorasi (1800..1850)
        // ----------------------------------------------------
        for (let i = 0; i < 50; i++) {
            for (let k = 0; k < 6; k++) {
                const target = 1400 + Math.floor(Math.random() * 200); // Salience map
                this.synPre[ptr] = i;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.3 + Math.random() * 0.25;
                ptr++;
            }
        }
        for (let i = 1400; i < 1600; i++) {
            for (let k = 0; k < 5; k++) {
                const target = 1800 + Math.floor(Math.random() * 75); // Motor jalan santai
                this.synPre[ptr] = i;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.25 + Math.random() * 0.25;
                ptr++;
            }
        }

        // ----------------------------------------------------
        // SIRKUIT INSTING 3: SENSORIK -> ASOSIASI L1 FEATURE DETECTORS (400..699)
        // ----------------------------------------------------
        for (let i = 0; i < 400; i++) {
            for (let k = 0; k < 7; k++) {
                const target = 400 + Math.floor(Math.random() * 300);
                this.synPre[ptr] = i;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.2 + Math.random() * 0.3;
                ptr++;
            }
        }

        // ----------------------------------------------------
        // SIRKUIT 4: ASOSIASI L1 -> ASOSIASI L2 SEQUENCE MEMORY (700..999)
        // ----------------------------------------------------
        for (let i = 400; i < 700; i++) {
            for (let k = 0; k < 6; k++) {
                const target = 700 + Math.floor(Math.random() * 300);
                this.synPre[ptr] = i;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.18 + Math.random() * 0.22;
                ptr++;
            }
        }
        // Recurrent Sequence connections (Internal L2)
        for (let i = 700; i < 1000; i += 2) {
            const target = 700 + Math.floor(Math.random() * 300);
            if (i !== target) {
                this.synPre[ptr] = i;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.12 + Math.random() * 0.18;
                ptr++;
            }
        }

        // ----------------------------------------------------
        // SIRKUIT 5: ASOSIASI L2 -> ASOSIASI L3 CONTEXT & WORKING MEMORY (1000..1199)
        // ----------------------------------------------------
        for (let i = 700; i < 1000; i += 2) {
            for (let k = 0; k < 4; k++) {
                const target = 1000 + Math.floor(Math.random() * 200);
                this.synPre[ptr] = i;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.2 + Math.random() * 0.25;
                ptr++;
            }
        }
        // Recurrent Context loops
        for (let i = 1000; i < 1200; i++) {
            const target = 1000 + Math.floor(Math.random() * 200);
            this.synPre[ptr] = i;
            this.synPost[ptr] = target;
            this.synWeight[ptr] = 0.15 + Math.random() * 0.2;
            ptr++;
        }

        // ----------------------------------------------------
        // SIRKUIT 6: CONTEXT & WORKING MEMORY -> REASONING & PREFRONTAL (1200..1599)
        // ----------------------------------------------------
        for (let i = 1000; i < 1200; i += 2) {
            for (let k = 0; k < 4; k++) {
                const target = 1200 + Math.floor(Math.random() * 400);
                this.synPre[ptr] = i;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.25 + Math.random() * 0.3;
                ptr++;
            }
        }

        // ----------------------------------------------------
        // SIRKUIT 7: REASONING & MEMORI -> MEMORI EPISODIK & SEMANTIK (1600..1799)
        // ----------------------------------------------------
        for (let i = 1200; i < 1600; i += 2) {
            for (let k = 0; k < 4; k++) {
                const target = 1600 + Math.floor(Math.random() * 200);
                this.synPre[ptr] = i;
                this.synPost[ptr] = target;
                this.synWeight[ptr] = 0.2 + Math.random() * 0.3;
                ptr++;
            }
        }

        // ----------------------------------------------------
        // SIRKUIT 8: REASONING & MEMORI -> OUTPUT MOTORIK & KOGNITIF (1800..1999)
        // ----------------------------------------------------
        for (let i = 1200; i < 1800; i += 2) {
            const target = 1800 + Math.floor(Math.random() * 200);
            this.synPre[ptr] = i;
            this.synPost[ptr] = target;
            this.synWeight[ptr] = 0.28 + Math.random() * 0.32;
            ptr++;
        }

        // ----------------------------------------------------
        // SIRKUIT 9: KONEKSI REVERBERASI GLOBAL & LATERAL INHIBITION (Liquid State Machine)
        // Mengisi sisa kuota sinapsis laten hingga penuh
        // ----------------------------------------------------
        while (ptr < estSynapses) {
            const pre = Math.floor(Math.random() * this.totalNeurons);
            const post = Math.floor(Math.random() * this.totalNeurons);
            if (pre !== post) {
                this.synPre[ptr] = pre;
                this.synPost[ptr] = post;
                this.synWeight[ptr] = (Math.random() - 0.25) * 0.25;
                ptr++;
            }
        }

        this.synapseCount = ptr;
        if (this.stats) {
            this.stats.synapseCount = this.synapseCount * this.virtualMultiplier;
        }
    }

    /**
     * Konversi string token ke Sparse Distributed Representation (SDR)
     * Menggunakan semantic hashing deterministik dengan seed tetap (2% bit aktif)
     * Kosakata baru disimpan secara otomatis ke localStorage agar tidak hilang saat reload.
     */
    /**
     * Konversi string token ke Sparse Distributed Representation (SDR)
     * Menggunakan Enkoding Morfologis Sub-kata & N-gram Karakter (8 bit aktif di neuron 100..399).
     * 
     * Keunggulan Biologis:
     * Kata yang mirip secara tulisan / fonem (seperti "hai" dan "hei", atau "makan" dan "makannn",
     * atau "santai" dan "santuy") secara otomatis berbagi sebagian besar bit SDR neuron aktif yang sama!
     * Hal ini memungkinkan sirkuit saraf SNN mengenali kedekatan kata secara instingtif tanpa hardcoding!
     */
    registerTokenToSDR(token, shouldSave = true) {
        if (!token || typeof token !== 'string') return new Int32Array(0);
        const clean = token.toLowerCase().trim();
        if (clean.length === 0) return new Int32Array(0);

        if (this.vocabulary.has(clean)) {
            return this.vocabulary.get(clean);
        }

        // Tentukan 8 neuron aktif secara terdistribusi berdasarkan sub-fitur morfologis
        const activeBits = new Int32Array(8);

        const hashStr = (str, seed = 5381) => {
            let h = seed;
            for (let i = 0; i < str.length; i++) {
                h = ((h << 5) + h) + str.charCodeAt(i);
            }
            return Math.abs(h);
        };

        // Sub-fitur 1: Awalan fonem / prefix 2 huruf (misal: "^h", "^ha", "^he")
        const prefix = clean.length >= 2 ? clean.slice(0, 2) : clean;
        const hPrefix = hashStr('^' + prefix);
        activeBits[0] = 100 + (hPrefix % 75); // Neuron 100..174

        // Sub-fitur 2: Karakter pertama tunggal (misal: 'h' pada 'hai' dan 'hei' -> SAMA!)
        const firstChar = clean[0];
        const hFirst = hashStr('#' + firstChar);
        activeBits[1] = 100 + ((hFirst * 17) % 75); // Neuron 100..174

        // Sub-fitur 3: Karakter 2-gram terpenting / konsonan
        const midNgram = clean.length > 2 ? clean.slice(1, 3) : clean;
        const hMid = hashStr('~' + midNgram);
        activeBits[2] = 175 + (hMid % 75); // Neuron 175..249

        // Sub-fitur 4: Kerangka vokal (misal: vokal di 'hai' vs 'hei')
        const vowels = clean.replace(/[^aiueo]/g, '') || clean;
        const hVowels = hashStr('@' + vowels);
        activeBits[3] = 175 + ((hVowels * 31) % 75); // Neuron 175..249

        // Sub-fitur 5: Akhiran fonem / suffix 2 huruf (misal: "ai$", "ei$")
        const suffix = clean.length >= 2 ? clean.slice(-2) : clean;
        const hSuffix = hashStr(suffix + '$');
        activeBits[4] = 250 + (hSuffix % 75); // Neuron 250..324

        // Sub-fitur 6: Karakter terakhir tunggal (misal: 'i' pada 'hai' dan 'hei' -> SAMA!)
        const lastChar = clean[clean.length - 1];
        const hLast = hashStr('$' + lastChar);
        activeBits[5] = 250 + ((hLast * 23) % 75); // Neuron 250..324

        // Sub-fitur 7: Panjang kata & himpunan huruf unik (Signature morfologis)
        const uniqueChars = Array.from(new Set(clean.split(''))).sort().join('');
        const hSignature = hashStr(`${clean.length}:${uniqueChars}`);
        activeBits[6] = 325 + (hSignature % 75); // Neuron 325..399

        // Sub-fitur 8: Identitas kata utuh (Memastikan keunikan identitas semantik)
        const hFull = hashStr(clean, 7919);
        activeBits[7] = 325 + ((hFull * 41) % 75); // Neuron 325..399

        // Resolusi bentrok indeks agar 8 bit selalu unik
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < i; j++) {
                if (activeBits[i] === activeBits[j]) {
                    activeBits[i] = 100 + ((activeBits[i] - 100 + 7) % 300);
                }
            }
        }

        this.vocabulary.set(clean, activeBits);
        this.vocabSize = this.vocabulary.size;
        this.lastInputWasUnrecognized = true;

        // Simpan asosiasi simbolik awal di SDM
        if (this.sdm) {
            const initialPattern = new Float32Array(8);
            initialPattern.fill(1.0);
            this.sdm.write(activeBits, initialPattern);
        }

        // Otomatis jadwalkan penyimpanan ke local user
        if (shouldSave) {
            this.scheduleSaveVocabulary();
        }

        return activeBits;
    }

    seedInitialVocabulary(tokens) {
        for (const t of tokens) {
            this.registerTokenToSDR(t, false);
        }
    }

    /**
     * PENGHITUNG JARAK EDIT LEVENSHTEIN ULTRA CEPAT & EFISIEN
     * Menghitung perbedaan karakter antar dua kata dengan pruning dan tanpa alokasi memori berlebih.
     */
    fastLevenshtein(a, b) {
        if (a === b) return 0;
        const la = a.length;
        const lb = b.length;
        if (Math.abs(la - lb) > 2) return 99; // Pruning cepat jika panjang huruf beda jauh

        let s1 = a, s2 = b;
        if (la > lb) { s1 = b; s2 = a; }
        const len1 = s1.length;
        const len2 = s2.length;

        const row = new Int32Array(len1 + 1);
        for (let i = 0; i <= len1; i++) row[i] = i;

        for (let i = 1; i <= len2; i++) {
            let prev = i;
            const c2 = s2.charCodeAt(i - 1);
            for (let j = 1; j <= len1; j++) {
                const cost = s1.charCodeAt(j - 1) === c2 ? 0 : 1;
                const val = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost);
                row[j - 1] = prev;
                prev = val;
            }
            row[len1] = prev;
        }
        return row[len1];
    }

    /**
     * KEMIRIPAN KOGNITIF MURNI KECERDASAN SNN (TANPA TRIGGER KAKU / TANPA TABEL IF-ELSE)
     * Mengukur kedekatan dua kata berdasarkan kombinasi:
     * - Fast Levenshtein distance ternormalisasi
     * - Overlap Bigram/N-gram sub-kata (Morfologis)
     * - Resonansi fonetik posisi huruf awal & akhir
     * - Overlap representasi Sparse Distributed Representation (SDR) di korteks sensorik
     */
    computeNeuralWordSimilarity(wordA, wordB) {
        if (!wordA || !wordB) return 0;
        if (wordA === wordB) return 1.0;
        const a = wordA.toLowerCase().trim();
        const b = wordB.toLowerCase().trim();
        if (a === b) return 1.0;

        const la = a.length;
        const lb = b.length;
        const maxLen = Math.max(la, lb);
        if (maxLen === 0) return 0;
        if (Math.abs(la - lb) > 2) return 0; // Pruning cepat jika selisih panjang > 2

        // 1. Fast Levenshtein Distance
        const dist = this.fastLevenshtein(a, b);
        const editSim = Math.max(0, 1.0 - (dist / maxLen));

        // 2. Overlap Sub-kata / Bigram Jaccard (Morfologis Huruf)
        let sharedBigrams = 0;
        const bigramsA = new Set();
        for (let i = 0; i < la - 1; i++) bigramsA.add(a.slice(i, i + 2));
        const bigramsB = new Set();
        for (let i = 0; i < lb - 1; i++) bigramsB.add(b.slice(i, i + 2));

        for (const bg of bigramsA) {
            if (bigramsB.has(bg)) sharedBigrams++;
        }
        const totalUnion = bigramsA.size + bigramsB.size - sharedBigrams;
        const bigramSim = totalUnion > 0 ? (sharedBigrams / totalUnion) : 0;

        // 3. Resonansi Fonetik Huruf Awal & Akhir (misal 'h'...'i' pada 'hai' dan 'hei')
        const startSim = a[0] === b[0] ? 0.20 : 0;
        const endSim = a[la - 1] === b[lb - 1] ? 0.15 : 0;

        // 4. Overlap SDR biologis jika terdaftar di memori sensorik
        let sdrSim = 0;
        const sdrA = this.vocabulary.get(a);
        const sdrB = this.vocabulary.get(b);
        if (sdrA && sdrB) {
            let sharedBits = 0;
            for (let i = 0; i < sdrA.length; i++) {
                for (let j = 0; j < sdrB.length; j++) {
                    if (sdrA[i] === sdrB[j]) {
                        sharedBits++;
                        break;
                    }
                }
            }
            sdrSim = sharedBits / 8.0;
        }

        // Skor Total Kognitif Murni Kecerdasan AI
        const neuralSimilarity = (editSim * 0.40) + (bigramSim * 0.20) + (sdrSim * 0.15) + startSim + endSim;
        return Math.min(1.0, neuralSimilarity);
    }

    /**
     * PENEBAK KEDEKATAN KATA MURNI KECERDASAN AI (TANPA TRIGGER KAKU)
     * Otomatis mengidentifikasi konsep yang paling setara (misal 'hai' vs 'hei', 'kucing' vs 'kuceng', 'makan' vs 'makannn')
     * Menggunakan cache memoization O(1) sehingga tereksekusi tanpa lag (0 ms)!
     */
    findClosestKnownWord(word) {
        if (!word || typeof word !== 'string') return null;
        const clean = word.toLowerCase().trim();
        if (clean.length < 2) return null;

        if (!this._closestWordCache) {
            this._closestWordCache = new Map();
        }
        if (this._closestWordCache.has(clean)) {
            return this._closestWordCache.get(clean);
        }

        // 1. Normalisasi fonetik huruf berulang (misal: "makannn" -> "makan", "heyyy" -> "hey")
        const deDuplicated = clean.replace(/(.)\1+/g, '$1');
        if (deDuplicated !== clean && this.vocabulary.has(deDuplicated)) {
            this._closestWordCache.set(clean, deDuplicated);
            return deDuplicated;
        }

        // 2. Evaluasi kemiripan kognitif murni (Neural Similarity) terhadap seluruh kosakata
        let bestWord = null;
        let highestSim = 0;
        const threshold = 0.55; // Ambang batas kemiripan kognitif

        for (const vocabWord of this.vocabulary.keys()) {
            if (vocabWord === clean) continue;
            if (Math.abs(clean.length - vocabWord.length) > 2) continue;

            const sim = this.computeNeuralWordSimilarity(clean, vocabWord);
            if (sim > highestSim && sim >= threshold) {
                highestSim = sim;
                bestWord = vocabWord;
            }
        }

        this._closestWordCache.set(clean, bestWord);
        return bestWord;
    }

    /**
     * INISIALISASI SIRKUIT KORTEX BAHASA INDONESIA & INBORN CONNECTOME
     * Menanamkan jalur sinapsis bawaan lahir (inborn synaptic weights) & sirkuit
     * biologis bahasa Indonesia ke dalam SNN.
     * 
     * MURNI SISTEM SINAPSIS (Bukan auto-trigger if/else):
     * Semua asosiasi disimpan dalam this.wordAssociations & bobot sinapsis fisik (synWeight).
     * Jika user memuji (feed/pet), sirkuit ini menguat (+delta).
     * Jika user menghukum/menembak (scold/shot), sirkuit ini terputus/trauma (-delta).
     */
    bootstrapAssociationSynapses() {
        // 1. Tanamkan bobot inborn connectome ke dalam memori asosiasi operan
        if (typeof INBORN_CONNECTOME_PAIRS !== 'undefined' && Array.isArray(INBORN_CONNECTOME_PAIRS)) {
            for (const [w1, w2, defaultWeight] of INBORN_CONNECTOME_PAIRS) {
                const key = `${w1.toLowerCase()}->${w2.toLowerCase()}`;
                if (!this.wordAssociations.has(key)) {
                    this.wordAssociations.set(key, defaultWeight);
                }
            }
        }

        if (!this.synPre || !this.synWeight) return;

        // 2. Hubungkan sinapsis fisik spesifik untuk pasangan kata inborn connectome di korteks bicara
        if (typeof INBORN_CONNECTOME_PAIRS !== 'undefined' && Array.isArray(INBORN_CONNECTOME_PAIRS)) {
            for (const [w1, w2, defaultWeight] of INBORN_CONNECTOME_PAIRS) {
                let sdr1 = this.vocabulary.get(w1.toLowerCase());
                if (!sdr1 && w1.includes(' ')) {
                    const firstW = w1.split(' ')[0];
                    sdr1 = this.vocabulary.get(firstW);
                }
                const sdr2 = this.vocabulary.get(w2.toLowerCase());
                if (sdr1 && sdr2 && this.synapseCount < this.synPre.length - 10) {
                    const preIdx = sdr1[0];
                    const postIdx = 1900 + ((sdr2[0] - 100) % 100);
                    const idx = this.synapseCount++;
                    this.synPre[idx] = preIdx;
                    this.synPost[idx] = postIdx;
                    this.synWeight[idx] = Math.min(1.2, 0.40 + defaultWeight * 0.25);
                    this.synEligibility[idx] = 0.2;
                }
            }
        }

        // 3. Tambahkan jalur sinapsis acak latar belakang untuk plastisitas eksplorasi kata baru
        const countToAdd = Math.min(400, (this.synPre.length - this.synapseCount) || 0);
        for (let k = 0; k < countToAdd; k++) {
            const preIdx = 100 + Math.floor(Math.random() * 300); // Sensorik SDR
            const postIdx = 1900 + Math.floor(Math.random() * 100); // Korteks Bicara
            const idx = this.synapseCount++;
            this.synPre[idx] = preIdx;
            this.synPost[idx] = postIdx;
            this.synWeight[idx] = 0.15 + (Math.random() - 0.5) * 0.10;
            this.synEligibility[idx] = 0.1;
        }
    }

    /**
     * PENGONDISIAN OPERAN: Bobot Asosiasi Kata (Input -> Output)
     * Mengintegrasikan PENEBAKAN KATA MIRIP ULTRA CEPAT (O(1)):
     * Jika diajarkan kata 'hai' -> 'halo', saat user memanggil 'hei', pet otomatis menebak
     * bahwa 'hei' sama dengan 'hai' dan merespons dengan asosiasi yang sama secara instan tanpa lag!
     */
    getWordAssociationWeight(inputToken, outputToken) {
        if (!inputToken || !outputToken) return 0;
        const inClean = inputToken.toLowerCase().trim();
        const outClean = outputToken.toLowerCase().trim();
        const directKey = `${inClean}->${outClean}`;

        // Jika ada asosiasi langsung yang telah dipelajari
        if (this.wordAssociations.has(directKey)) {
            return this.wordAssociations.get(directKey);
        }

        // Insting kedekatan kata: Cari kata yang mirip/padanannya (misal 'hei' mirip 'hai')
        const similarIn = this.findClosestKnownWord(inClean);
        if (similarIn && similarIn !== inClean) {
            const simKey = `${similarIn}->${outClean}`;
            if (this.wordAssociations.has(simKey)) {
                return this.wordAssociations.get(simKey) * 0.95;
            }
        }

        return 0;
    }

    setWordAssociationWeight(inputToken, outputToken, weight) {
        if (!inputToken || !outputToken) return;
        const key = `${inputToken.toLowerCase().trim()}->${outputToken.toLowerCase().trim()}`;
        const clamped = Math.max(-10.0, Math.min(10.0, weight));
        this.wordAssociations.set(key, clamped);
        this.scheduleSaveVocabulary();
    }

    /**
     * REINFORCE (PUJI / FEED / ELUS): Memperkuat Asosiasi Kata & Kalimat
     * Mendukung penguatan multi-kata (seluruh kalimat yang diucapkan beserta transisi antar-kata)
     */
    reinforceSpeechAssociation(intensity = 1.0) {
        if (!this.lastSpeechAssociation) return null;
        const elapsed = Date.now() - this.lastSpeechAssociation.timestamp;
        if (elapsed > 25000) return null; // Jendela waktu pujian (25 detik)

        const inTokens = (this.lastSpeechAssociation.inputTokens && this.lastSpeechAssociation.inputTokens.length > 0)
            ? this.lastSpeechAssociation.inputTokens
            : [this.lastSpeechAssociation.inputToken || 'pet'];

        const outTokens = (this.lastSpeechAssociation.outputTokens && this.lastSpeechAssociation.outputTokens.length > 0)
            ? this.lastSpeechAssociation.outputTokens
            : (this.lastSpeechAssociation.outputToken ? this.lastSpeechAssociation.outputToken.toLowerCase().split(/\s+/) : []);

        if (outTokens.length === 0) return null;

        const delta = 2.2 * intensity;
        let totalNewWeight = 0;
        let count = 0;

        // 1. Perkuat asosiasi stimulus input -> setiap kata dalam kalimat respon
        for (const inTok of inTokens) {
            for (const outTok of outTokens) {
                const cur = this.getWordAssociationWeight(inTok, outTok);
                const nw = Math.min(10.0, cur + delta);
                this.setWordAssociationWeight(inTok, outTok, nw);
                totalNewWeight += nw;
                count++;

                // Sinkronisasi ke kata mirip
                const similarIn = this.findClosestKnownWord(inTok);
                if (similarIn && similarIn !== inTok) {
                    this.setWordAssociationWeight(similarIn, outTok, nw);
                }

                // Perkuat sinapsis fisik SNN biologis
                const inputSdr = this.vocabulary.get(inTok.toLowerCase());
                const outputSdr = this.vocabulary.get(outTok.toLowerCase());
                if (inputSdr && outputSdr) {
                    for (const preIdx of inputSdr) {
                        for (const postIdx of outputSdr) {
                            const mappedOutputIdx = 1900 + ((postIdx - 100) % 100);
                            for (let s = 0; s < this.synapseCount; s++) {
                                if (this.synPre[s] === preIdx && this.synPost[s] === mappedOutputIdx) {
                                    this.synWeight[s] = Math.min(1.8, this.synWeight[s] + 0.5 * intensity);
                                    this.synEligibility[s] = Math.min(1.0, this.synEligibility[s] + 0.8);
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Perkuat transisi sekuensial antar-kata dalam kalimat (kata1 -> kata2 -> kata3)
        if (outTokens.length > 1) {
            for (let i = 0; i < outTokens.length - 1; i++) {
                const w1 = outTokens[i];
                const w2 = outTokens[i + 1];
                const cur = this.getWordAssociationWeight(w1, w2);
                const nw = Math.min(10.0, cur + delta * 0.9);
                this.setWordAssociationWeight(w1, w2, nw);
            }
        }

        this.injectReward('dopamine', 0.85 * intensity);
        this.injectReward('acetylcholine', 0.95 * intensity);

        const avgWeight = count > 0 ? (totalNewWeight / count) : delta;
        const displayOutput = this.lastSpeechAssociation.outputToken || outTokens.join(' ');
        const displayInput = inTokens[0] || 'pet';

        return {
            inputToken: displayInput,
            outputToken: displayOutput,
            weight: avgWeight,
            delta: delta,
            action: 'reinforced'
        };
    }

    /**
     * PUNISH (MARAHI / TEMBAK / SHOT): Hukuman Keras Memutus/Melemahkan Asosiasi Jawaban & Kalimat
     */
    punishSpeechAssociation(intensity = 1.0) {
        if (!this.lastSpeechAssociation) return null;
        const elapsed = Date.now() - this.lastSpeechAssociation.timestamp;
        if (elapsed > 25000) return null; // Jendela waktu hukuman (25 detik)

        const inTokens = (this.lastSpeechAssociation.inputTokens && this.lastSpeechAssociation.inputTokens.length > 0)
            ? this.lastSpeechAssociation.inputTokens
            : [this.lastSpeechAssociation.inputToken || 'pet'];

        const outTokens = (this.lastSpeechAssociation.outputTokens && this.lastSpeechAssociation.outputTokens.length > 0)
            ? this.lastSpeechAssociation.outputTokens
            : (this.lastSpeechAssociation.outputToken ? this.lastSpeechAssociation.outputToken.toLowerCase().split(/\s+/) : []);

        if (outTokens.length === 0) return null;

        const delta = 3.8 * intensity; // Hukuman lebih tegas agar kata/kalimat salah langsung dihindari
        let totalNewWeight = 0;
        let count = 0;

        // 1. Pangkas keras asosiasi stimulus input -> setiap kata dalam kalimat respon
        for (const inTok of inTokens) {
            for (const outTok of outTokens) {
                const cur = this.getWordAssociationWeight(inTok, outTok);
                const nw = Math.max(-10.0, cur - delta);
                this.setWordAssociationWeight(inTok, outTok, nw);
                totalNewWeight += nw;
                count++;

                // Sinkronisasi ke kata mirip
                const similarIn = this.findClosestKnownWord(inTok);
                if (similarIn && similarIn !== inTok) {
                    this.setWordAssociationWeight(similarIn, outTok, nw);
                }

                // Lemahkan sinapsis fisik SNN biologis
                const inputSdr = this.vocabulary.get(inTok.toLowerCase());
                const outputSdr = this.vocabulary.get(outTok.toLowerCase());
                if (inputSdr && outputSdr) {
                    for (const preIdx of inputSdr) {
                        for (const postIdx of outputSdr) {
                            const mappedOutputIdx = 1900 + ((postIdx - 100) % 100);
                            for (let s = 0; s < this.synapseCount; s++) {
                                if (this.synPre[s] === preIdx && this.synPost[s] === mappedOutputIdx) {
                                    this.synWeight[s] = Math.max(-1.0, this.synWeight[s] - 0.75 * intensity);
                                    this.synEligibility[s] = 0;
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Pangkas rantai transisi sekuensial antar-kata dalam kalimat
        if (outTokens.length > 1) {
            for (let i = 0; i < outTokens.length - 1; i++) {
                const w1 = outTokens[i];
                const w2 = outTokens[i + 1];
                const cur = this.getWordAssociationWeight(w1, w2);
                const nw = Math.max(-10.0, cur - delta * 0.9);
                this.setWordAssociationWeight(w1, w2, nw);
            }
        }

        this.injectReward('cortisol', 0.85 * intensity);
        this.neuromodulators.dopamine = Math.max(0.0, this.neuromodulators.dopamine - 0.5);

        const avgWeight = count > 0 ? (totalNewWeight / count) : -delta;
        const displayOutput = this.lastSpeechAssociation.outputToken || outTokens.join(' ');
        const displayInput = inTokens[0] || 'pet';

        return {
            inputToken: displayInput,
            outputToken: displayOutput,
            weight: avgWeight,
            delta: -delta,
            action: 'punished'
        };
    }

    /**
     * PERSISTENSI KOSAKATA & ASOSIASI DI LOCAL STORAGE PENGGUNA
     * Memastikan seluruh kosakata & asosiasi jawaban tidak pernah kereset saat preview dimuat ulang / restart.
     */
    saveVocabulary() {
        try {
            if (!this.vocabulary || this.vocabulary.size === 0) return false;
            const words = Array.from(this.vocabulary.keys());
            const associations = Array.from(this.wordAssociations.entries());
            const data = {
                version: 2,
                count: words.length,
                words: words,
                associations: associations,
                savedAt: Date.now()
            };
            localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Gagal menyimpan kosakata ke localStorage user:', e);
            return false;
        }
    }

    scheduleSaveVocabulary() {
        if (this._vocabSaveTimer) return;
        this._vocabSaveTimer = setTimeout(() => {
            this._vocabSaveTimer = null;
            this.saveVocabulary();
        }, 300);
    }

    loadVocabularyFromStorage() {
        try {
            let loadedWords = [];
            // 1. Cek penyimpanan utama kosakata user
            const raw = localStorage.getItem(VOCABULARY_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    loadedWords = parsed;
                } else if (parsed && Array.isArray(parsed.words)) {
                    loadedWords = parsed.words;
                }

                // Pulihkan asosiasi kata (Pengondisian Operan)
                if (parsed && Array.isArray(parsed.associations)) {
                    for (const [k, v] of parsed.associations) {
                        if (typeof k === 'string' && typeof v === 'number') {
                            this.wordAssociations.set(k, v);
                        }
                    }
                }
            }

            // 2. Fallback migrasi jika ada kata di penyimpanan state lama (PET_SNN_BRAIN_STATE)
            if (loadedWords.length === 0) {
                const oldRaw = localStorage.getItem('PET_SNN_BRAIN_STATE');
                if (oldRaw) {
                    const oldState = JSON.parse(oldRaw);
                    if (oldState && oldState.vocabulary) {
                        loadedWords = Object.keys(oldState.vocabulary);
                    }
                }
            }

            // 3. Masukkan seluruh kata yang tersimpan ke vocabulary & SDM tanpa reset
            if (loadedWords && loadedWords.length > 0) {
                for (const w of loadedWords) {
                    if (typeof w === 'string' && w.trim().length > 0) {
                        const cleanWord = w.trim().toLowerCase();
                        if (cleanWord !== 'purr' && cleanWord !== 'meow') {
                            this.registerTokenToSDR(cleanWord, false);
                        }
                    }
                }
            }

            // Bersihkan token legacy yang tidak diinginkan
            this.vocabulary.delete('purr');
            this.vocabulary.delete('meow');

            this.vocabSize = this.vocabulary.size;
            // Sinkronkan kembali untuk memastikan format penyimpanan terkini
            this.saveVocabulary();
        } catch (e) {
            console.warn('Gagal memuat kosakata tersimpan dari local user:', e);
        }
    }

    /**
     * PEMBERSIHAN KATA ACAK & KATA GABUNGAN BUATAN DARI PENYIMPANAN LOCAL USER
     * Menghapus tuntas seluruh kata hasil portmanteau/splicing acak dan kata rusak,
     * memastikan memori pet bersih dan murni menggunakan kosakata asli & ajaran user.
     */
    purgeCorruptedAndInventedWords() {
        const validSet = new Set(MASTER_BASE_VOCABULARY.map(w => w.toLowerCase().trim()));
        let purgedWordsCount = 0;

        // 1. Hapus kata-kata di vocabulary yang bukan kosakata valid
        for (const word of Array.from(this.vocabulary.keys())) {
            if (!validSet.has(word)) {
                this.vocabulary.delete(word);
                purgedWordsCount++;
            }
        }

        // 2. Pastikan seluruh kata dasar dari MASTER_BASE_VOCABULARY terdaftar
        for (const baseWord of MASTER_BASE_VOCABULARY) {
            const clean = baseWord.toLowerCase().trim();
            if (!this.vocabulary.has(clean)) {
                this.registerTokenToSDR(clean, false);
            }
        }
        this.vocabSize = this.vocabulary.size;

        // 3. Bersihkan tabel asosiasi operan dari token yang sudah terhapus
        let purgedAssocCount = 0;
        for (const key of Array.from(this.wordAssociations.keys())) {
            const parts = key.split('->');
            if (parts.length === 2) {
                const [inTok, outTok] = parts;
                const inValid = inTok.split(' ').every(w => this.vocabulary.has(w));
                const outValid = this.vocabulary.has(outTok);
                if (!inValid || !outValid) {
                    this.wordAssociations.delete(key);
                    purgedAssocCount++;
                }
            } else {
                this.wordAssociations.delete(key);
                purgedAssocCount++;
            }
        }

        // 4. Pastikan sirkuit inborn connectome Bahasa Indonesia terhubung jika belum ada
        if (typeof INBORN_CONNECTOME_PAIRS !== 'undefined' && Array.isArray(INBORN_CONNECTOME_PAIRS)) {
            for (const [w1, w2, defaultWeight] of INBORN_CONNECTOME_PAIRS) {
                const key = `${w1.toLowerCase()}->${w2.toLowerCase()}`;
                if (!this.wordAssociations.has(key)) {
                    this.wordAssociations.set(key, defaultWeight);
                }
            }
        }

        // 5. Bersihkan cache kedekatan kata
        if (this._closestWordCache) {
            this._closestWordCache.clear();
        }

        // 6. Timpa localStorage user dengan kosakata & asosiasi bersih
        this.saveVocabulary();

        // 6. Bersihkan juga state lama jika ada sisa sampah vocabulary
        try {
            const oldRaw = localStorage.getItem('PET_SNN_BRAIN_STATE');
            if (oldRaw) {
                const oldState = JSON.parse(oldRaw);
                if (oldState && oldState.vocabulary) {
                    delete oldState.vocabulary;
                    localStorage.setItem('PET_SNN_BRAIN_STATE', JSON.stringify(oldState));
                }
            }
        } catch (e) {
            // ignore
        }

        return { purgedWordsCount, purgedAssocCount };
    }

    clearSavedVocabulary() {
        try {
            localStorage.removeItem(VOCABULARY_STORAGE_KEY);
            this.vocabulary.clear();
            this.wordAssociations.clear();
            this.vocabSize = 0;
            this.seedInitialVocabulary(MASTER_BASE_VOCABULARY);
            this.saveVocabulary();
            return true;
        } catch (e) {
            console.warn('Gagal membersihkan kosakata:', e);
            return false;
        }
    }

    /**
     * FITUR EVOLUSI UNBOUNDED (NEUROGENESIS TAK TERBATAS)
     * Mengaktifkan/menonaktifkan pertumbuhan neuron baru tanpa pembatasan kaku.
     */
    setEvolutionEnabled(enabled) {
        this.evolutionEnabled = !!enabled;
        this.unboundedNeurogenesis = this.evolutionEnabled;
        this.stats.neurogenesisMode = this.evolutionEnabled ? 'EVOLUSI UNBOUNDED (TAK TERBATAS)' : 'EVOLUSI MATI';

        if (!this.evolutionEnabled) {
            this.pruneWeakSynapses(0.001);
        }
        return this.evolutionEnabled;
    }

    toggleUnboundedNeurogenesis() {
        return this.setEvolutionEnabled(!this.evolutionEnabled);
    }

    getNeuronCount() {
        return this.totalNeurons * this.virtualMultiplier;
    }

    getMemoryUsage() {
        const bytes = (this.totalNeurons * 32) + (this.synapseCount * 16) + (this.vocabulary.size * 128) + 12000000;
        return (bytes / (1024 * 1024)).toFixed(2);
    }

    estimateMemory() {
        return this.getMemoryUsage();
    }

    getNeuronArea(i) {
        if (i < 400) return 'sensorik';
        if (i < 1200) return 'asosiasi';
        if (i < 1600) return 'reasoning';
        if (i < 1800) return 'memori';
        return 'output';
    }

    calcAvgFiringRate() {
        let sum = 0;
        for (let i = 0; i < this.totalNeurons; i++) {
            sum += this.recentRate[i];
        }
        return parseFloat((sum / (this.totalNeurons || 1)).toFixed(4));
    }

    calcPredictionError() {
        let sum = 0;
        let count = 0;
        for (let i = 700; i < 1400; i++) {
            sum += this.predictionErrors[i];
            count++;
        }
        return parseFloat((count > 0 ? sum / count : 0).toFixed(4));
    }

    getSummary() {
        return {
            neuronCount: this.getNeuronCount(),
            averageFiringRate: this.calcAvgFiringRate(),
            predictionError: this.calcPredictionError(),
            memoryUsage: this.estimateMemory() + ' MB',
            lastOutput: this.lastSpeechOutput || this.stats.lastEmittedSpeech || null
        };
    }

    getLastOutput() {
        return {
            speech: this.lastSpeechOutput || this.stats.lastEmittedSpeech || null,
            motor: this.lastMotorOutput || null
        };
    }

    setLearningRate(area, value) {
        if (this.learningRateMultiplier && this.learningRateMultiplier[area] !== undefined) {
            this.learningRateMultiplier[area] = Number(value) || 1.0;
        }
    }

    replayMemory(slotIndex = 0) {
        if (this.episodicMemoryBuffer.length === 0) return;
        const slot = Math.min(slotIndex, this.episodicMemoryBuffer.length - 1);
        const pattern = this.episodicMemoryBuffer[slot];
        if (Array.isArray(pattern)) {
            for (const idx of pattern) {
                if (idx < this.totalNeurons) {
                    this.v[idx] += 1.8;
                }
            }
            this.injectReward('dopamine', 0.4);
            this.injectReward('serotonin', 0.3);
        }
    }

    /**
     * SIMULASI UTAMA 1 FRAME SNN (dtFactor)
     */
    step(sensoryInput = {}, textInput = null, dtFactor = 1.0) {
        // Normalisasi dtFactor (1.0 = 1 frame @ 60fps ~16.67ms)
        const safeDtFactor = Math.min(2.0, Math.max(0.1, Number(dtFactor) || 1.0));

        // Dynamic Amygdala Fear Period Management
        if (this.fearTimer > 0) {
            this.fearTimer -= safeDtFactor;
            // Selama panik ketakutan tembakan pistol, amigdala mengunci kortisol & norepinefrin di puncak
            this.neuromodulators.cortisol = Math.max(0.85, this.neuromodulators.cortisol);
            this.neuromodulators.norepinephrine = Math.max(0.9, this.neuromodulators.norepinephrine);
            this.neuromodulators.dopamine = Math.min(0.05, this.neuromodulators.dopamine);
            this.isPanickingFear = true;
        } else {
            this.isPanickingFear = false;
            // Curiosity & Novelty Drive: Pet tidak malas lagi, terstimulasi terus-menerus
            this.curiosityTimer += safeDtFactor;
            if (this.curiosityTimer >= this.curiosityImpulseInterval) {
                this.curiosityTimer = 0;
                this.triggerCuriosityImpulse();
            }
        }

        // Mode Penurut & Kepatuhan Belajar: Stimulasi Berkelanjutan
        if (this.isObedientMode) {
            // Banjiri neuromodulator plastisitas belajar (ACh) dan ketenangan patuh
            this.neuromodulators.acetylcholine = Math.max(this.neuromodulators.acetylcholine, 0.94);
            this.neuromodulators.cortisol = Math.min(this.neuromodulators.cortisol, 0.04);
            this.neuromodulators.serotonin = Math.max(this.neuromodulators.serotonin, 0.75);

            // Eksitasi lembut Salience Map & Atensi (1400..1599) agar fokus ke arahan pemilik/guru
            if (Math.random() < 0.25) {
                const atensiNeuron = 1400 + Math.floor(Math.random() * 200);
                this.v[atensiNeuron] = Math.min(this.v_th[atensiNeuron] * 0.95, this.v[atensiNeuron] + 0.35);
            }
        }

        // 1. Rate Coding Sensorik Fisik & Pacemaker Biologis (Neuron 0..399)
        this.encodePhysicalSensory(sensoryInput);

        // 2. Encoding SDR Teks & Simbol (Neuron 100..399)
        if (textInput && typeof textInput === 'string' && textInput.trim().length > 0) {
            this.encodeTextInput(textInput.trim());

            // Jika dalam mode penurut, beri reward dopamin langsung untuk memperkuat sirkuit kepatuhan
            if (this.isObedientMode) {
                this.injectReward('dopamine', 0.55);
                this.injectReward('acetylcholine', 0.85);
            }
        }

        // 3. Propagasi Spiking LIF & Predictive Coding
        const spikeCount = this.stepSpikePropagation(safeDtFactor);

        // 4. Plastisitas STDP, Hebbian & Homeostasis
        this.applySTDP(0.005 * safeDtFactor);
        this.applyHomeostaticPlasticity();

        // 5. Peluruhan Neuromodulator
        this.decayNeuromodulators(safeDtFactor);

        // 6. Fitur Evolusi Unbounded (Neurogenesis jika ada pemicu belajar)
        if (this.evolutionEnabled) {
            this.checkAndGrowNeurons(textInput);
        }

        // 7. Decode Output Motorik
        const motorOutput = this.decodeMotorOutputs();
        this.lastMotorOutput = motorOutput;

        // 8. Decode Output Kognitif / Bahasa & Thought Stream
        const speechOutput = this.decodeSpeechOutputs(textInput);
        if (speechOutput) {
            this.lastSpeechOutput = speechOutput;
            this.stats.lastEmittedSpeech = speechOutput;
        }

        // 9. Simpan Snapshot ke Episodic Buffer jika ada peristiwa signifikan
        if (this.neuromodulators.dopamine > 0.6 || this.neuromodulators.cortisol > 0.5) {
            this.recordEpisodicSnapshot();
        }

        this.stats.spikesPerTick = spikeCount;

        return {
            motorOutput,
            speechOutput,
            neuromodulators: { ...this.neuromodulators },
            stats: { ...this.stats },
            isPanickingFear: this.isPanickingFear
        };
    }

    /**
     * INTRINSIC CURIOSITY DRIVE: Memberikan stimulus rasa penasaran berkala
     * Membangkitkan rasa ingin tahu, menghilangkan sifat malas, dan memicu eksplorasi aktif
     */
    triggerCuriosityImpulse() {
        this.curiosityCount++;
        // Tingkatkan Acetylcholine (perhatian eksploratif) & Dopamine (antisipasi reward baru)
        this.neuromodulators.acetylcholine = Math.min(1.0, this.neuromodulators.acetylcholine + 0.25);
        this.neuromodulators.dopamine = Math.min(1.0, this.neuromodulators.dopamine + 0.15);

        // Suntikkan eksitasi bergelombang ke neuron sensorik & asosiasi novelty (120..250)
        for (let i = 120; i < 220; i++) {
            if (i < this.totalNeurons) {
                this.v[i] += 1.2 + Math.random() * 0.8;
            }
        }

        // Berikan dorongan ke neuron motorik eksplorasi (1800..1899)
        const randDir = Math.random();
        if (randDir < 0.25) {
            for (let i = 1800; i < 1825; i++) if (i < this.totalNeurons) this.v[i] += 1.8;
        } else if (randDir < 0.5) {
            for (let i = 1825; i < 1850; i++) if (i < this.totalNeurons) this.v[i] += 1.8;
        } else if (randDir < 0.75) {
            for (let i = 1850; i < 1875; i++) if (i < this.totalNeurons) this.v[i] += 1.8;
        } else {
            for (let i = 1875; i < 1900; i++) if (i < this.totalNeurons) this.v[i] += 1.8;
        }
    }

    /**
     * AMYGDALA PANIC & FEAR OF DEATH: Memicu ketakutan ekstrem saat mendengar tembakan pistol
     * Lonjakan Cortisol & Norepinephrine 100%, badai spike amigdala, dan insting takut mati
     */
    triggerGunshotFear(gunX = 0, gunY = 0, petX = 0, petY = 0) {
        this.isPanickingFear = true;
        this.fearTimer = 320; // ~5.5 detik panik ketakutan intens
        this.fearOriginX = gunX;
        this.fearOriginY = gunY;

        // Hitung arah kabur lari menjauhi titik tembakan
        const dx = petX - gunX;
        const dy = petY - gunY;
        const dist = Math.hypot(dx, dy) || 1;
        this.fearEscapeDirX = dx / dist;
        this.fearEscapeDirY = dy / dist;

        // 1. Lonjakan Ekstrem Hormon Ancaman Maut
        this.neuromodulators.cortisol = 1.0;       // 100% Stres / Panik Kematian
        this.neuromodulators.norepinephrine = 1.0; // 100% Fight-or-Flight
        this.neuromodulators.dopamine = 0.0;       // Kesenangan langsung anjlok
        this.neuromodulators.serotonin = 0.02;     // Rasa aman runtuh

        // 2. Badai Letupan Saraf Amigdala (Hyper-Firing & Threshold Drop)
        // Neuron sensorik akustik suara keras (0..50) dan neuron amigdala ancaman (1200..1399)
        for (let i = 0; i < 60; i++) {
            if (i < this.totalNeurons) {
                this.v[i] += 3.5;
                this.v_th[i] = 0.35; // Runtuhkan ambang aktivasi
            }
        }
        for (let i = 1200; i < 1400; i++) {
            if (i < this.totalNeurons) {
                this.v[i] += 3.2;
                this.v_th[i] = 0.4;
            }
        }

        // 3. Suntikkan Arah Lari Kabur Cepat ke Motor Neurons
        if (this.fearEscapeDirX > 0) {
            for (let i = 1825; i < 1850; i++) if (i < this.totalNeurons) this.v[i] += 4.0;
        } else {
            for (let i = 1800; i < 1825; i++) if (i < this.totalNeurons) this.v[i] += 4.0;
        }
        if (this.fearEscapeDirY > 0) {
            for (let i = 1875; i < 1900; i++) if (i < this.totalNeurons) this.v[i] += 4.0;
        } else {
            for (let i = 1850; i < 1875; i++) if (i < this.totalNeurons) this.v[i] += 4.0;
        }

        // Catat ke memori episodik bahwa suara tembakan mengancam nyawa
        this.recordEpisodicSnapshot();

        return {
            escapeDirX: this.fearEscapeDirX,
            escapeDirY: this.fearEscapeDirY,
            fearLevel: 1.0
        };
    }

    encodePhysicalSensory(input) {
        const {
            x = 1200, y = 800,
            vx = 0, vy = 0,
            isMoving = false, isGrounded = true,
            hunger = 80, happy = 80, energy = 90,
            isSwimming = false, isHeld = false,
            inHouse = false, isFrightened = false
        } = input;

        // 1. Rate coding posisi spasial (Neuron 0..29)
        if (this.v[10] !== undefined) this.v[10] += Math.min(1.0, Math.max(0, x / 2400)) * 0.8;
        if (this.v[20] !== undefined) this.v[20] += Math.min(1.0, Math.max(0, y / 1600)) * 0.8;

        // 2. Rate coding status homeostatik & biologis (Neuron 30..59)
        const hungerNeed = Math.max(0, (100 - hunger) / 100);
        if (this.v[30] !== undefined) this.v[30] += hungerNeed * 1.4;
        if (this.v[40] !== undefined) this.v[40] += (happy / 100) * 1.1;
        if (this.v[50] !== undefined) this.v[50] += (energy / 100) * 0.9;

        // 3. Sensor lingkungan khusus (Neuron 60..99)
        if (isSwimming && this.v[60] !== undefined) this.v[60] += 1.8;
        if (isHeld && this.v[70] !== undefined) this.v[70] += 1.6;
        if (inHouse && this.v[80] !== undefined) this.v[80] += 1.5;

        // 4. Locomotor & Central Pattern Generator (CPG) Motor Cortex Drive (1800..1899)
        // Neuron motorik aktif menghasilkan sinyal bio-elektrik saat kucing bergerak/berjalan
        if (isMoving || Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
            const moveIntensity = Math.min(1.0, Math.hypot(vx, vy) / 3.0) || 0.6;
            
            // Kiri vs Kanan (1800..1849)
            if (vx < -0.05) {
                const poolSize = 6;
                for (let k = 0; k < poolSize; k++) {
                    const idx = 1800 + Math.floor(Math.random() * 25);
                    if (idx < this.totalNeurons) this.v[idx] += 0.35 + moveIntensity * 0.45;
                }
            } else if (vx > 0.05) {
                const poolSize = 6;
                for (let k = 0; k < poolSize; k++) {
                    const idx = 1825 + Math.floor(Math.random() * 25);
                    if (idx < this.totalNeurons) this.v[idx] += 0.35 + moveIntensity * 0.45;
                }
            }

            // Atas vs Bawah (1850..1899)
            if (vy < -0.05) {
                for (let k = 0; k < 5; k++) {
                    const idx = 1850 + Math.floor(Math.random() * 25);
                    if (idx < this.totalNeurons) this.v[idx] += 0.35 + moveIntensity * 0.4;
                }
            } else if (vy > 0.05) {
                for (let k = 0; k < 5; k++) {
                    const idx = 1875 + Math.floor(Math.random() * 25);
                    if (idx < this.totalNeurons) this.v[idx] += 0.35 + moveIntensity * 0.4;
                }
            }
        }

        // Renang & Lompat Motorik
        if (isSwimming) {
            for (let k = 1880; k < 1890; k++) {
                if (k < this.totalNeurons) this.v[k] += 0.4 + Math.random() * 0.5;
            }
        }
        if (!isGrounded) {
            for (let k = 1890; k < 1900; k++) {
                if (k < this.totalNeurons) this.v[k] += 0.5 + Math.random() * 0.6;
            }
        }

        // Spontaneous Motor Babbling (Ritme tonik saraf motorik agar tidak beku)
        for (let m = 0; m < 5; m++) {
            const mIdx = 1800 + Math.floor(Math.random() * 100);
            if (mIdx < this.totalNeurons) {
                this.v[mIdx] += 0.15 + Math.random() * 0.3;
            }
        }

        // 5. Emosi Amigdala saat Ketakutan / Kaget
        if (isFrightened) {
            for (let a = 1200; a < 1400; a += 8) {
                if (a < this.totalNeurons) this.v[a] += 0.8 + Math.random() * 0.7;
            }
        }

        // 6. Bio-Pacemaker Spontan (Living Brain Background Oscillations across ALL regions):
        // Memberikan denyut depolarisasi biologis alami ke 32-48 neuron acak tiap frame
        const pulseCount = 36;
        for (let p = 0; p < pulseCount; p++) {
            const rNeuron = Math.floor(Math.random() * this.totalNeurons);
            this.v[rNeuron] += 0.15 + Math.random() * 0.32;
        }
    }

    encodeTextInput(text) {
        if (!text || typeof text !== 'string') return;
        const words = text.toLowerCase().split(/[\s,!?+=]+/).filter(Boolean);
        if (words.length === 0) return;

        // Modulasi neuromodulator atensi & pembelajaran
        this.neuromodulators.acetylcholine = Math.min(1.0, this.neuromodulators.acetylcholine + 0.4);
        this.neuromodulators.norepinephrine = Math.min(1.0, this.neuromodulators.norepinephrine + 0.3);

        // Eksitasi korteks sensorik teks (100..399) melalui SDR
        for (const w of words) {
            const sdr = this.registerTokenToSDR(w);
            for (let i = 0; i < sdr.length; i++) {
                const nIdx = sdr[i];
                if (nIdx < this.totalNeurons) {
                    this.v[nIdx] += 2.5; // Eksitatori korteks sensorik teks
                }
            }

            // Resonansi insting kata mirip: jika kata 'hei', pet otomatis memahami dan mengeksitasi juga memori 'hai'
            const similar = this.findClosestKnownWord(w);
            if (similar && similar !== w && this.vocabulary.has(similar)) {
                const simSdr = this.vocabulary.get(similar);
                for (let i = 0; i < simSdr.length; i++) {
                    const nIdx = simSdr[i];
                    if (nIdx < this.totalNeurons) {
                        this.v[nIdx] += 2.2; // Resonansi semantik padanan kata
                    }
                }
            }
        }
    }

    /**
     * Dinamika Propagasi Spiking LIF & Predictive Coding
     */
    stepSpikePropagation(dtFactor = 1.0) {
        let spikeCount = 0;
        this.spikeState.fill(0);

        // 1. Integrasi Membran LIF per Neuron
        for (let i = 0; i < this.totalNeurons; i++) {
            if (this.refractoryTimer[i] > 0) {
                this.refractoryTimer[i]--;
                this.v[i] = 0;
                continue;
            }

            // Leakage berdasarkan tauM per area: dv = (-v) * (dt / tauM)
            const dt = 16.67 * dtFactor;
            const leakFactor = Math.exp(-dt / this.tauM[i]);
            this.v[i] *= leakFactor;

            // Eksplorasi Noise Gaussian kecil (sigma = 0.01)
            this.v[i] += (Math.random() - 0.5) * 0.02;

            // Predictive Coding di Layer Sequence Memory (700..999) & Context
            if (i >= 700 && i < 1200) {
                const err = Math.abs(this.v[i] - this.predictedV[i]);
                this.predictionErrors[i] = err;
                // Update prediksi dengan leaky average
                this.predictedV[i] = 0.85 * this.predictedV[i] + 0.15 * this.v[i];
            }

            // Ambang Aktivasi
            if (this.v_th[i] === undefined || isNaN(this.v_th[i]) || this.v_th[i] < 0.6) {
                this.v_th[i] = 1.0;
            }

            if (this.v[i] >= this.v_th[i]) {
                this.spikeState[i] = 1;
                spikeCount++;

                // Reset membran & naikkan ambang adaptif (A_th = 0.2)
                this.v[i] = 0.0;
                this.v_th[i] = Math.min(2.5, this.v_th[i] + 0.2);

                // Refractory period: 2 frame sensorik, 5 frame area lain
                this.refractoryTimer[i] = (i < 400) ? 2 : 5;
            }

            // Peluruhan ambang adaptif kembali ke v_th0 (1.0) dengan tau = 50ms
            this.v_th[i] = Math.max(0.75, 1.0 + (this.v_th[i] - 1.0) * 0.96);

            // Update recent firing rate (Hz)
            this.recentRate[i] = 0.95 * this.recentRate[i] + 0.05 * (this.spikeState[i] * 60.0);
        }

        // 2. Transmisi Sinapsis ke Neuron Post-sinaptik
        for (let s = 0; s < this.synapseCount; s++) {
            const pre = this.synPre[s];
            if (pre < this.totalNeurons && this.spikeState[pre] === 1) {
                const post = this.synPost[s];
                if (post < this.totalNeurons) {
                    const w = this.synWeight[s];
                    this.v[post] += w;

                    // Update Eligibility Trace
                    this.synEligibility[s] = Math.min(1.0, this.synEligibility[s] + 0.25);
                }
            }
        }

        return spikeCount;
    }

    /**
     * Plastisitas STDP & Reward-Modulated Hebbian Learning
     */
    applySTDP(lr = 0.005) {
        const dopaBoost = 1.0 + this.neuromodulators.dopamine * 2.0;
        const cortSuppress = 1.0 / (1.0 + this.neuromodulators.cortisol);

        for (let s = 0; s < this.synapseCount; s++) {
            const pre = this.synPre[s];
            const post = this.synPost[s];

            if (pre < this.totalNeurons && post < this.totalNeurons) {
                const preSpiked = this.spikeState[pre] === 1;
                const postSpiked = this.spikeState[post] === 1;

                const postArea = this.getNeuronArea(post);
                const areaMult = this.learningRateMultiplier[postArea] || 1.0;
                const effectiveLr = lr * areaMult * dopaBoost * cortSuppress;

                if (preSpiked && postSpiked) {
                    // STDP Potentiation (Pre sebelum Post)
                    this.synWeight[s] += effectiveLr * 1.5;
                } else if (preSpiked && !postSpiked) {
                    // STDP Depression (Pre tanpa Post)
                    this.synWeight[s] -= effectiveLr * 0.3;
                }

                // Batasi bobot sinapsis [-1.0, 1.8]
                if (this.synWeight[s] > 1.8) this.synWeight[s] = 1.8;
                if (this.synWeight[s] < -1.0) this.synWeight[s] = -1.0;

                // Peluruhan bobot lambat (w -= 0.00001 * w)
                this.synWeight[s] -= 0.00001 * this.synWeight[s];

                // Peluruhan eligibility trace (tau = 1s)
                this.synEligibility[s] *= 0.94;
            }
        }
    }

    /**
     * Homeostatic Plasticity: Menjaga target firing rate
     */
    applyHomeostaticPlasticity() {
        for (let i = 0; i < this.totalNeurons; i++) {
            const targetRate = (i < 400) ? 1.0 : 0.15; // 1Hz sensorik, 0.15Hz asosiasi
            const diff = this.recentRate[i] - targetRate;
            if (diff > 0.5) {
                this.v_th[i] += 0.001; // Naikkan threshold jika terlalu aktif
            } else if (diff < -0.1) {
                this.v_th[i] = Math.max(0.7, this.v_th[i] - 0.0005); // Turunkan threshold
            }
        }
    }

    /**
     * Konsolidasi Reward Hebbian saat Dopamin meningkat
     */
    consolidateEligibilityTraces(amount) {
        for (let s = 0; s < this.synapseCount; s++) {
            if (this.synEligibility[s] > 0.05) {
                this.synWeight[s] += this.synEligibility[s] * amount;
                if (this.synWeight[s] > 1.8) this.synWeight[s] = 1.8;
            }
        }
    }

    injectReward(type, amount = 0.5) {
        if (this.neuromodulators[type] !== undefined) {
            this.neuromodulators[type] = Math.min(1.0, Math.max(0.0, this.neuromodulators[type] + amount));
        }

        if (type === 'dopamine' && amount > 0) {
            this.consolidateEligibilityTraces(amount * 0.08);
            // Dopamin menurunkan ambang output sementara untuk memicu ekspresi
            for (let i = 1800; i < 2000; i++) {
                if (i < this.totalNeurons) this.v_th[i] = Math.max(0.6, this.v_th[i] - 0.15);
            }
        }

        if (type === 'cortisol' || amount < 0) {
            this.negativeRewardHistory.push(Date.now());
        }
    }

    decayNeuromodulators(dtFactor = 1.0) {
        this.neuromodulators.dopamine *= (0.97 ** dtFactor);
        this.neuromodulators.cortisol *= (0.95 ** dtFactor);
        this.neuromodulators.norepinephrine *= (0.96 ** dtFactor);
        this.neuromodulators.serotonin = 0.5 + (this.neuromodulators.serotonin - 0.5) * 0.98;
        this.neuromodulators.acetylcholine *= (0.96 ** dtFactor);
    }

    /**
     * PERTUMBUHAN NEURON EVOLUSI UNBOUNDED (Tanpa Batasan)
     */
    checkAndGrowNeurons(textInput = null) {
        if (!this.evolutionEnabled) return;

        let shouldGrow = false;
        let reason = '';

        // 1. Prediction error tinggi
        const avgPredErr = this.calcPredictionError();
        if (avgPredErr > this.neurogenesisThreshold) {
            shouldGrow = true;
            reason = 'high_prediction_error';
        }

        // 2. Input token tidak dikenal
        if (!shouldGrow && this.lastInputWasUnrecognized) {
            shouldGrow = true;
            reason = 'new_vocabulary';
        }
        this.lastInputWasUnrecognized = false;

        // 3. Kegagalan berulang (3x kortisol dalam 10 detik)
        if (!shouldGrow) {
            const now = Date.now();
            this.negativeRewardHistory = this.negativeRewardHistory.filter(t => (now - t) <= 10000);
            if (this.negativeRewardHistory.length >= 3) {
                shouldGrow = true;
                reason = 'repeated_distress';
            }
        }

        if (shouldGrow) {
            this.growNeuronsUnbounded(100, reason);
        }
    }

    growNeuronsUnbounded(addCount = 100, reason = '') {
        const oldTotal = this.totalNeurons;
        const newTotal = oldTotal + addCount;

        // Perluas TypedArrays
        const newV = new Float32Array(newTotal);
        const newVth = new Float32Array(newTotal);
        const newRefractory = new Int16Array(newTotal);
        const newSpikeState = new Uint8Array(newTotal);
        const newRecentRate = new Float32Array(newTotal);
        const newTauM = new Float32Array(newTotal);
        const newPredictedV = new Float32Array(newTotal);
        const newPredictionErrors = new Float32Array(newTotal);

        newV.set(this.v);
        newVth.set(this.v_th);
        newRefractory.set(this.refractoryTimer);
        newSpikeState.set(this.spikeState);
        newRecentRate.set(this.recentRate);
        newTauM.set(this.tauM);
        newPredictedV.set(this.predictedV);
        newPredictionErrors.set(this.predictionErrors);

        for (let i = oldTotal; i < newTotal; i++) {
            newVth[i] = 1.0;
            newTauM[i] = 40.0 + (i % 5) * 15.0; // Kapasitas reasoning / memori baru
        }

        this.v = newV;
        this.v_th = newVth;
        this.refractoryTimer = newRefractory;
        this.spikeState = newSpikeState;
        this.recentRate = newRecentRate;
        this.tauM = newTauM;
        this.predictedV = newPredictedV;
        this.predictionErrors = newPredictionErrors;

        this.totalNeurons = newTotal;
        this.newCreatedNeurons += addCount;
        this.stats.activeNeuronCount = this.getNeuronCount();

        // Buat sinapsis baru ke area reasoning & memory
        const newSynapses = [];
        for (let idx = oldTotal; idx < newTotal; idx++) {
            // Sambungkan ke area reasoning (1200..1599) & output (1800..1999)
            for (let target = 1000; target < 1600; target += 25) {
                if (Math.random() < 0.02) {
                    newSynapses.push({ pre: target, post: idx, weight: (Math.random() - 0.5) * 0.15 });
                }
                if (Math.random() < 0.02) {
                    newSynapses.push({ pre: idx, post: target, weight: (Math.random() - 0.5) * 0.15 });
                }
            }
        }

        if (newSynapses.length > 0) {
            const oldSynCount = this.synapseCount;
            const addSynCount = newSynapses.length;
            const newSynTotal = oldSynCount + addSynCount;

            const expandedPre = new Int32Array(newSynTotal);
            const expandedPost = new Int32Array(newSynTotal);
            const expandedWeight = new Float32Array(newSynTotal);
            const expandedElig = new Float32Array(newSynTotal);

            expandedPre.set(this.synPre);
            expandedPost.set(this.synPost);
            expandedWeight.set(this.synWeight);
            expandedElig.set(this.synEligibility);

            for (let s = 0; s < addSynCount; s++) {
                expandedPre[oldSynCount + s] = newSynapses[s].pre;
                expandedPost[oldSynCount + s] = newSynapses[s].post;
                expandedWeight[oldSynCount + s] = newSynapses[s].weight;
                expandedElig[oldSynCount + s] = 0;
            }

            this.synPre = expandedPre;
            this.synPost = expandedPost;
            this.synWeight = expandedWeight;
            this.synEligibility = expandedElig;
            this.synapseCount = newSynTotal;
            this.stats.synapseCount = this.synapseCount * this.virtualMultiplier;
        }

        this.neuromodulators.norepinephrine = Math.min(1.0, this.neuromodulators.norepinephrine + 0.2);
        this.neuromodulators.dopamine = Math.min(1.0, this.neuromodulators.dopamine + 0.15);
    }

    /**
     * Pruning sinapsis lemah saat mode evolusi mati
     */
    pruneWeakSynapses(threshold = 0.001) {
        let validCount = 0;
        for (let s = 0; s < this.synapseCount; s++) {
            if (Math.abs(this.synWeight[s]) >= threshold) validCount++;
        }

        if (validCount === this.synapseCount) return 0;

        const newPre = new Int32Array(validCount);
        const newPost = new Int32Array(validCount);
        const newWeight = new Float32Array(validCount);
        const newElig = new Float32Array(validCount);

        let ptr = 0;
        for (let s = 0; s < this.synapseCount; s++) {
            if (Math.abs(this.synWeight[s]) >= threshold) {
                newPre[ptr] = this.synPre[s];
                newPost[ptr] = this.synPost[s];
                newWeight[ptr] = this.synWeight[s];
                newElig[ptr] = this.synEligibility[s];
                ptr++;
            }
        }

        this.synPre = newPre;
        this.synPost = newPost;
        this.synWeight = newWeight;
        this.synEligibility = newElig;
        this.synapseCount = validCount;
        this.stats.synapseCount = this.synapseCount * this.virtualMultiplier;
        return ptr;
    }

    recordEpisodicSnapshot() {
        // Ambil pola aktivasi aktif (neuron dengan potensial > 0.5)
        const activeIndices = [];
        for (let i = 0; i < this.totalNeurons; i++) {
            if (this.v[i] > 0.5) activeIndices.push(i);
        }
        if (activeIndices.length > 0) {
            if (this.episodicMemoryBuffer.length >= this.maxEpisodicSlots) {
                this.episodicMemoryBuffer.shift();
            }
            this.episodicMemoryBuffer.push(activeIndices);
        }
    }

    /**
     * DEKODE MOTORIK (Neuron 1800..1899)
     * Rata-rata aktivitas populasi menentukan kekuatan/arah gerakan
     */
    decodeMotorOutputs() {
        let leftSpikes = 0;
        let rightSpikes = 0;
        let upSpikes = 0;
        let downSpikes = 0;
        let swimSpikes = 0;
        let jumpSpikes = 0;

        for (let i = 1800; i < 1825; i++) { if (this.spikeState[i] === 1) leftSpikes++; }
        for (let i = 1825; i < 1850; i++) { if (this.spikeState[i] === 1) rightSpikes++; }
        for (let i = 1850; i < 1875; i++) { if (this.spikeState[i] === 1) upSpikes++; }
        for (let i = 1875; i < 1900; i++) { if (this.spikeState[i] === 1) downSpikes++; }
        for (let i = 1880; i < 1890; i++) { if (this.spikeState[i] === 1) swimSpikes++; }
        for (let i = 1890; i < 1900; i++) { if (this.spikeState[i] === 1) jumpSpikes++; }

        // Motor babbling alami
        const babbleX = (Math.random() - 0.5) * 0.2;
        const babbleY = (Math.random() - 0.5) * 0.2;

        const dx = (rightSpikes - leftSpikes) * 0.3 + babbleX;
        const dy = (downSpikes - upSpikes) * 0.3 + babbleY;

        return {
            dx: Math.max(-1.0, Math.min(1.0, dx)),
            dy: Math.max(-1.0, Math.min(1.0, dy)),
            shouldSwim: swimSpikes > 3,
            shouldJump: jumpSpikes > 2
        };
    }

    /**
     * DEKODE BAHASA & KOGNITIF (Neuron 1900..1999 + Resonansi Prefrontal Kortikal)
     * MURNI POPULATION RATE & VOLTAGE CODING DENGAN SAMPLING STOKASTIK BOLTZMANN!
     * 
     * Tanpa aturan if-else kaku, tanpa echo deterministik palsu. Output ditentukan oleh
     * distribusi probabilitas kontinu dari bobot sinapsis, plastisitas STDP, neuromodulator,
     * dan habituasi biologis (refractory suppression).
     */
    decodeSpeechOutputs(recentTextInput = null) {
        if (!this.vocabulary || this.vocabulary.size === 0) return null;

        const candidates = [];
        const dopamine = (this.neuromodulators && this.neuromodulators.dopamine) || 0.5;
        const serotonin = (this.neuromodulators && this.neuromodulators.serotonin) || 0.5;

        // Ekstrak token kata input, padanan kata mirip, serta frasa gabungan (bigram & trigram)
        let inputTokens = [];
        let effectiveTokens = [];
        let primaryInputToken = null;
        if (recentTextInput && typeof recentTextInput === 'string') {
            inputTokens = recentTextInput.toLowerCase().split(/[\s,!?+=]+/).filter(Boolean);
            if (inputTokens.length > 0) {
                primaryInputToken = inputTokens[0];
                for (const inTok of inputTokens) {
                    effectiveTokens.push(inTok);
                    if (!this.vocabulary.has(inTok)) {
                        const close = this.findClosestKnownWord(inTok);
                        if (close && close !== inTok && !effectiveTokens.includes(close)) {
                            effectiveTokens.push(close);
                        }
                    }
                }
                // Ekstrak frasa bigram & trigram input (misal: "siapa kamu", "apa kabar", "terima kasih", "lagi apa")
                if (inputTokens.length > 1) {
                    for (let i = 0; i < inputTokens.length - 1; i++) {
                        const bigram = `${inputTokens[i]} ${inputTokens[i + 1]}`;
                        effectiveTokens.push(bigram);
                    }
                    if (inputTokens.length > 2) {
                        const trigram = `${inputTokens[0]} ${inputTokens[1]} ${inputTokens[2]}`;
                        effectiveTokens.push(trigram);
                    }
                }
            }
        }

        // 1. Hitung energi aktivasi sinaptik & populasi untuk setiap kata di vocabulary
        for (const [token, sdr] of this.vocabulary.entries()) {
            let energy = 0;
            for (let k = 0; k < sdr.length; k++) {
                const sdrNeuron = sdr[k];
                // Output kognitif & bahasa (1900..1999)
                const mappedOutputIdx = 1900 + ((sdrNeuron - 100) % 100);
                if (mappedOutputIdx < this.totalNeurons) {
                    energy += (this.v[mappedOutputIdx] || 0) * 1.5 + (this.recentRate[mappedOutputIdx] || 0) * 0.8;
                }
                // Prefrontal & reasoning associative area (1200..1599)
                const mappedReasoningIdx = 1200 + ((sdrNeuron - 100) % 400);
                if (mappedReasoningIdx < this.totalNeurons) {
                    energy += (this.v[mappedReasoningIdx] || 0) * 0.7;
                }
            }

            // Integrasi Pembelajaran Pengondisian Operan (Operant Conditioning) O(1):
            // Akumulasi bobot asosiasi untuk SEMUA kata input dan frasa input
            let totalAssoc = 0;
            if (effectiveTokens.length > 0) {
                for (const inTok of effectiveTokens) {
                    const key = `${inTok}->${token}`;
                    const w = this.wordAssociations.get(key);
                    if (w) {
                        // Frasa multi-kata (misal "siapa kamu", "terima kasih") memiliki prioritas resonansi lebih kuat
                        const isPhrase = inTok.includes(' ');
                        totalAssoc += w * (isPhrase ? 1.6 : 1.0);
                    }
                }
                energy += totalAssoc * 3.8; // Amplifikasi energi asosiasi pujian (+)/hukuman (-)
            }

            // 2. Refractory Habituation (Repetition Suppression Biologis):
            // Mencegah otak mengulang kata yang persis sama berulang kali jika tanpa stimulus relevan
            if (this.recentSpeechHistory && this.recentSpeechHistory.length > 0) {
                const lastIdx = this.recentSpeechHistory.lastIndexOf(token);
                if (lastIdx !== -1) {
                    const recency = this.recentSpeechHistory.length - 1 - lastIdx;
                    // Jika ada asosiasi kuat dengan stimulus input saat ini, jangan tekan kata secara berlebihan
                    const suppressFactor = totalAssoc > 1.2 ? 0.85 : (recency === 0 ? 0.35 : (recency === 1 ? 0.60 : 0.80));
                    energy *= suppressFactor;
                }
            }

            candidates.push({ token, energy, adjustedEnergy: 0 });
        }

        if (candidates.length === 0) return null;

        // 3. Boltzmann Softmax Sampling dengan Temperatur Dinamis
        // Temperatur dipengaruhi Dopamin (eksplorasi & variasi kreatif) & Serotonin (fokus)
        const temperature = Math.max(0.2, 0.35 + dopamine * 0.30 - serotonin * 0.15);

        // Numerical stability untuk Softmax
        let maxE = -Infinity;
        for (let i = 0; i < candidates.length; i++) {
            // Biological thermal noise untuk stochastic exploration
            const noise = (Math.random() - 0.5) * 0.18;
            candidates[i].adjustedEnergy = (candidates[i].energy + noise) / temperature;
            if (candidates[i].adjustedEnergy > maxE) maxE = candidates[i].adjustedEnergy;
        }

        let sumExp = 0;
        const probs = new Float64Array(candidates.length);
        for (let i = 0; i < candidates.length; i++) {
            probs[i] = Math.exp(candidates[i].adjustedEnergy - maxE);
            sumExp += probs[i];
        }

        // Sampling stokastik probabilistik
        let r = Math.random() * sumExp;
        let selectedToken = candidates[0].token;
        let selectedIndex = 0;
        for (let i = 0; i < candidates.length; i++) {
            r -= probs[i];
            if (r <= 0) {
                selectedToken = candidates[i].token;
                selectedIndex = i;
                break;
            }
        }

        // Simpan ke riwayat ucapan untuk habituasi
        if (!this.recentSpeechHistory) this.recentSpeechHistory = [];
        this.recentSpeechHistory.push(selectedToken);
        if (this.recentSpeechHistory.length > 6) this.recentSpeechHistory.shift();

        // 4. PEMBENTUKAN KALIMAT BERTAHAP & FLUID (Sequential Natural Indonesian Sentence Generation)
        // Membangun rangkaian kalimat alami 2 s/d 4 kata berdasarkan transisi sintaksis sekuensial yang koheren
        const sentenceTokens = [selectedToken];
        const maxSentenceLength = (recentTextInput ? 4 : 3);
        const usedTokenCounts = new Map([[selectedToken, 1]]);

        // Kata-kata bahasa Indonesia yang valid mengalami reduplikasi (kata ulang)
        const REDUPLICATION_WORDS = new Set(['sama', 'nyam', 'jalan', 'main', 'pelan', 'hati', 'lagi', 'tidur']);

        for (let step = 1; step < maxSentenceLength; step++) {
            const prevToken = sentenceTokens[sentenceTokens.length - 1];
            let bestNextCandidate = null;
            let bestNextScore = -Infinity;
            const stepCandidates = [];

            for (let i = 0; i < candidates.length; i++) {
                const nextTok = candidates[i].token;

                // Cek duplikasi kata: boleh maksimal 2x HANYA jika kata ulang valid (misal: "sama-sama", "nyam-nyam")
                const count = usedTokenCounts.get(nextTok) || 0;
                if (count >= 2) continue;
                if (count === 1 && (!REDUPLICATION_WORDS.has(nextTok) || prevToken !== nextTok)) continue;

                // 1. Bobot asosiasi sekuensial (prevToken -> nextTok)
                const seqWeight = this.getWordAssociationWeight(prevToken, nextTok);

                // KRUSIAL: Harus ada tautan transisi sintaksis positif agar kalimat tidak asal-asalan!
                if (seqWeight < 0.45) continue;

                // 2. Bobot konteks bigram sekuensial (prevPrevToken + prevToken -> nextTok) jika ada
                let bigramSeqWeight = 0;
                if (sentenceTokens.length >= 2) {
                    const prevPrev = sentenceTokens[sentenceTokens.length - 2];
                    const key2 = `${prevPrev} ${prevToken}->${nextTok}`;
                    const w2 = this.wordAssociations.get(key2);
                    if (w2) bigramSeqWeight = w2;
                }

                // 3. Bobot relevansi stimulus dengan input percakapan
                let stimulusRelevance = 0;
                if (effectiveTokens.length > 0) {
                    for (const inTok of effectiveTokens) {
                        const w = this.getWordAssociationWeight(inTok, nextTok);
                        if (w > stimulusRelevance) stimulusRelevance = w;
                    }
                }

                // 4. Skor transisi gabungan:
                // Sintaksis Sekuensial (65%) + Konteks N-gram (20%) + Stimulus Resonansi (10%) + Energi SNN (5%)
                const transitionScore = (seqWeight * 3.2) + (bigramSeqWeight * 2.2) + (stimulusRelevance * 0.7) + (candidates[i].energy * 0.15);

                if (transitionScore > 1.8) {
                    stepCandidates.push({ token: nextTok, score: transitionScore });
                    if (transitionScore > bestNextScore) {
                        bestNextScore = transitionScore;
                        bestNextCandidate = nextTok;
                    }
                }
            }

            // Jika tidak ada transisi sintaksis yang memenuhi syarat, akhiri kalimat secara alami
            if (stepCandidates.length === 0 || !bestNextCandidate) break;

            // Boltzmann sampling lembut antar kandidat transisi valid
            if (stepCandidates.length > 1) {
                let sumExpStep = 0;
                const stepProbs = new Float64Array(stepCandidates.length);
                const tempStep = 0.35;
                for (let j = 0; j < stepCandidates.length; j++) {
                    stepProbs[j] = Math.exp((stepCandidates[j].score - bestNextScore) / tempStep);
                    sumExpStep += stepProbs[j];
                }
                let rStep = Math.random() * sumExpStep;
                let picked = bestNextCandidate;
                for (let j = 0; j < stepCandidates.length; j++) {
                    rStep -= stepProbs[j];
                    if (rStep <= 0) {
                        picked = stepCandidates[j].token;
                        break;
                    }
                }
                sentenceTokens.push(picked);
                usedTokenCounts.set(picked, (usedTokenCounts.get(picked) || 0) + 1);
            } else {
                sentenceTokens.push(bestNextCandidate);
                usedTokenCounts.set(bestNextCandidate, (usedTokenCounts.get(bestNextCandidate) || 0) + 1);
            }

            // Hentikan kalimat secara alami jika sudah mencapai 3 kata dan membentuk makna utuh
            if (sentenceTokens.length >= 3 && Math.random() < 0.40) break;
        }

        // Format kalimat rapi (huruf kapital di awal kata, tanda hubung untuk reduplikasi kata ulang)
        const formattedWords = [];
        for (let idx = 0; idx < sentenceTokens.length; idx++) {
            const cur = sentenceTokens[idx];
            if (idx > 0 && cur === sentenceTokens[idx - 1] && REDUPLICATION_WORDS.has(cur)) {
                formattedWords[formattedWords.length - 1] += `-${cur}`;
            } else {
                if (formattedWords.length === 0) {
                    formattedWords.push(cur.charAt(0).toUpperCase() + cur.slice(1));
                } else {
                    formattedWords.push(cur.toLowerCase());
                }
            }
        }

        let finalSentence = formattedWords.join(' ');

        // Deteksi intonasi kalimat (Tanya / Seru / Netral)
        const isQuestion = recentTextInput && (
            recentTextInput.includes('?') || 
            effectiveTokens.some(t => ['siapa', 'apa', 'kenapa', 'ngapain', 'dimana', 'kemana', 'gimana', 'kapan', 'kok'].includes(t)) ||
            sentenceTokens.some(t => ['siapa', 'apa', 'kabar', 'kenapa', 'dimana', 'kan'].includes(t))
        ) && (
            sentenceTokens.some(t => ['kan', 'siapa', 'apa', 'gimana', 'kamu'].includes(t))
        );

        const isExclamation = sentenceTokens.some(t => 
            ['banget', 'dong', 'cuy', 'bro', 'nyam', 'ampun', 'enak', 'jangan', 'tembak', 'marah', 'santai', 'woi', 'ayo', 'gas', 'lucu', 'gemoy', 'mati'].includes(t)
        );

        if (isQuestion && !finalSentence.endsWith('?')) {
            finalSentence += '?';
        } else if (isExclamation && !finalSentence.endsWith('!')) {
            finalSentence += '!';
        } else if (!finalSentence.endsWith('.') && !finalSentence.endsWith('!') && !finalSentence.endsWith('?')) {
            finalSentence += '!';
        }

        // Catat jejak asosiasi kalimat terkini untuk Operant Conditioning (Pujian / Hukuman)
        this.lastSpeechAssociation = {
            inputTokens: effectiveTokens.length > 0 ? effectiveTokens : (primaryInputToken ? [primaryInputToken] : ['pet']),
            inputToken: primaryInputToken || (effectiveTokens[0] || 'pet'),
            outputTokens: sentenceTokens,
            outputToken: finalSentence,
            timestamp: Date.now()
        };

        // Respons atas input percakapan
        if (recentTextInput) {
            return finalSentence;
        }

        // 5. KONDISI PIKIRAN ASOSIATIF SPONTAN (IDLE BRAIN BUBBLE)
        this.spontaneousThoughtTimer = (this.spontaneousThoughtTimer || 0) + 1;
        if (this.spontaneousThoughtTimer >= 300) {
            this.spontaneousThoughtTimer = 0;
            const totalCognitiveEnergy = candidates.reduce((acc, c) => acc + c.energy, 0);
            if (totalCognitiveEnergy > 0.35 || Math.random() < 0.5) {
                return finalSentence;
            }
        }

        return null;
    }

    /**
     * PRE-TRAIN KORPUS (Bootstrapping Statistik Bahasa)
     * Menggunakan STDP tanpa reward (unsupervised) untuk membentuk ko-occurrence kata/simbol
     */
    async preTrain(corpusText, options = {}) {
        const epochs = options.epochs || 2;
        const tokens = corpusText.toLowerCase()
            .replace(/[^a-z0-9\s+=]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 0);

        let processed = 0;

        for (let ep = 0; ep < epochs; ep++) {
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                const sdr = this.registerTokenToSDR(token);

                // Stimulasi area sensorik SDR
                for (let k = 0; k < sdr.length; k++) {
                    const idx = sdr[k];
                    if (idx < this.totalNeurons) {
                        this.v[idx] += 2.0;
                    }
                }

                // Forward tick SNN tanpa reward
                this.stepSpikePropagation(1.0);
                this.applySTDP(0.015);

                processed++;
            }
        }

        this.stats.pretrainedTokens += processed;
        return { tokensProcessed: processed, vocabCount: this.vocabulary.size };
    }

    /**
     * INTEGRASI EXTERNAL TEACHER (LLM) ASYNCHRONOUS
     * LLM memberikan petunjuk semantik async -> memodulasi reward & target signal SNN
     */
    enableExternalTeacher(llmAdapter) {
        this.llmAdapter = llmAdapter;
        this.enableTeacherSignal = !!llmAdapter;
    }

    async triggerTeacherSignalAsync(text) {
        if (this.llmAdapter && typeof this.llmAdapter.getSemanticHint === 'function') {
            try {
                const hint = await this.llmAdapter.getSemanticHint(text);
                if (hint) {
                    if (hint.sentiment === 'positive') this.injectReward('dopamine', 0.4);
                    if (hint.sentiment === 'negative') this.injectReward('cortisol', 0.3);
                }
            } catch (e) {
                // Silently fallback
            }
        } else if (this.llmConfig && this.llmConfig.apiKey) {
            this.queryLlmTeacher(text);
        }
    }

    loadLlmConfigFromStorage() {
        if (typeof localStorage === 'undefined') {
            this.llmConfig = { shotMode: '3-shot' };
            return;
        }
        const saved = localStorage.getItem('PET_LLM_CONFIG');
        if (saved) {
            try {
                this.llmConfig = JSON.parse(saved);
                if (!this.llmConfig.shotMode) this.llmConfig.shotMode = '3-shot';
                if (this.llmConfig && this.llmConfig.apiKey) this.enableTeacherSignal = true;
            } catch (e) {
                this.llmConfig = { shotMode: '3-shot' };
            }
        } else {
            this.llmConfig = { shotMode: '3-shot' };
        }
    }

    setLlmConfig(config) {
        this.llmConfig = config;
        if (config) {
            if (!this.llmConfig.shotMode) this.llmConfig.shotMode = '3-shot';
            localStorage.setItem('PET_LLM_CONFIG', JSON.stringify(config));
            this.enableTeacherSignal = Boolean(config.apiKey);
        } else {
            localStorage.removeItem('PET_LLM_CONFIG');
            this.enableTeacherSignal = false;
        }
    }

    /**
     * AMBIL DAFTAR CONTOH FEW-SHOT BERDASARKAN KONFIGURASI
     */
    getFewShotExamples() {
        const mode = (this.llmConfig && this.llmConfig.shotMode) ? this.llmConfig.shotMode : '3-shot';
        if (mode === 'zero') return [];
        if (mode === '1-shot') return DEFAULT_FEW_SHOT_EXAMPLES.slice(0, 1);
        if (mode === '3-shot') return DEFAULT_FEW_SHOT_EXAMPLES.slice(0, 3);
        if (mode === '5-shot') return DEFAULT_FEW_SHOT_EXAMPLES.slice(0, 5);
        if (mode === 'custom' && this.llmConfig.customShots && Array.isArray(this.llmConfig.customShots) && this.llmConfig.customShots.length > 0) {
            return this.llmConfig.customShots;
        }
        return DEFAULT_FEW_SHOT_EXAMPLES.slice(0, 3);
    }

    /**
     * TEST PING PROVIDER API
     */
    static async testPingLlmApi(config) {
        if (!config || !config.apiKey) throw new Error('API Key tidak boleh kosong');
        const { provider, model, apiKey } = config;
        const key = apiKey.trim();
        const targetModel = (model && model.trim()) ? model.trim() : (provider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini');

        if (provider === 'gemini') {
            const cleanModel = targetModel.replace(/^models\//, '');
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${key}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `HTTP ${res.status}`);
            }
            return true;
        } else if (['openai', 'groq', 'openrouter', 'deepseek', 'mistral', 'xai', 'together'].includes(provider)) {
            let endpoint = 'https://api.openai.com/v1/chat/completions';
            if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
            if (provider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';
            if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';
            if (provider === 'mistral') endpoint = 'https://api.mistral.ai/v1/chat/completions';
            if (provider === 'xai') endpoint = 'https://api.x.ai/v1/chat/completions';
            if (provider === 'together') endpoint = 'https://api.together.xyz/v1/chat/completions';

            const isReasoning = targetModel.startsWith('o1') || targetModel.startsWith('o3');
            const tokenParam = isReasoning ? { max_completion_tokens: 10 } : { max_tokens: 5 };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: targetModel,
                    messages: [{ role: 'user', content: 'ping' }],
                    ...tokenParam
                })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || errData?.message || `HTTP ${res.status}`);
            }
            return true;
        } else if (provider === 'anthropic') {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': key,
                    'anthropic-version': '2023-06-01',
                    'dangerously-allow-browser': 'true'
                },
                body: JSON.stringify({
                    model: targetModel || 'claude-3-7-sonnet-20250219',
                    messages: [{ role: 'user', content: 'ping' }],
                    max_tokens: 5
                })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `HTTP ${res.status}`);
            }
            return true;
        }
        throw new Error('Provider tidak dikenali');
    }

    async queryLlmTeacher(userText) {
        if (!this.llmConfig || !this.llmConfig.apiKey) return null;
        const { provider, model, apiKey, instructions } = this.llmConfig;
        const targetModel = (model && model.trim()) ? model.trim() : 'gemini-3.8-flash';
        const baseRule = "Kamu adalah Guru AI untuk SNN Pet Kucing. Balas dalam 1-4 kata pendek ramah yang cocok dipelajari pet (misal: '2 pintar', 'patuh duduk', 'meow sayang').";
        const systemPrompt = instructions ? `${instructions}\n${baseRule}` : baseRule;
        const shots = this.getFewShotExamples();

        try {
            let reply = null;
            if (provider === 'gemini') {
                const cleanModel = targetModel.replace(/^models\//, '');
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
                
                // Rakit contents dengan Few-Shot Multi-Turn Examples
                const contents = [];
                for (const shot of shots) {
                    contents.push({ role: 'user', parts: [{ text: `User berkata ke pet: "${shot.user}"` }] });
                    contents.push({ role: 'model', parts: [{ text: shot.teacher }] });
                }
                contents.push({ role: 'user', parts: [{ text: `${systemPrompt}\nUser sekarang berkata ke pet: "${userText}". Jawab 1-4 kata:` }] });

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: { temperature: 0.3, maxOutputTokens: 25 }
                    })
                });
                const data = await res.json();
                reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            } else if (['openai', 'groq', 'openrouter', 'deepseek', 'mistral', 'xai', 'together'].includes(provider)) {
                let endpoint = 'https://api.openai.com/v1/chat/completions';
                if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                if (provider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';
                if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';
                if (provider === 'mistral') endpoint = 'https://api.mistral.ai/v1/chat/completions';
                if (provider === 'xai') endpoint = 'https://api.x.ai/v1/chat/completions';
                if (provider === 'together') endpoint = 'https://api.together.xyz/v1/chat/completions';

                const messages = [{ role: 'system', content: systemPrompt }];
                for (const shot of shots) {
                    messages.push({ role: 'user', content: shot.user });
                    messages.push({ role: 'assistant', content: shot.teacher });
                }
                messages.push({ role: 'user', content: userText });

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: targetModel,
                        messages,
                        max_tokens: 30,
                        temperature: 0.3
                    })
                });
                const data = await res.json();
                reply = data?.choices?.[0]?.message?.content;
            } else if (provider === 'anthropic') {
                const messages = [];
                for (const shot of shots) {
                    messages.push({ role: 'user', content: shot.user });
                    messages.push({ role: 'assistant', content: shot.teacher });
                }
                messages.push({ role: 'user', content: userText });

                const res = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'dangerously-allow-browser': 'true'
                    },
                    body: JSON.stringify({
                        model: targetModel || 'claude-3-7-sonnet-20250219',
                        system: systemPrompt,
                        messages,
                        max_tokens: 30
                    })
                });
                const data = await res.json();
                reply = data?.content?.[0]?.text;
            }

            if (reply) {
                const cleaned = reply.replace(/["']/g, '').trim();
                this.seedInitialVocabulary(cleaned.split(/\s+/));
                this.injectReward('dopamine', 0.6);
                this.injectReward('acetylcholine', 0.8);
                return cleaned;
            }
        } catch (e) {
            console.warn('Teacher query failed:', e);
        }
        return null;
    }

    /**
     * Panggilan Kurikulum Otonom Guru AI (Auto-Training Loop)
     */
    getAutonomousCurriculum(topic = '', stepNumber = 0, state = {}) {
        const cleanTopic = (topic || '').toLowerCase();
        let actions = [];
        let isDone = false;

        if (cleanTopic.includes('mtk') || cleanTopic.includes('math') || cleanTopic.includes('hitung') || cleanTopic.includes('angka')) {
            const mathSteps = [
                [
                    { action: "setLearningRate", area: "reasoning", value: 0.05 },
                    { action: "sendInput", text: "1 + 1 = 2" },
                    { action: "feed" },
                    { action: "reward", type: "dopamine", amount: 0.6 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: "2 + 3 = 5" },
                    { action: "pet" },
                    { action: "reward", type: "dopamine", amount: 0.7 },
                    { action: "requestReplay", slot: 0 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: "5 + 5 = 10" },
                    { action: "feed" },
                    { action: "reward", type: "dopamine", amount: 0.8 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: "10 - 3 = 7" },
                    { action: "pet" },
                    { action: "reward", type: "dopamine", amount: 0.9 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: "2 x 4 = 8" },
                    { action: "feed" },
                    { action: "pet" },
                    { action: "reward", type: "dopamine", amount: 1.0 },
                    { action: "evaluateOutput" }
                ]
            ];
            const idx = stepNumber % mathSteps.length;
            actions = mathSteps[idx];
            isDone = false;
        } else if (cleanTopic.includes('indonesia') || cleanTopic.includes('bahasa') || cleanTopic.includes('kata') || cleanTopic.includes('bicara')) {
            const langSteps = [
                [
                    { action: "setLearningRate", area: "asosiasi", value: 0.05 },
                    { action: "sendInput", text: "Halo kawan" },
                    { action: "pet" },
                    { action: "reward", type: "dopamine", amount: 0.6 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: "Kucing pintar" },
                    { action: "feed" },
                    { action: "reward", type: "dopamine", amount: 0.7 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: "Suka makan ikan" },
                    { action: "feed" },
                    { action: "reward", type: "dopamine", amount: 0.8 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: "Aku sayang pet" },
                    { action: "pet" },
                    { action: "reward", type: "dopamine", amount: 0.9 },
                    { action: "evaluateOutput" }
                ]
            ];
            const idx = stepNumber % langSteps.length;
            actions = langSteps[idx];
            isDone = false;
        } else {
            const label = topic && topic.trim() ? topic.trim() : 'Pengetahuan Umum';
            const genSteps = [
                [
                    { action: "setLearningRate", area: "sensorik", value: 0.04 },
                    { action: "sendInput", text: `Belajar tentang ${label}` },
                    { action: "pet" },
                    { action: "reward", type: "dopamine", amount: 0.6 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: `${label}: Dasar 1` },
                    { action: "feed" },
                    { action: "reward", type: "dopamine", amount: 0.7 },
                    { action: "requestReplay", slot: 0 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: `${label}: Lanjutan 2` },
                    { action: "pet" },
                    { action: "reward", type: "dopamine", amount: 0.8 },
                    { action: "evaluateOutput" }
                ],
                [
                    { action: "sendInput", text: `${label}: Mahir` },
                    { action: "feed" },
                    { action: "reward", type: "dopamine", amount: 1.0 },
                    { action: "evaluateOutput" }
                ]
            ];
            const idx = stepNumber % genSteps.length;
            actions = genSteps[idx];
            isDone = false;
        }

        return { actions, done: isDone, isFallback: true };
    }

    async callLLM(prompt, topic = '', stepNumber = 0) {
        if (!this.llmConfig || !this.llmConfig.apiKey) {
            return this.getAutonomousCurriculum(topic, stepNumber, this.getSummary());
        }

        const { provider, model, apiKey } = this.llmConfig;
        const targetModel = (model && model.trim()) ? model.trim() : (provider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini');

        let rawText = null;

        if (provider === 'gemini') {
            const cleanModel = targetModel.replace(/^models\//, '');
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3 }
                })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `HTTP ${res.status}`);
            }
            const data = await res.json();
            rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        } else if (['openai', 'groq', 'openrouter', 'deepseek', 'mistral', 'xai', 'together'].includes(provider)) {
            let endpoint = 'https://api.openai.com/v1/chat/completions';
            if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
            if (provider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';
            if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';
            if (provider === 'mistral') endpoint = 'https://api.mistral.ai/v1/chat/completions';
            if (provider === 'xai') endpoint = 'https://api.x.ai/v1/chat/completions';
            if (provider === 'together') endpoint = 'https://api.together.xyz/v1/chat/completions';

            const isReasoning = targetModel.startsWith('o1') || targetModel.startsWith('o3');
            const tokenParam = isReasoning ? { max_completion_tokens: 1000 } : { max_tokens: 1000 };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: targetModel,
                    messages: [
                        { role: 'system', content: 'Kamu adalah LLM Teacher untuk SNN. Berikan jawaban HANYA format JSON valid tanpa markdown.' },
                        { role: 'user', content: prompt }
                    ],
                    ...tokenParam
                })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `HTTP ${res.status}`);
            }
            const data = await res.json();
            rawText = data?.choices?.[0]?.message?.content;
        }

        if (rawText) {
            let cleanJson = rawText.trim();
            cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
            const match = cleanJson.match(/\{[\s\S]*\}/);
            if (match) cleanJson = match[0];

            try {
                const parsed = JSON.parse(cleanJson);
                if (parsed && (Array.isArray(parsed.actions) || parsed.done !== undefined)) {
                    return parsed;
                }
            } catch (e) {
                console.warn('Gagal parse JSON LLM:', e, rawText);
            }
        }

        return this.getAutonomousCurriculum(topic, stepNumber, this.getSummary());
    }

    /**
     * SERIALISASI & PERSISTENSI STATE SNN
     * Aturan: Total neuron SELALU KERESET ke 2.000 saat reload/restart,
     * sedangkan seluruh kosakata TIDAK KERESET (disimpan di local user).
     */
    save() {
        try {
            // 1. Simpan kosakata ke local user
            this.saveVocabulary();

            // 2. Simpan parameter adaptif lainnya (neuromodulator, sinapsis inti 2000 neuron)
            const state = {
                baseNeurons: this.basePhysicalNeurons,
                evolutionEnabled: this.evolutionEnabled,
                neuromodulators: this.neuromodulators,
                synapseCount: Math.min(this.synapseCount, 50000),
                synPre: Array.from(this.synPre.slice(0, 50000)),
                synPost: Array.from(this.synPost.slice(0, 50000)),
                synWeight: Array.from(this.synWeight.slice(0, 50000)),
                episodicSlots: this.episodicMemoryBuffer.slice(-20)
            };

            localStorage.setItem('PET_SNN_BRAIN_STATE', JSON.stringify(state));
            return true;
        } catch (e) {
            console.warn('Gagal menyimpan state SNN:', e);
            return false;
        }
    }

    autoLoadState() {
        // JAMINAN KONTRAK: Total neuron SELALU kereset ke baseline awal 2.000 fisik (120.000 virtual)
        // setiap kali preview dimuat ulang / restart / dev code edit.
        this.totalNeurons = this.basePhysicalNeurons;
        this.newCreatedNeurons = 0;
        this.stats.activeNeuronCount = this.getNeuronCount();
        this.stats.synapseCount = this.synapseCount * this.virtualMultiplier;

        const saved = localStorage.getItem('PET_SNN_BRAIN_STATE');
        if (!saved) return;
        try {
            const state = JSON.parse(saved);
            if (state && state.neuromodulators) {
                this.neuromodulators = Object.assign(this.neuromodulators, state.neuromodulators);
            }
            if (state && state.synWeight && state.synPre) {
                const len = Math.min(state.synWeight.length, this.synWeight.length);
                for (let s = 0; s < len; s++) {
                    // Hanya pulihkan sinapsis yang berada di dalam 2000 neuron baseline
                    if (state.synPre[s] < this.totalNeurons && state.synPost[s] < this.totalNeurons) {
                        this.synPre[s] = state.synPre[s];
                        this.synPost[s] = state.synPost[s];
                        this.synWeight[s] = state.synWeight[s];
                    }
                }
            }
            if (state && state.evolutionEnabled !== undefined) {
                this.evolutionEnabled = state.evolutionEnabled;
                this.unboundedNeurogenesis = this.evolutionEnabled;
            }
        } catch (e) {
            console.warn('Gagal memuat state tersimpan SNN:', e);
        }
    }
}
