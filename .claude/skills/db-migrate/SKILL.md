---
name: db-migrate
description: Generuje i uruchamia migracje Drizzle ORM
argument-hint: "<generate|migrate|studio|status>"
---

Zarzadzaj migracjami bazy danych Drizzle ORM. Argument: $ARGUMENTS

Dostepne akcje:

1. **generate** (domyslna jesli brak argumentu):
   - Przeczytaj aktualny schemat z `src/lib/db/schema.ts`
   - Uruchom `npm run db:generate`
   - Pokaz uzytkownikowi wygenerowane pliki migracji

2. **migrate**:
   - Sprawdz czy Docker z PostgreSQL dziala (`docker compose ps`)
   - Uruchom `npm run db:migrate`
   - Pokaz wynik migracji

3. **studio**:
   - Uruchom `npm run db:studio`
   - Poinformuj uzytkownika ze Drizzle Studio jest dostepne

4. **status**:
   - Pokaz aktualny schemat z `src/lib/db/schema.ts`
   - Pokaz liste istniejacych migracji z `drizzle/`
   - Porownaj z baza danych

WAZNE: Zawsze sprawdz czy DATABASE_URL jest ustawiony w .env przed uruchomieniem migracji.
