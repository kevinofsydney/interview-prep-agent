import "server-only";

import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE = "ipa_session";
export const ADMIN_COOKIE = "ipa_admin";

export function getAccessPassword() {
  return process.env.APP_ACCESS_PASSWORD || "change-me";
}

export function sessionTokenForPassword(password = getAccessPassword()) {
  return createHash("sha256")
    .update(`interview-prep-agent:${password}`)
    .digest("hex");
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === sessionTokenForPassword();
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("Not authenticated");
  }
}

export async function setAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionTokenForPassword(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  cookieStore.set(ADMIN_COOKIE, randomBytes(16).toString("hex"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ADMIN_COOKIE);
}

