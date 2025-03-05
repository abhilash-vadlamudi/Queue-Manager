# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (to leverage caching)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the backend files
COPY . ./

# Expose port
EXPOSE 4315

# Start the backend server
CMD ["node", "app.js"]