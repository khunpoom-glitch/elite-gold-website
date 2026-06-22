import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ discarded: false });
  }

  const { data, error } = await supabase.rpc("discard_elite_google_signup_draft");

  if (error) {
    console.warn("[auth] Failed to discard Google signup draft.", {
      code: error.code,
      message: error.message,
    });
  }

  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

  return NextResponse.json({
    discarded: Boolean(data),
  });
}
