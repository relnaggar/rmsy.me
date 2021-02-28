FROM debian:10.3-slim

# https://github.com/geerlingguy/ansible-role-java/issues/64
RUN mkdir /usr/share/man/man1/

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
  # Gradle
  gradle \
  # cleanup
  && rm -rf /var/lib/apt/lists/*

ENV GRADLE_PROJECT=/home/cucumber
COPY cucumber/build.gradle ${GRADLE_PROJECT}/build.gradle
COPY cucumber/settings.gradle ${GRADLE_PROJECT}/settings.gradle

WORKDIR ${GRADLE_PROJECT}
RUN ["gradle", "build"]

COPY cucumber ${GRADLE_PROJECT}
COPY docker-entrypoint /

ENTRYPOINT ["/docker-entrypoint"]
CMD ["cucumber", "https://host.docker.internal"]
