FROM debian:10.3-slim
RUN groupadd -r -g 999 postgres && useradd -r -m -g postgres -u 999 postgres

ENV PGVERSION 11
RUN apt-get update -y \
  # PostgreSQL
  && apt-get install -y --no-install-recommends postgresql-$PGVERSION \
  # cleanup
  && rm -rf /var/lib/apt/lists/*

ENV PATH $PATH:/usr/lib/postgresql/$PGVERSION/bin/
ENV PGCONF /etc/postgresql/$PGVERSION/main
ENV PGDATA /var/lib/postgresql/$PGVERSION/main
COPY docker-entrypoint.sh /

USER postgres
VOLUME ["/etc/postgresql/11/main", "/var/lib/postgresql/11/main"]
EXPOSE 5432
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["postgres"]
