#!/bin/bash
# Get the default Apache configuration files from the container.
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && \
  pwd)"
readonly SCRIPT_DIR
. "${SCRIPT_DIR}/lib/utils.sh"

main() {
  # ask the user which config they want to view
  log "Which config would you like to view [apache2/php]?"
  read -r response
  local apache2_or_php
  if [[ "${response}" == "apache2" || "${response}" == "php" ]]; then
    apache2_or_php="${response}"
  else
    die "Error: Invalid response."
  fi

  local docker_compose_file="docker-compose.yml"
  local config_dir="config/${apache2_or_php}"
  local default_config_dir="config/default-${apache2_or_php}"

  if [[ -d "${default_config_dir}" ]]; then
    die "Error: "${default_config_dir}" already exists."
  fi

  # comment out the mounting of the config volume
  # to prevent the default configuration files from being overwritten
  escaped_config_dir=$(echo "$config_dir" | sed 's/\//\\\//g')
  logfun sed -i '' "/${escaped_config_dir}:.*/s/^ /#/" "${docker_compose_file}"

  # start the container
  logfun docker compose down
  logfun docker compose build
  logfun docker compose up -d

  # get the default configuration files
  logfun docker cp "apache2:/etc/${apache2_or_php}" "${default_config_dir}"

  # cleanup: uncomment the mounting of the config volume
  logfun sed -i '' "/${escaped_config_dir}:.*/s/#/ /" "${docker_compose_file}"

  if [[ ! -d "${config_dir}" ]]; then
    logfun mv "${default_config_dir}" "${config_dir}"
  else
    # ask the user if they want to overwrite the existing configuration files
    log "Do you want to overwrite the existing ${apache2_or_php} configuration \
files? [y/N]"
    read -r response
    if [[ "${response}" =~ ^[Yy]$ ]]; then
      logfun rm -rf "${config_dir}"
      logfun mv "${default_config_dir}" "${config_dir}"
    fi    
  fi
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  log "start"
  main "$@"
  log "end"
fi
