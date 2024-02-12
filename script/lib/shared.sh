#!/bin/bash
#
# Shared constants and functions which can be included with:
# 
#   . [relative-path/]lib/shared
#
# using Google Shell Style Guide:
# https://google.github.io/styleguide/shellguide.html
#
# using bash strict mode:
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# constants related to the script that sources this one
readonly SCRIPT_NAME="${BASH_SOURCE[1]##*/}"

# stack constants
readonly STACK_NAME="rmsy-me"
declare -a STACK_SERVICES; readonly STACK_SERVICES=("apache2" "postgres")
declare -a STACK_VOLUMES; readonly STACK_VOLUMES=("db" "apache2-logs" "django-media" "django-migrations")
declare -a STACK_DOMAINS; readonly STACK_DOMAINS=("rmsy.me" \
  "el-naggar.co.uk")

# constants for colour display
SC="\x1B["
RED="${SC}31m"
YELLOW="${SC}33m"
NC="${SC}0m"

# functions for error reporting

err() {
  echo -e "-${SCRIPT_NAME}: ${RED}$@${NC}" >&2
}

die() {
  err "$@"
  exit 1
}

# functions for logging

log_prefix() {
  echo -n "[${SCRIPT_NAME}]: "
}

log() {
  log_prefix
  echo -e "${YELLOW}$@${NC}"
}

logfun() {
  log_prefix
  exec 3>&2 2>&1
  set -x
    "$@"
  { local result="$?"; set +x; } 2>/dev/null
  exec 2>&3
  return "${result}"
} 

# functions for checking server status

is_stack_up() {
  docker stack ls | grep -q "${STACK_NAME}"
}

is_compose_up() {
  # -T prevents an issue with shell forwarding
  docker-compose exec -T "${STACK_SERVICES[0]}" date &>/dev/null
}

is_server_up() {
  is_stack_up || is_compose_up
}
