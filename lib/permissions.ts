import { Permission, SessionUser } from "@/types";

export function hasPermission(user: SessionUser, permission: Permission): boolean {
  return user.role === "super_admin" || user.permissions.includes(permission);
}
