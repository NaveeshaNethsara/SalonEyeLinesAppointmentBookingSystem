import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const AUTH_SECRET = process.env.AUTH_SECRET || "salon-eyelines-luxury-auth-secret-key-2026";
export const AUTH_COOKIE_NAME = "salon_eyelines_admin_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp: number; // expiration timestamp in ms
}

/**
 * Hash password with cryptographically secure random salt and scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

/**
 * Verify password against stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}

/**
 * Sign session token with HMAC SHA-256
 */
export function signSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days session
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verify session token and extract payload
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(data)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    );

    if (payload.exp < Date.now()) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Server-side helper to get authenticated user from incoming request or cookies
 */
/**
 * Server-side helper to get authenticated user from incoming request or cookies.
 * Uses cryptographically verified HMAC session token with fast-path fallback
 * so admin page never hangs on remote database latency.
 */
export async function getAuthenticatedUser(req?: Request) {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // Cookies not accessible in current context
    }
  }

  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  // Cryptographically verified user directly from HMAC token
  const sessionUser = {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    createdAt: new Date(payload.exp - 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  try {
    const dbPromise = prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1000)
    );
    const user = await Promise.race([dbPromise, timeoutPromise]);
    return user || sessionUser;
  } catch {
    return sessionUser;
  }
}

