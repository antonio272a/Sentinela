import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_EXPIRATION, SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { getUserByEmail, markUserAsVerified } from "@/lib/db";
import { calculateAgeFromBirthDate } from "@/lib/date";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const email = body?.email?.toLowerCase().trim();
  const code = body?.code?.trim();

  if (!email || !code) {
    return NextResponse.json(
      {
        message: "Informe e-mail e código de verificação válidos.",
      },
      { status: 400 }
    );
  }

  const user = getUserByEmail(email);

  if (!user || user.status !== "pending_verification" || !user.verificationCode) {
    return NextResponse.json(
      {
        message: "Não encontramos uma conta pendente para este e-mail.",
      },
      { status: 404 }
    );
  }

  if (user.verificationCode !== code) {
    return NextResponse.json(
      {
        message: "Código de verificação inválido.",
      },
      { status: 400 }
    );
  }

  const updatedUser = markUserAsVerified(user.id);

  const token = await createSessionToken({
    sub: String(updatedUser.id),
    email: updatedUser.email,
    name: updatedUser.name,
  });

  const age = calculateAgeFromBirthDate(updatedUser.birthDate);

  const response = NextResponse.json({
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      birthDate: updatedUser.birthDate,
      age,
      createdAt: updatedUser.createdAt,
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
