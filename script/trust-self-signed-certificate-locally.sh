#!/bin/bash
# Add the self-signed localhost SSL certificate to the trust store.
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && \
  pwd)"
readonly SCRIPT_DIR
. "${SCRIPT_DIR}/lib/utils.sh"

main() {
  # start the container
  logfun docker compose up -d

  # get the snakeoil SSL certificate
  logfun docker cp apache2:/etc/ssl/certs/ssl-cert-snakeoil.pem temp.pem

  case "$OSTYPE" in
    darwin*) 
      log "adding self-signed localhost certificates to Keychain..."
      logfun sudo security add-trusted-cert -d -r trustRoot \
        -k /Library/Keychains/System.keychain temp.pem
      log "...success"
      # cleanup
      logfun rm temp.pem
      ;;
    linux-gnu)
      if [[ "$(uname -r)" =~ .*amzn2.* ]]; then
        log "adding self-signed localhost certificates..."
        sudo update-ca-trust force-enable
        sudo cp temp.pem /etc/pki/ca-trust/source/anchors
        sudo update-ca-trust extract
        log "...success"
        # cleanup
        logfun rm temp.pem
      else
        log "warning: development SSL certificates remain untrusted"
      fi
      ;;
    *)
      log "warning: OS not supported, development SSL certificates remain untrusted"
  esac
}

if [[ "${#BASH_SOURCE[@]}" -eq 1 ]]; then
  log "start"
  main "$@"
  log "end"
fi
