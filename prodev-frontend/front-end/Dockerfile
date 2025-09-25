# DockerFile ของ frontend
FROM node:20-alpine

WORKDIR /app

# Copy package.json ก่อนเพื่อติดตั้ง dependencies
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

EXPOSE 3000

# Start frontend dev server
CMD ["npm", "start"]
