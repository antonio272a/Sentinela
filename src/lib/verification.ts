export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_RESEND_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos

export function generateVerificationCode(): string {
  const min = 10 ** (VERIFICATION_CODE_LENGTH - 1);
  const max = 10 ** VERIFICATION_CODE_LENGTH;
  const code = Math.floor(Math.random() * (max - min)) + min;
  return String(code).padStart(VERIFICATION_CODE_LENGTH, "0");
}

export function calculateResendAvailableAt(sentAtISO: string): string {
  const sentAt = new Date(sentAtISO);
  if (Number.isNaN(sentAt.getTime())) {
    return new Date(Date.now() + VERIFICATION_RESEND_INTERVAL_MS).toISOString();
  }

  return new Date(sentAt.getTime() + VERIFICATION_RESEND_INTERVAL_MS).toISOString();
}

export function canResendVerification(
  sentAtISO: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!sentAtISO) {
    return true;
  }

  const sentAt = new Date(sentAtISO);
  if (Number.isNaN(sentAt.getTime())) {
    return true;
  }

  return now.getTime() - sentAt.getTime() >= VERIFICATION_RESEND_INTERVAL_MS;
}
