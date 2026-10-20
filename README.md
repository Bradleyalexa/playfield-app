# ClubCourt (Playfield App) 🏸🎾🏓

> **Pocket Assistant Host Mabar & Pengatur Rotasi Lapangan Olahraga**  
> Solusi zero-friction untuk komunitas Badminton, Tennis, dan Padel di Indonesia.

---

## 📌 Sekilas Produk

ClubCourt dirancang khusus untuk mempermudah ketua komunitas dan host mabar mengelola sesi olahraga tanpa repot mencatat manual:
- **Zero-Friction untuk Pemain:** Pemain tidak diwajibkan mendaftar/login; host cukup memasukkan atau menempelkan (*paste*) daftar nama dummy dari WhatsApp.
- **Fair Matchmaking & Rotator:** Algoritma penyeimbang pasangan ganda berdasarkan jatah main, waktu istirahat, dan level keahlian.
- **Dukungan Multi-Sport:** Kustomisasi aturan untuk Badminton (Rally 21 / Fast 30), Tennis (Fast4 / Pro Set 8 / No-Ad Golden Point), dan Padel (Americano 24/32 / Mexicano).
- **Equipment & Cock Counter:** Pencatatan otomatis pemakaian shuttlecock dan kaleng bola (`+1 Cock`).
- **Live GOR Display & Audio AI:** Tampilan TV layar penuh dengan suara panggilan lapangan otomatis via Bluetooth speaker.
- **Arsitektur Hybrid Ringan:** Menggunakan Cloudflare R2 untuk penyimpanan data cepat tanpa ketergantungan server berat, serta database relasional Cloudflare D1 untuk riwayat sesi.

---

## 📂 Dokumentasi Teknis

Seluruh blueprint perencanaan dan arsitektur tersimpan lengkap di direktori [`documentations/`](./documentations):
1. [**PRD.md**](./documentations/PRD.md) — Product Requirement Document, panduan edukasi tiap olahraga, dan aturan turnamen.
2. [**SYSTEM_ARCHITECTURE.md**](./documentations/SYSTEM_ARCHITECTURE.md) — Arsitektur sistem, spesifikasi tech stack, strategi multi-sport, dan integrasi Cloudflare.
3. [**ERD.md**](./documentations/ERD.md) — Diagram relasi entitas, kamus data, dan skema SQL database.

---

## 🛠️ Tech Stack

- **Frontend & App:** Next.js (App Router) / React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui + Lucide Icons
- **Interaktivitas:** `@dnd-kit` untuk Drag & Drop rotasi pemain di lapangan
- **Hosting & Edge:** Cloudflare Pages + Vercel
- **Storage & Database:** Cloudflare R2 (Flat-File Snapshot) + Cloudflare D1 (Database)
- **Audio Engine:** HTML5 Web Speech API (Pengumuman Panggilan Lapangan)

---

## 🚀 Status Repositori

- **Inisialisasi Proyek:** Oktober 2026
- **Cabang Utama:** `main`
