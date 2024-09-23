import { updateSession } from "@/app/lib/actions";
import { auth, unstable_update } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const s = await unstable_update({
      user: data
    })
    return NextResponse.json({
      message: 'session updated'
    });
  } catch (err: any) {
    return NextResponse.json({
      message: err.message
    });
  }
}