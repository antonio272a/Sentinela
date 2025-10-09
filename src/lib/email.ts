import nodemailer from "nodemailer";
import { getRequiredEnv } from "./env";

type CachedTransporter = {
  transporter: nodemailer.Transporter;
  sender: string;
};

let cachedTransporterPromise: Promise<CachedTransporter> | null = null;

async function createTransporter(): Promise<CachedTransporter> {
  const senderEmail = getRequiredEnv("GMAIL_USER");
  const appPassword = getRequiredEnv("GMAIL_APP_PASSWORD");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: appPassword,
    },
  });

  return {
    transporter,
    sender: senderEmail,
  };
}

async function resolveTransporter(): Promise<CachedTransporter> {
  if (!cachedTransporterPromise) {
    cachedTransporterPromise = createTransporter();
  }

  return cachedTransporterPromise;
}

export async function sendVerificationCodeEmail(params: {
  to: string;
  name: string;
  code: string;
}): Promise<void> {
  const { transporter, sender } = await resolveTransporter();
  const { to, name, code } = params;

  const mailOptions: nodemailer.SendMailOptions = {
    from: {
      name: "Sentinela",
      address: sender,
    },
    to,
    subject: "Código de verificação — Sentinela",
    text: `Olá, ${name}!\n\nUse o código ${code} para confirmar seu cadastro no Sentinela.\n\nSe você não solicitou esta conta, ignore este e-mail.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #0f172a;">
        <p>Olá, <strong>${name}</strong>!</p>
        <p>
          Use o código abaixo para confirmar seu cadastro no <strong>Sentinela</strong>.
        </p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
          ${code}
        </p>
        <p>Se você não solicitou esta conta, ignore esta mensagem.</p>
        <p style="margin-top: 32px; font-size: 12px; color: #64748b;">Este código expira em alguns minutos.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erro ao enviar e-mail de verificação:", error);
    throw error;
  }
}
