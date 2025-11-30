# devops-dst-2025-kube-deployment-config


## สิ่งที่ต้องเตรียม
ต้อง Push Docker Image ของ FrontEnd และ BackEnd ขึ้น Dockerhub ให้เรียบร้อย ผ่าน CI/CD ที่ทำกันมาแล้ว

## Step 1
Copy Folder "example" แล้วเปลี่ยนชื่อเป็นกลุ่มตัวเอง

## Step 2
ในโฟลเดอร์นี้จะมีไฟล์ 7 ไฟล์ที่ต้องแก้

namespace.yaml

script-database.sql

backend-deployment.yaml

be-ingress.yaml

frontend-deployment.yaml

fe-ingress.yaml

certificate.yaml

## Step 3
นำไฟล์ Database ของกลุ่มตัวเองมาใส่ใน Folder 
Note: ควรเป็น SQL คำสั่งสร้างตาราง + เพิ่มข้อมูลต่างๆ (Source Code) ที่รวมการ Create Database ด้วย 

## Step 4
แก้ <group-name> เป็นชื่อกลุ่มตัวเองในทุกไฟล์ เป็นตัวเล็กทั้งหมดและไม่ขึ้นต้นด้วยตัวเลขเลยครับ
และ ใส่ Image ใน backend-deployment.yaml, frontend-deployment.yaml ให้ถูกตามที่เรา push ขึ้นไปที่ Docker Hub

## Extra
- ถ้ากลุ่มไหนเรียก API Backend จาก Frontend โดยการเขียน Localhost ลงไปให้แก้ตามใน Comment ใน frontend-deployment.yaml ใน Source Code ของ Frontend แล้ว push ขึ้น Docker Hub ใหม่

- ถ้ากลุ่มไหน มี Frontend แยกเป็น User และ Admin ให้แยก ทำ Deployment นะ user ให้ใช้ใน Example ส่วน Admin ให้ใช้ใน Extra แล้ว Copy ลงที่ Folder กลุ่มตัวเอง


