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
          isOpen ? "translate-x-0" : "-translate-x-full",
          "bg-base-200 border-r border-base-300"
        )}
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
            <div className="font-display font-700 text-sm tracking-tight text-base-content">
              FormCraft
            </div>
            <div className="text-xs text-neutral-content/60 font-mono">
              v2.0
            </div>
          </div>
          <button
            className="ml-auto md:hidden btn btn-ghost btn-sm btn-square"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-content/60 font-mono">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active 
                    ? "bg-primary/15 text-base-content border border-primary" 
                    : "hover:bg-base-300 text-neutral-content/60 hover:text-base-content"
                )}
              >
                <Icon size={16} className={active ? "text-primary" : ""} />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-base-300 border border-base-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs font-medium text-secondary font-mono">
              {user.email}
            </span>
          </div>
          <p className="text-xs text-neutral-content/60 capitalize">
            {user.role.replace("_", " ")} account
          </p>
        </div>
      </aside>
    </>
  );
}

