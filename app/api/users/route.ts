import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { NotificationModel, UserModel } from "@/lib/models";
import { defaultAdminPermissions, defaultUserPermissions, hashPassword } from "@/lib/auth";
import { APP_PERMISSIONS, Permission, UserRole } from "@/types";

function normalizePermissions(input: unknown): Permission[] {
  if (!Array.isArray(input)) return [];
  return input.filter((item): item is Permission => APP_PERMISSIONS.includes(item as Permission));
}

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "users:manage");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const query = user.role === "super_admin" ? {} : { createdBy: user.userId };
    const users = await UserModel.find(query)
      .select("email role permissions isActive createdBy createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "users:manage");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const body = await req.json();

    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const role = (body.role || "user") as UserRole;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    if (!["admin", "user"].includes(role) && user.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Only super admin can assign this role" }, { status: 403 });
    }

    if (role === "super_admin" && user.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Only super admin can create super admin users" }, { status: 403 });
    }

    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 });
    }

    let permissions = normalizePermissions(body.permissions);
    if (permissions.length === 0) {
      permissions = role === "admin" ? defaultAdminPermissions : defaultUserPermissions;
    }

    if (role === "super_admin") {
      permissions = defaultAdminPermissions;
    }

    const created = await UserModel.create({
      email,
      passwordHash: hashPassword(password),
      role,
      permissions,
      isActive: true,
      createdBy: user.userId,
    });

    await NotificationModel.create({
      userId: String(created._id),
      title: "Your account is ready",
      message: "An admin created your account. You can log in now.",
      link: "/dashboard",
      isRead: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: String(created._id),
          email: created.email,
          role: created.role,
          permissions: created.permissions,
          isActive: created.isActive,
          createdBy: created.createdBy,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}
