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

## Kto jest właścicielem treści

- **Projekty i strony blokowe** (`home`, `about`, `privacy`) — źródłem prawdy jest `content/*.json`
  w repo. Każdy deploy wgrywa je do bazy przez `scripts/sync-content.ts` (upsert po slugu, bloki
  stron podmieniane w całości). Edycja tych rzeczy w panelu CMS **nie jest trwała** — następny
  deploy ją nadpisze. Zmieniasz je w repo.
- **Wpisy na blogu** — źródłem prawdy jest baza (panel CMS). Sync ich nie dotyka.
  `content/posts.json` to eksport/kopia zapasowa, nie wejście.

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
