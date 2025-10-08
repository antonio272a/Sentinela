import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import { createUser, getUserByEmail } from "@/lib/db";
import {
  DEFAULT_EXPIRATION,
  SESSION_COOKIE_NAME,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const name = body?.name?.trim();
  const age = Number.parseInt(body?.age, 10);
  const email = body?.email?.toLowerCase().trim();
  const password = body?.password;

  if (!name || Number.isNaN(age) || age < 18 || !email || !password || password.length < 8) {
    return NextResponse.json(
      {
        message: "Dados inválidos. Verifique as informações enviadas.",
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
      age,
      email,
      passwordHash,
    });

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
          age: user.age,
          email: user.email,
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
