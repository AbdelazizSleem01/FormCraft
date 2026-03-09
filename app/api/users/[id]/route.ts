import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { defaultAdminPermissions, defaultUserPermissions, hashPassword } from "@/lib/auth";
import { APP_PERMISSIONS, Permission, UserRole } from "@/types";

function normalizePermissions(input: unknown): Permission[] {
  if (!Array.isArray(input)) return [];
  return input.filter((item): item is Permission => APP_PERMISSIONS.includes(item as Permission));
}

function canManageTarget(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === "super_admin") return true;
  if (targetRole === "super_admin") return false;
  return true;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "users:manage");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const body = await req.json();

    const target = await UserModel.findById(params.id);
    if (!target) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (!canManageTarget(user.role, target.role)) {
      return NextResponse.json({ success: false, error: "You cannot edit this user" }, { status: 403 });
    }

    if (user.role !== "super_admin" && target.createdBy !== user.userId) {
      return NextResponse.json({ success: false, error: "You cannot edit this user" }, { status: 403 });
    }

    const email = body.email ? String(body.email).toLowerCase().trim() : target.email;
    const role = (body.role || target.role) as UserRole;
    const isActive = typeof body.isActive === "boolean" ? body.isActive : target.isActive;

    if (role === "super_admin" && user.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Only super admin can assign this role" }, { status: 403 });
    }

    const exists = await UserModel.findOne({ email, _id: { $ne: target._id } }).lean();
    if (exists) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 });
    }

    let permissions = normalizePermissions(body.permissions);
    if (permissions.length === 0) {
      permissions = role === "admin" ? defaultAdminPermissions : defaultUserPermissions;
    }

    target.email = email;
    target.role = role;
    target.permissions = permissions;
    target.isActive = isActive;

    if (body.password) {
      target.passwordHash = hashPassword(String(body.password));
    }

    await target.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: String(target._id),
        email: target.email,
        role: target.role,
        permissions: target.permissions,
        isActive: target.isActive,
        createdBy: target.createdBy,
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
      },
    });
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "users:manage");
  if (forbidden) return forbidden;

  try {
    await connectDB();

    if (params.id === user.userId) {
      return NextResponse.json({ success: false, error: "You cannot delete your own account" }, { status: 400 });
    }

    const target = await UserModel.findById(params.id);
    if (!target) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (!canManageTarget(user.role, target.role)) {
      return NextResponse.json({ success: false, error: "You cannot delete this user" }, { status: 403 });
    }

    if (user.role !== "super_admin" && target.createdBy !== user.userId) {
      return NextResponse.json({ success: false, error: "You cannot delete this user" }, { status: 403 });
    }

    await target.deleteOne();

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}
