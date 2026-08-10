# adamszczotka.dev — analiza stanu i plan działania

> Stan na: 10 sierpnia 2026 · premiera serwisu: 14 kwietnia 2026 · ruch: ~4 wejścia
> Źródła: trzy audyty kodu (formattedai @ v2.12.0, adamszczotka.dev @ eddc5a5 + produkcja)

Trzy równoległe audyty — FormattedAI, panel CMS i warstwa SEO/treści — złożone w jeden
uporządkowany plan naprawy i rozwoju. Każda faza to osobna, zamykalna paczka pracy.

## Spis faz

| Faza | Zakres | Czas |
|---|---|---|
| 0 | Zabezpieczenie treści | ~0,5 dnia |
| 1 | Bugi krytyczne CMS + szybkie poprawki SEO | 1–2 dni |
| 2 | Pomiar: analityka i Search Console | ~0,5 dnia |
| 3 | FormattedAI: nowe case study i screeny | 1–2 dni |
| 4 | CMS: użyteczność i planowanie publikacji | 1–2 tyg. |
| 5 | Regularny blog i treści | ciągłe |
| 6 | SEO strukturalne | 2–3 dni |

---

## Diagnoza: dlaczego jest, jak jest

Cztery wejścia w kilka miesięcy to nie wina techniki — techniczny fundament SEO
(canonicale, hreflang, JSON-LD, sitemap, RSS, llms.txt) jest lepszy niż w większości
portfolio. Problem leży w trzech miejscach:

1. **Nie ma czego indeksować.** Trzy wpisy na blogu (wszystkie z dnia premiery), dwa
   projekty. Brak stron-hubów (archiwa tagów), ubogie linkowanie wewnętrzne, a
   najbogatszy tekst — opisy slajdów w case studies — w ogóle nie trafia do HTML-a
   widzianego przez roboty.
2. **Nie ma czym mierzyć.** Zero analityki i zero Search Console — nie wiadomo nawet,
   czy strona jest w pełni zaindeksowana.
3. **Pisanie boli.** CMS wymusza pracę na dwóch ekranach z dwoma osobnymi przyciskami
   zapisu, bez autosave, bez walidacji, z bugami psującymi dane. Regularny blog na tym
   nie powstanie — i słusznie z niego nie korzystasz.

### Trzy kluczowe ustalenia

**FormattedAI — portfolio nieaktualne.** Narzędzie urosło z ~5 do **14 narzędzi**,
przeszło pełny redesign „Hybrid Console" (maj 2026, nowe logo, dark-first) i dostało
flagowy **Text Humanizer** z lokalnym LLM w przeglądarce (WebLLM/Qwen). Portfolio
opisuje stan sprzed pół roku, a case study **zaprzecza samo sobie**: raz „Built with
Next.js and TypeScript", dwa akapity dalej „vanilla JavaScript... no frameworks".
Świeże screeny gotowe w `formattedai/docs/screenshots/`.

**CMS — 2 bugi psują dane.** Polskie slugi są niszczone („Jak działa AVIF" →
`jak-dziaa-avif`), a przełącznik EN/PL w edytorze stron potrafi nadpisać polską treść
angielską. Do tego: nieudany zapis wiesza UI bez komunikatu, callouty są po cichu
wycinane przez sanitizer, brak autosave, rewizji, harmonogramu i jakiegokolwiek
powiązania wersji PL↔EN postów.

**Treści — poza gitem.** Repozytorium zawiera **zero wpisów bloga i zero polskich
opisów projektów**. Cała realna treść strony (posty, polskie case studies) żyje
wyłącznie w produkcyjnej bazie — jeden nieostrożny reseed i znika bezpowrotnie.
Ponadto stare trasy `/projects` i `/about` (bez prefiksu języka) wciąż serwują pełne,
nieaktualne strony-duplikaty.

> **„Zdjęcia AI" — rozstrzygnięte.** Chodziło o grafiki generowane przez AI. Na
> adamszczotka.dev takich obecnie nie ma (wszystkie obrazy to screeny projektów,
> portret i wykresy), więc nie robimy nic. Notatka na przyszłość: jeśli blog zacznie
> używać ilustracji AI (wzorem artykułów FormattedAI), wtedy dodamy podpisy z
> ujawnieniem — do tego czasu temat zamknięty.

---

## FAZA 0 — Zabezpieczenie treści (~0,5 dnia, blokuje wszystko inne)

Najpierw ratujemy to, co można stracić. Dopóki treść produkcyjna nie jest w
repozytorium, każda praca nad CMS-em i seedami niesie ryzyko nieodwracalnej utraty
polskich case studies i wpisów bloga.

| # | Zadanie | Uwagi |
|---|---|---|
| 0.1 | **Zrzut produkcyjnej bazy** (`pg_dump` na serwerze) | Wymaga Twojego zalogowania na VPS — klucz działa tylko na koncie bez dostępu do bazy. Jednorazowo, razem ze mną. |
| 0.2 | **Eksport treści do repo** — posty i projekty jako wersjonowane pliki (np. `content/`), aktualizacja seeda | Od tej pory git jest źródłem prawdy dla treści startowej; baza — dla treści bieżącej. |
| 0.3 | **Weryfikacja backupów** — czy nocny cron `pg_dump → rclone → Drive` z planu faktycznie działa | PLAN.md go obiecuje; nikt nie sprawdził, czy istnieje. |

---

## FAZA 1 — Bugi krytyczne CMS + szybkie poprawki SEO (1–2 dni)

Wszystko w tej fazie to małe, niezależne poprawki — ale dwie pierwsze psują dane przy
każdym użyciu, więc muszą wejść przed jakimkolwiek pisaniem treści.

### CMS — bugi

| # | Zadanie | Waga |
|---|---|---|
| 1.1 | **Slugify z transliteracją polskich znaków** + sprawdzanie unikalności (dziś: surowy błąd bazy przy kolizji). Wspólny helper zamiast czterech kopii. | krytyczne |
| 1.2 | **Przełącznik EN/PL w edytorze stron** — wymuszenie remountu formularzy (`key={locale}`), żeby zapis nie nadpisywał polskiej treści angielską. | krytyczne |
| 1.3 | **Obsługa błędów zapisu** — try/catch + czytelny komunikat zamiast wiecznego „Saving...". | wysoka |
| 1.4 | **Toggle publikacji na liście ustawia `publishedAt`** — dziś post opublikowany z listy ląduje na dnie bloga z pustą datą. | wysoka |
| 1.5 | **Callouty przez klasy CSS** zamiast atrybutu `style` wycinanego przez sanitizer — dziś trzy przyciski edytora są czysto dekoracyjne. | średnia |
| 1.6 | **Preview z filtrem locale** — podgląd tłumaczonego posta losuje dziś jedną z dwóch wersji. | średnia |
| 1.7 | **Domyślny filtr bloga „All"** (albo obowiązkowa kategoria przy publikacji) — post bez kategorii jest dziś niewidoczny na liście. | średnia |
| 1.8 | **Potwierdzenia usuwania** — dziś jedno kliknięcie kasuje posta razem z komentarzami, bez pytania. | średnia |

### SEO — szybkie poprawki

| # | Zadanie | Efekt |
|---|---|---|
| 1.9 | **Wygaszenie tras-duplikatów** — `/projects` i `/about` bez prefiksu języka renderują dziś pełne strony z nieaktualnym bio; zamienić na przekierowania jak reszta. | koniec duplicate content |
| 1.10 | **robots.txt: odblokować `/api/og`** — dziś blokada `/api/` odcina obrazki OG od crawlerów (m.in. Twittera). | karty social działają |
| 1.11 | **Spójność danych** — jeden LinkedIn (footer vs O mnie podają różne), jeden e-mail (contact@ vs adam@), poprawny GitHub w JSON-LD (`AdamSzczotka`), polityka prywatności: OVH czy Vercel (PL i EN mówią co innego), przyciski „View Live/Case Study" po polsku na polskiej stronie, `metadataBase` w layoucie. | wiarygodność + poprawne sygnały |

---

## FAZA 2 — Pomiar: analityka i Search Console (~0,5 dnia)

Bez tego nie dowiemy się, czy cokolwiek z dalszych faz działa. Wchodzi wcześnie, żeby
zacząć zbierać dane zanim ruszą treści.

- **Google Search Console + Bing Webmaster Tools** — weryfikacja przez meta tag,
  zgłoszenie sitemapy, przegląd stanu indeksacji (być może Google widzi dziś ułamek
  stron — nie wiemy).
- **Analityka** — adamszczotka.dev nie jest projektem privacy-first (ta zasada dotyczy
  FormattedAI), więc wybór jest otwarty: **GA4** (pełne dane, integracja z Search
  Console, ale wymaga banera zgody wg RODO/ePrivacy) albo **Umami na VPS** (cookieless
  — zero banera, mniej danych). Patrz decyzja D3.
- **Aktualizacja polityki prywatności** — obecny tekst obiecuje wprost „żadnego Google
  Analytics, żadnych trackerów", więc niezależnie od wyboru narzędzia trzeba go
  zaktualizować; przy GA4 dochodzi baner zgody.
- **Baseline** — zapisujemy stan zero (zaindeksowane strony, impresje), żeby po 2–3
  miesiącach móc ocenić efekt.

---

## FAZA 3 — FormattedAI: nowe case study, nowe screeny (1–2 dni)

Portfolio opisuje produkt, którego już nie ma. Nowa wersja case study opiera się na
tym, co faktycznie jest w repo FormattedAI:

| # | Zadanie | Uwagi |
|---|---|---|
| 3.1 | **Nowa treść case study, PL + EN** — 14 narzędzi w 4 kategoriach, redesign „Hybrid Console", flagowy Text Humanizer (lokalny model Qwen w przeglądarce — zero wysyłania tekstu), pozycjonowanie GEO. Usunięcie sprzeczności: stack to vanilla JS + SCSS (nie Next.js), konwersja przez jSquash (nie „@aspect/avif"). Wyrzucamy nieweryfikowalne twierdzenia („100/100 Lighthouse", „used by developers in companies...") albo podpieramy je dowodem. | treść wchodzi do repo (faza 0), nie tylko do bazy |
| 3.2 | **Nowe screeny** z `formattedai/docs/screenshots/` (home, catalog, text-humanizer ×2, formatter, seo-geo, avif) — konwersja do AVIF, sensowne nazwy plików (obecne mają literówki typu `formatted_jsminifeir`), opisowe alty. | gotowe źródła, po redesignie |
| 3.3 | **Naprawa mechanizmu slidera** — dziś slajdy są zahardkodowane w komponencie (jedna wersja dla PL i EN), renderują się tylko gdy treść z bazy zawiera magiczny znacznik, a opisy nie trafiają do HTML-a dla robotów. Slajdy przenosimy do treści/bazy i renderujemy server-side. | ~1,5 tys. znaków treści SEO na case study przestaje być niewidzialne |
| 3.4 | **Osobne zadanie w repo FormattedAI** (poza tym planem): obrazki OG na formattedai.pl pochodzą sprzed majowego redesignu, README mówi „eleven tools", a `/about/` wymienia dziewięć — do odświeżenia przy okazji. | notatka, nie blokuje niczego |

---

## FAZA 4 — CMS: użyteczność i planowanie publikacji (1–2 tygodnie, w 6 etapach)

Największa paczka — podzielona na etapy, z których każdy osobno poprawia codzienną
pracę. Kolejność etapów = kolejność wdrażania; po każdym etapie CMS jest w pełni
działający.

### 4A — Pisanie bez strachu (odblokowuje bloga)

- **Autosave** treści i metadanych (debounce + zapis przy utracie fokusu) — dziś
  zamknięcie karty kasuje wszystko od ostatniego kliknięcia.
- **Jeden przycisk zapisu** — scalenie „Save Settings" i „Save" edytora w jedną akcję;
  wskaźnik niezapisanych zmian.
- Tworzenie posta prowadzi **prosto do edytora**, a nie na listę, z której trzeba
  posta odszukać.

### 4B — Harmonogram publikacji (Twoje „niedoboty")

- **Status zamiast checkboxa:** `draft → scheduled → published → archived` (enum w
  bazie, migracja z `isPublished`).
- **Data publikacji w przyszłości** + widok kolejki („co i kiedy wyjdzie") na liście
  postów.
- **Zero crona:** wszystkie publiczne trasy są już `force-dynamic`, więc wystarczy
  warunek `publishedAt ≤ teraz` w zapytaniach — post pojawia się sam o właściwej
  godzinie, wraz z sitemapą, RSS i llms.txt. To efekt uboczny poprawek, które sam
  zrobiłeś na serwerze — dobra decyzja.
- Opcjonalnie: publikacja pary PL+EN jednym ruchem (wymaga 4C).

### 4C — Dwujęzyczność, która wie o sobie

- **Powiązanie tłumaczeń** (`translationGroupId`) — dziś nic w systemie nie wie, że
  post polski i angielski to ta sama treść.
- Akcja **„utwórz tłumaczenie"** (kopiuje metadane, otwiera edytor drugiej wersji) +
  widok braków tłumaczeń.
- Przełącznik języka na stronie publicznej prowadzi do **odpowiednika**, nie do strony
  głównej; hreflang generowany z faktycznych par.

### 4D — Listy i media

- Lista postów: **filtry** (status, język, kategoria), szukajka, paginacja, badge
  języka — dziś obie wersje językowe leżą przemieszane w jednej płaskiej liście.
- **Biblioteka mediów** — przegląd, ponowne użycie i usuwanie uploadów; dziś każdy
  upload jest jednorazowy i niewidoczny.
- Zapisywanie `coverBlurDataUrl` — upload już liczy placeholder blur, ale edytor go
  wyrzuca; frontend czeka gotowy.
- Naprawa moderacji komentarzy — panel widzi tylko oczekujące; zatwierdzone/odrzucone
  znikają bez możliwości cofnięcia (decyzja D5).

### 4E — Edytor

- **Tabele** (sanitizer już je przepuszcza — brakuje tylko przycisku), wybór języka
  bloku kodu, alt i podpis obrazka, drag&drop uploadu, embed YouTube, przycisk
  wstawiania slidera (dziś: ręczne pisanie `<div data-slider>`).
- Edytor stron: **TipTap zamiast surowych textarea z HTML-em** dla bloków tekstowych;
  przeciąganie bloków zamiast strzałek góra/dół z rundą do serwera na każde kliknięcie.

### 4F — Podgląd z prawdziwego zdarzenia

- **Linki podglądu do udostępniania** — kolumna `previewToken` istnieje w schemacie od
  początku i nie jest nigdzie używana; pozwoli wysłać komuś draft bez logowania.
- Podgląd renderuje **prawdziwy szablon posta** (okładka, spis treści, seria), nie
  uproszczoną wersję.

---

## FAZA 5 — Regularny blog i treści (ciągłe, start po 4B)

Blogowa infrastruktura (serie, tagi, powiązane posty, komentarze, TOC) jest w pełni
zbudowana i stoi pusta. Po 4A+4B pisanie i kolejkowanie przestaje boleć — wtedy
startuje kalendarz.

### Gotowe tematy na start

| # | Artykuł | Stan |
|---|---|---|
| 5.1 | **AVIF w 2026 — pełny przewodnik** — dokończenie: w repo leży 169-liniowy, dobry draft, brakuje mu 3–4 obrazków. | draft w repo (`drafts/avif-complete-guide.md`) |
| 5.2 | **FormattedAI 2.0: redesign „Hybrid Console" i droga do 14 narzędzi** — naturalna para z fazą 3, linkuje do case study. | materiał z audytu |
| 5.3 | **LLM w przeglądarce bez wysyłania danych** — case study Text Humanizera (WebLLM, Qwen, prywatność przez architekturę). Mocny, unikalny temat. | do napisania |
| 5.4 | **Seria „z warsztatu":** własny CMS na Drizzle+TipTap (czego się nauczyłem), SSG vs force-dynamic w praktyce, self-hosted analityka bez cookies. | tematy z tej pracy |

### Zasady

- **Rytm ponad zryw:** realny cel to 1 post tygodniowo lub co dwa tygodnie, PL+EN,
  kolejkowany z wyprzedzeniem przez harmonogram. Lepszy stały rytm niż 5 postów w
  tydzień i cisza.
- **Polski jako przewaga:** mniejsza konkurencja w polskich frazach technicznych;
  wersja EN jako zasięg dodatkowy.
- **Każdy post linkuje** do case study lub narzędzia FormattedAI i odwrotnie —
  budujemy siatkę wewnętrzną, której dziś nie ma wcale.
- **GEO równolegle z SEO:** llms.txt już się aktualizuje sam; posty pisane tak, by
  nadawały się do cytowania przez wyszukiwarki AI (konkretne liczby, definicje, FAQ).

---

## FAZA 6 — SEO strukturalne (2–3 dni, równolegle z fazą 5)

- **Strony archiwów tagów i kategorii** — dziś tagi to zwykły tekst; jako podstrony
  staną się hubami tematycznymi do rankowania i naprawią linkowanie wewnętrzne.
- **Breadcrumbs** — funkcja `breadcrumbJsonLd()` istnieje i nie jest nigdzie
  wywołana; dodać UI + JSON-LD.
- **Naprawa cross-locale:** gdy brak polskiej wersji, `/pl/...` serwuje dziś angielski
  tekst z kanonicznym adresem PL — duplikat w oczach Google. Po 4C: canonical na
  wersję źródłową albo brak fallbacku; sitemapa przestaje zgłaszać nieistniejące
  alternatywy.
- **FAQ widoczne dla robotów** (odpowiedzi w initial HTML + FAQPage JSON-LD) — blok
  istnieje, jest nieużywany.
- **Porządki:** opisowe alty (dziś 9 screenów TutorHuba ma identyczny alt), usunięcie
  3,7 MB nieużywanych PNG z `public/`, cache dla `getTranslations()` (dziś pełna
  tabela z bazy na każdy render), README zamiast boilerplate'u create-next-app.

---

## Decyzje

| # | Pytanie | Status / rekomendacja |
|---|---|---|
| D1 | **Co znaczą „zdjęcia AI"?** | **Rozstrzygnięte:** grafiki generowane przez AI — na stronie ich nie ma, temat wypada z planu. Wraca tylko, jeśli blog zacznie używać ilustracji AI. |
| D2 | **Rendering: zostać przy force-dynamic czy wrócić do SSG/ISR?** Dynamic = harmonogram publikacji za darmo, prostota; ISR = szybsze TTFB, ale harmonogram wymaga triggera rewalidacji. | force-dynamic, rewizja przy realnym ruchu |
| D3 | **Analityka: GA4 czy Umami?** Privacy-first nie obowiązuje (to zasada FormattedAI, nie tej strony). GA4 = najpełniejsze dane i integracja z Search Console, kosztem banera zgody (RODO) na minimalistycznym layoucie. Umami self-hosted = zero banera i czysty wygląd, mniej danych. | GA4, jeśli baner nie przeszkadza; inaczej Umami |
| D4 | **Rytm bloga:** co tydzień czy co dwa tygodnie? Determinuje, ile artykułów kolejkować na start (min. 3 przed ogłoszeniem „regularnego bloga"). | co 2 tyg., podnieść gdy wejdzie w nawyk |
| D5 | **Komentarze i moderacja:** panel widzi tylko oczekujące — zatwierdzone/odrzucone znikają bez możliwości cofnięcia. Naprawiać w 4D czy wyłączyć komentarze do czasu ruchu? | naprawić w 4D, to mały zakres |

## Kolejność — dlaczego taka

Faza 0 usuwa ryzyko nieodwracalnej utraty i odblokowuje pracę na treściach z poziomu
repo. Faza 1 zatrzymuje psucie danych, zanim zaczniesz intensywnie pisać. Faza 2
wchodzi wcześnie, bo dane zbierają się dopiero od momentu instalacji — im wcześniej,
tym lepszy obraz efektów. Faza 3 to najszybszy widoczny efekt (aktualna wizytówka).
Faza 4 jest największa, ale dopiero ona czyni bloga możliwym — stąd przed 5. SEO
strukturalne (6) ma sens dopiero, gdy jest co linkować i mierzyć.
