FROM node:8

# Create the working directory
WORKDIR /usr/src/app

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/lib/node_modules/@angular-cli/bin

# Now do some cleanup
RUN apt-get -yq autoremove
RUN apt-get clean

# Now copy up the package.json and npm install
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli

# Then copy up the source
COPY . .

# Expose the port
EXPOSE 9090

# Then run the command
CMD [ "npm", "start" ]
