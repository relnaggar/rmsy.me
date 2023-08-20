FROM debian:10.3-slim
RUN groupadd -r -g 999 postgres && useradd -r -m -g postgres -u 999 postgres

ENV PGVERSION 15
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends postgresql-common gnupg \
  # manual fix to remove confirmation (-y not working, something about the script is broken)
  && sed -i '/read/d' /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh \
  && /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh \
  && apt-get install -y --no-install-recommends postgresql-${PGVERSION} \
  # cleanup
  && rm -rf /var/lib/apt/lists/*

ENV PATH /usr/lib/postgresql/${PGVERSION}/bin/:$PATH
ENV PGCONF /etc/postgresql/${PGVERSION}/main
ENV PGDATA /var/lib/postgresql/${PGVERSION}/main
COPY docker-entrypoint /

USER postgres
VOLUME ["/var/lib/postgresql/15/main", "/etc/postgresql/15/main"]
EXPOSE 5432
ENTRYPOINT ["/docker-entrypoint"]
CMD ["postgres"]
