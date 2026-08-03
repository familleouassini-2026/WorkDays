import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET";

  // Decode JWT payload to see the role claim
  let serviceRolePayload: unknown = null;
  let anonPayload: unknown = null;
  try {
    serviceRolePayload = JSON.parse(Buffer.from(serviceRoleKey.split(".")[1], "base64").toString());
  } catch { serviceRolePayload = "DECODE_FAILED"; }
  try {
    anonPayload = JSON.parse(Buffer.from(anonKey.split(".")[1], "base64").toString());
  } catch { anonPayload = "DECODE_FAILED"; }

  // Test insert with admin client
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("audit_log").insert({
    table_name: "debug_test",
    record_id: 0,
    action: "DEBUG",
    performed_by: "debug-endpoint",
    performed_at: new Date().toISOString(),
    context: "api-debug-v2",
  }).select("id").single();

  return NextResponse.json({
    supabaseUrl,
    serviceRoleJWT: serviceRolePayload,
    anonJWT: anonPayload,
    keysAreDifferent: serviceRoleKey !== anonKey,
    insertResult: data,
    insertError: error ? { message: error.message, hint: error.hint, code: error.code } : null,
  });
}
