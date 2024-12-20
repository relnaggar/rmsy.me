#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

main() {
  local cmd=${1:-}
  if [[ "${cmd}" == "apache2" ]]; then
    echo "Starting Apache in ${APP_ENVIRONMENT_MODE} mode..."
    exec gosu apache2 /usr/sbin/apache2ctl -D FOREGROUND -D "$APP_ENVIRONMENT_MODE"
  else
    exec gosu apache2 "$@"
  fi
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  main "$@"
fi
