FROM debian:10.3-slim

RUN apt-get update -y && \
  apt-get install -y --no-install-recommends apache2 libapache2-mod-php7.3 && \
  apt-get autoremove -y && apt-get clean

CMD ["/usr/sbin/apache2", "-D", "FOREGROUND"]
