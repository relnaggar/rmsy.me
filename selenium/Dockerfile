FROM debian:10.3-slim

# https://github.com/geerlingguy/ansible-role-java/issues/64
RUN mkdir /usr/share/man/man1/

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
  # Gradle
  gradle \
  # cleanup
  && rm -rf /var/lib/apt/lists/*

ARG GRADLE_PROJECT
ENV GRADLE_DIR=/home/gradle

COPY ${GRADLE_PROJECT}/build.gradle ${GRADLE_DIR}/build.gradle

WORKDIR ${GRADLE_DIR}
RUN ["gradle", "build"]

VOLUME ["/home/gradle/java"]

COPY docker-entrypoint /
ENTRYPOINT ["/docker-entrypoint"]
