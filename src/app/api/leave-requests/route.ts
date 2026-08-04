import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/leave-requests - Fetch leave requests with optional status filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabase = createAdminClient();
    let query = supabase
      .from("leave_requests")
      .select("*, employees!leave_requests_employee_id_fkey(id, first_name, last_name, manager_id), absence_codes(id, code, description, color_hex, time_unit)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[API /leave-requests] GET error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/leave-requests - Create a leave request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, absence_code_id, start_date, end_date, total_days, total_minutes, reason } = body;

    if (!employee_id || !absence_code_id || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("leave_requests").insert({
      employee_id,
      absence_code_id,
      start_date,
      end_date,
      total_days: total_days || null,
      total_minutes: total_minutes || null,
      reason: reason || null,
      status: "pending",
    }).select("id").single();

    if (error) {
      console.error("[API /leave-requests] Insert failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[API /leave-requests] POST error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * PATCH /api/leave-requests - Approve or reject a leave request
 * Body: { id, action: 'approve' | 'reject', approved_by?, rejection_reason? }
 * When approving, also creates year_calendar entries (same logic as encoder-drawer)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, approved_by, rejection_reason } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the leave request
    const { data: leaveRequest, error: fetchError } = await supabase
      .from("leave_requests")
      .select("*, absence_codes(id, code, time_unit)")
      .eq("id", id)
      .single();

    if (fetchError || !leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    if (action === "reject") {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          approved_by: approved_by || null,
          approved_at: new Date().toISOString(),
          rejection_reason: rejection_reason || null,
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "approve") {
      // 1. Fetch employee timesheet
      const { data: tsData } = await supabase
        .from("timesheets")
        .select("monday_minutes, tuesday_minutes, wednesday_minutes, thursday_minutes, friday_minutes, saturday_minutes, sunday_minutes")
        .eq("employee_id", leaveRequest.employee_id)
        .eq("is_active", true)
        .single();

      // 2. Fetch holidays for the year range
      const startYear = new Date(leaveRequest.start_date).getFullYear();
      const endYear = new Date(leaveRequest.end_date).getFullYear();
      const { data: holidaysData } = await supabase
        .from("holidays")
        .select("holiday_date")
        .gte("year", startYear)
        .lte("year", endYear);

      const holidaySet = new Set(
        (holidaysData || []).map((h: { holiday_date: string }) => h.holiday_date)
      );

      // 3. Determine time_unit for the absence code
      const timeUnit = leaveRequest.absence_codes?.time_unit || "DAYS";
      const isHours = timeUnit === "HOURS_MINUTES";

      // Helper: get schedule minutes for a given date
      const DOW_FIELDS = [
        "sunday_minutes",
        "monday_minutes",
        "tuesday_minutes",
        "wednesday_minutes",
        "thursday_minutes",
        "friday_minutes",
        "saturday_minutes",
      ] as const;

      const getScheduleMinutes = (date: Date): number => {
        if (!tsData) return 480; // default 8h
        const dow = date.getDay();
        return (tsData as Record<string, number | null>)[DOW_FIELDS[dow]] || 0;
      };

      // 4. Collect all records to insert in a batch
      const start = new Date(leaveRequest.start_date);
      const end = new Date(leaveRequest.end_date);
      const recordsToInsert: Array<{
        employee_id: number;
        absence_date: string;
        absence_code_id: number;
        absence_minutes: number | null;
        absence_days: number | null;
        year: number;
      }> = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        const dateStr = d.toISOString().split("T")[0];

        // Skip weekends
        if (dow === 0 || dow === 6) continue;
        // Skip holidays
        if (holidaySet.has(dateStr)) continue;
        // Skip days with 0 scheduled minutes
        const scheduledMin = getScheduleMinutes(d);
        if (scheduledMin === 0) continue;

        recordsToInsert.push({
          employee_id: leaveRequest.employee_id,
          absence_date: dateStr,
          absence_code_id: leaveRequest.absence_code_id,
          absence_minutes: isHours ? scheduledMin : null,
          absence_days: !isHours ? 1 : null,
          year: Number(dateStr.split("-")[0]),
        });
      }

      // 5. Batch insert all year_calendar entries at once (atomic)
      let insertedCount = 0;
      if (recordsToInsert.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
          .from("year_calendar")
          .insert(recordsToInsert)
          .select("id");

        if (insertError) {
          return NextResponse.json(
            { error: `Failed to create calendar entries: ${insertError.message}` },
            { status: 500 }
          );
        }
        insertedCount = insertedData?.length || recordsToInsert.length;
      }

      // 6. Update the leave request status
      const { error: updateError } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          approved_by: approved_by || null,
          approved_at: new Date().toISOString(),
          total_days: insertedCount,
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, days_inserted: insertedCount });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[API /leave-requests] PATCH error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
