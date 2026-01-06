FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

ENV PORT=8082

EXPOSE 8082

CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY src ./src
COPY readme.md ./README.md

EXPOSE 8082

CMD ["npm", "start"]


