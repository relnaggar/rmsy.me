#!/bin/bash
set -e

if [ "$1" = "postgres" ]; then
    chmod 700 $PGDATA

    # running internally to configure
    pg_ctl start -o "--config-file=$PGCONF/postgresql.conf --listen_addresses=''"
    psql -c "alter user postgres with password '`cat /run/secrets/PGPASSWORD`';"
    pg_ctl stop

    # running externally
    exec postgres --config-file=$PGCONF/postgresql.conf
else
    exec "$@"
fi

