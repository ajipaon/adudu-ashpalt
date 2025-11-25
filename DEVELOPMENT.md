# Development Guide

This guide provides instructions on how to set up, run, and build the application.

## Prerequisites

- **Java 21**: This project requires Java 21.
- **Node.js**: Required for the frontend build tools.
- **Maven**: Used for building the backend and managing dependencies.

## Setup

1.  Clone the repository.
2.  Navigate to the project directory.

## Running the Application

To run the application in development mode:

```bash
./mvnw spring-boot:run
```

This command will:
-   Start the Spring Boot backend.
-   Automatically start the Vite development server for the frontend.
-   Open the application in your default browser (usually at `http://localhost:8080`).

## Building for Production

To build the application for production:

```bash
./mvnw clean package -Pproduction
```

This will create a runnable JAR file in the `target/` directory, containing the optimized frontend bundle.

To run the production build:

```bash
java -jar target/aduduAshpalt-1.0-SNAPSHOT.jar
```

## Code Formatting

This project uses Spotless for code formatting.

To check for formatting issues:

```bash
./mvnw spotless:check
```

To apply formatting fixes:

```bash
./mvnw spotless:apply
```
