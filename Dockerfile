FROM node:10-alpine
WORKDIR /usr/server/
RUN npm install --global nodemon
COPY package.json /usr/server/
RUN npm install
COPY . /usr/sever/
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
