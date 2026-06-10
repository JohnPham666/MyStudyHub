# Sử dụng image Maven để build code (có sẵn Java 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy pom.xml và thư mục src vào Docker
COPY pom.xml .
COPY src ./src
# Chạy lệnh build ra file jar
RUN mvn clean package -DskipTests

# Sử dụng image Java 21 gọn nhẹ để chạy app (Run stage)
FROM eclipse-temurin:21-jre
WORKDIR /app
# Lấy file jar đã build từ bước trên
COPY --from=build /app/target/*.jar app.jar

# Khai báo port 8080
EXPOSE 8080

# Chạy file jar
ENTRYPOINT ["java", "-jar", "app.jar"]
