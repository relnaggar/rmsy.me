# apache2

## Quickstart

Start the development server:

    $ docker compose up -d

Access the development server:
  
    $ curl http://localhost

Modifiable folders
* `app`: files placed in this directory are served to users who access the server via a web browser (maps to `/var/www/html/`)
* `apache-config`: files placed in this directory are used to configure the Apache server (maps to `/etc/apache2`)
    * changes to these files require a restart of the development server

Stop the development server:

    $ docker compose down

# Debugging

Get a shell inside the running container:

    $ docker compose exec app bash

This is often preceeded by the following command to keep the container running if it fails on start:

    $ docker compose run -d app tail -f /dev/null

# Advanced

If you want to view the default apache configuration files:

    $ script/get-default-apache-config

If you need to make changes to the `Dockerfile` or `docker-compose.yml` files, you will need to rebuild the Docker image:

    $ docker compose up -d --build