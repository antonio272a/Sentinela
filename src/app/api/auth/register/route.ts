import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import { createUser, getUserByEmail } from "@/lib/db";
import { calculateAgeFromBirthDate, normalizeISODateOnly } from "@/lib/date";
import {
  DEFAULT_EXPIRATION,
  SESSION_COOKIE_NAME,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const name = body?.name?.trim();
  const birthDateInput = body?.birthDate;
  const email = body?.email?.toLowerCase().trim();
  const password = body?.password;

  if (!password) {
    return NextResponse.json(
      {
        message: "Informe uma senha válida.",
      },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      {
        message: "A senha deve ter ao menos 8 caracteres.",
      },
      { status: 400 }
    );
  }

  if (!name || !birthDateInput || !email) {
    return NextResponse.json(
      {
        message: "Dados inválidos. Verifique as informações enviadas.",
      },
      { status: 400 }
    );
  }

  const normalizedBirthDate = normalizeISODateOnly(birthDateInput);

  if (!normalizedBirthDate) {
    return NextResponse.json(
      {
        message: "Informe uma data de nascimento válida.",
      },
      { status: 400 }
    );
  }

  const age = calculateAgeFromBirthDate(normalizedBirthDate);

  if (age === null || age < 18) {
    return NextResponse.json(
      {
        message: "Usuários precisam ter ao menos 18 anos.",
      },
      { status: 400 }
    );
  }

  const existingUser = getUserByEmail(email);

  if (existingUser) {
    return NextResponse.json(
      {
        message: "E-mail já cadastrado. Utilize outro endereço ou faça login.",
      },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = createUser({
      name,
      birthDate: normalizedBirthDate,
      email,
      passwordHash,
    });

    const userAge = calculateAgeFromBirthDate(user.birthDate);

    const token = await createSessionToken({
      sub: String(user.id),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
          age: userAge,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );

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
  } catch (error) {
    return NextResponse.json(
      {
        message: "Não foi possível criar a conta no momento.",
      },
      { status: 500 }
    );
  }
}
