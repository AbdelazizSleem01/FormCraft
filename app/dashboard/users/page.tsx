import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";
import { hasPermission } from "@/lib/permissions";
import { requireServerAuth } from "@/lib/server-auth";

export default function UsersPage() {
  const user = requireServerAuth();

  if (!hasPermission(user, "users:manage")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
        >
          Users
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Super admin can create users, set passwords, and assign permissions.
        </p>
      </div>
      <UsersClient />
    </div>
  );
}
