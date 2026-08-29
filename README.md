# Apereel

Premium digital growth consultancy website for Apereel — business-first SEO, e-commerce growth, digital advertising, and AI-powered web development.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run build
```

## Contact form

The contact form posts to `/api/contact`.

- If `RESEND_API_KEY` is set, messages are sent with Resend.
- Otherwise, messages are delivered through FormSubmit to `CONTACT_TO_EMAIL` (defaults to the public inquiry email). FormSubmit may send a one-time confirmation email on first use.

## Environment

See `.env.example`. `NEXT_PUBLIC_SITE_URL` should be the canonical production URL.
