import "dotenv/config";

function formatEnvError(name: string): string {
  return `A variável de ambiente ${name} é obrigatória. Defina-a no arquivo .env.`;
}

export function getEnv(name: string): string | undefined {
  return process.env[name];
}

export function getRequiredEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(formatEnvError(name));
  }

  return value;
}
