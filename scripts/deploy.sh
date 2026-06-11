#!/usr/bin/env bash
# /var/www/mvbroker/scripts/deploy.sh
# Atualiza o app a partir do GitHub sem tocar em .env, node_modules cache, nem keys.
# Uso: bash /var/www/mvbroker/scripts/deploy.sh

set -euo pipefail

APP_DIR="/var/www/mvbroker"
APP_NAME="mvbroker"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

echo "▶ [1/6] Protegendo .env e arquivos sensíveis"
# Garante que .env nunca seja sobrescrito pelo git
git update-index --skip-worktree .env 2>/dev/null || true
# Backup defensivo
[ -f .env ] && cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

echo "▶ [2/6] Buscando atualizações do GitHub (branch: $BRANCH)"
git fetch --all --prune
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "✅ Já está atualizado ($LOCAL). Nada a fazer."
  exit 0
fi

echo "   Local : $LOCAL"
echo "   Remoto: $REMOTE"

# Stash qualquer alteração local (não deveria ter, mas garante)
git stash push -u -m "deploy-autostash-$(date +%s)" 2>/dev/null || true

echo "▶ [3/6] Aplicando pull"
git reset --hard "origin/$BRANCH"

echo "▶ [4/6] Verificando dependências (só instala se package.json/lock mudou)"
CHANGED_FILES=$(git diff --name-only "$LOCAL" "$REMOTE")
if echo "$CHANGED_FILES" | grep -qE '^(package\.json|package-lock\.json|bun\.lockb)$'; then
  echo "   Mudanças em dependências detectadas → npm install"
  npm install --no-audit --no-fund
else
  echo "   Sem mudanças em dependências, pulando install"
fi

echo "▶ [5/6] Rodando migrations novas (se houver)"
NEW_MIGRATIONS=$(echo "$CHANGED_FILES" | grep -E '^supabase/migrations/.*\.sql$' || true)
if [ -n "$NEW_MIGRATIONS" ]; then
  echo "   Migrations novas:"
  echo "$NEW_MIGRATIONS" | sed 's/^/     • /'
  for f in $NEW_MIGRATIONS; do
    if [ -f "$f" ]; then
      echo "   ▶ Aplicando $f"
      docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$f"
    fi
  done
else
  echo "   Sem migrations novas"
fi

echo "▶ [6/6] Build + restart PM2"
npm run build
pm2 restart "$APP_NAME" --update-env
pm2 save

echo ""
echo "✅ Deploy concluído!"
echo "   $(date)"
echo "   $LOCAL → $REMOTE"
curl -sI https://app.sistemamvbroker.com.br/ | head -1
