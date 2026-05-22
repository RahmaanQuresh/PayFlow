import { setCsrfCookie, getCsrfHeaderName } from "@/lib/auth/csrf";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await setCsrfCookie();
  return NextResponse.json({ token, headerName: getCsrfHeaderName() });
}
