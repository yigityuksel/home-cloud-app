#!/bin/bash 

FROM node:8

# Create app directory
RUN mkdir -p /usr/src/home-cloud-app
WORKDIR /usr/src/home-cloud-app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . /usr/src/home-cloud-app

CMD [ "npm", "start" ]