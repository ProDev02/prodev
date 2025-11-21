# =================== Base Image ===================
FROM node:20-alpine

WORKDIR /app

# Copy package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# Copy source code
COPY . .

# เปิด port ของ app (ตาม package.json start)
EXPOSE 3000

ENV HOST=0.0.0.0
# รัน app ด้วย npm start
CMD ["npm", "start"]
