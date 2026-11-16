#!/usr/bin/env bash
set -Eeuo pipefail

cd /opt/tontine-frontend

BRANCH="main"
ENV_FILE="src/environments/environment.ts"
BACKUP="/root/tontine-environment-production.ts"
CONTAINER="cotisation-frontend"
IMAGE="cotisation-frontend:latest"
BACKUP_IMAGE="cotisation-frontend:rollback"

echo "=== 1. Sauvegarde de la configuration ==="
cp "$ENV_FILE" "$BACKUP"
chmod 600 "$BACKUP"

echo "=== 2. Sauvegarde temporaire dans Git ==="
git stash push -m "frontend environment production" -- "$ENV_FILE"

echo "=== 3. Récupération du code ==="
if ! git pull --ff-only origin "$BRANCH"; then
  cp "$BACKUP" "$ENV_FILE"
  echo "ERREUR : git pull a échoué. Configuration restaurée."
  exit 1
fi

echo "=== 4. Restauration de la configuration de production ==="
cp "$BACKUP" "$ENV_FILE"

if ! grep -Fq "apiUrl: '/api'" "$ENV_FILE"; then
  echo "ERREUR : apiUrl '/api' n'a pas été trouvé."
  exit 1
fi

echo "=== 5. Sauvegarde de l'image précédente ==="
if docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker image tag "$IMAGE" "$BACKUP_IMAGE"
fi

echo "=== 6. Construction de l'image ==="
docker build -t "$IMAGE" .

echo "=== 7. Redémarrage du frontend ==="
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true

docker run -d \
  --name "$CONTAINER" \
  --network bridge \
  --add-host=host.docker.internal:host-gateway \
  --restart unless-stopped \
  -p 127.0.0.1:8080:80 \
  "$IMAGE"

echo "=== 8. Vérification ==="
sleep 3

if [ "$(docker inspect "$CONTAINER" --format '{{.State.Running}}')" = "true" ]; then
  docker ps --filter "name=^/${CONTAINER}$"
  echo "Frontend démarré. Vérifie les logs avec :"
  echo "docker logs --tail 80 $CONTAINER"
else
  docker logs --tail 80 "$CONTAINER" || true
  echo "ERREUR : le frontend n'a pas démarré."
  exit 1
fi
