# US – Fishing & Huntingshop

> **JAGD · ANGELN · OUTDOOR**
> Ihr Spezialist für Jagd- und Angelausrüstung — Premium Outdoor-Ausrüstung zu fairen Preisen.

**Live:** [https://online-shop-seven-delta.vercel.app](https://online-shop-seven-delta.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | PHP API (web.lweb.ch/shop) |
| AI Chatbot | OpenAI API |
| Payments | Stripe |
| Deployment | Vercel |

---

## Features

- **Shop** — Product catalog with categories, filters and detail pages
- **Cart & Checkout** — Full checkout flow with Stripe payment integration
- **User Accounts** — Registration, login, profile management, order history
- **Invoice PDF** — Download invoices as PDF directly from order history
- **Admin Dashboard** — Product management, order tracking, bulk status updates, Excel import
- **AI Chatbot** — OpenAI-powered customer support assistant
- **Blog** — Articles with image support
- **PWA** — Installable as a progressive web app

---

## Project Structure

```
app/                  # Next.js App Router pages
  page.tsx            # Home
  shop/               # Product catalog
  product/[id]/       # Product detail
  blog/               # Blog
  success / cancel/   # Stripe callbacks
  api/chat/           # OpenAI API route

components/           # Business components
  admin.tsx           # Admin dashboard
  user-profile.tsx    # User profile & orders
  bot.tsx             # AI chatbot

components/ui/        # shadcn/ui primitives (~50 components)
lib/                  # Utilities & API helpers
hooks/                # Custom React hooks
api/                  # PHP backend files
public/               # Static assets
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd hot-sauce-store-main
npm install
```

### Environment Variables

Create a `.env` file:

```env
NEXT_PUBLIC_API_BASE_URL=https://web.lweb.ch/shop
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public
```

### Development

```bash
npm run dev       # http://localhost:3000
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Lint
```

---

## Store Info

**US – Fishing & Huntingshop**
Bahnhofstrasse 2, 9475 Sevelen
📞 078 606 61 05
✉️ info@lweb.ch
# leder-shop
