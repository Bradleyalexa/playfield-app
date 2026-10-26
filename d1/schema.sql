-- ====================================================================
-- Playfield / ClubCourt - Cloudflare D1 (SQLite Edge) Database Schema
-- File: d1/schema.sql
-- ====================================================================

-- 1. Tabel Users (Host Akun Terdaftar)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                             -- UUID v4
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone_number TEXT,
    auth_provider TEXT DEFAULT 'google',             -- 'google' | 'email_otp'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel User Auth Sessions
CREATE TABLE IF NOT EXISTS user_auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON user_auth_sessions(user_id);

-- 3. Tabel Clubs (Komunitas / Klub Rutin)
CREATE TABLE IF NOT EXISTS clubs (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                              -- e.g. "PB Ceria Bintaro"
    sport_type TEXT NOT NULL,                        -- 'badminton' | 'tennis' | 'padel'
    slug TEXT UNIQUE NOT NULL,                       -- "pb-ceria-bintaro"
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Game Sessions (Sesi Mabar Aktif / Selesai)
-- Mendukung Guest Host (host_user_id IS NULL) dan Registered Host
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    club_id TEXT REFERENCES clubs(id) ON DELETE SET NULL,
    host_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    admin_secret_key TEXT UNIQUE NOT NULL,            -- Kunci otorisasi hak edit host
    public_slug TEXT UNIQUE NOT NULL,                 -- Slug URL publik penonton (/live/[slug])
    title TEXT NOT NULL,                              -- "Mabar Ceria Badminton GOR Tomang"
    sport_type TEXT NOT NULL,                         -- 'badminton' | 'tennis' | 'padel'
    court_count INTEGER NOT NULL DEFAULT 2,
    rule_preset TEXT NOT NULL DEFAULT 'rally_21',
    target_points INTEGER DEFAULT 21,
    status TEXT NOT NULL DEFAULT 'active',            -- 'active' | 'completed' | 'archived'
    session_data TEXT,                                -- Full JSON snapshot data sesi
    r2_snapshot_url TEXT,                             -- Backup URL snapshot JSON di Cloudflare R2
    session_date TEXT,                                -- "2026-10-21"
    start_time TEXT,                                  -- "19:00"
    duration_hours REAL DEFAULT 2,                    -- 2 jam
    court_location TEXT,                              -- "GOR Tomang Barat, Lapangan 1-2"
    google_maps_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_public_slug ON game_sessions(public_slug);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_key ON game_sessions(admin_secret_key);
CREATE INDEX IF NOT EXISTS idx_sessions_host_user ON game_sessions(host_user_id);

-- 5. Tabel Courts (Lapangan Terdaftar)
CREATE TABLE IF NOT EXISTS courts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    court_number INTEGER NOT NULL,
    court_name TEXT,                                  -- "Lapangan 1 (Karpet Hijau)"
    status TEXT DEFAULT 'available'                   -- 'available' | 'in_match' | 'maintenance'
);
CREATE INDEX IF NOT EXISTS idx_courts_session ON courts(session_id);

-- 6. Tabel Players (Pemain Mabar)
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F')) DEFAULT 'M',
    skill_level INTEGER DEFAULT 2,                    -- 1: Beginner, 2: Intermediate, 3: Advanced
    public_tier TEXT DEFAULT 'intermediate',          -- 'beginner' | 'intermediate' | 'advanced'
    games_played INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',                     -- 'active' | 'paused' | 'departed'
    elo_rating INTEGER DEFAULT 1000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_players_session ON players(session_id);

-- 7. Tabel Matches & Lineups
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    score_team_a INTEGER DEFAULT 0,
    score_team_b INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress',                -- 'queued' | 'in_progress' | 'completed'
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_matches_session ON matches(session_id);

CREATE TABLE IF NOT EXISTS match_lineups (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_side TEXT CHECK (team_side IN ('A', 'B')) NOT NULL,
    position_index INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_lineups_match ON match_lineups(match_id);

-- 8. Tabel Equipment Logs (Pemakaian Shuttlecock / Bola)
CREATE TABLE IF NOT EXISTS equipment_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    match_id TEXT REFERENCES matches(id) ON DELETE SET NULL,
    unit_type TEXT NOT NULL DEFAULT 'shuttlecock',
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10, 2) DEFAULT 0.00,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_equipment_session ON equipment_logs(session_id);

-- 9. Tabel Billing Split Summary
CREATE TABLE IF NOT EXISTS session_billings (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    court_rental_fee DECIMAL(10, 2) DEFAULT 0.00,
    shuttlecock_fee DECIMAL(10, 2) DEFAULT 0.00,
    shuttlecock_count INTEGER DEFAULT 0,
    other_fees DECIMAL(10, 2) DEFAULT 0.00,
    total_bill DECIMAL(10, 2) DEFAULT 0.00,
    player_count INTEGER DEFAULT 0,
    bill_per_person DECIMAL(10, 2) DEFAULT 0.00,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_holder TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
