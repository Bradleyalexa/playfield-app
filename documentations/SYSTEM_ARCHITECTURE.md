# System Architecture Document — ClubCourt (Hybrid Edge & Multi-Sport Edition)

**Nama Sistem:** ClubCourt Platform  
**Target Deployment:** Cloudflare Pages + Cloudflare D1 (Database) + Cloudflare R2 Storage  
**Dokumen Versi:** 2.1 (Explicit Tech Stack, Hybrid Auth, & Relational Database)  
**Tanggal:** Oktober 2026  
**Dokumen Relasi:** [ERD.md](file:///c:/Users/Alexander/playfield-app/documentations/ERD.md), [PRD.md](file:///c:/Users/Alexander/playfield-app/documentations/PRD.md)  

---

## 1. Spesifikasi Lengkap Tech Stack

Berikut adalah susunan teknologi (*technology stack*) resmi yang dipilih untuk menjamin performa cepat, biaya operasional $0 di tahap awal, dan kemudahan pengembangan:

| Lapisan (Layer) | Teknologi / Alat | Alasan Pemilihan & Fungsi |
| :--- | :--- | :--- |
| **Framework Utama** | **Next.js (App Router) / SvelteKit / Vite + React** | SSR & Edge rendering cepat, API Routes terintegrasi, SEO-friendly, dan didukung penuh oleh Cloudflare Pages. |
| **Bahasa Pemrograman** | **TypeScript** | *Type safety* ketat untuk model data pertandingan, aturan sport strategy, dan payload API. |
| **Styling & Komponen UI**| **Tailwind CSS + shadcn/ui + Lucide Icons** | Desain responsif modern, dark-mode bawaan untuk GOR Kiosk Display, dan komponen siap pakai. |
| **Interaktivitas Lapangan**| **`@dnd-kit/core` & `@dnd-kit/sortable`** | Fitur drag-and-drop jempol-friendly untuk menukar pemain antar-lapangan di pinggir lapangan. |
| **Hosting & Edge Runtime**| **Cloudflare Pages + Pages Functions** | Deploy global super cepat, latensi ultra-rendah di Indonesia, zero server maintenance. |
| **Database (Data Persisten)**| **Cloudflare D1 (SQLite Edge) / Supabase (PostgreSQL)** | Free-tier sangat besar (D1: 5 juta read/hari gratis). Menyimpan akun pengguna, relasi klub, dan histori sesi. |
| **Object & Snapshot Storage**| **Cloudflare R2** | Zero egress fees! Digunakan untuk snapshot cepat `session.json`, logo klub, dan aset gambar IG Story. |
| **Otentikasi (Hybrid Auth)**| **Lucia Auth / NextAuth / Supabase Auth** | Mendukung **Guest Mode (Secret Token)** untuk pengguna tanpa login, dan **Google OAuth / Email Magic Link** untuk host terdaftar. |
| **Audio Voice Announcer** | **HTML5 Web Speech API (`id-ID`)** | Mengumumkan panggilan giliran pemain ke lapangan via speaker Bluetooth tanpa perlu API eksternal berbayar. |
| **Image Generator** | **HTML5 Canvas / Satori** | Men-generate kartu infografis *Spotify-Wrapped* format 9:16 langsung di browser pengguna untuk Instagram Story. |

---

## 2. Arsitektur Hybrid: Guest Mode vs Registered Host

Aplikasi mengadopsi model **Hybrid Storage & Auth**:

```mermaid
flowchart TB
    subgraph User Access Layer
        Guest[👤 Host Tanpa Login\n(Guest Mode)] -->|Akses Cepat 1-Klik| URL_Key["Link Rahasia: /host/:slug?key=secret_token"]
        Member[🔐 Host Terdaftar\n(Registered Mode)] -->|Google OAuth / Magic Link| AuthSession["User Session Token"]
    end

    subgraph Application & Edge (Cloudflare Pages)
        Router[Edge API Router & Controller]
        URL_Key --> Router
        AuthSession --> Router
        
        Engine[Multi-Sport Engine\n- Badminton / Tennis / Padel\n- Fair Matchmaking & Rotator]
        Router --> Engine
    end

    subgraph Data & Persistence Layer
        DB[("Cloudflare D1 / Supabase\n(Relational Database)\n- users, clubs, sessions\n- matches, players, equipment")]
        R2[("Cloudflare R2 Bucket\n(Fast Edge Snapshot)\ngames/:slug/session.json")]
        
        Router -->|Sync State / Update| DB
        Router -->|Live Snapshot Write| R2
    end

    subgraph Public Spectator Layer
        Spectator[👥 Pemain di Lapangan: /g/:slug]
        TVDisplay[📺 TV GOR Kiosk: /g/:slug/kiosk]
        
        R2 -->|Polling Cepat tiap 8s| Spectator
        R2 -->|Polling Cepat tiap 8s| TVDisplay
        TVDisplay -->|Voice Call| Audio[🔊 Speaker Bluetooth GOR]
    end
```

### 2.1 Alur Kerja Mode Hybrid:
1. **Host Tamu (Guest Mode - Tanpa Login):**
   - Host yang buru-buru di lapangan bisa langsung membuat mabar tanpa sign-up.
   - Sesi diberi `admin_secret_key` unik (32 karakter). Hak akses edit diverifikasi melalui parameter URL `?key=xyz` atau cookie lokal.
   - Data tetap tersimpan rapi di database dengan `host_user_id = NULL`.
2. **Host Terdaftar (Registered Host):**
   - Host yang login dapat melihat dashboard kumpulan mabar (*multi-session history*), membuat profil klub rutin, dan mengelola daftar pemain langganan (*master roster*).
3. **Claiming Sesi Guest Menjadi Akun Resmi:**
   - Jika seorang host awalnya membuat sesi sebagai guest, di akhir acara mereka bisa klik *"Simpan Sesi ke Akun Saya"* $\rightarrow$ Login Google $\rightarrow$ Sesi otomatis tertaut ke akun baru.

---

## 3. Sinkronisasi Real-Time: Database + R2 Snapshot

Untuk menyeimbangkan antara **kecepatan di pinggir lapangan** dan **integritas data**:

1. **R2 Edge Snapshot (`session.json`):**
   - Setiap kali host mengubah skor atau menukar pemain, serverless function memperbarui file `games/:slug/session.json` di Cloudflare R2.
   - File statis ini di-cache di Cloudflare CDN Edge, sehingga ratusan pengunjung / TV GOR yang melakukan polling tiap 8 detik **tidak akan membebani database**.
2. **Database Persistence (Cloudflare D1 / Supabase):**
   - Event penting (pembuatan sesi, pemain baru masuk, match selesai, pencatatan cock, sesi diakhiri) langsung disimpan ke tabel relasional database.
   - Skema tabel relasional lengkap terdokumentasi di [ERD.md](file:///c:/Users/Alexander/playfield-app/documentations/ERD.md).

---

## 4. Multi-Sport Engine Strategy (Badminton, Tennis, Padel)

Sistem menggunakan pola **Strategy Pattern** sederhana di sisi backend/frontend TypeScript:

```typescript
export interface SportStrategy {
  sportType: "badminton" | "tennis" | "padel";
  getPresets(): ScoringPreset[];
  validateMatchScore(scoreA: number, scoreB: number, config: SportConfig): boolean;
  generatePairings(players: Player[], courtCount: number, mode: string): GeneratedRound;
  trackEquipment(currentTotal: number, increment: number): number;
}
```

### Perbedaan Konfigurasi per Cabang Olahraga:
- **Badminton:** Format Ganda (4 pemain/lapangan), Rally 21 BWF (deuce maks 30) atau 30 Poin Fast Match. Tombol `+1 Cock` untuk tracker shuttlecock.
- **Tennis:** Format Ganda atau Tunggal, No-Ad Golden Point (40–40 penentuan langsung), Fast4 Tennis, dan Pro Set 8 Games. Tracker pembukaan kaleng bola (`+1 Can`).
- **Padel:** Format Americano (24 atau 32 poin per laga, pasangan diacak tiap ronde, poin diakumulasikan ke klasemen individu) dan Mexicano (pemain peringkat atas vs peringkat bawah untuk penyeimbangan dinamis).

---

## 5. Ringkasan Endpoint API Utama

| Method | Endpoint | Fungsi | Autentikasi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/sessions` | Membuat sesi mabar baru | Publik (Guest) atau User Token |
| `GET` | `/api/sessions/:slug` | Mengambil data sesi untuk spectator | Publik (Tanpa Auth) |
| `PUT` | `/api/sessions/:slug` | Memperbarui susunan pemain / skor | Header `x-admin-key` atau User Session |
| `POST` | `/api/sessions/:slug/next-round` | Memicu algoritma matchmaking ronde baru | Header `x-admin-key` atau User Session |
| `POST` | `/api/sessions/:slug/cock` | Menambah counter cock/bola (`+1`) | Header `x-admin-key` atau User Session |
| `POST` | `/api/sessions/:slug/claim` | Menautkan sesi guest ke akun yang baru login | User Session + Valid Admin Key |
