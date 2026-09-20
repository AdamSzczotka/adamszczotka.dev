# Plan: przebudowa panelu admina

**Utworzony:** 2026-09-20
**Gałąź robocza:** `feature/admin-refresh` (osobna od `feature/cms-4a-writing`)
**Cel:** panel, w którym da się wygodnie pisać bloga — bo to on jest dziś wąskim gardłem,
nie strona publiczna.

> Uwaga o kolejności: w `feature/cms-4a-writing` są Twoje niezacommitowane zmiany w
> `editor-wrapper.tsx`, `tiptap-editor.tsx` oraz `posts/actions.ts` i `projects/actions.ts`.
> **Faza 3 (edytor) rusza dopiero po ich zamknięciu**, żeby nie robić konfliktów w tych
> samych plikach. Fazy 0–2 dotykają innych plików i można je robić równolegle.

---

## 1. Co realnie boli (zweryfikowane w kodzie)

### Fundament — źródło większości problemów

`src/components/ui/` zawiera dziś **tylko** `fade-in.tsx` i `image-slider.tsx`. Nie ma
Buttona, Inputa, Cardu, Dialogu, Toasta, Table ani Badge'a. Każdy ekran panelu stylowany
jest ręcznie stringiem klas Tailwinda, więc te same elementy wyglądają inaczej na każdej
podstronie. To jest przyczyna wrażenia „straszny", a nie pojedyncze ekrany.

Skutki uboczne tego braku:
- `ConfirmButton` (`src/components/admin/confirm-button.tsx`) używa natywnego
  `window.confirm()` — blokujący szary dialog przeglądarki przy każdym usuwaniu.
- Edytor przy błędzie uploadu robi `alert("Upload failed")` (`editor-wrapper.tsx:118`).
- Brak toastów: po zapisie nie ma potwierdzenia poza zmianą tekstu przycisku.

### Nawigacja (`src/app/admin/layout.tsx`)

- **Brak stanu aktywnego.** Wszystkie linki w sidebarze wyglądają identycznie — nie widać,
  na której stronie jesteś. Nav jest server componentem, więc potrzebuje wydzielenia
  klienckiego kawałka z `usePathname()`.
- **`mt-auto` nie działa.** Link „Back to site" ma `mt-auto`, ale `<aside>` nie jest
  `flex flex-col`, więc link nie ląduje na dole panelu tylko tuż pod nawigacją.
- 50 linii inline SVG w pliku layoutu — ikony do wyniesienia.

### Listy treści (`src/app/admin/posts/page.tsx`, analogicznie `projects`)

- **Nie widać języka wpisu.** Lista pobiera wszystkie posty bez rozróżnienia locale, a
  wersje EN i PL mają **ten sam slug** — więc w liście stoją obok siebie wiersze o tym
  samym slugu i dacie, różniące się wyłącznie językiem tytułu. Przy 3 wpisach da się
  zgadnąć; przy 30 będzie to nie do użycia. To najpilniejsza rzecz na listach.
- Data sformatowana na sztywno `toLocaleDateString("en-US")` — amerykański format w
  polskim interfejsie.
- Brak wyszukiwania, filtrów (język, status, kategoria), sortowania i paginacji.
- Wiersz nie pokazuje kategorii ani tagów.
- Komunikat potwierdzenia usunięcia jest zaszyty po angielsku, choć reszta panelu
  przechodzi przez `t()`.

### Dashboard (`src/app/admin/dashboard/page.tsx`)

- Siatka `sm:grid-cols-3` przy **dwóch** kaflach — trzecia komórka świeci pustką.
- Liczniki nie rozróżniają języków: pokazują 6 postów tam, gdzie realnie są 3 wpisy w
  dwóch wersjach.
- Brak tego, co faktycznie przydaje się przy pisaniu: ostatnio edytowane szkice, skrót
  „nowy wpis", wpisy bez wersji w drugim języku.

### Media

- Brak biblioteki mediów — nie ma ekranu, na którym widać wgrane obrazy.
- Brak pola na tekst alternatywny. Edytor wstawia `alt` z nazwy pliku
  (`tiptap-editor.tsx:185`), a w panelu nie ma gdzie tego poprawić.
- Slajdy projektów (`projects.slides`) są jedynymi obrazami w serwisie z porządnymi
  opisami i **nie da się ich edytować z panelu** — tylko przez `content/projects.json`.

---

## 2. Fazy

### Faza 0 — fundament UI (bez tego reszta nie ma sensu)

Zestaw prymitywów w `src/components/ui/`, w stylu Linear/Vercel zgodnym z design systemem
z `CLAUDE.md` (ostre krawędzie, neutralna paleta, jeden akcent, zero emotikon):

`Button` (warianty: primary / secondary / ghost / danger, stan `loading`), `Input`,
`Textarea`, `Select`, `Label`, `Card`, `Badge` (status: opublikowany / szkic, język),
`Dialog` (zamiennik `window.confirm`), `Toast` (potwierdzenia zapisu i błędy),
`Table` (wiersze list), `EmptyState`.

Kryterium wyjścia: `ConfirmButton` przepisany na `Dialog`, `alert()` zastąpiony `Toastem`.

### Faza 1 — nawigacja i dashboard

- Stan aktywny w sidebarze (`usePathname`), poprawka `flex flex-col` na `<aside>`.
- Ikony do osobnego modułu.
- Dashboard: kafle liczone per język, siatka dopasowana do liczby kafli, sekcja
  „ostatnio edytowane" i przycisk „nowy wpis" na wierzchu.

### Faza 2 — listy treści

- **Kolumna/badge języka** przy każdym wierszu (priorytet).
- Grupowanie wersji językowych tego samego sluga w jeden wiersz z dwoma badge'ami
  (EN/PL), z widocznym brakiem tłumaczenia — od razu widać, czego nie przetłumaczyłeś.
- Wyszukiwanie po tytule, filtr statusu i języka, sortowanie po dacie.
- Daty przez locale panelu zamiast `en-US`.
- Paginacja (wchodzi, gdy wpisów przekroczy ~25).
- Potwierdzenia usuwania przez `Dialog`, z treścią z `t()`.

### Faza 3 — edytor *(dopiero po zamknięciu Twojego WIP)*

- Toasty zamiast zmiany tekstu przycisku i `alert()`.
- Autosave szkicu (lub twarde ostrzeżenie przy wyjściu z niezapisanymi zmianami).
- Pole `alt` przy wstawianiu obrazu i przy okładce — zamiast nazwy pliku.
- Widoczny przełącznik języka wersji wpisu i skrót do wersji w drugim języku.
- Przeniesienie zaszytych stringów („Save Settings", „Saving...") do tłumaczeń.

### Faza 4 — media

- Ekran biblioteki mediów: siatka wgranych obrazów z `/uploads/cms`, podgląd, usuwanie.
- Edycja `alt` dla istniejących obrazów — wymaga **tabeli `media`** w bazie
  (dziś obrazy to gołe kolumny tekstowe, nie ma gdzie trzymać metadanych).
- Edycja slajdów projektów z panelu.

---

## 3. Czego świadomie nie robimy

- Nie zmieniamy modelu treści: posty zostają własnością CMS-a, projekty i strony blokowe
  zostają repo-driven (`docs/DEPLOY.md`).
- Nie wprowadzamy biblioteki komponentów z zewnątrz (shadcn itp.) — panel ma zostać
  spójny z resztą serwisu i bez nowych zależności runtime.
- Nie ruszamy uwierzytelniania ani uprawnień; admin to nadal jedno konto z allowlisty.

## 4. Ryzyka

- **Faza 4 wymaga migracji bazy** (tabela `media` + backfill istniejących ścieżek).
  To jedyna faza z nieodwracalnym krokiem — robimy ją na końcu i z backupem.
- Grupowanie wersji językowych w listach (Faza 2) zmienia sposób czytania list; jeśli
  okaże się mylące, wracamy do płaskiej listy z badge'em języka.
- Fazy 0–2 są czysto kosmetyczno-UX-owe i odwracalne.
