"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, User, LogOut, Menu } from "lucide-react";
import { AppNotification, SessionUser } from "@/types";
import { useSidebar } from "@/components/SidebarContext";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Overview", subtitle: "Your workspace at a glance" },
  "/dashboard/forms": { title: "My Forms", subtitle: "Manage all your form schemas" },
  "/dashboard/submissions": { title: "Submissions", subtitle: "Browse and analyze collected data" },
  "/dashboard/users": { title: "Users", subtitle: "Create users and control their permissions" },
  "/form-builder": { title: "Form Builder", subtitle: "Design a new dynamic form" },
};

interface SearchResult {
  id: string;
  type: "form" | "submission";
  title: string;
  subtitle: string;
  href: string;
}

export default function TopBar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const page = pageTitles[pathname] || { title: "FormCraft", subtitle: "" };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const { toggle } = useSidebar();

  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const notifyWrapRef = useRef<HTMLDivElement | null>(null);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) setSearchOpen(false);
      if (notifyWrapRef.current && !notifyWrapRef.current.contains(target)) setNotificationOpen(false);
      if (menuWrapRef.current && !menuWrapRef.current.contains(target)) setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search.trim())}`);
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data);
        }
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [search]);

  const loadNotifications = async () => {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    const json = await res.json();
    if (json.success) {
      setNotifications(json.data.items);
      setUnreadCount(json.data.unreadCount);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    await loadNotifications();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = useMemo(() => user.email.slice(0, 1).toUpperCase(), [user.email]);

  return (
    <header
      className="fixed top-0 right-0 left-0 md:left-[240px] z-30 flex items-center justify-between px-3 md:px-6 py-4"
      style={{
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        height: "65px",
      }}
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)" }}
          onClick={toggle}
          aria-label="Open sidebar"
        >
          <Menu size={16} style={{ color: "var(--text-secondary)" }} />
        </button>
        <div className="min-w-0">
          <h1
            className="font-semibold text-sm md:text-base leading-tight truncate"
            style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}
          >
            {page.title}
          </h1>
          <p className="hidden md:block text-xs" style={{ color: "var(--text-muted)" }}>
            {page.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden md:flex flex-col items-end" style={{ fontFamily: "'DM Mono', monospace" }}>
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {timeStr}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
            {dateStr}
          </span>
        </div>

        <div className="hidden md:block w-px h-6 mx-1" style={{ background: "var(--border)" }} />

        <div className="relative" ref={searchWrapRef}>
          <button
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg text-xs transition-all duration-200 hover:border-opacity-60"
            style={{
              background: "var(--surface-overlay)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Open search"
          >
            <Search size={13} />
            <span className="hidden md:inline" style={{ fontFamily: "'DM Mono', monospace" }}>
              {search || "Search..."}
            </span>
            <span
              className="hidden md:inline-flex px-1.5 py-0.5 rounded text-xs"
              style={{ background: "var(--border)", color: "var(--text-muted)", fontSize: "0.6rem" }}
            >
              Ctrl+K
            </span>
          </button>

          {searchOpen && (
            <div
              className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-96 rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="p-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <input
                  ref={searchInputRef}
                  className="form-input text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search forms and submissions"
                />
              </div>
              <div className="max-h-72 overflow-auto">
                {searching ? (
                  <div className="p-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    No results
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.href}
                      className="block p-3 transition-colors hover:bg-white/5"
                      onClick={() => setSearchOpen(false)}
                    >
                      <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {result.title}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {result.subtitle}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={notifyWrapRef}>
          <button
            onClick={() => {
              setNotificationOpen((prev) => !prev);
              loadNotifications();
            }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)" }}
          >
            <Bell size={14} style={{ color: "var(--text-secondary)" }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center"
                style={{ background: "var(--accent)", color: "white" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div
              className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-80 rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="p-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Notifications
                </span>
                <button className="text-xs" style={{ color: "var(--accent-soft)" }} onClick={markAllRead}>
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item._id}
                      href={item.link || "#"}
                      className="block p-3 transition-colors hover:bg-white/5"
                      onClick={async () => {
                        if (!item.isRead) {
                          await fetch("/api/notifications", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: item._id }),
                          });
                          await loadNotifications();
                        }
                        setNotificationOpen(false);
                      }}
                    >
                      <div className="text-sm flex items-center justify-between" style={{ color: "var(--text-primary)" }}>
                        <span>{item.title}</span>
                        {!item.isRead && <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {item.message}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuWrapRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs"
            style={{
              background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,217,126,0.3))",
              border: "1px solid rgba(108, 99, 255, 0.4)",
              color: "var(--accent-soft)",
            }}
            title={user.email}
          >
            {initials || <User size={14} />}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-64 rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="p-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Signed in as
                </p>
                <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {user.email}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--accent-soft)", textTransform: "uppercase" }}>
                  {user.role.replace("_", " ")}
                </p>
              </div>
              <button
                className="w-full p-3 text-sm flex items-center gap-2 transition-colors hover:bg-white/5"
                style={{ color: "#FF4D6A" }}
                onClick={handleLogout}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
