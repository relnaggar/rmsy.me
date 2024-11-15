# [🖼 My Mona Lisa: A Personal Website](https://rmsy.me) 
[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade-score/rmsy.me?publish)](https://observatory.mozilla.org/analyze/rmsy.me) [![30 day uptime ratio (Uptime Robot)](https://img.shields.io/uptimerobot/ratio/30/m784796051-da0b2757e43473b1f9d676b0)](https://stats.uptimerobot.com/KjJ317wYaG)

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
* `config/apache2`: files placed in this directory are used to configure the Apache server (maps to `/etc/apache2`)
    * changes to these files require a restart of the development server
* `bundler/src/scss`: files placed in this directory are compiled to CSS and copied to the development server (`/var/www/html/css`)
    * changes to these files are detected automatically
* `bundler/src/js`: files placed in this directory are bundled to `/var/www/html/js`
    * changes to these files are detected automatically
* `config/php`: files placed in this directory are used to configure PHP (maps to `/etc/php`)
  * * changes to these files require a restart of the development server

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

If you want to fetch the default configuration files for apache or php:

```bash
script/get-default-config.sh
```

Changes to the following files require rebuilding with `docker compose build`:
* `Dockerfile`
* `docker-compose.yml`
* `bundler/Dockerfile`
* `bundler/package.json`
