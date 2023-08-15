FROM debian:10.3-slim
RUN groupadd -r -g 999 apache2 && useradd -r -m -g apache2 -u 999 apache2

ENV PHPVERSION 7.3
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends gosu \
  # Apache 
  apache2 \
  # PHP                                                     
  libapache2-mod-php${PHPVERSION} \
  php${PHPVERSION}-common \
  #OpenSSL
  openssl \
  # PHP Postgres
  php${PHPVERSION}-pgsql \
  # Composer PHP dependencies
  php${PHPVERSION}-xml php${PHPVERSION}-mbstring zip unzip \
  # Python 3.7 and WSGI
  libapache2-mod-wsgi-py3 \
  # flask
  python3-flask \
  # cleanup
  && rm -rf /var/lib/apt/lists/*

COPY cli-ini /etc/php/${PHPVERSION}/cli
COPY certs /usr/lib/ssl/certs

# composer (for PHPUnit)
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
  && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
  && php -r "unlink('composer-setup.php');"
ENV PATH $PATH:/home/apache2/.composer/vendor/bin/

USER apache2
# PHPUnit
RUN composer global require phpunit/phpunit ^9.1

USER root

# permissions for WSGISocketPrefix /var/run/apache2/wsgi
RUN chown -R apache2:apache2 /var/run/apache2

ENV WEBSITE_ENV=DEVELOPMENT
COPY docker-entrypoint /
VOLUME ["/var/log/apache2", "/var/www", "/etc/apache2", "/etc/php/7.3/apache2"]
EXPOSE 8080
EXPOSE 8443
ENTRYPOINT ["/docker-entrypoint"]
CMD ["apache2"]
