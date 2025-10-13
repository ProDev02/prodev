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

# ✅ ติดตั้ง curl สำหรับ healthcheck
RUN apk add --no-cache curl bash

# Copy built JAR from stage 1
COPY --from=build /app/build/libs/*.jar app.jar

# Map folder uploads
VOLUME /app/uploads

# Expose port
EXPOSE 8080

# Run Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]