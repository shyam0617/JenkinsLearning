# ---- Dockerfile: packages THIS app into a Docker image ----
FROM node:24-alpine

WORKDIR /usr/src/app

# Copy package files first so Docker can cache "npm ci" when deps don't change.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source.
COPY . .

# The app listens on 3000 (see app.js).
EXPOSE 3000

CMD ["node", "app.js"]
