import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE, ROLES } from "@/config/constants";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret());
}

export async function verifyToken(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}

export async function auth() {
  return getSession();
}

export function buildSessionPayload(user) {
  return {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function getSessionCookieConfig(token) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isManagerOrAbove(role) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

export function canUserWrite(role) {
  return isManagerOrAbove(role);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
