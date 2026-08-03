import { NextRequest, NextResponse } from "next/server";

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || "WorkDays2026!";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === ACCESS_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("wd_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("wd_auth");
  return response;
}
