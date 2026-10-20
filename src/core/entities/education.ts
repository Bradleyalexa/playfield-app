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
};
