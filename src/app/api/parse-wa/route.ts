import { NextResponse } from "next/server";
import {
  createPlayersFromParsed,
  parseWhatsAppList,
  parseWhatsAppMetadata,
} from "../../../core/matchmaking/wa-parser";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = body.text || "";

    const parsed = parseWhatsAppList(rawText);
    const players = createPlayersFromParsed(parsed);
    const metadata = parseWhatsAppMetadata(rawText);

    return NextResponse.json({
      success: true,
      count: players.length,
      players,
      metadata,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses teks WhatsApp" },
      { status: 400 }
    );
  }
}
