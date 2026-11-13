import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Secret mta3 JWT majboud mel .env
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
export const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

// Création mta3 JWT
export async function createSession(userId: number, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies(); // Obligatoire fi Next.js 15
  store.set(COOKIE_NAME, token, {
    httpOnly: true, // Protégé contre XSS
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

// Lecture mta3 l'session
export async function getSession(): Promise<{ userId: number; role: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, secret);
    return { 
      userId: payload.userId as number,
      role: payload.role as string
    };
  } catch {
    return null; // Token expiré wala ghalet
  }
}

// Déconnexion
export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}   