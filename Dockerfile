FROM node:alpine AS build

WORKDIR /app

COPY . .

RUN npm i

EXPOSE 3000

CMD ["node", "app.js"]
