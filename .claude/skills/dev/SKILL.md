---
name: dev
description: Uruchamia srodowisko developerskie (Docker + Next.js)
argument-hint: "<up|down|restart|logs>"
---

Zarzadzaj srodowiskiem developerskim. Akcja: $ARGUMENTS (domyslnie: up)

1. **up** (domyslna):
   - Sprawdz czy Docker Desktop jest uruchomiony
   - `docker compose up -d` (PostgreSQL)
   - Poczekaj na gotowsc bazy (healthcheck)
   - `npm run dev` (Next.js dev server)
   - Pokaz uzytkownikowi URLe: http://localhost:3000 (app), Drizzle Studio

2. **down**:
   - Zatrzymaj Next.js dev server jesli dziala
   - `docker compose down`

3. **restart**:
   - `docker compose restart`
   - Poinformuj o statusie

4. **logs**:
   - `docker compose logs --tail=50`
   - Pokaz ostatnie logi z PostgreSQL

WAZNE: Jesli .env nie istnieje, skopiuj z .env.example i poproś uzytkownika o uzupelnienie wartosci.
