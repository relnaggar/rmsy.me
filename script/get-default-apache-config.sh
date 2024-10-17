#!/bin/bash
# This script is used to get the default Apache configuration files.

# comment out the mounting of the apache-config volume to prevent the default Apache configuration files from being overwritten
sed -i '' '/\.\/apache-config:.*/s/^ /#/' docker-compose.yaml

# start the container
docker compose up -d

# get the default Apache configuration files
docker cp apache2:/etc/apache2 default-apache-config

# stop the container
docker compose down

# uncomment the mounting of the apache-config volume
sed -i '' '/\.\/apache-config:.*/s/#/ /' docker-compose.yaml