#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

git config --local core.hooksPath .githooks
chmod +x .githooks/pre-commit .githooks/pre-push

echo "Git hooks installed from .githooks/"
echo "pre-commit: docker compose exec -T -u apache2 app ... vendor/bin/pint --test"
echo "pre-push: docker compose exec -T -u apache2 app ... php artisan test && npm --prefix www run e2e"
echo "emergency toggles: SKIP_PRE_PUSH_TESTS=1 and/or SKIP_PRE_PUSH_E2E=1"
