export const runtime = "nodejs";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import { getUserByEmail } from "@/lib/db";
import { calculateAgeFromBirthDate } from "@/lib/date";
import { DEFAULT_EXPIRATION, SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const email = body?.email?.toLowerCase().trim();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json(
      {
        message: "Informe e-mail e senha válidos.",
      },
      { status: 400 }
    );
  }

  const user = getUserByEmail(email);

  if (!user) {
    return NextResponse.json(
      {
        message: "Credenciais inválidas.",
      },
      { status: 401 }
    );
  }

  if (user.status !== "active") {
    return NextResponse.json(
      {
        message: "Confirme seu e-mail antes de acessar o Sentinela.",
      },
      { status: 403 }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return NextResponse.json(
      {
        message: "Credenciais inválidas.",
      },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    sub: String(user.id),
    email: user.email,
    name: user.name,
  });

  const age = calculateAgeFromBirthDate(user.birthDate);

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
      age,
      createdAt: user.createdAt,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEFAULT_EXPIRATION,
  });

  return response;
}
