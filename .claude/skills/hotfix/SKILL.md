---
name: hotfix
description: Pilna poprawka z main - merguje do main i develop
argument-hint: "<opis problemu>"
---

Utwórz hotfix — pilna poprawka bezpośrednio na main. Argument z opisem: $ARGUMENTS

Wykonaj następujące kroki:

1. Sprawdź czy są niezatwierdzone zmiany — jeśli tak, przerwij.

2. Na podstawie argumentu użytkownika utwórz nazwę gałęzi:
   - Format: `hotfix/<krotki-opis>` (np. `hotfix/naprawa-logowania`)
   - Jeśli brak argumentu — zapytaj o opis problemu.
   - Zamień spacje na myślniki, usuń polskie znaki, lowercase.

3. Przełącz się na main i pobierz najnowsze:
   - `git checkout main`
   - `git pull origin main`

4. Utwórz gałąź hotfix:
   - `git checkout -b <hotfix-branch>`
   - `git push -u origin <hotfix-branch>`

5. Poinformuj użytkownika że gałąź hotfix jest gotowa — niech wprowadzi poprawki.

Po zakończeniu pracy (gdy użytkownik powie że hotfix jest gotowy):

6. Zatwierdź zmiany (commit po polsku, bez wzmianek o AI).

7. Zmerguj hotfix do main:
   - `git checkout main`
   - `git merge --no-ff <hotfix-branch>`
   - `git push origin main`

8. Zmerguj hotfix do develop (żeby poprawka trafiła też do rozwoju):
   - `git checkout develop`
   - `git merge --no-ff <hotfix-branch>`
   - `git push origin develop`

9. Zapytaj o usunięcie gałęzi hotfix.

10. Zasugeruj utworzenie nowego tagu wersji (patch bump, np. v1.0.0 → v1.0.1).

WAŻNE: Hotfix to pilna ścieżka — mergujemy zarówno do main JAK I do develop.
