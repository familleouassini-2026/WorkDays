/**
 * Notifications helper - creates notifications via direct Supabase client.
 *
 * RLS is disabled on the notifications table (migration 029),
 * so the anon key works fine without needing the service_role key.
 */
import { createClient } from "@/lib/supabase/client";

export async function createNotification(params: {
  employeeId: number | null;
  title: string;
  message?: string;
  type?: "info" | "warning" | "success" | "action";
  link?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").insert({
      employee_id: params.employeeId,
      title: params.title,
      message: params.message || null,
      type: params.type || "info",
      link: params.link || null,
      is_read: false,
    });

    if (error) {
      console.error("[createNotification] Insert failed:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[createNotification] Error:", err);
    return { success: false, error: String(err) };
  }
}
