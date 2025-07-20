# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the backend application code
COPY backend/ ./

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port that the app runs on
EXPOSE 5000

# Define the command to run the application
CMD ["npm", "start"]
