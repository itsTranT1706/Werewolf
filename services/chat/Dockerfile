FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY src ./src
COPY readme.md ./README.md

EXPOSE 8085

CMD ["npm", "start"]
