# sales-offer (portfolio demo)

Personalized B2B sales-offer portal built for **Up Hellas**. Prospects open a tokenized link, review a filled PDF brochure, and accept or decline from any device — in Greek or English.

This repository is a **portfolio copy** of that work. Up Hellas branding is kept as shipped. Production Azure/CRM backends are removed and replaced with local fictional fixtures so the experience can be explored safely.

> **Not a production system.** Client data is fictional. Accept/decline never call Up Hellas infrastructure.

## Live demo

After you deploy to Vercel, put the URL here and set `NEXT_PUBLIC_SITE_URL` to match.

- Local: [http://localhost:3000](http://localhost:3000) (English)
- Greek: [http://localhost:3000/el](http://localhost:3000/el)
- Sample offer: `/?offerToken=demo-fitpass`

## What this showcases

- **Next.js App Router + React 19** — RSC offer load, client islands for decisions and PDF viewing
- **End-to-end PDF pipeline** — `pdf-lib` AcroForm fill → `@napi-rs/canvas` + `pdfjs-dist` page rasterization → in-browser `pdf.js` booklet viewer
- **Multi-product catalog** — 11 offer types (employee benefits, merchant network, FlexOne) with product-specific pricing maps
- **Bilingual UX** — English default, Greek under `/el`, Framer Motion transitions, accept confetti / reject “destruction” flow

## Architecture (demo)

```text
Visitor → product gallery (/)
       → /?offerToken=demo-…
       → local fixture JSON
       → offer mapper (same as production)
       → filled PDF + WebP page cache
       → local accept/reject stubs
```

## Run locally

```bash
npm install
cp .env.example .env.local   # optional; defaults to http://localhost:3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pick a product, or jump straight to:

| Token | Product |
|-------|---------|
| `demo-expense` | Up Expense |
| `demo-fitpass` | Fitpass |
| `demo-go-for-eat` | Go For Eat & Gift |
| `demo-cheque-dejeuner` | Chèque Déjeuner |
| `demo-merchant-meal` | Merchant Meal |
| `demo-merchant-non-meal` | Merchant Non-Meal |
| `demo-merchant-fitpass` | Merchant Fitpass |
| `demo-flexone-subscription` | FlexOne Subscription |
| `demo-flexone-commission` | FlexOne Commission |
| `demo-rewards` | Rewards |
| `demo-gift` | Up Gift |

## Deploy (Vercel)

1. Push this repo to your personal GitHub account.
2. Import the project in Vercel (Node.js runtime; no Azure env vars).
3. Set `NEXT_PUBLIC_SITE_URL` to the deployment URL.
4. Deploy. Offer PDFs and fonts are already listed in `next.config.ts` `outputFileTracingIncludes`.

The app stays **noindex** (`robots.ts` + `X-Robots-Tag`) so it does not compete with `offer.uphellas.gr`.

## Attribution

Original product built for Up Hellas. This public demo is for portfolio use with fictional company and contact data only.
