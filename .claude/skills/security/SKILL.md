---
name: security
description: Audyt bezpieczenstwa kodu - XSS, CSRF, injection, auth bypass
argument-hint: "<sciezka-do-pliku-lub-katalogu>"
---

Przeprowadz audyt bezpieczenstwa. Cel: $ARGUMENTS (domyslnie caly src/)

Sprawdz nastepujace obszary:

1. **XSS (Cross-Site Scripting)**:
   - Szukaj `dangerouslySetInnerHTML` -- czy dane sa sanityzowane przez `sanitize-html`?
   - Szukaj niesanityzowanych danych z formularzy przed INSERT do bazy
   - Sprawdz czy komentarze przechodza przez sanitize-html przed zapisem

2. **Injection**:
   - Szukaj surowych zapytan SQL (powinny isc przez Drizzle ORM)
   - Sprawdz czy parametry URL/slug sa walidowane

3. **Auth & Session**:
   - Sprawdz czy wszystkie route /admin/* sa chronione middleware
   - Sprawdz czy Better Auth session jest weryfikowana w Server Actions
   - Szukaj route handlers bez sprawdzania autoryzacji

4. **Upload Security**:
   - Sprawdz walidacje MimeType w /api/upload
   - Sprawdz limit rozmiaru pliku (max 5MB)
   - Sprawdz czy sharp przetwarza plik PRZED zapisem

5. **Headers & CSP**:
   - Sprawdz Content-Security-Policy w next.config
   - Sprawdz czy nie ma otwartych CORS

6. **Secrets**:
   - Sprawdz czy .env jest w .gitignore
   - Szukaj hardcodowanych kluczy API, tokenow, hasel w kodzie

Wynik: lista znalezionych problemow z priorytetem (CRITICAL / HIGH / MEDIUM / LOW) i konkretnymi poprawkami.
