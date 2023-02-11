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
  # cleanup
  && rm -rf /var/lib/apt/lists/*

COPY cli-ini /etc/php/${PHPVERSION}/cli
COPY certs /usr/lib/ssl/certs

# composer (for PHPUnit)
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
  && php -r "if (hash_file('sha384', 'composer-setup.php') === '55ce33d7678c5a611085589f1f3ddf8b3c52d662cd01d4ba75c0ee0459970c2200a51f492d557530c71c15d8dba01eae') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" \
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
