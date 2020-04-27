<!-- TODO ![Logo of the project](./images/logo.png)-->

# rmsy.me
[![website status](https://img.shields.io/website?url=https://rmsy.me)](https://rmsy.me) [![7 day uptime ratio (Uptime Robot)](https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url=https://img.shields.io/uptimerobot/ratio/7/m784796051-da0b2757e43473b1f9d676b0)](https://status.rmsy.me) [![Mozilla HTTP Observatory Grade](https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url=https://img.shields.io/mozilla-observatory/grade-score/rmsy.me?publish)](https://observatory.mozilla.org/analyze/rmsy.me) [![Github License](https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url=https://img.shields.io/github/license/relnaggar/rmsy.me)](https://github.com/relnaggar/rmsy.me/blob/master/LICENSE)

> A personal website

A personal playground for learning concepts and tools related to developing, testing and deploying web apps.

## Introduction

The website is live at https://rmsy.me.

The following instructions are for developing, testing, and staging the website locally.

<!--
### Built With
TODO: list libraries and frameworks used including versions
-->

## Prerequisites

macOS 10.13+:
* Docker Desktop for Mac v2.2.0.5+

<!--
Amazon Linux 2:
* Docker
* Docker Compose 3.7
* TODO: finish bootstrap
-->

Other:
* not currently supported

## Setting up

```shell
# download the project
git clone https://github.com/relnaggar/rmsy.me.git
cd rmsy.me/script

# install the prerequisites if not already installed
./bootstrap

# setup the project for development
./setup

# build and run the server using the development build
./server up

# verify the server is running
curl https://localhost/

# run all available tests on the current build
./test
```

The setup script executes the following tasks:
* initialises a swarm, putting the Docker Engine into swarm mode
* symlinks .git/hooks/ to githooks/
* creates the external Docker volumes for the project (if not already present)
* generates local development secrets (SSL certificate and database password)
  * this step requires sudo access to trust the generated SSL certificate
  
## Development 

### Developing

Modifications to files in the following folders will show immediately on the development build:
* `/apache2/www/`

Modifications to files in the following folders require a restart before they will show on the development build:
* `/apache2/conf/`
* `/apache2/ini/`
* `/postgres/conf/`
* any `Dockerfile`
* any `docker-entrypoint`

```shell
cd script

# rebuild and restart the application on the development build
./server up
```

### Debugging

The following commands are available to help debug the application during development:
```shell
cd script

# view the status of running services
./status

# view the logs for running and stopped services
./logs

# enter a console for the container running a particular service
./console service

# ensure the console is opened as the root user for that container
./console service --root
```

These debugging commands also work automatically in staging/production mode.

### Building

The production build is without testing dependencies or bind mounts. Any modifications to a development Dockerfile (`Dockerfile`) should be reflected in the corresponding production Dockerfile (`Dockerfile.prod`) and tested with:

```shell
cd script

# build and run the application using the production build
./server up prod

# run end-to-end tests on the production build
./test
```

### Staging

A pre-push hook ensures all tests are running on both builds before changes can be pushed.

After pushing, the production images are automatically rebuilt on Docker hub (this can take a few minutes):
* apache2 : [![Docker image size](https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url=https://img.shields.io/docker/image-size/relnaggar/rmsy-me-apache2)](https://hub.docker.com/repository/docker/relnaggar/rmsy-me-apache2/tags)
* postgres : [![Docker image size](https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url=https://img.shields.io/docker/image-size/relnaggar/rmsy-me-postgres)](https://hub.docker.com/repository/docker/relnaggar/rmsy-me-postgres/tags)
  
Development mode runs the application with Docker Compose but in production the application runs using Docker Swarm. There are a few differences between the two (mostly to do with secret passing) so test the application locally in staging mode before deployment:

```shell
git push

# wait for the production images to be rebuilt on Docker Hub

cd script

# stop the application running in development mode and run in staging mode
# (using Docker Swarm and the external images from Docker Hub)
./server up -s

# run end-to-end tests on the staged application
./test
```

## Production

The following can only be executed on the production server:
```shell
cd script

# backup the production database to backup/:
./backup db

# run/update the application in production mode
# (using the production secrets and database)
./server up -p
```

<!--
## Api Reference
If the api is external, link to api documentation. If not describe your api including authentication methods as well as explaining all the endpoints with their required parameters.
-->

<!-- ## Database
Explaining what database (and version) has been used. Provide download links. Documents your database design and schemas, relations etc...
-->
