import { getAlltwitts } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const twitts = await getAlltwitts();

  return NextResponse.json(twitts);
}