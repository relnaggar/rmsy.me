FROM debian:12.7-slim
ENV DEBIAN_FRONTEND=noninteractive

# install apache
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
  # for docker-entrypoint.sh
  gosu \
  # apache
  apache2 \
  # cleanup
  && apt autoremove -y \
  && apt clean \
  && rm -rf /var/lib/apt/lists/*

# make apache run as custom user for better permission control
RUN groupadd -r -g 999 apache2 && useradd -r -m -g apache2 -u 999 apache2 \
  && mkdir -p /var/run/apache2 \
  && chown -R apache2:apache2 /var/run/apache2 /var/log/apache2 \
  && sed -i 's/^User .*/User apache2/' /etc/apache2/apache2.conf \
  && sed -i 's/^Group .*/Group apache2/' /etc/apache2/apache2.conf \
  && sed -i 's/^export APACHE_RUN_USER=.*/export APACHE_RUN_USER=apache2/' \
    /etc/apache2/envvars \
  && sed -i 's/^export APACHE_RUN_GROUP=.*/export APACHE_RUN_GROUP=apache2/' \
    /etc/apache2/envvars

# enable HTTPS
RUN a2enmod ssl \
  && a2ensite default-ssl \
  # install ssl-cert for snakeoil cert
  && apt-get update -y \
  && apt-get install -y --no-install-recommends ssl-cert \
  # cleanup
  && apt autoremove -y \
  && apt clean \
  && rm -rf /var/lib/apt/lists/* \
  # fix permissions
  && chown root:apache2 /etc/ssl/private \
  && chmod 750 /etc/ssl/private \
  && chown root:apache2 /etc/ssl/private/ssl-cert-snakeoil.key \
  && chmod 640 /etc/ssl/private/ssl-cert-snakeoil.key

RUN a2enmod headers \
  && cat <<EOF >> /etc/apache2/conf-available/security.conf

# implement baseline permissive CSP globally
Header always set Content-Security-Policy: "\\
default-src 'none';\\
form-action 'self';\\
style-src 'self' https:;\\
script-src 'self';\\
img-src 'self' data: https:;\\
font-src 'self' https: data:;\\
frame-ancestors 'self';\\
"
EOF

RUN a2enmod headers \
  && cat <<'EOF' >> /etc/apache2/conf-available/security.conf

# make all cookies secure
Header always edit Set-Cookie (.*) "$1; Secure"
EOF

RUN a2enmod rewrite \
  && sed -i '/<\/VirtualHost>/d' /etc/apache2/sites-available/000-default.conf \
  && cat <<'EOF' >> /etc/apache2/sites-available/000-default.conf

  # rewrite HTTP to HTTPS
  RewriteEngine On
  RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L,QSA]
</VirtualHost>
EOF

RUN a2enmod headers \
  && cat <<'EOF' >> /etc/apache2/conf-available/security.conf

# implement permissive Referrer-Policy globally
Header always set Referrer-Policy: "strict-origin-when-cross-origin"
EOF

RUN a2enmod headers \
  && sed -i '/<\/VirtualHost>/d' /etc/apache2/sites-available/default-ssl.conf \
  && cat <<EOF >> /etc/apache2/sites-available/default-ssl.conf
  # implement HSTS in production mode
  <IfDefine PRODUCTION>
    Header always set Strict-Transport-Security "\\
max-age=15768000;\\
includeSubDomains\\
"
  </IfDefine>
</VirtualHost>
EOF

RUN a2enmod headers \
  && cat <<'EOF' >> /etc/apache2/conf-available/security.conf

# implement X-Content-Type-Options globally
Header always set X-Content-Type-Options: "nosniff"
EOF

# install php for apache
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
  # php (8.2 with debian:12.7)
  php php-mbstring php-xml php-curl php-zip \
  # apache2 php module
  libapache2-mod-php \
  # cleanup
  && apt autoremove -y \
  && apt clean \
  && rm -rf /var/lib/apt/lists/*

# set php config for development
RUN PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION;") \
  && sed -i \
  "s/^auto_prepend_file.*/auto_prepend_file = \
\/etc\/php\/${PHP_VERSION}\/apache2\/development_ini.php/" \
  "/etc/php/${PHP_VERSION}/apache2/php.ini" \
  && cat <<EOF > "/etc/php/${PHP_VERSION}/apache2/development_ini.php"
<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('zend.exception_ignore_args', 0);
ini_set('zend.exception_string_param_max_len', 15);
EOF

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
  # install composer dependencies
  ca-certificates \
  # cleanup
  && apt autoremove -y \
  && apt clean \
  && rm -rf /var/lib/apt/lists/*

# install composer
COPY --from=composer/composer:2.2-bin /composer /usr/bin/composer

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
  # install sqlite3 for php
  php-sqlite3 \
  # cleanup
  && apt autoremove -y \
  && apt clean \
  && rm -rf /var/lib/apt/lists/*

# database setup
RUN mkdir /var/db \
  && chown -R apache2:apache2 /var/db

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
  # install php-intl
  php-intl \
  # cleanup
  && apt autoremove -y \
  && apt clean \
  && rm -rf /var/lib/apt/lists/*

# add composer dependencies for rmsy.me
RUN composer require phpmailer/phpmailer
RUN composer require symfony/http-client

# add framework
RUN composer require relnaggar/veloz:^1.2

# entrypoint
ENV APP_ENVIRONMENT_MODE="DEVELOPMENT"
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["apache2"]

# ports
EXPOSE 80 443

# volumes
VOLUME ["/var/www", "/etc/apache2", "/etc/php", "/var/db"]
