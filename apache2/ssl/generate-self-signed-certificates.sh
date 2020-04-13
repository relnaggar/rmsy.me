#!/bin/bash

domains=( localhost )
for domain in "${domains[@]}"
do
    openssl req -x509 -newkey rsa:4096 -nodes -out $domain.crt -keyout $domain.key -days 825 -sha256 -subj "/CN=$domain" -extensions EXT -config <( \
        printf "[dn]\nCN=$domain\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:$domain\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
done
