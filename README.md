<!-- TODO ![Logo of the project](./images/logo.png)-->

# [rmsy.me](https://rmsy.me)
[![7 day uptime ratio (Uptime Robot)](https://img.shields.io/uptimerobot/ratio/7/m784796051-da0b2757e43473b1f9d676b0)](https://stats.uptimerobot.com/Dwjv4hBo98) [![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade-score/rmsy.me?publish)](https://observatory.mozilla.org/analyze/rmsy.me) [![GitHub License](https://img.shields.io/badge/license-MIT-green)](https://github.com/relnaggar/rmsy.me/blob/master/LICENSE)

> A personal website

A personal playground for learning concepts and tools related to developing, testing and deploying web apps.

<!--
## Built With
TODO: list libraries and frameworks used including versions
-->

## Prerequisites

macOS 10.13+:
* Docker Desktop for Mac v2.2.0.5+

Amazon Linux 2:
* Docker v19.03.6+
* Docker Compose v1.25.4+

Other:
* not currently supported

## Development

### Setting up

```shell
# download the project
git clone https://github.com/relnaggar/rmsy.me.git
cd rmsy.me/script

# install the prerequisites if not already installed
./bootstrap

# setup the project for development
./setup

# build and run the application using the development build
./server up

# verify the local website is running
curl https://localhost/

# run unit and end-to-end tests on the development build
./test
```

The setup script executes the following tasks:
* initialises a swarm, putting the Docker Engine into swarm mode
* symlinks `.git/hooks/` to `githooks/`
* creates the external Docker volumes for the project (if not already present)
* generates local development secrets (an SSL certificate and database password)
  * this step requires sudo access to trust the generated SSL certificate
  
### Developing

Modifications to files in the following directories will show immediately on the development build:
* `/apache2/www/`

Modifications to files in the following directories require a restart before they will show on the development build:
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

### Building

The production build is without testing dependencies or bind mounts. Any modifications to a development Dockerfile (`Dockerfile`) should be reflected in the corresponding production Dockerfile (`Dockerfile.prod`) and tested with:

```shell
cd script

# build and run the application using the production build
./server up prod

# run end-to-end tests on the production build
./test
```

## Staging

```shell
# a pre-push hook ensures all tests are passing on both builds before pushing
git push

docker push relnaggar/rmsy-me-apache2
docker push relnaggar/rmsy-me-postgres
```

The latter commands push the production images to Docker hub:
* apache2 : [![Docker image size](https://img.shields.io/docker/image-size/relnaggar/rmsy-me-apache2)](https://hub.docker.com/repository/docker/relnaggar/rmsy-me-apache2/tags)
* postgres : [![Docker image size](https://img.shields.io/docker/image-size/relnaggar/rmsy-me-postgres)](https://hub.docker.com/repository/docker/relnaggar/rmsy-me-postgres/tags)

Development mode runs the application with Docker Compose but production runs the application with Docker Swarm. There are a few differences between the two (mostly to do with passing secrets) so test the application locally in staging mode before deploying:

```shell
cd script

# wait for the production images to be rebuilt on Docker Hub

# stop the application running in development mode and run in staging mode
# (using Docker Swarm and the external images from Docker Hub)
./server up -s

# run end-to-end tests on the staged application
./test
```

## Production

### Setting up

To set up a fresh production server (e.g. an AWS EC2 instance):

```shell
# install git
sudo yum install -y git

# download the project
git clone https://github.com/relnaggar/rmsy.me.git
cd rmsy.me/script

# install the prerequisites
./bootstrap

# setup the project
./setup
```

Before deploying, it's also necessary to generate production secrets:
* SSL certificates (e.g. using [Certbot](https://certbot.eff.org/))
* a file with appropriate permissions to store a secure database password

### Deploying

Change Cloudfare 'Development Mode' to 'On' to force Cloudfare's cache to clear.

On the production server:
```shell
git pull

cd script

# backup the production database to backup/:
./backup db

# run/update the application in production mode
# (using the production secrets and database)
./server up -p
```

Change Cloudfare 'Development Mode' back to 'Off'.

### Verifying

On the development machine:
```shell
# verify the website is running
curl https://rmsy.me/

# run end-to-end tests on the live application
./test live
```

## Debugging

The following commands are available to help debug the application during development, staging or production:

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

<!--
## Api Reference
If the api is external, link to api documentation. If not describe your api including authentication methods as well as explaining all the endpoints with their required parameters.
-->

<!-- ## Database
Explaining what database (and version) has been used. Provide download links. Documents your database design and schemas, relations etc...
-->
