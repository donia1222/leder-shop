# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Core Development:**
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting

**No test setup is currently configured in this project.**

## Project Architecture

**Tech Stack:**
- Next.js 15.2.4 with App Router
- React 19 + TypeScript 5
- Tailwind CSS + shadcn/ui component library
- External PHP API integration (web.lweb.ch/shop)
- OpenAI API integration for chatbot functionality

**Key Directories:**
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (business logic)
- `components/ui/` - shadcn/ui component library (~50 components)
- `api/` - External PHP API files for order processing and email
- `lib/` - Utility functions and API integration helpers
- `hooks/` - Custom React hooks

**Component Architecture:**
- Business components built on shadcn/ui primitives
- All client components use `"use client"` directive
- TypeScript with path aliases (`@/components`, `@/lib`, etc.)
- Form handling with React Hook Form + Zod validation

**Data Flow:**
- Client-side state management with React hooks
- External PHP API at `web.lweb.ch/shop` for product data and orders
- Next.js API routes (`app/api/chat/`) for OpenAI integration
- Mixed architecture: Next.js frontend + PHP backend services

**Key Features:**
- E-commerce: Product catalog, shopping cart, checkout with Stripe-like flow
- Admin dashboard: Product management, order tracking (`components/admin.tsx`)
- AI chatbot: OpenAI-powered customer support (`components/bot.tsx`)
- User authentication: Admin auth system (`components/admin-auth.tsx`)
- German branding: "FEUER KÖNIGREICH" premium hot sauce store

**External Dependencies:**
- All UI components use Radix UI primitives
- OpenAI API key required for chatbot functionality
- PHP backend handles order processing and email confirmations
- Environment variables stored in `.env` file

**Component Patterns:**
- Use existing shadcn/ui components before creating custom ones
- Follow Tailwind utility-first styling approach
- Maintain consistent error handling with toast notifications (Sonner)
- All forms use React Hook Form with Zod schemas for validation
EOF < /dev/null