# apache2

## Quick Start

Start the development server:

```bash
docker compose up -d
```

Access the development server:

```bash
curl http://localhost
```

Access the development server via HTTPS:

```bash
script/trust-self-signed-certificate-locally.sh
curl https://localhost
```

Modifiable folders
* `app`: files placed in this directory are served to users who access the server via a web browser (maps to `/var/www/html/`)
* `apache-config`: files placed in this directory are used to configure the Apache server (maps to `/etc/apache2`)
    * changes to these files require a restart of the development server

Stop the development server:

```bash
docker compose down
```

# Debugging

Get a shell inside the running container:

```bash
docker compose exec app bash
```

This is often preceeded by the following command to keep the container running if it fails on start:

```bash
docker compose run -d app tail -f /dev/null
```

# Advanced

If you want to view the default apache configuration files:

```bash
script/get-default-apache-config
```

If you need to make changes to the `Dockerfile` or `docker-compose.yml` files, you will need to rebuild the Docker image:

```bash
docker compose up -d --build
```