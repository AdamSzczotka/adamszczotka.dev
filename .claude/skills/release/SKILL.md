---
name: release
description: Tworzy nowe wydanie - merguje develop do main i taguje wersje
argument-hint: "<opcjonalny numer wersji np. v1.0.0>"
---

Utwórz nową wersję (release) — zmerguj develop do main i otaguj. Opcjonalny numer wersji: $ARGUMENTS

Wykonaj następujące kroki:

1. Sprawdź czy są niezatwierdzone zmiany — jeśli tak, przerwij i poinformuj użytkownika.

2. Określ numer wersji:
   - Jeśli użytkownik podał numer w argumencie — użyj go.
   - Jeśli nie — sprawdź ostatni tag (`git tag --sort=-v:refname | head -1`) i zaproponuj następny (np. v1.0.0 → v1.1.0).
   - Jeśli nie ma żadnych tagów — zaproponuj v1.0.0.
   - Zapytaj użytkownika o potwierdzenie numeru wersji.

3. Przełącz się na develop i pobierz najnowsze zmiany:
   - `git checkout develop`
   - `git pull origin develop`

4. Przełącz się na main i pobierz najnowsze:
   - `git checkout main`
   - `git pull origin main`

5. Zmerguj develop do main:
   - `git merge --no-ff develop`

6. Utwórz tag z numerem wersji:
   - `git tag -a <wersja> -m "Wydanie <wersja>"`

7. Wypchnij main i tagi na serwer:
   - `git push origin main`
   - `git push origin --tags`

8. Wróć na develop:
   - `git checkout develop`

9. Podsumuj release — pokaż co zostało wydane (lista commitów od ostatniego tagu).

WAŻNE: Komunikaty tagów po polsku. NIE wspominaj o AI/Claude.
