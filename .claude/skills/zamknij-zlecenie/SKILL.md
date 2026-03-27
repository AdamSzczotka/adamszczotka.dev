---
name: zamknij-zlecenie
description: Zamyka zlecenie - merguje galaz robocza do develop
---

Zamknij bieżące zlecenie — zmerguj gałąź roboczą do develop. Wykonaj następujące kroki:

1. Sprawdź na jakiej gałęzi się znajdujesz (`git branch --show-current`).
   - Jeśli jesteś na `main` lub `develop` — poinformuj użytkownika że nie ma aktywnego zlecenia do zamknięcia i zakończ.

2. Sprawdź czy są niezatwierdzone zmiany (`git status`).
   - Jeśli są — zapytaj użytkownika czy chce je najpierw zacommitować (zasugeruj `/commit`).

3. Zapamiętaj nazwę bieżącej gałęzi roboczej.

4. Wypchnij ostatnie zmiany z gałęzi roboczej:
   - `git push origin <bieżąca-gałąź>`

5. Przełącz się na develop i pobierz najnowsze zmiany:
   - `git checkout develop`
   - `git pull origin develop`

6. Zmerguj gałąź roboczą do develop:
   - `git merge --no-ff <nazwa-galezi-roboczej>`
   - Flaga `--no-ff` zachowuje historię gałęzi.

7. Wypchnij develop na serwer:
   - `git push origin develop`

8. Zapytaj użytkownika czy usunąć gałąź roboczą (lokalnie i zdalnie):
   - `git branch -d <nazwa-galezi-roboczej>`
   - `git push origin --delete <nazwa-galezi-roboczej>`

9. Potwierdź zamknięcie zlecenia.

WAŻNE: Jeśli merge powoduje konflikty — poinformuj użytkownika i pomóż je rozwiązać zanim kontynuujesz.
