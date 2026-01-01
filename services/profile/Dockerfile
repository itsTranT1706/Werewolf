# Multi-stage build for Spring Boot application

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine  

WORKDIR /app

# Install PostgreSQL client for database initialization
RUN apk add --no-cache postgresql-client

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Copy database schema files
COPY db ./db

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the application port
EXPOSE 8086

# Set JVM options for containerized environment
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
