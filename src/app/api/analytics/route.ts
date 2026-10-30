import { NextRequest, NextResponse } from "next/server";
import { r2Service } from "../../../services/storage/r2.service";

/**
 * GET /api/analytics
 * Mengambil analitik harian sesi mabar dari Cloudflare R2
 * Query: ?refresh=true untuk memaksa pembaruan data real-time dari R2
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
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
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat analitik harian", details: error?.message },
      { status: 500 }
    );
  }
}
