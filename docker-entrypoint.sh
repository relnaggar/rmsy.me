#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Activate the CERTBOT_IS_LIVE Apache define when Let's Encrypt cert is present
LE_DIR=$(find /etc/letsencrypt/live -maxdepth 1 -mindepth 1 -type d 2>/dev/null \
  | head -n1 || true)
if [[ -n "${LE_DIR}" ]]; then
  echo "Define CERTBOT_IS_LIVE" > /etc/apache2/conf-enabled/certbot-is-live.conf
fi

exec "$@"
