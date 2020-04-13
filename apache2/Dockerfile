FROM debian:10.3-slim

RUN apt-get update -y && \
  apt-get install -y --no-install-recommends apache2 libapache2-mod-php7.3 php-xml php-mbstring wget zip unzip && \
  apt-get autoremove -y && apt-get clean

RUN wget --no-check-certificate https://getcomposer.org/installer
RUN php installer --install-dir=/usr/local/bin --filename=composer

RUN groupadd -r apache2 && useradd -r -m -g apache2 apache2
USER apache2
RUN composer global require phpunit/phpunit ^9.1

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
