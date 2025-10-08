import { NextRequest, NextResponse } from "next/server";

import { getUserByEmail, refreshVerificationCode } from "@/lib/db";
import { sendVerificationCodeEmail } from "@/lib/email";
import {
  VERIFICATION_RESEND_INTERVAL_MS,
  calculateResendAvailableAt,
  canResendVerification,
  generateVerificationCode,
} from "@/lib/verification";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      {
        message: "Informe um e-mail válido.",
      },
      { status: 400 }
    );
  }

  const user = getUserByEmail(email);

  if (!user || user.status !== "pending_verification") {
    return NextResponse.json(
      {
        message: "Não encontramos uma conta pendente para este e-mail.",
      },
      { status: 404 }
    );
  }

  if (!canResendVerification(user.verificationCodeSentAt)) {
    const resendAvailableAt = user.verificationCodeSentAt
      ? calculateResendAvailableAt(user.verificationCodeSentAt)
      : calculateResendAvailableAt(new Date().toISOString());

    return NextResponse.json(
      {
        message: "O código só pode ser reenviado após aguardar 2 minutos.",
        verification: {
          email,
          sentAt: user.verificationCodeSentAt,
          resendAvailableAt,
          resendIntervalMs: VERIFICATION_RESEND_INTERVAL_MS,
        },
      },
      { status: 429 }
    );
  }

  const verificationCode = generateVerificationCode();
  const sentAt = new Date().toISOString();

  try {
    const updatedUser = refreshVerificationCode({
      id: user.id,
      verificationCode,
      verificationCodeSentAt: sentAt,
    });

    await sendVerificationCodeEmail({
      to: updatedUser.email,
      name: updatedUser.name,
      code: verificationCode,
    });

    return NextResponse.json({
      message: "Enviamos um novo código de verificação para o seu e-mail.",
      verification: {
        email,
        sentAt,
        resendAvailableAt: calculateResendAvailableAt(sentAt),
        resendIntervalMs: VERIFICATION_RESEND_INTERVAL_MS,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Não foi possível enviar o novo código agora. Tente novamente em instantes.",
      },
      { status: 500 }
    );
  }
}
