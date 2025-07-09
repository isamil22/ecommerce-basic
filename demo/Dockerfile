# Use a slim OpenJDK image for a smaller footprint
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper executable and the wrapper configuration
COPY mvnw .
COPY .mvn ./.mvn

# Copy the pom.xml to leverage Docker's layer caching
COPY pom.xml .

# Make the mvnw script executable
RUN chmod +x mvnw

# Download dependencies. This will use the pom.xml to download all necessary libraries.
RUN ./mvnw dependency:go-offline

# Copy the rest of the application source code
COPY src ./src

# Package the application into a JAR file, skipping tests
RUN ./mvnw package -DskipTests

# Expose the port the application will run on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java","-jar","target/demo-0.0.1-SNAPSHOT.jar"]