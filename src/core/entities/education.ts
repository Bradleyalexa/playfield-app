import { SportType } from "./session";

export interface SportGuide {
  sport: SportType;
  title: string;
  badge: string;
  overview: string;
  scoringRules: string[];
  courtPositions: {
    title: string;
    subtitle: string;
    description: string;
    tag: string;
  }[];
  tipsAndTricks: {
    title: string;
    category: "Teknik" | "Taktik" | "Etika";
    description: string;
  }[];
  etiquette: string[];
}

export const SPORT_GUIDES: Record<SportType, SportGuide> = {
  badminton: {
    sport: "badminton",
    title: "Badminton (Bulutangkis)",
    badge: "🏸 Terpopuler di GOR Indonesia",
    overview:
      "Badminton ganda menuntut kelincahan, refleks cepat, dan rotasi posisi yang kompak antara menyerang (depan-belakang) dan bertahan (kiri-kanan).",
    scoringRules: [
      "Standar BWF: Rally Point 21. Setiap kok mati menghasilkan 1 poin tanpa harus memegang servis.",
      "Deuce di 20-20: Pemenang harus unggul selisih 2 poin, dengan batasan maksimal di angka 30 poin (sudden death).",
      "Format Fast Match 30: Sangat lazim di mabar malam GOR Indonesia, bermain 1 game hingga 30 poin, tukar tempat saat salah satu mencapai 15 poin.",
      "Batas Servis Ganda: Lapangan lebar (garis luar samping aktif) namun pendek (garis belakang dalam aktif saat servis).",
    ],
    courtPositions: [
      {
        title: "Formasi Menyerang (Attacking)",
        subtitle: "Posisi Depan - Belakang",
        description:
          "Saat tim Anda melancarkan smash tajam atau drop shot, pemain depan bersiap menyergap kok di net (net kill), sementara pemain belakang mengontrol bola atas.",
        tag: "Offensive",
      },
      {
        title: "Formasi Bertahan (Defending)",
        subtitle: "Posisi Berdampingan Kiri - Kanan",
        description:
          "Saat terpaksa mengangkat kok tinggi (lob), segera mundur sejajar di tengah lapangan untuk menutup sudut smash lawan.",
        tag: "Defensive",
      },
    ],
    tipsAndTricks: [
      {
        title: "Hindari Pan Handle Grip",
        category: "Teknik",
        description:
          "Pegang raket dengan V-Grip (seperti bersalaman dengan pegangan raket). Jangan memegang seperti palu agar pergelangan tangan fleksibel menghasilkan cambukan smash.",
      },
      {
        title: "Split Step & Segera Kembali ke Base",
        category: "Taktik",
        description:
          "Jangan menonton kok terbang setelah Anda memukul. Segera ambil 1 langkah kembali ke posisi tengah siap siaga.",
      },
      {
        title: "Etika Mengembalikan Kok",
        category: "Etika",
        description:
          "Jika kok jatuh di area Anda, angkat dengan sopan menggunakan raket atau tangan lalu berikan langsung ke arah penyervis lawan, jangan disepak.",
      },
    ],
    etiquette: [
      "Jangan menyeberang melintasi belakang lapangan orang lain saat mereka sedang bertanding rally.",
      "Pemain yang merusak kok secara berlebihan wajib berinisiatif mengganti shuttlecock baru.",
      "Ucapkan terima kasih dan bersalaman dengan lawan serta partner setelah pertandingan selesai.",
    ],
  },

  tennis: {
    sport: "tennis",
    title: "Tennis Lapangan",
    badge: "🎾 Sport Klasik & Elegan",
    overview:
      "Tenis memadukan kekuatan fisik, stamina kaki, dan akurasi pukulan dengan sistem penilaian bersejarah (15-30-40).",
    scoringRules: [
      "Sistem Skor Unik: 0 (Love) → 15 → 30 → 40 → Game. Pemain harus memenangkan 6 game dengan selisih 2 untuk menang 1 set.",
      "Golden Point (No-Ad): Pada skor deuce 40-40, poin penentuan langsung dimainkan (penerima servis berhak memilih sisi servis). Ini sangat menghemat waktu mabar.",
      "Fast4 Tennis: Memenangkan 4 game untuk satu set. Pada 3-3 dimainkan tiebreak hingga 5 poin.",
      "Pro Set 8 Games: Siapa cepat mencapai 8 game dengan selisih 2 game (sangat ideal untuk sesi mabar 2 jam).",
    ],
    courtPositions: [
      {
        title: "Formasi Satu Depan, Satu Belakang",
        subtitle: "Net Player & Baseliner",
        description:
          "Pemain baseline bertugas menjaga rally panjang dari garis belakang, sedangkan pemain net mengincar volley silang (poach) mematikan.",
        tag: "Standard Doubles",
      },
      {
        title: "Formasi Australian / I-Formation",
        subtitle: "Variasi Servis Agresif",
        description:
          "Pemain net jongkok di tengah garis net untuk membingungkan arah return lawan sebelum melompat menutup sudut.",
        tag: "Advanced",
      },
    ],
    tipsAndTricks: [
      {
        title: "Split-Step Saat Kontak Lawan",
        category: "Teknik",
        description:
          "Lakukan loncatan kecil mendarat dengan ujung kaki tepat saat raket lawan menyentuh bola agar siap meluncur ke kiri atau kanan.",
      },
      {
        title: "Komunikasi 'Yours!' atau 'Mine!'",
        category: "Taktik",
        description:
          "Bola tengah sering memicu keraguan. Komunikasikan dengan tegas sejak bola melayang di udara.",
      },
      {
        title: "Panggil Out dengan Jujur",
        category: "Etika",
        description:
          "Pemain di sisi bola yang berhak memutuskan bola masuk atau keluar. Jika ragu, berikan poin keuntungan untuk lawan.",
      },
    ],
    etiquette: [
      "Tunggu pemain menyelesaikan rally sebelum mengambil bola yang menggelinding ke lapangan tetangga.",
      "Jangan melakukan servis sebelum receiver berada dalam posisi siap.",
    ],
  },

  padel: {
    sport: "padel",
    title: "Padel Tennis",
    badge: "🏓 Viral, Sosial & Sangat Seru",
    overview:
      "Olahraga raket paling dinamis di dalam kurungan kaca. Kunci kemenangan padel bukanlah kekuatan smash, melainkan kesabaran memanfaatkan pantulan dinding kaca.",
    scoringRules: [
      "Format Americano: Setiap ronde pasangan diacak. Skor dimainkan hingga total poin tetap (24 atau 32 poin, misal 18-14). Poin individu diakumulasikan ke klasemen.",
      "Format Mexicano: Pasangan disusun berdasarkan peringkat klasemen sementara agar pertandingan semakin seimbang dan kompetitif.",
      "Servis Underhand: Bola wajib dipantulkan ke lantai 1 kali terlebih dahulu sebelum dipukul di bawah ketinggian pinggang.",
      "Aturan Dinding Kaca: Bola lawan harus memantul di lantai lapangan Anda 1 kali sebelum boleh mengenai dinding kaca atau kawat.",
    ],
    courtPositions: [
      {
        title: "Kuasai Posisi Net (Attacking Zone)",
        subtitle: "Zona Poin Terbesar di Padel",
        description:
          "Di padel, tim yang menguasai net memiliki peluang menang 80%. Jangan bertahan di belakang jika lawan terpaksa melakukan lob pendek.",
        tag: "Net Domination",
      },
      {
        title: "Transisi Kaca Belakang (Defending Zone)",
        subtitle: "Berdampingan di Garis Servis",
        description:
          "Saat lawan merebut net, mundur bersama partner ke belakang garis servis dan gunakan pantulan kaca belakang untuk melancarkan lobs tinggi.",
        tag: "Glass Defense",
      },
    ],
    tipsAndTricks: [
      {
        title: "Jadikan Kaca Sahabat Anda",
        category: "Taktik",
        description:
          "Jangan panik saat bola meluncur kencang melewati badan Anda. Biarkan bola memantul dari kaca belakang terlebih dahulu agar kecepatannya melambat dan mudah dikontrol.",
      },
      {
        title: "Kuasai Pukulan Bandeja",
        category: "Teknik",
        description:
          "Pukulan overhead defensif dengan raket datar seperti nampan agar bola tidak melambung liar keluar lapangan kaca.",
      },
      {
        title: "Gunakan Lobs untuk Membalikkan Keadaan",
        category: "Taktik",
        description:
          "Lob tinggi ke sudut belakang adalah senjata paling ampuh di padel untuk memaksa lawan melepas posisi net mereka.",
      },
    ],
    etiquette: [
      "Selalu gunakan tali pengaman raket (wrist strap) di pergelangan tangan demi keselamatan partner dan lawan.",
      "Jangan membenturkan raket ke dinding kaca saat mengejar bola.",
    ],
  },

  table_tennis: {
    sport: "table_tennis",
    title: "Tenis Meja (Ping Pong)",
    badge: "🏓 Cepat, Refleks Kilat & Merakyat",
    overview:
      "Tenis meja memadukan refleks super cepat, variasi spin bola yang tajam (topspin, backspin, sidespin), dan penempatan bola akurat di atas meja 2,74 m x 1,525 m.",
    scoringRules: [
      "Standar ITTF: Game dimainkan hingga 11 poin dengan sistem rally point. Pemenang wajib unggul selisih minimal 2 poin.",
      "Rotasi Servis 2 Poin: Servis berganti pemegang setiap 2 poin. Pada deuce (10-10), servis berganti setiap 1 poin.",
      "Aturan Servis Ganda: Servis wajib memantul menyilang dari kotak kanan server menuju kotak kanan receiver.",
      "Format Klasik 21 Poin: Sistem tradisional komunitas di mana game dimainkan sampai 21 poin dan servis berganti tiap 5 poin.",
    ],
    courtPositions: [
      {
        title: "Rotasi Pukulan Ganda Tenis Meja",
        subtitle: "Pukulan Wajib Bergantian Antar Partner",
        description:
          "Dalam nomor ganda, pemain harus memukul secara bergantian (A1 → B1 → A2 → B2). Pemain harus segera bergerak menyamping memberi ruang bagi partnernya.",
        tag: "Doubles Rotation",
      },
      {
        title: "Posisi Siap (Ready Stance)",
        subtitle: "Pusat Keseimbangan Rendah",
        description:
          "Badan condong ke depan, lutut ditekuk rileks, dan bat selalu berada di depan dada agar siap mengantisipasi bola smash maupun chop cepat.",
        tag: "Fundamental",
      },
    ],
    tipsAndTricks: [
      {
        title: "Kuasai Brush Contact untuk Spin",
        category: "Teknik",
        description:
          "Gesek bola dengan permukaan karet bat saat puncak pantulan untuk menghasilkan topspin tajam yang menukik deras ke meja lawan.",
      },
      {
        title: "Eksploitasi Sisi Backhand Lawan",
        category: "Taktik",
        description:
          "Sebagian besar pemain komunitas lebih rentan terhadap dorongan backhand. Gunakan servis pendek berputar untuk memancing bola tanggung.",
      },
      {
        title: "Etika Bola Pinggiran (Edge & Net Ball)",
        category: "Etika",
        description:
          "Jika bola Anda mengenai ujung meja (edge) atau bibir net lalu masuk secara beruntung, angkat tangan sebagai gestur meminta maaf secara sopan.",
      },
    ],
    etiquette: [
      "Jangan menyentuh permukaan meja dengan tangan yang tidak memegang bat saat reli sedang berlangsung.",
      "Kembalikan bola dengan menggelindingkannya di atas meja ke arah penyervis, jangan dilempar sembarangan.",
    ],
  },

  pickleball: {
    sport: "pickleball",
    title: "Pickleball",
    badge: "🥒 Tren Olahraga Raket Terhangat Dunia",
    overview:
      "Perpaduan seru antara tenis, bulutangkis, dan pingpong yang dimainkan di lapangan seukuran bulutangkis dengan paddle solid dan bola berlubang (wiffle ball).",
    scoringRules: [
      "Standar Side-Out Scoring (11 Poin): Hanya tim yang memegang servis yang dapat mencetak poin. Target 11 poin dengan selisih 2 poin.",
      "Modern Rally Scoring (15 / 21 Poin): Setiap reli menghasilkan poin untuk mempercepat pertandingan dan efisiensi waktu sewa lapangan.",
      "Zona Non-Volley (The Kitchen): Dilarang memukul bola secara langsung di udara (volley) saat kaki menyentuh atau berada di dalam area 2,13 m dari net.",
      "Two-Bounce Rule: Servis harus memantul satu kali sebelum di-return, dan bola return juga harus memantul satu kali sebelum tim penyervis boleh memukulnya.",
    ],
    courtPositions: [
      {
        title: "Formasi Kitchen Line (Dink Battle)",
        subtitle: "Zona Utama Perebutan Poin",
        description:
          "Setelah two-bounce rule terpenuhi, kedua pemain harus maju merapatkan posisi ke garis Kitchen untuk memulai adu dink sabar.",
        tag: "Kitchen Control",
      },
      {
        title: "Third Shot Drop (Transisi)",
        subtitle: "Kunci Emas Menuju Net",
        description:
          "Pukulan ketiga yang dilambungkan halus dari baseline agar jatuh mati di area Kitchen lawan, memberi waktu tim Anda maju ke net.",
        tag: "Strategy",
      },
    ],
    tipsAndTricks: [
      {
        title: "The Dink Shot: Pukulan Sabar",
        category: "Teknik",
        description:
          "Pukul bola lembut dengan ayunan bahu (tanpa pergelangan tangan) agar bola jatuh persis di dalam Kitchen lawan tanpa melambung tinggi.",
      },
      {
        title: "Sabar Sebelum Speed-Up",
        category: "Taktik",
        description:
          "Jangan terburu-buru melakukan smash keras dari bola rendah di bawah net. Tunggu sampai bola lawan melambung tanggung untuk melakukan serangan mendadak.",
      },
      {
        title: "Umumkan Skor Lengkap Sebelum Servis",
        category: "Etika",
        description:
          "Server wajib menyebutkan 3 angka skor (Skor Tim Servis - Skor Tim Receiver - Server 1 atau 2) secara lantang sebelum mengayunkan servis.",
      },
    ],
    etiquette: [
      "Hargai zona Kitchen: akui kesalahan dengan sportif jika kaki Anda menyentuh garis Kitchen saat melakukan volley.",
      "Gunakan bola indoor untuk lapangan kayu/vinyl dan bola outdoor berlubang 40 untuk lapangan semen/aspal.",
    ],
  },

  squash: {
    sport: "squash",
    title: "Squash (Tenis Dinding)",
    badge: "💥 Olahraga Paling Menguras Kalori",
    overview:
      "Olahraga raket berdinding empat yang menuntut daya tahan aerobik luar biasa, kecepatan reaksi kilat, dan taktik cerdas menguasai titik T (T-Position).",
    scoringRules: [
      "Standar WSF (PAR-11): Point-A-Rally sampai 11 poin. Setiap reli menghasilkan poin. Pada skor 10-10, dibutuhkan keunggulan selisih 2 poin untuk menang.",
      "Batas Dinding: Bola harus mengenai dinding depan di atas garis 'Tin' (setinggi 48 cm dari lantai) dan di bawah garis batas 'Out' atas.",
      "Satu Pantulan Lantai: Bola boleh mengenai dinding samping atau belakang berkali-kali, asalkan hanya memantul 1 kali di lantai sebelum dipukul.",
      "Let vs Stroke: Jika pergerakan atau ayunan raket terhalang lawan, mintalah 'Let' (reli diulang) atau dapatkan 'Stroke' (poin langsung jika terhalang jalur bola ke dinding depan).",
    ],
    courtPositions: [
      {
        title: "Kuasai Titik T (T-Position)",
        subtitle: "Pusat Kendali Lapangan",
        description:
          "Titik persimpangan garis tengah lapangan adalah pusat kontrol. Setelah memukul bola, segera bergerak kembali ke T untuk menjangkau seluruh 4 sudut lapangan.",
        tag: "T-Domination",
      },
      {
        title: "Defending from the Back Corners",
        subtitle: "Manfaatkan Pantulan Dinding Belakang",
        description:
          "Jika terdesak ke pojok belakang, gunakan pukulan lob tinggi ke dinding depan atau pantulan sudut (boast) untuk membeli waktu kembali ke T.",
        tag: "Defense",
      },
    ],
    tipsAndTricks: [
      {
        title: "Pukulan Straight Drive (The Rail)",
        category: "Teknik",
        description:
          "Pukul bola menempel rapat di sepanjang dinding samping menuju sudut belakang (nick) agar lawan kesulitan mengayunkan raket.",
      },
      {
        title: "Drop Shot Halus di Depan",
        category: "Taktik",
        description:
          "Saat lawan terjebak jauh di belakang, lepaskan drop shot lembut persis di atas garis Tin dinding depan untuk mematikan langkah lawan.",
      },
      {
        title: "Keselamatan Nomor Satu (Safety First)",
        category: "Etika",
        description:
          "Jangan pernah memaksakan pukulan jika raket Anda berisiko mengenai badan lawan. Selalu tahan ayunan dan minta 'Let'.",
      },
    ],
    etiquette: [
      "Wajib mengenakan kacamata pelindung mata (protective eyewear) selama berada di dalam lapangan squash.",
      "Gunakan sepatu bersol karet non-marking agar tidak meninggalkan bekas hitam di lantai kayu parket.",
    ],
  },
};
