# Do zrobienia na serwerze: Referrer-Policy

**Po co:** skaner bezpieczeństwa zdejmuje 5 punktów za `Referrer-Policy: no-referrer-when-downgrade`.
Docelowa wartość to `strict-origin-when-cross-origin`.

**Dlaczego nie da się tego zrobić przez `git push`:** ten nagłówek ustawia nginx, w pliku
`/etc/nginx/nginx.conf` (linia 29), globalnie dla **wszystkich** stron na VPS-ie. To konfiguracja
systemowa, poza jakimkolwiek repozytorium. Aplikacja nie może jej nadpisać — gdyby Next ustawiał
ten sam nagłówek, przeglądarka dostałaby dwie różne wartości.

**Efekt uboczny (pozytywny):** poprawia wynik od razu na wszystkich stronach na tym serwerze:
adamszczotka.dev, formattedai.pl, karta-wedkarska.pl, tutorhub i centrum-wiedzy.

---

## Komenda do wklejenia

W oknie Claude Code wpisz to z wykrzyknikiem na początku (`! ssh -t ...`), żeby poleciało
w tej sesji. Poprosi o Twoje hasło sudo do serwera.

```bash
ssh -t adam@57.129.141.64 'sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak-$(date +%F) && sudo sed -i "s|no-referrer-when-downgrade|strict-origin-when-cross-origin|" /etc/nginx/nginx.conf && sudo nginx -t && sudo systemctl reload nginx && echo REFERRER-OK && grep -n "Referrer-Policy" /etc/nginx/nginx.conf'
```

---

## Co ta komenda robi, krok po kroku

1. `sudo cp ... nginx.conf.bak-RRRR-MM-DD` — kopia zapasowa z dzisiejszą datą.
2. `sudo sed -i "s|...|...|"` — podmienia wartość nagłówka.
3. `sudo nginx -t` — **sprawdza składnię konfiguracji**.
4. `sudo systemctl reload nginx` — przeładowuje nginx.
5. `grep -n "Referrer-Policy"` — pokazuje zmienioną linię, żeby było widać efekt.

Kroki są połączone przez `&&`, więc jeśli którykolwiek się nie powiedzie, następne **nie**
wykonają się. W szczególności: przy błędnej składni nginx nie zostanie przeładowany i strony
będą działać dalej na starej konfiguracji.

## Sprawdzone przed podaniem

- Fraza `no-referrer-when-downgrade` występuje w całym `/etc/nginx` **dokładnie raz**, więc
  podmiana nie może trafić w nic innego.
- Żaden pojedynczy serwis w `sites-enabled` nie ma własnego `add_header`, który przykryłby
  wartość globalną.
- Samą podmianę przetestowałem na dokładnej kopii tej linii (jest tam tabulator i cudzysłowy).

## Gdyby coś poszło nie tak

Przywrócenie kopii zapasowej:

```bash
ssh -t adam@57.129.141.64 'sudo cp /etc/nginx/nginx.conf.bak-$(date +%F) /etc/nginx/nginx.conf && sudo nginx -t && sudo systemctl reload nginx && echo PRZYWROCONE'
```

## Jak sprawdzić, że zadziałało

```bash
curl -sI https://adamszczotka.dev/ | grep -i referrer
```

Powinno pokazać `referrer-policy: strict-origin-when-cross-origin`.
