import { redirect } from "next/navigation";
import { SessionUser } from "@/types";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export function requireServerAuth(): SessionUser {
  const user = getCurrentUserFromCookies();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export function requireServerPermission(permission: Parameters<typeof hasPermission>[1]): SessionUser {
  const user = requireServerAuth();
  if (!hasPermission(user, permission)) {
    redirect("/dashboard");
  }
  return user;
}
