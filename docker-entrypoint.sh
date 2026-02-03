#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

main() {
  local cmd=${1:-}
  if [[ "${cmd}" == "apache2" ]]; then
    if [[ "${APP_ENVIRONMENT_MODE}" == "PRODUCTION" ]]; then
      cp /var/www/laravel/.env.production /var/www/laravel/.env
      chown apache2:apache2 /var/www/laravel/.env
    fi
    echo "APP_KEY=$(cat /run/secrets/LARAVEL_APP_KEY)" >> /var/www/laravel/.env
    echo "Starting Apache in ${APP_ENVIRONMENT_MODE} mode..."
    exec gosu apache2 /usr/sbin/apache2ctl -D FOREGROUND -D "$APP_ENVIRONMENT_MODE"
  else
    exec gosu apache2 "$@"
  fi
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  main "$@"
fi
