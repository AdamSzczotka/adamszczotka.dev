---
name: init
description: Inicjalizacja projektu z szablonu - tworzy galaz develop z main
---

Zainicjalizuj projekt z szablonu. Wykonaj następujące kroki:

1. Upewnij się, że jesteś na gałęzi `main` i pobierz najnowsze zmiany:
   - `git checkout main`
   - `git pull origin main`

2. Utwórz gałąź `develop` z `main`:
   - `git checkout -b develop`

3. Wypchnij gałąź `develop` na serwer:
   - `git push -u origin develop`

4. Potwierdź użytkownikowi, że środowisko jest gotowe i znajduje się na gałęzi `develop`.

WAŻNE: Jeśli gałąź `develop` już istnieje, poinformuj użytkownika i zapytaj czy chce ją zresetować do stanu `main`.
