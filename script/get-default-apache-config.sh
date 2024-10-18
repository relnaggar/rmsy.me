#!/bin/bash
# Get the default Apache configuration files from the container.
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && \
  pwd)"
readonly SCRIPT_DIR
. "${SCRIPT_DIR}/lib/utils.sh"

main() {
  if [[ -d "default-apache-config" ]]; then
    die "Error: default-apache-config already exists."
  fi

  local docker_compose_file="docker-compose.yml"
  local apache_config_dir="apache-config"

  # comment out the mounting of the apache-config volume
  # to prevent the default Apache configuration files from being overwritten
  logfun sed -i '' "/${apache_config_dir}:.*/s/^ /#/" "${docker_compose_file}"

  # start the container
  logfun docker compose up -d

  # get the default Apache configuration files
  logfun docker cp apache2:/etc/apache2 default-apache-config

  # cleanup: uncomment the mounting of the apache-config volume
  logfun sed -i '' "/${apache_config_dir}:.*/s/#/ /" "${docker_compose_file}"
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  log "start"
  main "$@"
  log "end"
fi
