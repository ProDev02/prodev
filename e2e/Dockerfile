FROM node:20-alpine

# ติดตั้ง npm
RUN npm install -g npm

# คัดลอกและติดตั้ง dependencies ของ project
WORKDIR /e2e
COPY package*.json ./
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# รันคำสั่ง npx cypress
CMD ["npx", "cypress", "run"]
