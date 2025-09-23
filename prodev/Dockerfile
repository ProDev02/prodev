FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy fat jar
COPY build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

# Map folder uploads
VOLUME /app/uploads

# Expose port
EXPOSE 8080

# Run Spring Boot
ENTRYPOINT ["java","-jar","app.jar"]
