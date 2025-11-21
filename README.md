# E-commerce Website for a Food Store

### Table of Contents
- [1. User Story](#User-Stories)
- [2. Clone Project](#Clone-Project)
- [3. Run docker compose](#Run-docker-compose)
- [4. Set up database](#Set-up-database)
- [5. Frontend port](#Fronted-port)
- [6. ตรวจสอบ log ของแต่ละ service](#ตรวจสอบ-log-ของแต่ละ-service)

### User Stories
1. สำหรับผู้ซื้อ (Customer)
    1) สมัครสมาชิก / เข้าสู่ระบบ
         * ในฐานะผู้ซื้อจะต้องสามารถสมัครสมาชิกและเข้าสู่ระบบได้โดยการกรอก Email และ Password ที่ถูกต้อง เพื่อให้สามารถสั่งซื้อสินค้าและดูรายการคำสั่งซื้อได โดยกดที่ Icon Account เพื่อเลือก Login / login Admin / Register
    2) เรียกดูสินค้าหรือแค็ตตาล็อก
         * ในฐานะผู้ซื้อจะต้องสามารถเรียกดูรายการสินค้าตามหวดหมู่ หรือค้นหาด้วยชื่อสินค้า เพื่อให้สามารถหาสินค้าที่ต้องการได้
    3) เพิ่ม / แก้ไขรายการสินค้าเข้าสู่ตระกร้า
         * ในฐานะผู้ซื้อจะต้องสามารถเพิ่มรายการสินค้าลงในตระกร้าได้ สามารถปรับจำนวนสินค้าที่ต้องการเพิ่มได้ เพื่อให้สามารถจัดการรายการสั่งซื้อก่อนชำระเงินได้ โดยกด add ตรงใต้รายการสินค้านั้น ๆ
    4) ชำระเงิน / Checkout
         * ในฐานะผู้ซื้อจะต้องสามารถกรอกข้อมูลที่อยู่และเลือกวิธีชำระเงิน เพื่อให้สามารถสั่งซื้อสินค้าได้สำเร็จ โดยกด payment ของ cartsidebar และกด Pay Now!!
    5) ติดตามสถานะคำสั่งซื้อ
         * ในฐานะผู้ซื้อจะต้องสามารถดูสถานะคำสั่งซื้อ เพื่อให้ทราบว่าสินค้าอยู่ระหว่างจัดส่งหรือจัดส่งแล้ว โดยกด icon รถเข็นและกด order เพื่อติดตามคำสั่งซื้อ
    6) เก็บคูปองและเลือกใช้คูปอง
         * ในฐานะผู้ซื้อต้องสามารถเก็บคูปองส่วนลดเพื่อนำไปใช้ในหน้า payment โดยกดที่ไอคอนของขวัญสีเขียวที่มุมซ้ายล่าง เลือกคูปองที่จะเก็บผ่านกดปุ่มเก็บ และสามารถสุ่มคูปองใหม่ได้ โดยจะสุ่มส่วนลดช่วง 1.0 - 5.0%  และสามารถนำไปใช้ในหน้า payment โดยกด dropdown เพื่อเลือกคูปองที่เก็บของแต่ละ user
    7) ระบบสั่งสินค้าซ้ำ/ reorder option
         * ในฐานะผู้ซื้อต้องสามารถดูประวัติการสังซื้อและสามารถสั่งซื้อสินค้านั่นได้อีกครั้ง โดยใน icon รถเข็นสินค้าหน้า home เมื่อกดเข้าไปจะมี tab ชื่อ order hostory และจะแสดงสินค้าที่เคยสั่งซื้อไปเมื่อกด “สั่งซ้ำ” จะส่งสินค้านั้นเข้า shopcart อีกครั้ง
    8) ระบบปริ้น pdf สรุปรายการที่สั่งซื้อ
         * ในฐานะผู้ซื้อต้องสามารถดูสรุปรายการที่สั่งซื้อและสรุปส่วนลดที่เลือกด้วย โดยสามารถโหลดไฟล์ pdf ได้หลังจากกด Pay now ที่หน้า payment ระบบจะอัปโหลด pdf ให้อัตโนมัติ
2. สำหรับผู้ขาย (Admin / Seller)
    1) จัดการายการสินค้า
         * ในฐานะผู้ขายจะต้องสามารถเพิ่ม แก้ไข หรือลบสินค้า เพื่อให้สามารถควบคุมแค็ตตาล็อกสินค้าได้
    2) ตรวจสอบ order
         * ในฐานะผู้ขายจะต้องสามารถดูคำสั่งซื้อทั้งหมด เพื่อให้สามารถจัดส่งสินค้าและติดตามสถานะคำสั่งซื้อได้
    3) ปรับสถานะคำสั่งซื้อ
         * ในฐานะผู้ขายจะต้องสามารถรปรับสถานะคำสั่งซื้อ (pending / cancel) เพื่อให้ผู้ซื้อสามารถกด receive เพื่อรับของได้
    4) แจ้งเตือนเมื่อสินค้าหมดสต็อก
         * ในฐานะผู้ขายจะต้องสามารถให้ระบบแจ้งเตือนเมื่อมีสินค้าที่หมดสต็อกเพื่อให้ผู้ขายสามารถเข้าไปเพิ่มสินค้าได้ โดยเมื่อทุกครั้งที่ login บัญชี admin มันจะแสดง pop up กลางหน้าจอว่าสินค้าอะไรบ้างที่หมดสต็อก
    5) รายงานสต็อกสินค้ารายสัปดาห์
         * ในฐานะผู้ขายจะต้องสามารถดูรายงานสรุปข้อมูลสินค้าทั้งหมดที่มีในระบบเพื่อดูว่ามีสินค้าไหนจำนวนน้อยลงในแต่ละสัปดาห์ โดยกดปุ่ม “weekly stock report” เพื่อดูรายงานข้อมูลสินค้า หลัง login สำเร็จ


### Clone Projects
เปิด Terminal แล้วรัน:
```bash
git clone https://github.com/ProDev02/prodev
git checkout main
```

## Run docker compose
รันคำสั่งที่ root ของโปรเจ็ค:
```bash
 docker-compose up --build -d
```

เมื่อรันเสร็จจะพบสถานะดังนี้

```bash
[+] Running 5/5
 ✔ ideaprojects-backend               Built                                                                                                                                   0.0s 
 ✔ ideaprojects-frontend              Built                                                                                                                                   0.0s 
 ✔ Container ideaprojects-backend-1   Started                                                                                                                                 0.8s 
 ✔ Container prodev_db                Started                                                                                                                                 0.3s 
 ✔ Container ideaprojects-frontend-1  Started                                                                                                                                 0.3s
```

## Set up database
```bash
 component       port   user  password   host
MySQL Database  3306   root  ict555!!!  localhost
```

## Backend port
สามารถเข้าถึง API ของระบบ Backend ได้ผ่าน URL:
[http://localhost:8080/api/*](http://localhost:8080/api/*)
ตัว api จะอยู่ใน folder prodev

ตัวอย่างทดสอบ
[http://localhost:8080/api/products/all](http://localhost:8080/api/products/all)


ตัวอย่าง Dockerfile (อยู่ที่ root ของ folder prodev):
```
# Stage 1: Build the Spring Boot JAR
FROM gradle:8.8-jdk21-alpine AS build
WORKDIR /app

# Copy source code
COPY . .

# Build jar (skip tests for speed)
RUN gradle clean build -x test

# Stage 2: Run the application
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy built JAR from stage 1
COPY --from=build /app/build/libs/*.jar app.jar

# Map folder uploads
VOLUME /app/uploads

# Expose port
EXPOSE 8080

# Run Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Frontend port
[http://localhost:3000](http://localhost:3000)
code UI จะอยู่ที่ path prodev-frontend/front-end

ตัวอย่าง Dockerfile (อยู่ที่ root ของ front-end):
```
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
```

## ตรวจสอบ log ของแต่ละ service
```
docker ps:
PS C:\Users\ADMIN\IdeaProjects> docker ps
CONTAINER ID   IMAGE                           COMMAND                  CREATED             STATUS             PORTS                                         NAMES
843720dbc464   ideaprojects-backend            "java -jar app.jar"      About an hour ago   Up About an hour   0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp   ideaprojects-backend-1
c11dcda3753f   ideaprojects-frontend           "docker-entrypoint.s…"   6 hours ago         Up About an hour   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp   ideaprojects-frontend-1
9e6894720dc7   mysql:8.0                       "docker-entrypoint.s…"   3 weeks ago         Up About an hour   0.0.0.0:3307->3306/tcp, [::]:3307->3306/tcp   prodev_db
```

ดูแต่ละ log (ตัวอย่าง):
```
docker-compose log ideaprojects-backend
docker-compose log ideaprojects-frontend
docker-compose log prodev_db
```
