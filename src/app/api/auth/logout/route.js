import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("auth-token", "", { expires: new Date(0) });
  return response;
}