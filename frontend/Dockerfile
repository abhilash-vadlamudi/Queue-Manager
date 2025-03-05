# Use a lightweight Node.js image for frontend build
FROM node:18-alpine as build-stage
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy and build the frontend
COPY . ./
RUN npm run build

# Serve frontend using Nginx
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]