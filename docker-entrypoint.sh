#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

main() {
  local cmd=${1:-}
  if [[ "${cmd}" == "apache2" ]]; then
    # use the appropriate .env file based on APP_ENVIRONMENT_MODE 
    if [[ "${APP_ENVIRONMENT_MODE}" == "PRODUCTION" ]] && [[ ! -f /var/www/laravel/.env ]]; then
      cp /var/www/laravel/.env.production /var/www/laravel/.env
      chown apache2:apache2 /var/www/laravel/.env
    fi
    # add APP_KEY from Docker secret if not already set
    if ! grep -q '^APP_KEY=' /var/www/laravel/.env; then
      echo "Adding APP_KEY to .env file"
      echo "APP_KEY=$(cat /run/secrets/LARAVEL_APP_KEY)" >> /var/www/laravel/.env
    fi
    echo "Starting Apache in ${APP_ENVIRONMENT_MODE} mode..."
    exec gosu apache2 /usr/sbin/apache2ctl -D FOREGROUND -D "$APP_ENVIRONMENT_MODE"
  else
    exec gosu apache2 "$@"
  fi
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  main "$@"
fi
