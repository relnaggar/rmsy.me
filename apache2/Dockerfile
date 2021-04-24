FROM debian:10.3-slim
RUN groupadd -r -g 999 apache2 && useradd -r -m -g apache2 -u 999 apache2

ENV PHPVERSION 7.3
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends gosu \
  # Apache 
  apache2 \
  # PHP                                                     
  libapache2-mod-php$PHPVERSION \
  #OpenSSL
  openssl \
  # PHP Postgres
  php$PHPVERSION-pgsql \
  # Composer PHP dependencies
  php${PHPVERSION}-xml php${PHPVERSION}-mbstring zip unzip \
  # cleanup
  && rm -rf /var/lib/apt/lists/*

COPY cli-ini /etc/php/${PHPVERSION}/cli
COPY certs /usr/lib/ssl/certs

# composer (for PHPUnit)
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
  && php -r "if (hash_file('sha384', 'composer-setup.php') !== '756890a4488ce9024fc62c56153228907f1545c228516cbf63f885e036d37e9a59d27d63f46af1d4d07ee0f76181c7d3') { throw new Exception('Installer corrupt'); }" \
  && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
  && php -r "unlink('composer-setup.php');"
ENV PATH $PATH:/home/apache2/.composer/vendor/bin/

USER apache2
# PHPUnit
RUN composer global require phpunit/phpunit ^9.1

USER root
COPY docker-entrypoint /
VOLUME ["/var/log/apache2", "/var/www", "/etc/apache2", "/etc/php/7.3/apache2"]
EXPOSE 8080
EXPOSE 8443
ENTRYPOINT ["/docker-entrypoint"]
CMD ["apache2"]
