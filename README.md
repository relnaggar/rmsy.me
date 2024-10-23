# apache2

## Quick Start

Start the development server:

```bash
docker compose up
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
* `www`: files placed in this directory are copied to the development server (maps to `/var/www/`)
* `www/html`: files placed in this directory are served to users who access the server via a web browser (maps to `/var/www/html/`)
* `apache-config`: files placed in this directory are used to configure the Apache server (maps to `/etc/apache2`)
    * changes to these files require a restart of the development server
* `bundler/src/scss`: files placed in this directory are compiled to CSS and copied to the development server (`/var/www/html/css`)
    * changes to these files are detected automatically
* `bundler/src/js`: files placed in this directory are bundled to `/var/www/html/js`
    * changes to these files are detected automatically

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

Changes to the following files require rebuilding with `docker compose build`:
* `Dockerfile`
* `docker-compose.yml`
* `bundler/Dockerfile`
* `bundler/package.json`
