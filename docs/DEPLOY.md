# Deploy (CI/CD)

Produkcja: VPS `57.129.141.64`, repo w `/var/www/adamszczotka.dev`, aplikacja w Dockerze
(`docker-compose.prod.yml`) za nginx, port `127.0.0.1:3000`.

## Jak to działa

1. Push na `main` odpala workflow **Deploy** (`.github/workflows/deploy.yml`).
2. Job `check`: `npm ci` + lint + `tsc --noEmit` + build. Deploy rusza tylko gdy przejdzie.
3. Job `deploy`: SSH na serwer jako `adam` kluczem z sekretu `DEPLOY_SSH_KEY`.
   Wpis w `authorized_keys` ma wymuszoną komendę (`command="sudo -n /usr/local/bin/deploy-adamszczotka-dev"`),
   więc ten klucz nie może zrobić nic innego niż deploy.
4. Skrypt `/usr/local/bin/deploy-adamszczotka-dev` (kopia: `scripts/deploy/deploy-adamszczotka-dev.sh`):
   `git reset --hard origin/main` (jako `adamszczotka`) → build obrazów → **migracje Drizzle**
   (serwis `migrate` w compose) → **sync treści** (`scripts/sync-content.ts`) → `up -d app` →
   healthcheck na `127.0.0.1:3000`.
5. Na końcu workflow sprawdza `https://adamszczotka.dev/` z zewnątrz.

Workflow **CI** (`ci.yml`) robi te same checki na każdym pushu na inne gałęzie i na PR-ach
do `main`/`develop`.

## Zasada: deploy nie wymaga SSH

**Wdrożenie to wyłącznie push na `main`.** Nigdy nie trzeba logować się na serwer, żeby coś
wdrożyć — jeśli kiedykolwiek pojawia się taka potrzeba, to znaczy, że zmiana została zrobiona
w złym miejscu.

Powód: skrypt `/usr/local/bin/deploy-adamszczotka-dev` żyje **poza repo** (musi, bo działa jako
root) i nie aktualizuje się z gita. Dlatego jest celowo ogólny i stabilny — robi tylko:
aktualizacja repo → build → uruchom serwis `migrate` → uruchom sync treści → restart → healthcheck.

Wszystko, co może się zmieniać z wydania na wydanie, siedzi **w repo**, w dwóch miejscach, które
ten skrypt wywołuje:

| Gdzie | Co tam wrzucać |
| --- | --- |
| `Dockerfile`, stage `migrator` (CMD) | migracje schematu bazy |
| `scripts/sync-content.ts` | wszystkie zadania wydaniowe: sync treści i cokolwiek dojdzie później |

**Nowy krok deployu dopisujesz do `scripts/sync-content.ts`, nie do skryptu powłoki.** Dopisanie
linijki do `scripts/deploy/deploy-adamszczotka-dev.sh` nic nie da, dopóki ktoś ręcznie nie
przeinstaluje skryptu na serwerze przez sudo — i to jest dokładnie ten scenariusz, którego
unikamy.

> **Nie zmieniaj nazwy ani ścieżki `scripts/sync-content.ts`.** Jest zaszyta w skrypcie na
> serwerze (`docker compose run --rm migrate npx tsx scripts/sync-content.ts`). Przeniesienie
> tego pliku wywali deploy, a naprawa będzie wymagała wejścia na serwer.

`scripts/deploy/deploy-adamszczotka-dev.sh` w repo to **kopia referencyjna** tego, co jest
zainstalowane na serwerze — trzymana po to, żeby było widać, co się dzieje. Zmiana w niej nie
jest wdrożeniem. Sprawdzenie, czy kopia nie rozjechała się z serwerem (porównuje same
instrukcje, bez komentarzy):

```bash
diff <(ssh adam@57.129.141.64 cat /usr/local/bin/deploy-adamszczotka-dev | grep -v '^#') \
     <(grep -v '^#' scripts/deploy/deploy-adamszczotka-dev.sh)
```

## Kto jest właścicielem treści

- **Projekty** — źródłem prawdy jest `content/projects.json`. Deploy robi upsert po slugu.
  Edycja projektu w panelu nie jest trwała; zmieniasz go w repo.
- **Strony blokowe** — domyślnie **należą do CMS-a** i sync ich nie dotyka. Z repo jedzie tylko
  strona z `"repoManaged": true` w `content/pages.json` (dziś wyłącznie `privacy`). Dla takiej
  strony bloki są kasowane i wstawiane od nowa, więc wszystko, co zmienisz w niej w panelu,
  zniknie przy najbliższym deployu.
- **Wpisy na blogu** — źródłem prawdy jest baza (panel CMS). Sync zmienia w nich wyłącznie
  długie myślniki na zwykłe. `content/posts.json` to eksport/kopia zapasowa, nie wejście.
- **Tłumaczenia** — edytowalne w panelu; sync tylko **dodaje** klucze nowe w repo.

> **Dlaczego `home` nie jest repo-managed.** 2026-09-20 sync wgrał na produkcję sierpniowy
> snapshot strony głównej i skasował to, co było dopisane w panelu później. Strona blokowa
> dostaje `repoManaged` dopiero wtedy, gdy `content/pages.json` zawiera jej **pełną, aktualną**
> treść — a nie stary eksport.

> **Bloki `project_showcase`.** W bazie wskazują projekt przez `projectId`, a w
> `content/pages.json` przez `projectSlug` (bo id nie są przenośne między bazami). Sync mapuje
> jedno na drugie, a renderer obsługuje oba — jeśli któryś z tych dwóch elementów zawiedzie,
> sekcja projektów po prostu znika ze strony, bez żadnego błędu.

## Release = deploy

Zwykły flow: praca na `feature/*` → merge do `develop` → merge do `main` (`/release`) → push.
Push `main` na GitHuba automatycznie wdraża produkcję. Nic więcej nie trzeba robić.

## Ręczny deploy / retry

- Z GitHuba: zakładka Actions → workflow "Deploy" → "Run workflow" (workflow_dispatch),
  albo `gh workflow run deploy.yml`.
- Z serwera (interaktywnie): `ssh adam@57.129.141.64`, potem `sudo /usr/local/bin/deploy-adamszczotka-dev`.

## Stan trwały na produkcji

Poza bazą danych serwer trzyma jeszcze jedną rzecz, której nie ma w repo: **obrazy wgrane
z panelu CMS**. Leżą w wolumenie Dockera `uploads_data`, zamontowanym w kontenerze pod
`/app/public/uploads/cms`.

- Obrazy wersjonowane w repo (`public/uploads/*`) jadą w obrazie Dockera i wolumen ich
  nie dotyczy — dlatego CMS-owe siedzą w podkatalogu `cms/`.
- Katalog musi istnieć w obrazie i należeć do użytkownika `nextjs`, bo świeży wolumen
  dziedziczy właściciela po katalogu z obrazu. Stąd `public/uploads/cms/.gitkeep` i
  `--chown=nextjs:nodejs` przy `COPY ... /app/public` w `Dockerfile`.
- **Backup:** `docker run --rm -v uploads_data:/data -v "$PWD":/out alpine tar czf /out/uploads.tgz -C /data .`

## Nagłówki bezpieczeństwa

Podzielone między dwa miejsca i **nie wolno ustawiać tego samego w obu** — przeglądarka dostanie
wtedy nagłówek dwa razy, a skanery raportują to jako błąd (tak było z `X-Content-Type-Options`).

| Gdzie | Co ustawia |
| --- | --- |
| `src/proxy.ts` | `Content-Security-Policy` — musi być tu, bo zawiera nonce generowany per żądanie |
| `nginx.conf` na serwerze (blok `http`) | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security` — globalnie dla wszystkich stron na VPS |

`next.config.ts` **nie** ustawia żadnych nagłówków.

### CSP i skrypty inline

`script-src` nie ma `'unsafe-inline'`. Każdy skrypt inline musi mieć nonce z żądania:

- skrypty Next.js dostają go automatycznie (proxy podaje CSP także w nagłówkach **żądania**),
- nasz skrypt motywu w `app/layout.tsx` — przez `headers().get("x-nonce")`,
- dane strukturalne — przez komponent `components/json-ld.tsx`.

Wyjątek: `next-themes` renderuje własny skrypt i na React 19 gubi wszystkie przekazane mu propsy
(sprawdzone — nie przechodzi nawet zwykły `data-*`), więc jest dopuszczony **po hashu**.
Po aktualizacji `next-themes` albo zmianie opcji `ThemeProvider` przelicz hash:

```bash
npm run build && node .next/standalone/server.js   # w drugim terminalu:
npm run csp:hash http://localhost:3000/pl
```

i wstaw wynik do `THEME_SCRIPT_HASH` w `src/proxy.ts`. Gdy hash się rozjedzie, skrypt zostanie
zablokowany — nic się wizualnie nie psuje, bo nasz własny skrypt i tak ustawia motyw przed
pierwszym renderem, ale w konsoli pojawi się błąd CSP.

## Rollback

`git revert <zły-commit>` na `main` i push — Actions wdroży poprzedni stan aplikacji.
Uwaga: migracje bazy nie cofają się same; rollback migracji trzeba zrobić ręcznie.
Wolumen z uploadami przeżywa rollback aplikacji.

## Konfiguracja jednorazowa na serwerze

- Klucz deployowy: `~adam/.ssh/github_actions_deploy` (pub w `authorized_keys` z forced command),
  prywatny w sekrecie repo `DEPLOY_SSH_KEY`.
- Sudoers: `/etc/sudoers.d/deploy-adamszczotka-dev` —
  `adam ALL=(root) NOPASSWD: /usr/local/bin/deploy-adamszczotka-dev`.
- Skrypt: `sudo install -m 755 -o root -g root scripts/deploy/deploy-adamszczotka-dev.sh /usr/local/bin/deploy-adamszczotka-dev`
  (po zmianach w skrypcie trzeba go przeinstalować — nie aktualizuje się sam z repo).
- Sekrety aplikacji żyją tylko w `/var/www/adamszczotka.dev/.env` na serwerze (mode 600).
