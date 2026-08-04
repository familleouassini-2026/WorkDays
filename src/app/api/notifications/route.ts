import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/notifications - Fetch notifications (optionally filtered)
 * Query params: limit, is_read (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const isRead = searchParams.get("is_read");

    const supabase = createAdminClient();
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (isRead === "true") {
      query = query.eq("is_read", true);
    } else if (isRead === "false") {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[API /notifications] GET error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/notifications - Create a notification
 * Body: { employee_id, title, message?, type?, link? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, title, message, type, link } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("notifications").insert({
      employee_id: employee_id || null,
      title,
      message: message || null,
      type: type || "info",
      link: link || null,
      is_read: false,
    }).select("id").single();

    if (error) {
      console.error("[API /notifications] Insert failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[API /notifications] POST error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications - Mark notifications as read
 * Body: { ids: number[] } or { mark_all_read: true }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, mark_all_read } = body;

    const supabase = createAdminClient();

    if (mark_all_read) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Provide ids array or mark_all_read: true" }, { status: 400 });
  } catch (err) {
    console.error("[API /notifications] PATCH error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
