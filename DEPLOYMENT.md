# Panduan Deployment Produksi — Playfield

Panduan langkah-demi-langkah untuk mendeploy Playfield ke **Vercel** dengan backend **Cloudflare D1 Database** dan **Cloudflare R2 Object Storage**.

---

## 1. Deploy ke Vercel via GitHub (Frontend & API Routes)

1. **Push Repository ke GitHub**:
   Repository saat ini: `https://github.com/Bradleyalexa/playfield-app` (cabang `main`).
2. **Buka Vercel Dashboard**:
   - Kunjungi [vercel.com/new](https://vercel.com/new).
   - Hubungkan akun GitHub Anda dan pilih repository `playfield-app`.
   - Framework Preset: **Next.js** (terdeteksi otomatis).
   - Root Directory: `./` (default).
3. **Konfigurasi Environment Variables**:
   Di tab **Environment Variables**, Anda bisa langsung klik **Deploy** terlebih dahulu (aplikasi sudah memiliki *in-memory cache* dan *resilient fallback* sehingga dapat langsung diakses tanpa crash).
   Untuk mengaktifkan persistensi multi-device permanen, tambahkan variabel dari Cloudflare (Langkah 2 & 3 di bawah).

---

## 2. Setup Cloudflare D1 (Relational Database)

Cloudflare D1 menyediakan database SQLite serverless gratis hingga 5 juta pembacaan per hari.

1. **Install & Login Wrangler CLI (jika belum)**:
   ```bash
   npx wrangler login
   ```
2. **Buat Database D1**:
   ```bash
   npx wrangler d1 create playfield-db
   ```
   *Catat `database_id` yang ditampilkan di terminal.*

3. **Jalankan Migrasi Skema SQL**:
   ```bash
   npx wrangler d1 execute playfield-db --file=./d1/schema.sql --remote
   ```
   *Skema tabel `game_sessions`, `players`, `courts`, `matches`, `match_lineups`, `equipment_logs`, dan `session_billings` akan otomatis dibuat.*

4. **Buat Cloudflare API Token**:
   - Buka Cloudflare Dashboard > **My Profile** > **API Tokens**.
   - Klik **Create Token** > pilih template **D1 Edit** (atau custom dengan permission `Account - D1 - Edit`).
   - Salin token API tersebut.

---

## 3. Setup Cloudflare R2 (Live Snapshot Storage)

Cloudflare R2 adalah object storage kompatibel S3 dengan biaya egress $0 (sangat hemat untuk polling live scoreboard).

1. **Buat Bucket R2**:
   - Buka Cloudflare Dashboard > **R2 Object Storage**.
   - Klik **Create bucket** > beri nama: `playfield-sessions`.
2. **Buat R2 API Token**:
   - Di menu R2, klik **Manage R2 API Tokens**.
   - Klik **Create API Token**, beri izin **Object Read & Write**.
   - Dapatkan:
     - `Access Key ID`
     - `Secret Access Key`
     - `Account ID` (tertera di URL dashboard atau sidebar).

---

## 4. Masukkan Variabel ke Vercel Project Settings

Buka **Settings > Environment Variables** di project Vercel Anda, lalu masukkan:

```env
R2_ACCOUNT_ID=xxxx_cloudflare_account_id
R2_ACCESS_KEY_ID=xxxx_r2_access_key
R2_SECRET_ACCESS_KEY=xxxx_r2_secret_key
R2_BUCKET_NAME=playfield-sessions

CLOUDFLARE_ACCOUNT_ID=xxxx_cloudflare_account_id
CLOUDFLARE_D1_DATABASE_ID=xxxx_d1_database_uuid
CLOUDFLARE_API_TOKEN=xxxx_cloudflare_api_token
```

Klik **Save** dan lakukan **Redeploy**.

---

## 5. Cara Kerja Sinkronisasi Multi-Device

- **Host (di HP Host)**: Setiap perubahan skor, giliran lapangan, atau add player tersimpan di LocalStorage HP host (latensi 0ms) dan dikirim ke `/api/sessions/[slug]`.
- **API Serverless Vercel**: Menyimpan snapshot ke Cloudflare R2 dan data sesi ke Cloudflare D1.
- **Penonton (di HP Penonton)**: Saat scan QR Code, halaman `/live/[slug]` akan mengambil snapshot terbaru dari cloud dan melakukan sinkronisasi otomatis tiap 7 detik.
- **TV GOR (Kiosk Mode)**: Halaman `/kiosk/[slug]` di layar TV otomatis mendengarkan panggilan giliran pemain via suara dan mengupdate tampilan tanpa perlu refresh manual.
