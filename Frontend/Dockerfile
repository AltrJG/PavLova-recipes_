FROM node:25-alpine
WORKDIR /app
COPY package.json .
RUN npm install
RUN npm i -g serve
COPY . .
RUN npm run build
EXPOSE 14165
CMD [ "serve", "-s", "dist" ]
LABEL version='1.0' description='PavLova Recipes, an overpowered project by the Pavlova Team'