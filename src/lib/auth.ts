import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export type AuthenticatedUser = {
  id: string;
  name: string;
};

function normalizeUserName(value: string | undefined) {
  if (!value) return "Sentinela";
  return value.trim().length > 0 ? value : "Sentinela";
}

export async function getUserFromCookies(): Promise<AuthenticatedUser | null> {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  if (!userId) return null;
  const name = normalizeUserName(store.get("userName")?.value);
  return { id: userId, name };
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getUserFromCookies();
  if (!user) {
    redirect("/");
  }
  return user;
}

export function getUserFromRequest(request: NextRequest): AuthenticatedUser | null {
  const userId = request.cookies.get("userId")?.value;
  if (!userId) return null;
  const name = normalizeUserName(request.cookies.get("userName")?.value);
  return { id: userId, name };
}
