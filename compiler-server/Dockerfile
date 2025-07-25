# Use Node.js Alpine as base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Install build tools for C, C++, Python, Java
RUN apk update && \
    apk add --no-cache \
    g++ \
    gcc \
    python3 \
    openjdk17

# Copy only the package.json and package-lock.json files and install dependencies.
# This allows Docker to cache this layer when package files don't change.
COPY package*.json ./
RUN npm install

# Copy rest of the application
# This layer will only be rebuilt if application code changes.
COPY . .

# Expose compiler server port
EXPOSE 8000

# Specify command to run the server
CMD [ "node", "server.js" ]