---
name: check
description: Sprawdza build, typy i linting projektu
---

Wykonaj pelna kontrole jakosci projektu:

1. **TypeScript** -- sprawdz typy:
   - `npx tsc --noEmit`
   - Jesli sa bledy -- wyswietl je i zaproponuj poprawki

2. **ESLint** -- sprawdz linting:
   - `npm run lint`
   - Jesli sa ostrzezenia/bledy -- wyswietl je

3. **Build** -- sprawdz czy projekt sie buduje:
   - `npm run build`
   - Jesli build padnie -- przeanalizuj blad i zaproponuj fix

4. **Podsumowanie**:
   - Wyswietl status kazdego kroku (OK / FAIL)
   - Jesli wszystko OK -- potwierdz ze projekt jest gotowy
   - Jesli sa bledy -- zaproponuj konkretne poprawki

WAZNE: Uruchom wszystkie 3 kroki nawet jesli pierwszy padnie -- uzytkownik chce widziec pelny obraz.
