import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) || "NOT SET";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET";

  // Try a test insert
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("audit_log").insert({
    table_name: "debug_test",
    record_id: 0,
    action: "DEBUG",
    performed_by: "debug-endpoint",
    performed_at: new Date().toISOString(),
    context: "api-debug-test",
  }).select("id").single();

  return NextResponse.json({
    hasServiceRoleKey: hasServiceRole,
    keyPrefix: keyPrefix + "...",
    supabaseUrl,
    insertResult: data,
    insertError: error ? { message: error.message, details: error.details, hint: error.hint, code: error.code } : null,
  });
}
