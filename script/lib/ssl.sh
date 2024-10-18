trust_certificate_locally() {
  case "$OSTYPE" in
    darwin*) 
      log "adding self-signed localhost certificates to Keychain..."
      logfun sudo security add-trusted-cert -d -r trustRoot \
        -k /Library/Keychains/System.keychain "$1"
      return 0
      ;;
    linux-gnu)
      if [[ "$(uname -r)" =~ .*amzn2.* ]]; then
        log "adding self-signed localhost certificates..."
        sudo update-ca-trust force-enable
        sudo cp "$1" /etc/pki/ca-trust/source/anchors
        sudo update-ca-trust extract
        return 0
      else
        log "OS not supported, development SSL certificates remain untrusted"
        return 1
      fi
      ;;
    *)
      log "OS not supported, development SSL certificates remain untrusted"
      return 1
  esac
}
