# ใช้ Cypress image ที่มีมาให้
FROM cypress/included:15.2.0

# กำหนด working directory สำหรับ Cypress
WORKDIR /e2e

# คัดลอกไฟล์จากเครื่องของเราไปยัง container
COPY . /e2e

# ติดตั้ง Cypress (หากยังไม่ได้ติดตั้งใน base image)
RUN npm install

# รัน Cypress เมื่อ container เริ่มต้น
CMD ["npx", "cypress", "open"]
