# adamszczotka.dev

Portfolio + autorski Headless CMS. Premiera: 14 kwietnia 2026.

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Style:** Tailwind CSS v4 (config w `globals.css` pod `@theme`, NIE w `tailwind.config.ts`) + `next-themes` + `@tailwindcss/typography`
- **DB:** PostgreSQL (Docker) + Drizzle ORM
- **Auth:** Better Auth (GitHub OAuth, natywny adapter Drizzle)
- **Editor:** TipTap (czysty HTML do bazy)
- **Obrazy:** Sharp (AVIF/WebP, server-side)
- **Fonty:** Geist Sans (body) + JetBrains Mono (kod/tagi)

## Komendy

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run db:generate  # Drizzle: generuj migracje
npm run db:migrate   # Drizzle: uruchom migracje
npm run db:studio    # Drizzle Studio (GUI)
docker compose up -d # PostgreSQL + dev env
```

## Konwencje

- Commity po angielsku, bez wzmianek o AI/Claude
- Git flow: main -> develop -> feature/xxx
- Pliki wrażliwe (.env) NIGDY do repo -- tylko .env.example
- Server Components domyślnie, "use client" tylko gdy konieczne
- Walidacja danych na serwerze (sanitize-html dla komentarzy)
- Zero emotikon w UI. Zero AI gradientów. Styl: Linear / Vercel

## Design System

- Dark: `bg-neutral-950` / `text-neutral-200` / `border-neutral-800`
- Light: `bg-neutral-50` / `text-neutral-900` / `border-neutral-200`
- Akcent: jeden zgaszony kolor (niebieski/fiolet) -- tylko CTA i hovery
- Ostre krawędzie (`rounded-none` lub `rounded-sm`), duzo whitespace
- Tech loga: grayscale + opacity-50, hover: pelen kolor

## Struktura katalogowa

```
src/
  app/                  # Next.js App Router
    (public)/           # Strefa publiczna (/, /projects, /blog)
    admin/              # Panel admina (chroniony)
    api/                # Route handlers
  components/           # Komponenty UI
    ui/                 # Bazowe (Button, Card, Input)
    layout/             # Layout (Nav, Footer, ThemeToggle)
  lib/                  # Logika biznesowa
    db/                 # Drizzle schema + konfiguracja
    auth/               # Better Auth config
    utils/              # Helpery
  types/                # TypeScript types
```

## Bezpieczenstwo

- XSS: sanitize-html z restrykcyjnymi regulami przed INSERT
- Upload: sprawdzaj MimeType + limit 5MB przed sharp
- CSP headers w next.config
- Middleware: Better Auth sprawdza sesje na /admin/*
