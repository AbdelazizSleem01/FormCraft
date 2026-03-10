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
          className="card bg-base-200 border border-base-300 xl:col-span-1"
        >
          <div className="card-body p-4">
            <h3 className="text-sm font-semibold text-base-content mb-4">
              Create User
            </h3>

            <div className="space-y-3">
              <input
                className="input input-bordered input-sm w-full bg-base-300"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="input input-bordered input-sm w-full bg-base-300"
                type="text"
                placeholder="Temporary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <select className="select select-bordered select-sm w-full bg-base-300" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <div className="space-y-2">
                <p className="text-xs text-neutral-content/60">
                  Permissions
                </p>
                <div className="max-h-48 overflow-auto space-y-1">
                  {APP_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-xs text-neutral-content/80 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn text-white btn-sm w-full bg-primary "
              >
                {submitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </form>

        <div className="card bg-base-200 border border-base-300 xl:col-span-2 overflow-hidden">
          <div className="card-body p-0">
            <div className="p-4 border-b border-base-300">
              <h3 className="text-sm font-semibold text-base-content">
                User Accounts
              </h3>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-neutral-content/60 text-center">
                Loading users...
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className="p-6 text-sm text-neutral-content/60 text-center">
                No users found.
              </div>
            ) : (
              <div className="divide-y divide-neutral-content/10">
                {sortedUsers.map((item) => (
                  <div key={item._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-base-content">
                          {item.email}
                        </p>
                        <p className="text-xs mt-0.5 text-neutral-content/60 capitalize">
                          {item.role.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge ${item.isActive ? 'bg-secondary/10 text-secondary border-secondary/25' : 'bg-error/10 text-error border-error/25'} border text-xs`}
                        >
                          {item.isActive ? "active" : "inactive"}
                        </span>
                        <button
                          onClick={() => startEdit(item)}
                          className="btn btn-ghost btn-xs btn-square"
                          title="Edit user"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteUser(item)}
                          className="btn btn-ghost btn-xs btn-square text-error"
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
                          className="px-2 py-0.5 rounded text-[11px] bg-base-300 border border-base-300 text-neutral-content/60"
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
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={saveEdit}
            className="card bg-base-200 border border-base-300 w-full max-w-lg"
          >
            <div className="card-body p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-base-content">
                  Edit User
                </h3>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-ghost btn-sm btn-square"
                >
                  <X size={13} />
                </button>
              </div>

              <input className="input input-bordered input-sm w-full bg-base-300" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              <input
                className="input input-bordered input-sm w-full bg-base-300"
                type="text"
                placeholder="New password (optional)"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />

              <select className="select select-bordered select-sm w-full bg-base-300" value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)}>
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm text-neutral-content/80 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-xs checkbox-primary"
                  checked={editIsActive} 
                  onChange={(e) => setEditIsActive(e.target.checked)} 
                />
                Active account
              </label>

              <div className="space-y-2">
                <p className="text-xs text-neutral-content/60">
                  Permissions
                </p>
                <div className="max-h-40 overflow-auto space-y-1">
                  {APP_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-xs text-neutral-content/80 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={editPermissions.includes(perm)}
                        onChange={() => toggleEditPermission(perm)}
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={editSubmitting}
                className="btn btn-primary btn-sm w-full"
              >
                {editSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

