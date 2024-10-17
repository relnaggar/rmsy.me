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
  && sed -i 's/^export APACHE_RUN_USER=.*/export APACHE_RUN_USER=apache2/' /etc/apache2/envvars \
  && sed -i 's/^export APACHE_RUN_GROUP=.*/export APACHE_RUN_GROUP=apache2/' /etc/apache2/envvars

# entrypoint
ENV APP_ENVIRONMENT_MODE="DEVELOPMENT"
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["apache2"]

# volumes
VOLUME ["/var/www/html", "/etc/apache2"]

# ports
EXPOSE 80
