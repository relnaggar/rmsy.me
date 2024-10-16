FROM debian:12.7-slim
ENV DEBIAN_FRONTEND=noninteractive

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

# allow apache to run as www-data
RUN mkdir -p /var/run/apache2 \
  && chown -R www-data:www-data /var/run/apache2 /var/log/apache2

# entrypoint
ENV APP_ENVIRONMENT_MODE="DEVELOPMENT"
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["apache2"]

# volumes
VOLUME ["/var/www/html"]

# ports
EXPOSE 80
