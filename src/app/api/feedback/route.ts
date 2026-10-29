import { NextRequest, NextResponse } from "next/server";
import { r2Service } from "../../../services/storage/r2.service";
import { SessionFeedback } from "../../../core/entities/feedback";

/**
 * POST /api/feedback
 * Menerima feedback dari host setelah menyelesaikan sesi mabar
 * Disimpan langsung ke Cloudflare R2 tanpa biaya egress
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, senderName, senderContact, rating, sessionId, sessionTitle, sportType } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Pesan feedback tidak boleh kosong" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || undefined;
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const feedbackId = `fb-${Date.now()}-${randomSuffix}`;

    const feedback: SessionFeedback = {
      id: feedbackId,
      sessionId: sessionId || undefined,
      sessionTitle: sessionTitle || undefined,
      sportType: sportType || undefined,
      rating: typeof rating === "number" ? Math.min(Math.max(rating, 1), 5) : undefined,
      message: message.trim(),
      senderName: senderName?.trim() || undefined,
      senderContact: senderContact?.trim() || undefined,
      createdAt: new Date().toISOString(),
      userAgent,
    };

    const uploaded = await r2Service.uploadFeedback(feedback);
    if (!uploaded) {
      console.warn("[Feedback API] R2 upload gagal atau R2 belum terkonfigurasi");
    }

    return NextResponse.json({ success: true, id: feedbackId });
  } catch (error: any) {
    console.error("[Feedback API] Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan feedback" }, { status: 500 });
  }
}

/**
 * GET /api/feedback
 * Mengambil daftar feedback untuk dicek manual oleh admin/creator
 */
export async function GET() {
  try {
    const feedbacks = await r2Service.listFeedbacks(100);
    return NextResponse.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (error: any) {
    console.error("[Feedback API] Error listing feedbacks:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar feedback" }, { status: 500 });
  }
}
