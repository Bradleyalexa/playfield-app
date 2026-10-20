import { NextRequest, NextResponse } from "next/server";
import { GameSession } from "../../../../core/entities/session";
import { r2Service } from "../../../../services/storage/r2.service";
import { d1Service } from "../../../../services/storage/d1.service";

// In-Memory fallback store untuk session caching antar serverless invocation
const globalSessionCache = new Map<string, GameSession>();

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * GET /api/sessions/[sessionId]
 * Mengambil data sesi secara multi-layer:
 * 1. Global Memory Cache
 * 2. Cloudflare R2 Snapshot (Edge Object Storage)
 * 3. Cloudflare D1 Database (Relational Store)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  // 1. Cek memory cache
  const cached = globalSessionCache.get(sessionId);
  if (cached) {
    return NextResponse.json({ session: cached, source: "memory_cache" }, {
      headers: { "Cache-Control": "public, s-maxage=3, stale-while-revalidate=10" },
    });
  }

  // 2. Cek Cloudflare R2 Snapshot
  if (r2Service.isConfigured()) {
    const r2Session = await r2Service.getSessionSnapshot(sessionId);
    if (r2Session) {
      globalSessionCache.set(r2Session.id, r2Session);
      globalSessionCache.set(r2Session.publicSlug, r2Session);
      return NextResponse.json({ session: r2Session, source: "cloudflare_r2" }, {
        headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" },
      });
    }
  }

  // 3. Cek Cloudflare D1 Database
  if (d1Service.isConfigured()) {
    const d1Session = await d1Service.getSession(sessionId);
    if (d1Session) {
      globalSessionCache.set(d1Session.id, d1Session);
      globalSessionCache.set(d1Session.publicSlug, d1Session);
      return NextResponse.json({ session: d1Session, source: "cloudflare_d1" }, {
        headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" },
      });
    }
  }

  return NextResponse.json({ error: "Session not found" }, { status: 404 });
}

/**
 * POST /api/sessions/[sessionId]
 * Menyimpan / Sinkronisasi data sesi dari Host ke Cloud:
 * 1. Simpan ke Global Memory Cache
 * 2. Upload snapshot JSON ke Cloudflare R2
 * 3. Simpan row ke Cloudflare D1 Database
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { sessionId } = await params;

  try {
    const body = await request.json();
    const session = body as GameSession;

    if (!session || (!session.id && !session.publicSlug)) {
      return NextResponse.json({ error: "Invalid session payload" }, { status: 400 });
    }

    session.updatedAt = new Date().toISOString();

    // 1. Simpan di in-memory cache
    globalSessionCache.set(session.id, session);
    globalSessionCache.set(session.publicSlug, session);
    if (sessionId) {
      globalSessionCache.set(sessionId, session);
    }

    // 2. Upload snapshot ke R2 di background (non-blocking jika bisa)
    const promises: Promise<any>[] = [];
    if (r2Service.isConfigured()) {
      promises.push(r2Service.uploadSessionSnapshot(session));
    }

    // 3. Simpan ke D1 Database
    if (d1Service.isConfigured()) {
      promises.push(d1Service.saveSession(session));
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }

    return NextResponse.json({
      success: true,
      id: session.id,
      publicSlug: session.publicSlug,
      r2Configured: r2Service.isConfigured(),
      d1Configured: d1Service.isConfigured(),
    });
  } catch (err: any) {
    console.error("[API Sessions POST] Error:", err);
    return NextResponse.json({ error: "Failed to persist session", details: err?.message }, { status: 500 });
  }
}
