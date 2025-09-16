# backend/Dockerfile
FROM node:20-slim

WORKDIR /app

# Copy dependency manifests from project root
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy only backend code into the image
COPY backend ./backend

# Set working directory to backend for running the server
WORKDIR /app/backend

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
