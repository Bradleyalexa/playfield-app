"use client";

import { useState } from "react";
import { X, BookOpen, CheckCircle2, Zap, Users, Trophy, Flame, HelpCircle, ArrowRight } from "lucide-react";
import { ALGORITHM_REGISTRY, MatchmakingAlgorithm } from "../../core/entities/session";

interface AlgorithmExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAlgorithm?: MatchmakingAlgorithm;
  onSelectAlgorithm?: (algo: MatchmakingAlgorithm) => void;
}

interface DetailedAlgoInfo {
  id: MatchmakingAlgorithm;
  formula: string;
  howItWorks: string[];
  exampleScenario: string;
  advantages: string[];
}

const DETAILED_ALGO_DOCS: Record<MatchmakingAlgorithm, DetailedAlgoInfo> = {
  playfields_mix: {
    id: "playfields_mix",
    formula: "Pemerataan Giliran Main + Gender Seimbang + Skill Anti-Jomplang (All-in-One)",
    howItWorks: [
      "Prioritas Antrean Adil: Pemain yang paling sedikit bermain dan paling lama duduk istirahat otomatis dipanggil ke lapangan lebih dulu.",
      "Distribusi Gender Pintar: Jika ada pemain pria (M) dan wanita (W), sistem otomatis menyusun komposisi seimbang (XD vs XD atau didampingi pasangan yang tepat).",
      "Keseimbangan Level Otomatis: Menyandingkan pemain level atas dengan pemula melawan pasangan level menengah agar pertandingan sengit dan reli tetap hidup.",
      "100% Bebas Repot: Host tidak diwajibkan menginput angka skor sama sekali! Selesai match tinggal klik 1 tombol dan rotasi langsung berjalan mulus."
    ],
    exampleScenario:
      "Dalam sesi mabar campuran dengan pemain berbagai level, sistem secara otomatis memastikan semua peserta mendapatkan jumlah bermain yang sama rata, tidak ada partai yang berat sebelah, dan cewek maupun cowok bertanding secara nyaman tanpa drama.",
    advantages: [
      "Algoritma paling lengkap dan direkomendasikan untuk 95% mabar komunitas.",
      "Host tidak perlu pusing memilih algoritma yang mana; semua formula terbaik sudah digabung jadi satu.",
      "Ramah host: pertandingan bisa diselesaikan seketika tanpa perlu mencatat skor."
    ],
  },
  hybrid_2plus2: {
    id: "hybrid_2plus2",
    formula: "Game 1–2: Mix Level (Baurkan) ➜ Game 3–4: Level Sama (Adu Skill Kasta)",
    howItWorks: [
      "Fase 1 (Game 1 & 2 - Mix Level): Sistem otomatis menyusun pasangan silang tier (Suhu + Pemula vs 2 Menengah). Tujuannya untuk mencairkan suasana, pemanasan seimbang, membimbing pemula, dan reli tetap hidup.",
      "Fase 2 (Game 3 & 4 - Level Sama): Sistem otomatis mengelompokkan lapangan berdasarkan kasta skill. Lapangan 1 khusus partai Suhu vs Suhu (reli kencang adu skill), Lapangan 2 khusus partai Menengah/Pemula sesamanya agar main lepas tanpa canggung.",
      "Rotasi Berkelanjutan: Jika sesi mabar berlanjut melebihi 4 ronde (ronde 5, 6, dst.), sistem mengulang siklus 2 Mix + 2 Level Sama secara dinamis.",
      "Jatah Main Adil: Tetap memprioritaskan antrean pemain yang paling sedikit main dan paling lama istirahat agar waktu sewa dinikmati rata."
    ],
    exampleScenario:
      "Di 2 game awal, mantan atlet dipasangkan dengan pemain pemula untuk pemanasan ramah. Begitu stamina panas di game 3 dan 4, 4 pemain Suhu langsung dipertemukan di Lapangan 1 untuk duel sengit, sementara 4 Pemula bermain di Lapangan 2 dengan percaya diri.",
    advantages: [
      "Format mabar paling ideal: membaur di awal, adu skill kompetitif di akhir.",
      "Pemain pemula senang karena sempat dibimbing suhu, lalu bisa main lepas sesama pemula.",
      "Pemain berpengalaman puas karena mendapatkan jatah partai keras sesama pemain selevel.",
      "100% otomatis: host tidak perlu repot mengganti algoritma atau kocok manual di tengah sesi."
    ],
  },
  fair_playtime: {
    id: "fair_playtime",
    formula: "Main Paling Sedikit + Duduk Paling Lama = Masuk Lapangan Duluan",
    howItWorks: [
      "Pemain dengan total main (games played) paling sedikit berada di prioritas teratas antrean agar semua pemain dapat jatah bermain yang rata.",
      "Jika ada beberapa pemain dengan games played sama, pemain yang paling lama duduk istirahat didahulukan masuk lapangan.",
      "4 pemain terpilih diurutkan dari skill tertinggi ke terendah [Suhu, Hore, Hore, Kentang]. Sistem memasangkan Suhu + Kentang melawan 2 pemain Hore agar kekuatan tim berimbang.",
      "Pemain pria (M) dan wanita (W) tetap berpeluang main bersama secara alami jika gilirannya tiba."
    ],
    exampleScenario:
      "Ada 10 pemain di 2 lapangan (8 main, 2 istirahat). Pada ronde berikutnya, 2 orang yang sedang istirahat dijamin 100% langsung masuk ke lapangan menggantikan 2 pemain yang sudah paling banyak bermain.",
    advantages: [
      "Tidak ada pemain yang dianaktirikan atau kelamaan duduk bengong.",
      "Uang sewa lapangan terasa adil karena semua peserta dapat giliran main yang sama.",
      "Tensi reli pertandingan tetap seru berkat perpaduan tier seimbang."
    ],
  },
  mixed_doubles: {
    id: "mixed_doubles",
    formula: "1 Pria (M) + 1 Wanita (W) per Tim di Tiap Lapangan",
    howItWorks: [
      "Sistem memisahkan antrean siap main menjadi pool Pria (M) dan pool Wanita (W).",
      "Pada setiap lapangan diupayakan format murni Ganda Campuran: Tim A (1 M + 1 W) vs Tim B (1 M + 1 W).",
      "Jika jumlah wanita ganjil (misal 1 W dan 3 M dalam 1 lapangan), pemain wanita akan dipasangkan dengan pria berkemampuan tertinggi (Suhu) untuk melawan 2 pria berkemampuan menengah agar adil."
    ],
    exampleScenario:
      "Dalam mabar terdapat 6 Pria (M) dan 4 Wanita (W) di 2 lapangan. Sistem akan membagi 2 M + 2 W di Lapangan 1 (XD vs XD) dan 2 M + 2 W di Lapangan 2 (XD vs XD), sementara 2 M sisanya menunggu giliran.",
    advantages: [
      "Menghindari situasi canggung di mana 2 pemain cowo smash keras ke 2 pemain cewe pemula.",
      "Memberikan panggung yang nyaman dan inklusif bagi pemain wanita.",
      "Rotasi pasangan ganda campuran berjalan dinamis tiap ronde."
    ],
  },
  skill_tiered: {
    id: "skill_tiered",
    formula: "Suhu + Kentang Lawan Sepasang Hore (Total Level Tim Berimbang)",
    howItWorks: [
      "Sistem membaca tier keahlian pemain: Kentang (Level 1), Hore (Level 2), dan Suhu (Level 3).",
      "Sistem melarang pasangan Suhu + Suhu bermain melawan Kentang + Kentang.",
      "Kombinasi tim wajib memiliki total skor keahlian yang seimbang, contohnya Suhu (3) + Kentang (1) = Total 4 melawan Hore (2) + Hore (2) = Total 4.",
      "Pria (M) dan wanita (W) bebas dipasangkan selama level kekuatannya berimbang."
    ],
    exampleScenario:
      "Jika mantan atlet (Suhu) bermain, dia akan dipasangkan dengan pemain pemula (Kentang) untuk menghadapi dua pemain menengah (Hore). Pertandingan menjadi sengit karena reli tetap hidup.",
    advantages: [
      "Mencegah pembantaian skor sepihak (anti-skor 21-2).",
      "Pemain pemula bisa belajar rotasi dan positioning karena didampingi oleh pemain Suhu.",
      "Semua level pemain pulang dengan rasa puas dan berkeringat."
    ],
  },
  king_of_court: {
    id: "king_of_court",
    formula: "Menang Tetap di Lapangan 1, Penantang Naik Lapangan, Kalah Keluar",
    howItWorks: [
      "Lapangan 1 dinobatkan sebagai 'Tahta Utama GOR'.",
      "Pasangan yang menang di Lapangan 1 tetap bertahan di Lapangan 1 sebagai 'Raja Lapangan' untuk ronde selanjutnya.",
      "Pasangan yang menang di Lapangan 2 naik kasta ke Lapangan 1 untuk menantang Sang Raja.",
      "Pasangan yang kalah turun ke antrean cadangan atau berpindah ke lapangan bawah."
    ],
    exampleScenario:
      "Budi & Hendra menang di Lapangan 1. Mereka tetap di Lapangan 1. Di Lapangan 2, Kevin & Maya menang. Kevin & Maya langsung naik ke Lapangan 1 untuk menantang Budi & Hendra di ronde berikutnya!",
    advantages: [
      "Membangkitkan adrenalin dan atmosfer kompetitif yang sangat seru.",
      "Ada gengsi mempertahankan Tahta Lapangan 1 sepanjang malam.",
      "Sangat digemari saat sesi mabar sparing internal antar member."
    ],
  },
  americano: {
    id: "americano",
    formula: "Partner Berganti Tiap Ronde, Poin Game Masuk Klasemen Individu",
    howItWorks: [
      "Format turnamen resmi yang populer di Padel dan sangat digemari di Badminton komunitas.",
      "Setiap ronde, setiap pemain berganti rekan pasangan baru secara terjadwal (semua orang merasakan berpasangan dengan semua orang).",
      "Skor poin yang didapat tim dicatat sebagai poin individu masing-masing pemain ke papan klasemen (Leaderboard)."
    ],
    exampleScenario:
      "Di Ronde 1, Budi berpasangan dengan Andi dan menang 21-15. Budi dan Andi masing-masing mendapat 21 poin. Di Ronde 2, Budi berpasangan dengan Siti dan menang 21-18. Poin individu Budi menjadi 21 + 21 = 42 poin.",
    advantages: [
      "Format turnamen mini yang sangat adil untuk menentukan siapa 'Juara Mabar Malam Ini'.",
      "Menghilangkan ego pasangan tetap karena setiap pemain bermain bersama rekan yang berbeda-beda.",
      "Pemain yang poinnya tertinggi di akhir sesi dinobatkan sebagai Juara Americano."
    ],
  },
  random_fun: {
    id: "random_fun",
    formula: "Kocok Acak Murni Tanpa Syarat & Statistik (Main Santai)",
    howItWorks: [
      "Sistem mengocok seluruh pemain aktif secara acak murni tanpa memandang tier, gender, maupun jatah main.",
      "4 orang pertama masuk Lapangan 1, 4 orang berikutnya ke Lapangan 2, dst.",
      "Pasangan 2v2 diundi secara spontan."
    ],
    exampleScenario:
      "Sesi mabar santai di mana host tidak ingin pusing dengan data statistik dan pemain hanya ingin bersenang-senang serta berkenalan dengan teman baru secara spontan.",
    advantages: [
      "Pengaturan instan tanpa perlu memikirkan level keahlian.",
      "Menciptakan pasangan-pasangan tak terduga yang mengundang tawa.",
      "Sangat cocok untuk mabar gathering santai, komunitas baru, atau pemanasan awal."
    ],
  },
  custom_manual: {
    id: "custom_manual",
    formula: "100% Ditentukan Manual oleh Host (Bebas Pilih Pemain & Lapangan)",
    howItWorks: [
      "Host memegang kendali penuh 100% untuk menentukan pertandingan.",
      "Host bebas memilih berapa match awal yang ingin disiapkan (misal 4, 8, atau isi bebas berapa saja).",
      "Host dapat menentukan secara manual siapa pemain 1 & 2 di Tim A melawan pemain 1 & 2 di Tim B melalui modal pembuat match.",
      "Host bebas menambahkan match baru kapan saja di tengah sesi berjalan."
    ],
    exampleScenario:
      "Host sudah punya jadwal bagan pertandingan sparing persahabatan antar kantor yang sudah disepakati di WhatsApp. Host tinggal memilih nama-nama pemain sesuai daftar bagan tersebut.",
    advantages: [
      "Fleksibilitas tak terbatas tanpa intervensi otomatisasi sistem.",
      "Bisa mengakomodasi permintaan khusus (misal: 'Saya mau main bareng adik saya di lapangan 2 ronde 3').",
      "Cocok untuk turnamen dengan bagan bracket sistem gugur atau grup manual."
    ],
  },
};

export function AlgorithmExplainerModal({
  isOpen,
  onClose,
  selectedAlgorithm = "playfields_mix",
  onSelectAlgorithm,
}: AlgorithmExplainerModalProps) {
  const [activeTab, setActiveTab] = useState<MatchmakingAlgorithm>(selectedAlgorithm);

  if (!isOpen) return null;

  const algoBase = ALGORITHM_REGISTRY[activeTab];
  const algoDetail = DETAILED_ALGO_DOCS[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans selection:bg-[#ccff00] selection:text-black">
      <div
        className="relative flex flex-col w-full max-w-4xl bg-[#faf8f2] border-[4px] border-black rounded-3xl shadow-[10px_10px_0px_#000] overflow-hidden max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-white border-b-[3px] border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black shrink-0">
              <BookOpen className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono font-black uppercase px-2 py-0.5 rounded bg-black text-[#ccff00]">
                  PANDUAN LENGKAP
                </span>
                <span className="text-xs font-bold text-black/60">7 Algoritma Rotasi Lapangan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                Cara Kerja & Perbandingan Algoritma Mabar
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl border-[3px] border-black bg-white flex items-center justify-center text-black hover:bg-[#ff5500] hover:text-white shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
          >
            <X className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab Horizontal Selector Algoritma */}
        <div className="flex items-center gap-2 p-3 bg-white border-b-2 border-black overflow-x-auto shrink-0 scrollbar-none">
          {Object.values(ALGORITHM_REGISTRY).map((algo) => {
            const isActive = activeTab === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() => setActiveTab(algo.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wide border-2 border-black transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                    : "bg-[#faf8f2] text-black hover:bg-slate-100 shadow-[1px_1px_0px_#000]"
                }`}
              >
                <span>{algo.icon}</span>
                <span>{algo.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Penjelasan Lengkap Algoritma Terpilih */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Card Header */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_#000]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{algoBase.icon}</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                    {algoBase.name}
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black inline-block mt-0.5 ${algoBase.badgeColor}`}>
                    {algoBase.badge}
                  </span>
                </div>
              </div>

              {onSelectAlgorithm && (
                <button
                  onClick={() => {
                    onSelectAlgorithm(activeTab);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#ccff00] px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                  <span>Pilih Algoritma Ini</span>
                </button>
              )}
            </div>

            <p className="text-sm font-semibold text-black/80 leading-relaxed mb-4">
              {algoBase.description}
            </p>

            {/* Formula / Aturan Kunci (Bahasa Manusiawi yang Mudah Dipahami) */}
            <div className="p-3.5 rounded-xl bg-[#faf8f2] border-2 border-black flex flex-col gap-1 shadow-[2px_2px_0px_#000]">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-black/50">
                Prinsip Kunci Algoritma:
              </span>
              <span className="font-heading font-black text-xs sm:text-sm text-black">
                {algoDetail.formula}
              </span>
            </div>
          </div>

          {/* Grid 2 Kolom: Cara Kerja & Contoh Skenario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cara Kerja & Aturan */}
            <div className="rounded-2xl border-[3px] border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-black mb-3">
                <Zap className="h-5 w-5 text-black stroke-[2.5]" />
                <h4 className="text-sm font-black text-black uppercase tracking-wide">
                  Langkah & Cara Kerja Sistem
                </h4>
              </div>

              <ul className="space-y-2.5 text-xs font-medium text-black/85 flex-1">
                {algoDetail.howItWorks.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#faf8f2] p-3 rounded-xl border border-black">
                    <span className="h-5 w-5 rounded-full bg-black text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contoh Kasus Nyata di Lapangan */}
            <div className="rounded-2xl border-[3px] border-black bg-white p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b-2 border-black mb-3">
                  <Users className="h-5 w-5 text-black stroke-[2.5]" />
                  <h4 className="text-sm font-black text-black uppercase tracking-wide">
                    Simulasi Contoh Kasus Mabar
                  </h4>
                </div>
                <div className="p-4 rounded-xl bg-[#fef08a]/40 border-2 border-black text-xs font-semibold text-black/90 leading-relaxed shadow-[2px_2px_0px_#000]">
                  {algoDetail.exampleScenario}
                </div>
              </div>

              {/* Rekomendasi Penggunaan */}
              <div className="mt-4 pt-3 border-t-2 border-black/15">
                <span className="text-[10px] font-mono font-black uppercase text-black/50 block mb-1">
                  🎯 Paling Cocok Digunakan Untuk:
                </span>
                <p className="text-xs font-bold text-black">{algoBase.bestFor}</p>
              </div>
            </div>
          </div>

          {/* Keunggulan Utama */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5 shadow-[4px_4px_0px_#000]">
            <h4 className="text-xs font-black uppercase tracking-wider text-black mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 stroke-[3]" />
              Keunggulan Utama Algoritma Ini:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {algoDetail.advantages.map((adv, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#faf8f2] border-2 border-black text-xs font-bold text-black shadow-[2px_2px_0px_#000]"
                >
                  {adv}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-white border-t-[3px] border-black flex items-center justify-between gap-3 text-xs shrink-0">
          <span className="font-bold text-black/60 text-xs hidden sm:inline">
            💡 Catatan: Pria (M) dan Wanita (W) tetap bisa berpasangan di semua algoritma jika terpilih dalam ronde tersebut.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-black text-white font-black uppercase tracking-wider border-2 border-black hover:bg-neutral-800 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ml-auto"
          >
            Tutup Penjelasan
          </button>
        </div>
      </div>
    </div>
  );
}
