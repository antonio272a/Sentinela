import nodemailer from "nodemailer";
import { getEnv, getRequiredEnv } from "./env";

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedSender: string | null = null;

function resolveTransporter() {
  if (cachedTransporter && cachedSender) {
    return { transporter: cachedTransporter, sender: cachedSender };
  }

  const outlookEmail = getRequiredEnv("OUTLOOK_EMAIL");
  const outlookPassword = getRequiredEnv("OUTLOOK_PASSWORD");
  const outlookHost = getEnv("OUTLOOK_SMTP_HOST") ?? "smtp.office365.com";
  const outlookPort = Number.parseInt(getEnv("OUTLOOK_SMTP_PORT") ?? "587", 10);

  cachedTransporter = nodemailer.createTransport({
    host: outlookHost,
    port: outlookPort,
    secure: outlookPort === 465,
    auth: {
      user: outlookEmail,
      pass: outlookPassword,
    },
  });

  cachedSender = outlookEmail;

  return { transporter: cachedTransporter, sender: cachedSender };
}

export async function sendVerificationCodeEmail(params: {
  to: string;
  name: string;
  code: string;
}): Promise<void> {
  const { transporter, sender } = resolveTransporter();
  const { to, name, code } = params;

  await transporter.sendMail({
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
  });
}
