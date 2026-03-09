import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { Permission, SessionUser } from "@/types";

const SESSION_COOKIE = "fd_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const HASH_KEYLEN = 64;

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || "dev-auth-secret-change-me";
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, HASH_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;
  const hash = crypto.scryptSync(password, salt, HASH_KEYLEN).toString("hex");
  return timingSafeEqual(hash, storedHash);
}

export function createSessionToken(user: SessionUser): string {
  const payload = {
    ...user,
    exp: Date.now() + SESSION_TTL_MS,
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionUser | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  const expected = sign(payloadB64);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as SessionUser & { exp: number };
    if (!payload.exp || payload.exp < Date.now()) return null;

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };
  } catch {
    return null;
  }
}

export function sessionCookieConfig(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export function clearSessionCookieConfig() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function getCurrentUserFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function getCurrentUserFromCookies(): SessionUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export const defaultUserPermissions: Permission[] = [
  "forms:create",
  "forms:read",
  "forms:update",
  "forms:delete",
  "submissions:create",
  "submissions:read",
  "submissions:update",
  "submissions:delete",
  "notifications:read",
];

export const defaultAdminPermissions: Permission[] = [
  ...defaultUserPermissions,
  "users:manage",
];

