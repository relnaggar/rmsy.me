FROM node:20-alpine
WORKDIR /bundler

# install dependencies
COPY package.json .
RUN npm install

# entrypoint
CMD ["npm", "start"]

# volumes
VOLUME ["/bundler/src", "/bundler/dist/css", "/bundler/dist/js", "/bundler/dist/fonts"]
