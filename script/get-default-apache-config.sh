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
  logfun docker compose down
  logfun docker compose build
  logfun docker compose up -d

  # get the default Apache configuration files
  logfun docker cp apache2:/etc/apache2 default-apache-config

  # cleanup: uncomment the mounting of the apache-config volume
  logfun sed -i '' "/${apache_config_dir}:.*/s/#/ /" "${docker_compose_file}"

  if [[ ! -d "${apache_config_dir}" ]]; then
    logfun mv default-apache-config "${apache_config_dir}"
  else
    # ask the user if they want to overwrite the existing Apache configuration files
    log "Do you want to overwrite the existing Apache configuration files? [y/N]"
    read -r response
    if [[ "${response}" =~ ^[Yy]$ ]]; then
      logfun rm -rf "${apache_config_dir}"
      logfun mv default-apache-config "${apache_config_dir}"
    fi    
  fi
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  log "start"
  main "$@"
  log "end"
fi
