This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Backend API setup

The frontend API client is in [src/lib/api.js](src/lib/api.js). Set `NEXT_PUBLIC_API_URL` in a local `.env.local` file to your backend's API root (for example, `http://localhost:4000/api`); `.env.example` shows the variable. Restart the Next.js dev server after changing it. The backend must allow requests from the frontend origin and accept bearer tokens for protected requests.

The frontend expects these backend endpoints:

- `POST /auth/register` — JSON `{ username, email, password, role, gender, age }`, where `role` is `PARENT` or `STUDENT`.
- `POST /auth/login` — JSON `{ email, password }`.
- Both auth endpoints return `{ accessToken, user }` (or `{ token, user }`). The token is stored in browser local storage and sent as `Authorization: Bearer <token>`.
- `GET /auth/google?redirect_uri=...&state=...` — start Google OAuth, then redirect to the supplied callback with a one-time `code` and the same `state`.
- `POST /auth/google/exchange` — JSON `{ code, redirectUri }`, returning the same token response as login. The backend must validate the OAuth state and exchange the one-time code.
- `POST /contact` — authenticated JSON `{ name, email, subject, message }`.

The contact form and course WhatsApp action send unauthenticated visitors through login and back to the action. These frontend checks are for user flow only: enforce authentication and authorization on the backend for any protected data or actual purchase operation. For production, an HttpOnly, Secure, SameSite cookie is safer than local storage for access tokens because scripts can read local storage.

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
