FROM node:8

# Create user
RUN useradd --create-home -s /bin/bash user
RUN usermod -aG sudo user

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# Expose the port
EXPOSE 3000

# Environment Variables
ENV PDC_DB_GQ pdc
ENV PDC_DB_GQ_USER PDCAdmin
# Password to be set locally
ENV PDC_DB_GQ_PWD 
ENV PDC_DB_GQ_HOST 127.0.0.1
ENV PDC_DB_GQ_DIALECT mysql
ENV PDC_DB_GQ_PORT 3306
ENV PDC_ELASTICACHE_HOST 127.0.0.1
ENV PDC_ELASTICACHE_PORT 6379
#elasticache enable flag for local development
ENV PDC_ELASTICACHE_ENABLE true

# run the command to start the server
#CMD [ "npm", "start" ]

# run the command to establish ssh tunnel and start the server
CMD ssh -o TCPKeepAlive=yes -o ServerAliveInterval=30 -o StrictHostKeyChecking=no -i pdcDevKeyBastion.pem -f ec2-user@pdc-dev.esacinc.com -L 3306:development-rds.cigm1ydzxo6j.us-east-1.rds.amazonaws.com:3306 -L 6379:dev-elasticache.ucpg92.0001.use1.cache.amazonaws.com:6379 -N && npm start

