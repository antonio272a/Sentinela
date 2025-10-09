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

O projeto utiliza o SMTP do Gmail com uma senha de aplicativo para o envio de e-mails.
Preencha as variáveis de ambiente no arquivo `.env` com as credenciais da conta:

- `GMAIL_SMTP_USERNAME`: o endereço de e-mail da conta Gmail que enviará as mensagens.
- `GMAIL_APP_PASSWORD`: a senha de aplicativo gerada nas configurações de segurança da conta.
- `GMAIL_FROM_EMAIL`: o endereço que será exibido como remetente (geralmente o mesmo da conta).

> 💡 Gere a senha de aplicativo acessando "Segurança" > "Senhas de app" na sua conta
> Google. Anote-a em local seguro, pois ela concede acesso direto ao envio de e-mails.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# Sentinela"
