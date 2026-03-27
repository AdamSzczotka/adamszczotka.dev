---
name: status
description: Pokazuje pelny status repozytorium i przeplywu pracy
---

Pokaż pełny status repozytorium i przepływu pracy. Wykonaj następujące kroki:

1. Pokaż bieżącą gałąź:
   - `git branch --show-current`

2. Pokaż status plików (zmodyfikowane, nowe, usunięte):
   - `git status --short`

3. Pokaż listę wszystkich gałęzi lokalnych i zdalnych:
   - `git branch -a`

4. Pokaż ostatnie 10 commitów w czytelnym formacie:
   - `git log --oneline --graph --decorate -10`

5. Pokaż różnicę między develop a main (co jest gotowe do release):
   - `git log main..develop --oneline` (jeśli obie gałęzie istnieją)

6. Pokaż listę tagów (wersji):
   - `git tag --sort=-v:refname | head -5`

7. Przedstaw użytkownikowi czytelne podsumowanie w języku polskim:
   - Na jakiej gałęzi jest
   - Czy ma niezatwierdzone zmiany
   - Ile commitów jest do wydania (develop ahead of main)
   - Ostatnia wydana wersja
   - Aktywne gałęzie robocze (feature branches)
