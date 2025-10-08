This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Configuração do envio de e-mails

O projeto utiliza o Outlook SMTP para envio de e-mails transacionais. Preencha as variáveis
de ambiente no arquivo `.env` conforme o cenário da sua conta:

- **Autenticação básica habilitada**: informe `OUTLOOK_EMAIL` e `OUTLOOK_PASSWORD` (senha de
  aplicativo). Esse modo só funciona se o recurso estiver disponível na conta.
- **Autenticação básica desabilitada (cenário padrão)**: cadastre um aplicativo no Azure AD,
  conceda a permissão `SMTP.Send` (ou `Mail.Send`) e configure `OUTLOOK_TENANT_ID`,
  `OUTLOOK_CLIENT_ID` e `OUTLOOK_CLIENT_SECRET`. Opcionalmente ajuste
  `OUTLOOK_OAUTH_SCOPE` caso utilize um escopo diferente de
  `https://outlook.office365.com/.default`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# Sentinela"
