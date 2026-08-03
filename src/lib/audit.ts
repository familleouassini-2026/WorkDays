/**
 * Audit log helper — writes to audit_log via server-side API route.
 * 
 * Why API route instead of direct Supabase browser client?
 * The browser client uses the anon key which is subject to RLS policies.
 * The API route uses the server client which bypasses RLS issues.
 */
export async function auditLog(params: {
  tableName: string;
  recordId: number;
  action: "INSERT" | "UPDATE" | "DELETE";
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  performedBy?: string;
  context?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableName: params.tableName,
        recordId: params.recordId,
        action: params.action,
        oldValues: params.oldValues || null,
        newValues: params.newValues || null,
        performedBy: params.performedBy || "gestionnaire",
        context: params.context || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: res.statusText }));
      console.error("[auditLog] API call failed:", data.error);
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err) {
    console.error("[auditLog] Fetch error:", err);
    return { success: false, error: String(err) };
  }
}
