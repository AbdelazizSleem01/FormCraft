import { NextRequest, NextResponse } from "next/server";
import { Permission, SessionUser } from "@/types";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export function requireAuth(req: NextRequest): SessionUser | NextResponse {
  const user = getCurrentUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export function requirePermission(user: SessionUser, permission: Permission): NextResponse | null {
  if (!hasPermission(user, permission)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function ownerFilter(user: SessionUser): Record<string, string> {
  if (user.role === "super_admin") return {};
  return { ownerId: user.userId };
}
