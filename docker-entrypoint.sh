#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

main() {
  local cmd=${1:-}
  if [[ "${cmd}" == "apache2" ]]; then
    # use the appropriate .env file based on APP_ENVIRONMENT_MODE 
    if [[ "${APP_ENVIRONMENT_MODE}" == "PRODUCTION" ]]; then
      cp /var/www/.env.production /var/www/.env
      chown apache2:apache2 /var/www/.env
    fi
    echo "Starting Apache in ${APP_ENVIRONMENT_MODE} mode..."
    exec gosu apache2 /usr/sbin/apache2ctl -D FOREGROUND \
      -D "$APP_ENVIRONMENT_MODE"
  else
    exec gosu apache2 "$@"
  fi
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  main "$@"
fi
