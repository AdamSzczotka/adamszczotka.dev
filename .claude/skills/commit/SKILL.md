---
name: commit
description: Zatwierdza zmiany z automatycznym opisem po polsku
argument-hint: "<opcjonalny opis commita>"
---

Zatwierdź zmiany w repozytorium. Opcjonalny argument z opisem: $ARGUMENTS

Wykonaj następujące kroki:

1. Sprawdź status repozytorium (`git status`) i pokaż użytkownikowi co się zmieniło.

2. Przejrzyj diff zmian (`git diff` oraz `git diff --staged`) aby zrozumieć co zostało zmienione.

3. Dodaj wszystkie zmienione pliki do staging:
   - `git add -A`
   - UWAGA: Jeśli widzisz pliki wrażliwe (.env, credentials, klucze API itp.) — NIE dodawaj ich i ostrzeż użytkownika.

4. Wygeneruj treść commita:
   - Jeśli użytkownik podał opis w argumencie — użyj go jako bazę.
   - Jeśli nie podał — wygeneruj opis na podstawie zmian.
   - Commit MUSI być w języku angielskim.
   - Format: krótki opis (max 72 znaki), opcjonalnie dłuższy opis po pustej linii.
   - Przykłady: "Added login form", "Fixed email validation in registration", "Updated navigation styles"
   - NIGDY nie dodawaj wzmianek o AI, Claude, asystencie, agencie ani żadnych "Co-Authored-By".

5. Wykonaj commit:
   - `git commit -m "<treść commita>"`

6. Potwierdź użytkownikowi wykonanie commita.

KRYTYCZNE ZASADY:
- Commity ZAWSZE po angielsku.
- NIGDY nie dodawaj "Co-Authored-By" ani żadnych wzmianek o AI/Claude/agencie.
- NIE pushuj automatycznie — to osobna decyzja użytkownika.
