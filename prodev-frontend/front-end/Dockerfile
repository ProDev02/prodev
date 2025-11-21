# =================== Build Stage ===================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json ก่อนเพื่อติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# Copy source code และ build
COPY . .
RUN npm run build

# =================== Serve Stage ===================
FROM nginx:alpine

# Copy build output ไปที่ nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# ใช้ nginx default config แล้ว expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
