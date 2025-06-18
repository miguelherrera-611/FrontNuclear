FROM openjdk:21-slim
WORKDIR /app

# Copiar archivos de Maven
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY target/ModuloCitas-0.0.1-SNAPSHOT.jar app.jar

# Descargar dependencias
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente
COPY src src

# Construir aplicación
RUN ./mvnw clean package -DskipTests

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
