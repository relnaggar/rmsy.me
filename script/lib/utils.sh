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

# functions to work with .env files

get_env_value() {
  grep "^export $1=" .env | cut -d '=' -f2
}

set_env_value() {
  if [[ -f .env ]]; then
    if [[ -n "$(get_env_value $1)" ]]; then
      local sed_cmd="s|^export $1=.*|export $1=$2|"
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS (BSD sed)
        logfun sed -i "" "${sed_cmd}" .env
      else
        # Linux (GNU sed)
        logfun sed -i "${sed_cmd}" .env
      fi
    else
      echo "export $1=$2" >> .env
    fi
  else
    echo "export $1=$2" > .env
  fi
}

unset_env_value() {
  if [[ -f .env ]]; then
    if [[ -n "$(get_env_value $1)" ]]; then
      local sed_cmd="s|^export $1=.*||"
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS (BSD sed)
        logfun sed -i "" "${sed_cmd}" .env
      else
        # Linux (GNU sed)
        logfun sed -i "${sed_cmd}" .env
      fi
    fi
  fi
}
