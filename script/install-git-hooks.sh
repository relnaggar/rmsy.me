#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

git config --local core.hooksPath .githooks
chmod +x .githooks/pre-commit .githooks/pre-push
echo "Git hooks installed from .githooks/"
