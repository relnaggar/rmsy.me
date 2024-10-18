#!/bin/bash
#
# Shared constants and functions which can be included with:
# 
#   . [relative-path/]lib/shared
#
set -euo pipefail
IFS=$'\n\t'

# constants related to the script that sources this one
readonly SCRIPT_NAME="${BASH_SOURCE[1]##*/}"

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

# function to get the value of a variable from the .env file

get_env_value() {
  grep "^export $1=" .env | cut -d '=' -f2
}
