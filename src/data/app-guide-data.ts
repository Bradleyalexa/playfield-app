export interface GuideStep {
  step: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  tips: string;
  iconName: string;
}

export interface FaqItem {
  id: string;
  category: "umum" | "matchmaking" | "lapangan" | "patungan";
  categoryLabel: string;
  question: string;
  answer: string;
  highlight?: string;
  tags: string[];
}

export const CARA_PAKAI_STEPS: GuideStep[] = [
  {
    step: 1,
    badge: "Langkah 1 • Setup Sesi",
    badgeColor: "bg-[#ccff00] text-black",
    title: "Buat Sesi Mabar Baru (Hanya 30 Detik)",
    subtitle: "Atur cabor, durasi jam sewa GOR, dan model patungan biaya",
    description:
      "Mulai dengan memilih cabang olahraga mabar Anda: Badminton, Tennis Lapangan, Padel, Tenis Meja (Pingpong), Pickleball, atau Squash. Tentukan jam mulai, durasi sewa, dan jumlah lapangan/meja yang disewa di GOR/club.",
    features: [
      "Prediksi Cerdas: Sistem otomatis menghitung estimasi jumlah ronde dan total match yang optimal sesuai durasi sewa.",
      "Pilihan Model Biaya: Pilih Bagi Rata Per Orang (Fixed), Hitung Shuttlecock/Bola Terpakai, atau Bebas Biaya (Gratis).",
      "Info Lokasi: Masukkan nama GOR dan link Google Maps agar pemain yang belum tahu tempat bisa langsung navigasi.",
    ],
    tips: "💡 Tips: Anda bisa mencoba fitur ini secara instan lewat tombol 'Coba Demo Langsung' di halaman utama.",
    iconName: "Sliders",
  },
  {
    step: 2,
    badge: "Langkah 2 • Input Pemain",
    badgeColor: "bg-[#7dd3fc] text-black",
    title: "Copas List dari WhatsApp (Smart Parser)",
    subtitle: "Tinggalkan input manual satu per satu, biarkan AI yang merapikan",
    description:
      "Cukup copy teks daftar absen dari grup WhatsApp Anda, lalu klik tombol 'Paste dari WhatsApp'. Smart Parser Playfield otomatis membaca nama, gender, dan level keahlian.",
    features: [
      "Deteksi Gender Otomatis: Mengenali tanda (M/W, Pria/Wanita, Cowok/Cewek) untuk menyusun komposisi seimbang.",
      "Standar 5 Level Skill: Otomatis membagi pemain ke Newbie, Beginner, Intermediate, Advanced, atau Pro.",
      "Status Hadir vs OTW: Tandai siapa yang sudah tiba di GOR vs yang masih di jalan. Pemain OTW otomatis ditahan dari rotasi hingga mereka tiba.",
    ],
    tips: "💡 Tips: Anda tetap bisa menambah, mengedit, atau menghapus nama pemain kapan saja selama mabar berlangsung.",
    iconName: "ClipboardCheck",
  },
  {
    step: 3,
    badge: "Langkah 3 • Pilih Algoritma",
    badgeColor: "bg-[#d946ef] text-white",
    title: "Pilih Algoritma Matchmaking Sesuai Vibe Komunitas",
    subtitle: "Keadilan jatah main, gender seimbang, atau adu skill kompetitif",
    description:
      "Playfield menyediakan berbagai algoritma rotasi cerdas yang dirancang khusus untuk berbagai kebutuhan mabar komunitas:",
    features: [
      "Playfield's Mix (Utama): All-in-one cerdas yang memastikan jatah main rata, gender seimbang, dan level anti-jomplang tanpa perlu repot.",
      "Hybrid 2+2 (Favorit): Game 1–2 baurkan level (Mix Level) untuk pemanasan ramah, Game 3–4 duel selevel (Advanced vs Advanced, Beginner vs Beginner) untuk adu skill maksimal.",
      "Giliran Main Rata: Prioritas 100% untuk siapa yang main paling sedikit dan paling lama duduk istirahat.",
      "Ganda Campuran: Format murni XD vs XD (1 Pria + 1 Wanita per kubu) agar pemain wanita bertanding dengan nyaman.",
      "Seimbang Level: Mengunci total level skill tim tetap berimbang agar tensi reli tetap seru dan serbaguna.",
      "Raja Lapangan & Americano: Mode turnamen kompetitif di mana pemenang mempertahankan tahta atau mengumpulkan poin individu.",
    ],
    tips: "💡 Tips: Host bisa mengganti algoritma di tengah jalan atau menggunakan mode Custom Manual jika ada request pasangan khusus.",
    iconName: "Cpu",
  },
  {
    step: 4,
    badge: "Langkah 4 • Jalankan Ronde",
    badgeColor: "bg-[#00e5ff] text-black",
    title: "Jalankan Pertandingan & Rotasi Lapangan",
    subtitle: "Selesai match tinggal 1 klik, tanpa diwajibkan mencatat skor",
    description:
      "Ketika ronde dimulai, pemain yang dipanggil langsung menuju lapangan masing-masing. Host dapat memantau jalannya laga dengan kontrol super fleksibel.",
    features: [
      "Bebas Repot Catat Skor: Jika host malas catat angka, cukup tekan 'Selesai & Rotasi Lapangan'. Sistem langsung mengundi ronde berikutnya.",
      "Input Skor Praktis: Jika ingin mencatat skor, tombol angka besar memudahkan penonton atau host menginput poin.",
      "Substitusi / Ganti Pemain Instan: Jika ada pemain yang kram atau kelelahan mendadak, klik icon tukar di lapangan dan pilih cadangan yang selevel dalam 1 detik.",
      "Panggilan Suara Otomatis: Hubungkan HP/laptop ke speaker Bluetooth GOR untuk mengumumkan partai lapangan tiap ronde baru.",
    ],
    tips: "💡 Tips: Aktifkan opsi 'Izinkan Penonton Update Skor' agar peserta di pinggir lapangan bisa mencatat skor mereka sendiri.",
    iconName: "PlayCircle",
  },
  {
    step: 5,
    badge: "Langkah 5 • TV & Live QR",
    badgeColor: "bg-[#ffde00] text-black",
    title: "Tampilkan Kiosk TV GOR & Papan Penonton via QR",
    subtitle: "Peserta scan QR dari HP masing-masing tanpa perlu install aplikasi",
    description:
      "Hilangkan drama peserta yang bolak-balik bertanya 'Habis ini giliran siapa, Kak?'. Jadwal dan skor live bisa diakses semua orang dari layar mana saja.",
    features: [
      "TV Kiosk Mode (/kiosk): Buka di Smart TV GOR atau tablet iPad. Desain kartu besar dan font kontras tinggi mudah dibaca dari kejauhan.",
      "Papan Penonton (/live): Peserta tinggal scan QR Code di meja host untuk membuka jadwal langsung di HP mereka.",
      "Player Schedule Finder: Peserta bisa mengetik nama mereka di HP untuk melihat jadwal lapangan ronde depan dan riwayat poin.",
    ],
    tips: "💡 Tips: Taruh iPad atau tablet di meja registrasi GOR agar peserta bisa scan QR Code saat check-in.",
    iconName: "Tv",
  },
  {
    step: 6,
    badge: "Langkah 6 • Rekap & Patungan",
    badgeColor: "bg-[#ff5500] text-white",
    title: "Kelar Mabar: Rekap WA Otomatis & Story Card",
    subtitle: "Hitungan patungan anti-boncos dan piala digital siap dibagikan",
    description:
      "Begitu sesi mabar selesai, Playfield secara instan merekap semua statistik dan tagihan biaya tanpa perlu host menghitung manual di kalkulator.",
    features: [
      "Salin Teks WhatsApp 1-Klik: Format rapi memuat podium juara, ringkasan match, detail shuttlecock terpakai, dan nomor rekening/e-wallet host.",
      "Hitungan Patungan Akurat: Biaya sewa lapangan + bola otomatis dibagi rata sesuai jumlah pemain aktif.",
      "Story Card Estetis (1080x1920): Unduh gambar kartu profil pemain bergaya Neo-Brutalist untuk diupload ke Instagram Story & status WhatsApp.",
    ],
    tips: "💡 Tips: Bagikan teks rekap ke grup WhatsApp tepat setelah sesi mabar selesai agar pemain langsung transfer patungan.",
    iconName: "Share2",
  },
];

export const FAQ_CATEGORIES = [
  { id: "all", label: "Semua Pertanyaan" },
  { id: "umum", label: "Umum & Akses" },
  { id: "matchmaking", label: "Matchmaking & Level" },
  { id: "lapangan", label: "Operasional Lapangan" },
  { id: "patungan", label: "Patungan & Biaya" },
] as const;

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    category: "umum",
    categoryLabel: "Umum & Akses",
    question: "Apakah peserta mabar harus download aplikasi atau membuat akun?",
    answer:
      "Sama sekali tidak perlu! Playfield dirancang 100% berbasis Web (PWA). Peserta mabar hanya perlu melakukan scan QR Code di meja host atau mengklik link yang dibagikan di grup WhatsApp. Halaman jadwal dan live score langsung terbuka di browser HP mereka tanpa perlu registrasi, login, ataupun download apapun dari app store.",
    highlight: "100% Tanpa Login & Tanpa Install Aplikasi",
    tags: ["Akses", "QR Code", "Tanpa Akun", "Mobile"],
  },
  {
    id: "faq-2",
    category: "umum",
    categoryLabel: "Umum & Akses",
    question: "Apakah Playfield gratis digunakan untuk mabar komunitas?",
    answer:
      "Ya, Playfield 100% GRATIS dan bebas digunakan kapan saja oleh komunitas olahraga di seluruh Indonesia. Tidak ada batasan jumlah lapangan, batasan jumlah peserta, maupun batasan durasi mabar.",
    highlight: "Gratis 100% Tanpa Biaya Tersembunyi",
    tags: ["Gratis", "Komunitas", "Fitur"],
  },
  {
    id: "faq-3",
    category: "umum",
    categoryLabel: "Umum & Akses",
    question: "Di mana data sesi mabar saya disimpan? Apakah aman jika browser tertutup?",
    answer:
      "Sangat aman. Seluruh data sesi mabar Anda disimpan secara otomatis dan persisten di memori browser lokal (LocalStorage) serta tersinkronisasi realtime ke cloud backend Playfield. Jika baterai HP host habis, halaman ter-refresh, atau browser tertutup tanpa sengaja, sesi Anda akan langsung melanjutkan kondisi terakhir begitu dibuka kembali.",
    highlight: "Auto-Save Persisten & Cloud Sync Realtime",
    tags: ["Penyimpanan", "Data", "Offline", "Aman"],
  },
  {
    id: "faq-4",
    category: "matchmaking",
    categoryLabel: "Matchmaking & Level",
    question: "Bagaimana cara kerja Smart WhatsApp List Parser?",
    answer:
      "Anda cukup menyalin (copy) daftar peserta dari pesan teks di grup WhatsApp mabar Anda, lalu menempelkannya (paste) ke modal import Playfield. Algoritma cerdas Playfield otomatis membersihkan nomor urut (1., 2.), membuang embel-embel teks (seperti 'lunas', 'tamu', 'transfer'), serta mendeteksi jenis kelamin (M/W) dan level skill secara instan.",
    highlight: "Copas WhatsApp Langsung Jadi Roster Lengkap",
    tags: ["WhatsApp", "Parser", "Input Otomatis"],
  },
  {
    id: "faq-5",
    category: "matchmaking",
    categoryLabel: "Matchmaking & Level",
    question: "Bagaimana Playfield memastikan jatah bermain semua orang adil?",
    answer:
      "Setiap kali ronde selesai dan ronde berikutnya dibuat, algoritma Playfield menghitung dua faktor utama secara simultan: total match yang telah dimainkan dan durasi waktu istirahat di bangku cadangan. Pemain yang paling sedikit bermain dan paling lama duduk istirahat selalu ditempatkan pada prioritas teratas untuk masuk lapangan berikutnya.",
    highlight: "Anti Dianaktirikan di Bangku Cadangan",
    tags: ["Fair Play", "Giliran Main", "Antrean"],
  },
  {
    id: "faq-6",
    category: "matchmaking",
    categoryLabel: "Matchmaking & Level",
    question: "Bagaimana standardisasi level skill yang digunakan di Playfield?",
    answer:
      "Playfield membagi level pemain ke dalam 5 tingkatan skill yang diadaptasi dari standar komunitas badminton Indonesia:\n\n1. Newbie (Level 1): Pemain baru pertama kali main/pegang raket, latihan servis aman dan pengenalan dasar.\n2. Beginner (Level 2): Pemula yang sudah paham aturan main, reli dasar teratur, dan servis aman.\n3. Intermediate (Level 3): Pemain level menengah, reli konsisten, drive aktif, dan rotasi teratur.\n4. Advanced (Level 4): Pemain mahir, smash tajam, defense rapat, footwork rapi, dan taktik matang.\n5. Pro (Level 5): Atlet / semi-pro / master berkecepatan tinggi, fisik prima, dan akurasi turnamen.\n\nSistem matchmaking menyeimbangkan total skor keahlian antartim agar pertandingan berjalan sengit tanpa ada pembantaian skor sepihak.",
    highlight: "Standar 5 Tingkat: Newbie, Beginner, Intermediate, Advanced, & Pro",
    tags: ["Level Skill", "Newbie", "Beginner", "Intermediate", "Advanced", "Pro"],
  },
  {
    id: "faq-7",
    category: "matchmaking",
    categoryLabel: "Matchmaking & Level",
    question: "Apa itu Algoritma Hybrid 2+2 dan kapan sebaiknya digunakan?",
    answer:
      "Hybrid 2+2 adalah format mabar terfavorit di mana 2 game awal otomatis disusun Mix Level (Pro/Advanced + Newbie/Beginner vs Pasangan Intermediate) untuk pemanasan ramah dan membaurkan suasana. Kemudian pada game 3 dan 4, sistem otomatis beralih ke Level Sama (Pro/Advanced vs Pro/Advanced, Beginner/Newbie vs Beginner/Newbie) agar pemain bisa adu skill maksimal dengan lawan selevel.",
    highlight: "Pemanasan Membaur di Awal, Adu Skill Kompetitif di Akhir",
    tags: ["Hybrid 2+2", "Algoritma", "Mix Level", "Level Sama"],
  },
  {
    id: "faq-8",
    category: "lapangan",
    categoryLabel: "Operasional Lapangan",
    question: "Gimana kalau ada pemain yang telat datang atau masih OTW ke GOR?",
    answer:
      "Di daftar Roster pemain, host cukup menekan tombol toggle 'OTW' pada pemain yang bersangkutan. Sistem tidak akan memasukkan pemain berstatus OTW ke dalam rotasi lapangan agar lapangan tidak terbengkalai menunggu orang. Begitu pemain tersebut tiba di GOR, klik tombol 'Hadir' dan pemain langsung aktif masuk ke antrean ronde berikutnya.",
    highlight: "Anti Lapangan Nganggur Menunggu Pemain Telat",
    tags: ["OTW", "Kehadiran", "Check-in", "Operasional"],
  },
  {
    id: "faq-9",
    category: "lapangan",
    categoryLabel: "Operasional Lapangan",
    question: "Gimana jika ada pemain yang kram, cedera, atau kelelahan mendadak di tengah game?",
    answer:
      "Pada kartu lapangan yang sedang bermain, klik tombol icon 'Ganti Pemain (Substitusi)' di samping nama pemain yang cedera. Sistem secara otomatis merekomendasikan kandidat pengganti terbaik dari bangku cadangan dengan level skill dan gender yang setara. Cukup 1 klik, pemain langsung tertukar tanpa merusak jadwal pertandingan lapangan lain.",
    highlight: "Ganti Pemain Instan 1-Detik Tanpa Rusak Jadwal",
    tags: ["Substitusi", "Cedera", "Tukar Pemain", "Emergency"],
  },
  {
    id: "faq-10",
    category: "lapangan",
    categoryLabel: "Operasional Lapangan",
    question: "Apakah host diwajibkan menginput skor tiap kali pertandingan selesai?",
    answer:
      "Tidak diwajibkan sama sekali! Jika host sedang sibuk atau mabar bersifat kasual santai, host cukup menekan tombol 'Selesai & Rotasi Lapangan'. Sistem tetap mencatat bahwa pemain telah menyelesaikan pertandingan dan langsung memutar antrean. Jika ingin mencatat angka skor untuk rekap juara, input angka skor tersedia dengan tombol yang sangat mudah.",
    highlight: "Bebas Repot: Bisa Pakai Skor atau Langsung Rotasi",
    tags: ["Skor", "Rotasi", "Fleksibel", "Host"],
  },
  {
    id: "faq-11",
    category: "lapangan",
    categoryLabel: "Operasional Lapangan",
    question: "Bagaimana cara menghubungkan pengumuman panggilan ke Speaker Bluetooth GOR?",
    answer:
      "Dashboard Host Playfield dilengkapi dengan fitur Voice Announcement (Text-to-Speech) otomatis berbahasa Indonesia. Cukup sambungkan HP atau laptop host ke speaker Bluetooth GOR. Setiap kali ronde baru dibuat, suara asisten Playfield akan otomatis memanggil nama-nama pemain dan nomor lapangan mereka.",
    highlight: "Asisten Suara Otomatis Panggil Pemain ke Lapangan",
    tags: ["Speaker", "Bluetooth", "Voice", "Audio GOR"],
  },
  {
    id: "faq-12",
    category: "patungan",
    categoryLabel: "Patungan & Biaya",
    question: "Bagaimana cara kerja hitungan patungan (Split Bill) sewa dan shuttlecock/bola?",
    answer:
      "Saat membuat sesi, pilih model biaya 'Track Equipment'. Masukkan harga sewa lapangan dan harga shuttlecock/bola (bisa per biji atau per slop). Saat mabar berlangsung, host cukup menekan tombol '+1 Cock' setiap kali membuka bola baru. Di akhir sesi mabar, sistem secara otomatis menghitung total biaya sewa + bola dan membaginya rata ke seluruh peserta aktif.",
    highlight: "Hitungan Patungan Transparan & Anti Boncos",
    tags: ["Split Bill", "Shuttlecock", "Bola", "Keuangan"],
  },
  {
    id: "faq-13",
    category: "patungan",
    categoryLabel: "Patungan & Biaya",
    question: "Apakah ada format teks rekap siap kirim ke WhatsApp?",
    answer:
      "Ya! Cukup klik tombol 'Rekap Mabar' di dashboard Host, lalu pilih 'Salin Format WA'. Teks rekap rapi yang memuat salam pembuka, podium juara mabar, ringkasan match yang dimainkan, rincian biaya lapangan dan bola, serta info nomor rekening/e-wallet host langsung tersalin dan siap di-paste ke grup WhatsApp.",
    highlight: "1-Klik Salin Teks Rekap Rapi Lengkap",
    tags: ["Rekap WA", "WhatsApp", "Podium", "Transfer"],
  },
  {
    id: "faq-14",
    category: "patungan",
    categoryLabel: "Patungan & Biaya",
    question: "Apa itu Story Card dan bagaimana cara mengunduhnya?",
    answer:
      "Story Card adalah kartu visual infografis profil pemain beresolusi tinggi (rasio 9:16 / 1080x1920) dengan desain Neo-Brutalist Playfield yang keren. Kartu ini menampilkan statistik pertandingan individu, rasio kemenangan, gelar julukan mabar, dan partner duet terbaik. Host maupun pemain dapat mengunduhnya dengan menekan tombol 'Story Card' di samping nama pemain.",
    highlight: "Visual Story Card Keren untuk Instagram & WhatsApp",
    tags: ["Story Card", "Instagram", "Status WA", "Share"],
  },
];
