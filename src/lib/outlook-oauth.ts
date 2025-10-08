import { getEnv, getRequiredEnv } from "./env";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;
let pendingTokenPromise: Promise<string> | null = null;

export function isOutlookOAuthConfigured(): boolean {
  return (
    Boolean(getEnv("OUTLOOK_CLIENT_ID")) &&
    Boolean(getEnv("OUTLOOK_CLIENT_SECRET")) &&
    Boolean(getEnv("OUTLOOK_TENANT_ID"))
  );
}

function getOAuthScope(): string {
  return getEnv("OUTLOOK_OAUTH_SCOPE") ?? "https://outlook.office365.com/.default";
}

async function requestNewToken(): Promise<string> {
  const tenantId = getRequiredEnv("OUTLOOK_TENANT_ID");
  const clientId = getRequiredEnv("OUTLOOK_CLIENT_ID");
  const clientSecret = getRequiredEnv("OUTLOOK_CLIENT_SECRET");
  const scope = getOAuthScope();

  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorBody = await response.json();
      const description =
        typeof errorBody?.error_description === "string"
          ? errorBody.error_description
          : undefined;
      const error = typeof errorBody?.error === "string" ? errorBody.error : undefined;
      errorMessage = description ?? error ?? response.statusText;
    } catch (error) {
      const fallback = await response.text();
      errorMessage = fallback || (error instanceof Error ? error.message : "Erro desconhecido");
    }

    throw new Error(
      `Não foi possível obter um token OAuth2 para o Outlook. Detalhes: ${errorMessage}.`,
    );
  }

  const payload: unknown = await response.json();
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("access_token" in payload) ||
    typeof (payload as { access_token: unknown }).access_token !== "string"
  ) {
    throw new Error("A resposta do provedor OAuth2 do Outlook não contém um access_token válido.");
  }

  const { access_token: accessToken } = payload as { access_token: string; expires_in?: unknown };
  let expiresInSeconds = 3600;

  if ("expires_in" in (payload as Record<string, unknown>)) {
    const rawExpiresIn = (payload as { expires_in?: unknown }).expires_in;
    if (typeof rawExpiresIn === "number") {
      expiresInSeconds = rawExpiresIn;
    } else if (typeof rawExpiresIn === "string") {
      const parsed = Number.parseInt(rawExpiresIn, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        expiresInSeconds = parsed;
      }
    }
  }

  const safeExpiresIn = Math.max(expiresInSeconds - 60, 60);
  cachedToken = {
    accessToken,
    expiresAt: Date.now() + safeExpiresIn * 1000,
  };

  return accessToken;
}

export async function getOutlookSmtpAccessToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < cachedToken.expiresAt) {
    return cachedToken.accessToken;
  }

  if (pendingTokenPromise) {
    return pendingTokenPromise;
  }

  pendingTokenPromise = requestNewToken();

  try {
    const accessToken = await pendingTokenPromise;
    return accessToken;
  } finally {
    pendingTokenPromise = null;
  }
}
