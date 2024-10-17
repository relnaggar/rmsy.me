#!/bin/bash
# This script is used to get the default Apache configuration files.
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && \
  pwd)"
readonly SCRIPT_DIR
. "${SCRIPT_DIR}/lib/utils.sh"

main() {
  local DOCKER_COMPOSE_FILE="docker-compose.yml"
  local APACHE_CONFIG_DIR="apache-config"

  # comment out the mounting of the apache-config volume
  # to prevent the default Apache configuration files from being overwritten
  logfun sed -i '' "/\.\/${APACHE_CONFIG_DIR}:.*/s/^ /#/" "${DOCKER_COMPOSE_FILE}"

  # start the container
  logfun docker compose up -d

  # get the default Apache configuration files
  logfun docker cp apache2:/etc/apache2 default-apache-config

  # cleanup: uncomment the mounting of the apache-config volume
  logfun sed -i '' "/\.\/${APACHE_CONFIG_DIR}:.*/s/#/ /" "${DOCKER_COMPOSE_FILE}"
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  log "start"
  main "$@"
  log "end"
fi
