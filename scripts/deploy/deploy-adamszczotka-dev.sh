#!/usr/bin/env bash
# Production deploy for adamszczotka.dev.
# Installed as /usr/local/bin/deploy-adamszczotka-dev (root:root, 755) and
# allowed for user "adam" via /etc/sudoers.d/deploy-adamszczotka-dev.
# Triggered by GitHub Actions (deploy.yml) through a forced-command SSH key.
set -euo pipefail

REPO=/var/www/adamszczotka.dev
COMPOSE="docker compose -f $REPO/docker-compose.prod.yml"

cd "$REPO"

echo "==> Updating repo to origin/main"
sudo -u adamszczotka git fetch origin main
sudo -u adamszczotka git reset --hard origin/main

echo "==> Building images"
$COMPOSE build app migrate

echo "==> Running database migrations"
$COMPOSE run --rm migrate

echo "==> Restarting app"
$COMPOSE up -d app

echo "==> Pruning dangling images"
docker image prune -f >/dev/null

echo "==> Health check"
for _ in $(seq 1 20); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    echo "==> Deploy OK: $(sudo -u adamszczotka git rev-parse --short HEAD)"
    exit 0
  fi
  sleep 3
done

echo "!! App did not become healthy on 127.0.0.1:3000" >&2
exit 1
