---
name: nowe-zlecenie
description: Tworzy nowa galaz robocza z develop dla zlecenia
argument-hint: "<numer/nazwa zlecenia>"
---

Utwórz nową gałąź roboczą dla zlecenia. Argument: $ARGUMENTS

Wykonaj następujące kroki:

1. Sprawdź czy jesteś na gałęzi `develop`. Jeśli nie — przełącz się na nią i pobierz najnowsze zmiany:
   - `git checkout develop`
   - `git pull origin develop`

2. Na podstawie argumentu użytkownika utwórz nazwę gałęzi w formacie:
   - `feature/<numer-lub-skrot>-<krotki-opis>` (np. `feature/ZLC-123-logowanie-uzytkownika`)
   - Jeśli użytkownik nie podał argumentu, zapytaj o nazwę/opis zlecenia.
   - Zamień spacje na myślniki, usuń polskie znaki diakrytyczne, zamień na lowercase.

3. Utwórz gałąź i wypchnij ją na serwer:
   - `git checkout -b <nazwa-galezi>`
   - `git push -u origin <nazwa-galezi>`

4. Potwierdź użytkownikowi nazwę utworzonej gałęzi i że może rozpocząć pracę.

WAŻNE: Wszystkie komunikaty w języku polskim.
