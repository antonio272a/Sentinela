import nodemailer from "nodemailer";
import { getEnv, getRequiredEnv } from "./env";
import {
  getOutlookSmtpAccessToken,
  isOutlookOAuthConfigured,
} from "./outlook-oauth";

type AuthStrategy = "password" | "oauth2";

type CachedTransporter = {
  transporter: nodemailer.Transporter;
  sender: string;
  strategy: AuthStrategy;
};

let cachedTransporterPromise: Promise<CachedTransporter> | null = null;

async function createTransporter(): Promise<CachedTransporter> {
  const outlookEmail = getRequiredEnv("OUTLOOK_EMAIL");
  const outlookPassword = getEnv("OUTLOOK_PASSWORD");
  const outlookHost = getEnv("OUTLOOK_SMTP_HOST") ?? "smtp.office365.com";
  const outlookPort = Number.parseInt(getEnv("OUTLOOK_SMTP_PORT") ?? "587", 10);

  const usePasswordAuth = Boolean(outlookPassword);
  const useOAuth = !usePasswordAuth && isOutlookOAuthConfigured();

  if (!usePasswordAuth && !useOAuth) {
    throw new Error(
      "Configure as variáveis de ambiente do Outlook: defina OUTLOOK_PASSWORD ou as variáveis de OAuth2 (OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET e OUTLOOK_TENANT_ID).",
    );
  }

  const transporter = nodemailer.createTransport({
    host: outlookHost,
    port: outlookPort,
    secure: outlookPort === 465,
    auth: usePasswordAuth
      ? {
          user: outlookEmail,
          pass: outlookPassword!,
        }
      : undefined,
  });

  return {
    transporter,
    sender: outlookEmail,
    strategy: usePasswordAuth ? "password" : "oauth2",
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
  const { transporter, sender, strategy } = await resolveTransporter();
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

  if (strategy === "oauth2") {
    const accessToken = await getOutlookSmtpAccessToken();
    mailOptions.auth = {
      type: "OAuth2",
      user: sender,
      accessToken,
    };
  }

  await transporter.sendMail(mailOptions);
}
