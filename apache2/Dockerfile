FROM debian:10.3-slim
RUN groupadd -r -g 999 apache2 && useradd -r -m -g apache2 -u 999 apache2

ENV PHPVERSION 7.3
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends gosu \
  # Apache 
  apache2 \
  # PHP                                                     
  libapache2-mod-php$PHPVERSION \
  # PHP Postgres
  php$PHPVERSION-pgsql \
  # composer (for PHPUnit)
  curl php$PHPVERSION-xml php$PHPVERSION-mbstring zip unzip \
  && curl --insecure https://getcomposer.org/installer --output composer-setup.php \
  # remove unnecessary packages
  && apt-get purge -y curl \
  # cleanup
  && rm -rf /var/lib/apt/lists/*

# composer (for PHPUnit)
RUN php composer-setup.php --install-dir=/usr/local/bin --filename=composer
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
