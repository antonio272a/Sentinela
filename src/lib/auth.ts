import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
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

export interface AuthenticatedUser {
  id: string;
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

function sessionToUser(session: SessionPayload | null): AuthenticatedUser | null {
  if (!session) {
    return null;
  }

  return {
    id: session.sub,
    email: session.email,
    name: session.name,
  };
}

function getUserFromHeaderBag(headerBag: Headers): AuthenticatedUser | null {
  const id = headerBag.get("x-user-id");
  const email = headerBag.get("x-user-email");
  const name = headerBag.get("x-user-name");

  if (!id || !email || !name) {
    return null;
  }

  return { id, email, name };
}

async function getUserFromCookiesStore(): Promise<AuthenticatedUser | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await verifySessionToken(sessionToken);
  return sessionToUser(session);
}

export async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  const fromHeaders = getUserFromHeaderBag(request.headers);
  if (fromHeaders) {
    return fromHeaders;
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return null;
  }

  const session = await verifySessionToken(sessionToken);
  return sessionToUser(session);
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const headerStore = headers();
  const fromHeaders = getUserFromHeaderBag(headerStore);

  if (fromHeaders) {
    return fromHeaders;
  }

  const user = await getUserFromCookiesStore();
  if (user) {
    return user;
  }

  redirect("/");
}
