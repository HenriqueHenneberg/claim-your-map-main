import crypto from "node:crypto";
import { cookies } from "next/headers";
import { timingSafeEqualString } from "@/lib/security";

export const ADMIN_COOKIE_NAME = "cot_admin_session";

function adminSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 24) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be configured in production.");
  }
  return "dev-admin-session-secret-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", adminSecret()).update(value).digest("hex");
}

export function createAdminSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", iat: Date.now() }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!timingSafeEqualString(signature, sign(payload))) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      role?: string;
      iat?: number;
    };
    const maxAgeMs = 1000 * 60 * 60 * 12;
    return data.role === "admin" && typeof data.iat === "number" && Date.now() - data.iat < maxAgeMs;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqualString(password, expected);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
