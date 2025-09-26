# ใช้ Node.js Alpine image เป็น base image
FROM node:20-alpine

# ติดตั้ง npm และ npx
RUN npm install -g npm
RUN npm install -g npx

# สร้างโฟลเดอร์และทำงานใน /e2e
WORKDIR /e2e

# คัดลอก package.json และ package-lock.json ของ e2e
COPY e2e/package*.json ./

# ติดตั้ง dependencies ของ project
RUN npm install

# คัดลอกโค้ดทั้งหมดจากโฟลเดอร์ e2e
COPY e2e/ ./

# คัดลอก Cypress config (ถ้ามี)
COPY e2e/cypress.json ./

# รัน Cypress tests เมื่อ container ถูกสร้างและรัน
CMD ["npx", "cypress", "run"]
