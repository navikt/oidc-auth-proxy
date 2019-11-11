FROM node:alpine

WORKDIR /usr/src/app

COPY dist ./dist
COPY node_modules ./node_modules
COPY package.json .

EXPOSE 8080
CMD ["npm", "run", "start"]