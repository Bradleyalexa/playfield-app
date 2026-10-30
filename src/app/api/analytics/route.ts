import { NextRequest, NextResponse } from "next/server";
import { r2Service } from "../../../services/storage/r2.service";

const ADMIN_PIN = "4137";

/**
 * GET /api/analytics
 * Mengambil analitik harian sesi mabar dari Cloudflare R2
 * Dilindungi PIN admin 4137
 * Query: ?refresh=true untuk memaksa pembaruan data real-time dari R2
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pin = request.headers.get("x-admin-pin") || searchParams.get("pin");

    if (pin !== ADMIN_PIN) {
      return NextResponse.json(
        { error: "Unauthorized: Akses ditolak. PIN admin salah atau tidak ada." },
        { status: 401 }
      );
    }

    const forceRefresh = searchParams.get("refresh") === "true";

    const analytics = await r2Service.getDailyAnalytics(forceRefresh);

    return NextResponse.json(analytics, {
      headers: {
        "Cache-Control": forceRefresh
          ? "no-cache, no-store, must-revalidate"
          : "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_")) {
      throw error;
    }
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat analitik harian", details: error?.message },
      { status: 500 }
    );
  }
}
