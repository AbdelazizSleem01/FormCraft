"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { APP_PERMISSIONS, Permission, UserRole } from "@/types";

interface UserListItem {
  _id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt?: string;
}

const roles: UserRole[] = ["user", "admin", "super_admin"];

export default function UsersClient() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      } else {
        setError(json.error || "Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const togglePermission = (perm: Permission) => {
    setPermissions((prev) => (prev.includes(perm) ? prev.filter((item) => item !== perm) : [...prev, perm]));
  };

  const toggleEditPermission = (perm: Permission) => {
    setEditPermissions((prev) => (prev.includes(perm) ? prev.filter((item) => item !== perm) : [...prev, perm]));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, permissions }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create user");

      setEmail("");
      setPassword("");
      setRole("user");
      setPermissions([]);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (user: UserListItem) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditPassword("");
    setEditRole(user.role);
    setEditPermissions(user.permissions);
    setEditIsActive(user.isActive);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditEmail("");
    setEditPassword("");
    setEditRole("user");
    setEditPermissions([]);
    setEditIsActive(true);
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;
    setEditSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail,
          password: editPassword || undefined,
          role: editRole,
          permissions: editPermissions,
          isActive: editIsActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user");

      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setEditSubmitting(false);
    }
  };

  const deleteUser = async (user: UserListItem) => {
    if (!confirm(`Delete user ${user.email}?`)) return;

    setError(null);
    try {
      const res = await fetch(`/api/users/${user._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete user");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || "") * -1),
    [users]
  );

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <form
          onSubmit={handleCreate}
          className="xl:col-span-1 rounded-xl p-4 h-fit"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Create User
          </h3>

          <div className="space-y-3">
            <input
              className="form-input"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="form-input"
              type="text"
              placeholder="Temporary password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="space-y-2">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Permissions
              </p>
              <div className="max-h-48 overflow-auto space-y-1">
                {APP_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs" style={{ color: "#FF4D6A" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-muted))",
                color: "white",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>

        <div
          className="xl:col-span-2 rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              User Accounts
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>
              Loading users...
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>
              No users found.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {sortedUsers.map((item) => (
                <div key={item._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {item.email}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>
                        {item.role.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: item.isActive ? "rgba(0,217,126,0.1)" : "rgba(255,77,106,0.1)",
                          color: item.isActive ? "#00D97E" : "#FF4D6A",
                        }}
                      >
                        {item.isActive ? "active" : "inactive"}
                      </span>
                      <button
                        onClick={() => startEdit(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                        title="Edit user"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteUser(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ border: "1px solid var(--border)", color: "#FF4D6A" }}
                        title="Delete user"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.permissions.map((perm) => (
                      <span
                        key={`${item._id}-${perm}`}
                        className="px-2 py-0.5 rounded text-[11px]"
                        style={{ background: "var(--surface-overlay)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <form
            onSubmit={saveEdit}
            className="w-full max-w-lg rounded-xl p-4 space-y-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Edit User
              </h3>
              <button
                type="button"
                onClick={cancelEdit}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                <X size={13} />
              </button>
            </div>

            <input className="form-input" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
            <input
              className="form-input"
              type="text"
              placeholder="New password (optional)"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />

            <select className="form-input" value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)}>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} />
              Active account
            </label>

            <div className="space-y-2">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Permissions
              </p>
              <div className="max-h-40 overflow-auto space-y-1">
                {APP_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <input
                      type="checkbox"
                      checked={editPermissions.includes(perm)}
                      onChange={() => toggleEditPermission(perm)}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs" style={{ color: "#FF4D6A" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={editSubmitting}
              className="w-full py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-muted))",
                color: "white",
                opacity: editSubmitting ? 0.7 : 1,
              }}
            >
              {editSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
