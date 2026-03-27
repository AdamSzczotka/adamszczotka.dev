---
name: setup
description: Instalacja i konfiguracja Next.js + calego stacku od zera
---

Zainstaluj i skonfiguruj projekt Next.js z pelnym stackiem. Wykonaj kroki:

1. Zainicjalizuj Next.js z App Router i TypeScript:
   - `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
   - Jesli katalog nie jest pusty, zapytaj uzytkownika.

2. Zainstaluj zaleznosci produkcyjne:
   ```
   npm install drizzle-orm postgres better-auth @tiptap/react @tiptap/starter-kit @tiptap/pm sharp sanitize-html next-themes geist motion
   ```

3. Zainstaluj zaleznosci dev:
   ```
   npm install -D drizzle-kit @types/sanitize-html
   ```

4. Stworz strukture katalogow:
   ```
   src/app/(public)/
   src/app/admin/
   src/app/api/
   src/components/ui/
   src/components/layout/
   src/lib/db/
   src/lib/auth/
   src/lib/utils/
   src/types/
   ```

5. Stworz plik `.env.example` z wymaganymi zmiennymi (BEZ wartosci):
   ```
   DATABASE_URL=
   BETTER_AUTH_SECRET=
   BETTER_AUTH_URL=
   GITHUB_CLIENT_ID=
   GITHUB_CLIENT_SECRET=
   ```

6. Dodaj `.env` do `.gitignore` jesli jeszcze nie ma.

7. Dodaj skrypty do package.json:
   ```json
   "db:generate": "drizzle-kit generate",
   "db:migrate": "drizzle-kit migrate",
   "db:studio": "drizzle-kit studio"
   ```

8. Potwierdz uzytkownikowi co zostalo zainstalowane.

WAZNE: NIE twórz konfiguracji tailwind.config.ts -- Tailwind v4 uzywa globals.css pod @theme.
