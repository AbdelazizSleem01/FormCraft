import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  return NextResponse.json({ success: true, data: user });
}
