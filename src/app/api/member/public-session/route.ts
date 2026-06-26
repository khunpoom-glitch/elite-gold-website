import { NextResponse } from "next/server";
import { getPublicSessionState } from "@/lib/member/public-session";

export async function GET() {
  const publicSession = await getPublicSessionState();

  return NextResponse.json(publicSession, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
