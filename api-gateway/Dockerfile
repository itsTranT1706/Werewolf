FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY src ./src
COPY readme.md ./README.md

ENV PORT=80
EXPOSE 80

CMD ["npm", "start"]
