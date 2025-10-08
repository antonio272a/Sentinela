import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "sentinela-session";
export const DEFAULT_EXPIRATION = 60 * 60 * 24 * 7; // 7 dias

const secret = process.env.AUTH_SECRET ?? "sentinela-development-secret";
const secretKey = new TextEncoder().encode(secret);

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(DEFAULT_EXPIRATION)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    return null;
  }
}
