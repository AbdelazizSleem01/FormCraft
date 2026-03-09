import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function isDirectImageUrl(url: string): boolean {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return /\.(png|jpe?g|gif|webp|svg|ico|avif)$/i.test(u.pathname);
  } catch {
    return false;
  }
}

export function getLogoUrl(domain: string): string {
  return `https://${domain}/favicon.ico`;
}

export function getFaviconUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
