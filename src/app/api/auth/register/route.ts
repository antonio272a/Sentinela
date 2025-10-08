import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import { createUser, getUserByEmail, updatePendingUser } from "@/lib/db";
import { calculateAgeFromBirthDate, normalizeISODateOnly } from "@/lib/date";
import { sendVerificationCodeEmail } from "@/lib/email";
import {
  VERIFICATION_RESEND_INTERVAL_MS,
  calculateResendAvailableAt,
  generateVerificationCode,
} from "@/lib/verification";

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

  const verificationCode = generateVerificationCode();
  const sentAt = new Date().toISOString();

  const verificationDetails = {
    email,
    sentAt,
    resendAvailableAt: calculateResendAvailableAt(sentAt),
    resendIntervalMs: VERIFICATION_RESEND_INTERVAL_MS,
  };

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    if (existingUser) {
      if (existingUser.status !== "pending_verification") {
        return NextResponse.json(
          {
            message: "E-mail já cadastrado. Utilize outro endereço ou faça login.",
          },
          { status: 409 }
        );
      }

      const updatedUser = updatePendingUser({
        id: existingUser.id,
        name,
        birthDate: normalizedBirthDate,
        passwordHash,
        verificationCode,
        verificationCodeSentAt: sentAt,
      });

      await sendVerificationCodeEmail({
        to: updatedUser.email,
        name: updatedUser.name,
        code: verificationCode,
      });

      return NextResponse.json({
        message: "Atualizamos seus dados e reenviamos um novo código de verificação.",
        verification: verificationDetails,
      });
    }

    const user = createUser({
      name,
      birthDate: normalizedBirthDate,
      email,
      passwordHash,
      status: "pending_verification",
      verificationCode,
      verificationCodeSentAt: sentAt,
    });

    await sendVerificationCodeEmail({
      to: user.email,
      name: user.name,
      code: verificationCode,
    });

    return NextResponse.json(
      {
        message: "Enviamos um código de verificação para o seu e-mail. Informe-o para finalizar o cadastro.",
        verification: verificationDetails,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Não foi possível enviar o código de verificação. Tente novamente em instantes.",
      },
      { status: 500 }
    );
  }
}
