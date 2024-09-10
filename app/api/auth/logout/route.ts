import { signOut } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL('/', request.url));
}