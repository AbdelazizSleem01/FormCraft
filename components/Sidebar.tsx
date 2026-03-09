"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  PlusSquare,
  Database,
  Layers,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/types";
import { hasPermission } from "@/lib/permissions";
import Image from "next/image";
import { useSidebar } from "@/components/SidebarContext";

const baseNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/form-builder", label: "Form Builder", icon: PlusSquare },
  { href: "/dashboard/submissions", label: "Submissions", icon: Database },
  { href: "/dashboard/forms", label: "My Forms", icon: Layers },
];

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();

  const navItems = [...baseNavItems];
  if (hasPermission(user, "users:manage")) {
    navItems.push({ href: "/dashboard/users", label: "Users", icon: Users });
  }

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-60 flex flex-col z-50 transition-transform duration-300 ease-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
      >
      <div className="flex items-center gap-2 px-6 py-5 mb-2">
        <div className="relative w-18 h-18 rounded-lg flex items-center justify-center overflow-hidden">
          <Image 
            src="/Solo-Logo.png" 
            alt="FormCraft" 
            width={45}
            height={45}
            className="rounded-lg w-auto h-auto"
            priority
          />
        </div>
        <div>
          <div
            className="font-display font-700 text-sm tracking-tight"
            style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
          >
            FormCraft
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
            v2.0
          </div>
        </div>
        <button
          className="ml-auto md:hidden rounded-lg p-1.5"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-6 mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem" }}
        >
          Navigation
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                active ? "text-white" : "hover:text-white"
              )}
              style={{
                background: active ? "rgba(108, 99, 255, 0.15)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                border: active ? "1px solid rgba(108, 99, 255, 0.25)" : "1px solid transparent",
              }}
            >
              <Icon size={16} className="transition-colors duration-200" style={{ color: active ? "var(--accent-soft)" : "inherit" }} />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-3 rounded-xl" style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--jade)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--jade)", fontFamily: "'DM Mono', monospace" }}>
            {user.email}
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>
          {user.role.replace("_", " ")} account
        </p>
      </div>
      </aside>
    </>
  );
}
