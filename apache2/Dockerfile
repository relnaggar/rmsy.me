FROM debian:10.3-slim
RUN groupadd -r -g 999 apache2 && useradd -r -m -g apache2 -u 999 apache2

RUN apt-get update -y \
  # Apache 
  && apt-get install -y --no-install-recommends apache2 \
  # PHP                                                     
  libapache2-mod-php7.3 \
  # PHP Postgres
  php7.3-pgsql \
  # composer (for PHPUnit)
  curl php7.3-xml php7.3-mbstring zip unzip \
  && curl --insecure https://getcomposer.org/installer --output composer-setup.php \
  # remove unnecessary packages
  && apt-get purge -y curl \
  # cleanup
  && rm -rf /var/lib/apt/lists/*

# composer (for PHPUnit)
RUN php composer-setup.php --install-dir=/usr/local/bin --filename=composer

USER apache2

# PHPUnit
RUN composer global require phpunit/phpunit ^9.1

VOLUME ["/var/www", "/etc/apache2", "/var/log/apache2", "/etc/php/7.3/apache2"]
EXPOSE 8080
EXPOSE 8443
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
