FROM debian:10.3-slim
RUN groupadd -r -g 999 apache2 && useradd -r -m -g apache2 -u 999 apache2

ENV PYTHONVERSION 3.11.4
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
  # Python dependencies
  build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev ca-certificates \
  # Python 3.11.4 from source
  && wget https://www.python.org/ftp/python/${PYTHONVERSION}/Python-${PYTHONVERSION}.tgz \
  && tar -xvf Python-${PYTHONVERSION}.tgz \
  && cd Python-${PYTHONVERSION} \
  && ./configure --enable-optimizations --enable-shared \
  && make -j 2 \
  && make install \
  && cd .. \
  && rm -rf Python-${PYTHONVERSION}* \
  # cleanup
  && apt autoremove -y \
  && rm -rf /var/lib/apt/lists/*

ENV PHPVERSION 7.3
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends gosu \
  # Apache 
  apache2 \
  # PHP                                                     
  libapache2-mod-php${PHPVERSION} \
  php${PHPVERSION}-common \
  # OpenSSL
  openssl \
  # PHP Postgres
  php${PHPVERSION}-pgsql \
  # Composer PHP dependencies
  php${PHPVERSION}-xml php${PHPVERSION}-mbstring zip unzip \
  # for mod-wsgi
  apache2-dev \
  # postgres for Django
  libpq-dev \
  # Python backend
  && pip3 install mod-wsgi \
  # flask
  && pip3 install flask \
  # Django and DRF with postgres
  && pip3 install psycopg2 \
  && pip3 install Django \
  && pip3 install djangorestframework \
  # openai
  && pip3 install openai \
  # BeautifulSoup
  && pip3 install lxml \
  && pip3 install beautifulsoup4 \
  # docx
  && pip3 install python-docx \
  # libreoffice-writer and poppler-utils for docx to png conversion
  && apt-get install -y --no-install-recommends libreoffice-writer poppler-utils \
  # cleanup  
  && apt autoremove -y \
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
VOLUME ["/var/log/apache2", "/var/www", "/etc/apache2", "/etc/php/7.3/apache2", "/var/www/public/media"]
EXPOSE 8080
EXPOSE 8443
ENTRYPOINT ["/docker-entrypoint"]
CMD ["apache2"]
