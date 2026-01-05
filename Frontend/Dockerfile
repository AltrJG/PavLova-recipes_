FROM node:25-alpine
WORKDIR /app
COPY package.json .
RUN npm install
RUN npm i -g serve
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build
EXPOSE 14165
CMD [ "serve", "-s", "dist" ]
LABEL version='1.0' description='PavLova Recipes, an overpowered project by the Pavlova Team'