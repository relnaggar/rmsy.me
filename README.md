# [🖼 My Mona Lisa: A Personal Website](https://rmsy.me)
[![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade-score/rmsy.me?publish)](https://observatory.mozilla.org/analyze/rmsy.me) [![30 day uptime ratio (Uptime Robot)](https://img.shields.io/uptimerobot/ratio/30/m784796051-da0b2757e43473b1f9d676b0)](https://stats.uptimerobot.com/KjJ317wYaG) [![Docker image size](https://img.shields.io/docker/image-size/relnaggar/rmsy.me)](https://hub.docker.com/r/relnaggar/rmsy.me) [![W3C Validation](https://img.shields.io/w3c-validation/html?targetUrl=https%3A%2F%2Frmsy.me)](https://validator.nu/?doc=https%3A%2F%2Frmsy.me) [![PageSpeed Insights](https://img.shields.io/badge/pagespeed_insights-99_100_100_100-43cc11)](https://pagespeed.web.dev/analysis/https-rmsy-me/xz200iqpci?form_factor=desktop)

## Project Overview
rmsy.me is a personal portfolio website with an authenticated portal for managing Ramsey's freelance tutoring business. It runs with two Docker services: a PHP/Apache app server, and a Node.js Vite dev server for frontend asset hot-reloading.

## Quick Start
Install git hooks (pre-commit lint, pre-push unit + E2E tests):
```bash
./script/install-git-hooks.sh
```
Emergency pre-push toggles (use only when needed):
```bash
SKIP_PRE_PUSH_TESTS=1 git push
SKIP_PRE_PUSH_E2E=1 git push
SKIP_PRE_PUSH_TESTS=1 SKIP_PRE_PUSH_E2E=1 git push
```

Start the local development services:
```bash
docker compose up
```
Access at `https://localhost/` (run `script/trust-self-signed-certificate-locally.sh` first for HTTPS).

Stop the services:
```bash
docker compose down
```

## Development Commands
Seed the database with sample data:
```bash
docker compose exec -u apache2 app bash -c "cd /var/www && php artisan db:seed"
```

This includes a test user for the portal:
- Email: `q@q`
- Password: `q`

Migrate the database:
```bash
docker compose exec -u apache2 app bash -c "cd /var/www && php artisan migrate"
```

Run linting:
```bash
docker compose exec app bash -c "cd /var/www && vendor/bin/pint"
```

Run unit tests:
```bash
docker compose exec app bash -c "cd /var/www && php artisan test"
```

Run E2E tests:
```bash
npm --prefix www run e2e
```

Get a shell in the app container:

```bash
docker compose exec app bash
```

## Rebuild and Restart Rules
Rebuild images after changes to:
- `Dockerfile.dev`
- `docker-compose.yml`
```bash
docker compose build
```

Restart services after changes to:
- `config/` (Apache/PHP config changes)
```bash
docker compose restart
```

## Architecture

### Docker Services
- `app`: serves the Laravel 12 app from `www/` at `/var/www/` (DocumentRoot: `/var/www/public`).
- `laravel-vite`: runs the Vite dev server for frontend asset hot-reloading during development.

### Laravel Application (`www/`)
Standard Laravel directory structure. Key custom components:
- `app/Data/` - Data classes (`Nav`, `NavItem`, `Project`, `Section`, `Source`, `Image`)
- `app/Providers/ViewServiceProvider.php` - Injects `$menuNav` and `$sidebarNav` into all Blade views via `NavService`

### Frontend Assets (`www/resources/`)
- SCSS: `scss/styles.scss` is the main entry point (imports Bootstrap 5 and custom partials). `scss/invoice.scss` is a separate entry for PDF invoice styling, which is not compatible with Bootstrap.
- JS: `js/main.js` is the main entry point (imports Bootstrap 5 JS).
- Built with Vite (`www/vite.config.js`). Build output goes to `www/public/build/`.
- CSP restriction: Inline `<script>` tags and styles are blocked by CSP. All JS must go in `www/resources/js/` and be loaded via Vite. All CSS must go in `www/resources/scss/` and be compiled by Vite.

## Database
SQLite database `laravel.sqlite` is stored in `db/` (mounted to `/var/db/` in the container).

## CI/CD
GitHub Actions (`.github/workflows/docker-image.yml`) builds Laravel assets (via `www/Dockerfile.build`), builds the production Docker image (`Dockerfile.build`), and pushes to Docker Hub on push to `main`.

## Secrets
Docker secrets live in `secrets/` and are referenced in `docker-compose.yml`.
