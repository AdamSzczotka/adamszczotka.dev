---
name: push
description: Wypycha zmiany z biezacej galezi na serwer zdalny
---

Wypchnij zmiany z bieżącej gałęzi na serwer zdalny. Wykonaj następujące kroki:

1. Sprawdź na jakiej gałęzi się znajdujesz:
   - `git branch --show-current`

2. Sprawdź czy są niezatwierdzone zmiany:
   - Jeśli tak — zapytaj użytkownika czy chce najpierw zacommitować (zasugeruj `/commit`).

3. Sprawdź czy gałąź ma ustawiony upstream:
   - `git rev-parse --abbrev-ref @{upstream}`
   - Jeśli nie — użyj `git push -u origin <bieżąca-gałąź>`
   - Jeśli tak — użyj `git push`

4. Potwierdź użytkownikowi że zmiany zostały wypchnięte.

WAŻNE:
- NIGDY nie rób `push --force` bez wyraźnej prośby użytkownika.
- Jeśli push się nie powiedzie z powodu rozbieżności — zasugeruj `git pull` najpierw.
