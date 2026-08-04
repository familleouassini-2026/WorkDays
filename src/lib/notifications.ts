/**
 * Notifications helper - creates notifications via server-side API route.
 *
 * Uses the same pattern as audit.ts: calls an API route that uses
 * the admin client (service_role) to bypass RLS.
 */
export async function createNotification(params: {
  employeeId: number | null;
  title: string;
  message?: string;
  type?: "info" | "warning" | "success" | "action";
  link?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: params.employeeId,
        title: params.title,
        message: params.message || null,
        type: params.type || "info",
        link: params.link || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: res.statusText }));
      console.error("[createNotification] API call failed:", data.error);
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err) {
    console.error("[createNotification] Fetch error:", err);
    return { success: false, error: String(err) };
  }
}
