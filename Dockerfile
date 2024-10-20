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

# implement baseline secure but permissive CSP globally
RUN a2enmod headers \
  && echo "\n# implement baseline permissive CSP globally" \
    >> /etc/apache2/conf-available/security.conf \
  && echo "Header always set Content-Security-Policy: \"\
default-src 'none';\
form-action 'self';\
style-src 'self' https:;\
script-src 'self';\
img-src 'self' data: https:;\
font-src 'self' https: data:;\
frame-ancestors 'self';\"" \
    >> /etc/apache2/conf-available/security.conf

# make all cookies secure
RUN a2enmod headers \
  && echo "\n# make all cookies secure" \
    >> /etc/apache2/conf-available/security.conf \
  && echo "Header always edit Set-Cookie (.*) \"\$1; Secure\"" \
    >> /etc/apache2/conf-available/security.conf

# rewrite HTTP to HTTPS
RUN a2enmod rewrite \
  && sed -i '/<\/VirtualHost>/i \
  \ \n  \# rewrite HTTP to HTTPS\n\
  RewriteEngine On\n\
  RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L,QSA]' \
  /etc/apache2/sites-available/000-default.conf

# implement permissive Referrer-Policy globally
RUN a2enmod headers \
  && echo "\n# implement permissive Referrer-Policy globally" \
    >> /etc/apache2/conf-available/security.conf \
  && echo "Header always set Referrer-Policy: \"\
strict-origin-when-cross-origin\"" \
    >> /etc/apache2/conf-available/security.conf

# implement HSTS in production mode
RUN a2enmod headers \
  && sed -i '/<\/VirtualHost>/i \
  \ \n  \# implement HSTS in production mode\n\
  <IfDefine PRODUCTION>\n\
    Header always set Strict-Transport-Security \
\"max-age=15768000; includeSubDomains\"\n\
  </IfDefine>' \
  /etc/apache2/sites-available/default-ssl.conf

# implement X-Content-Type-Options globally
RUN a2enmod headers \
  && echo "\n# implement X-Content-Type-Options globally" \
    >> /etc/apache2/conf-available/security.conf \
  && echo "Header always set X-Content-Type-Options: \"nosniff\"" \
    >> /etc/apache2/conf-available/security.conf

# entrypoint
ENV APP_ENVIRONMENT_MODE="DEVELOPMENT"
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["apache2"]

# ports
EXPOSE 80 443

# volumes
VOLUME ["/var/www/html", "/etc/apache2"]
