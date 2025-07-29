# Stage 1: Build the frontend application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Run the build command (e.g., for Vite, Create React App)
# This typically outputs to 'dist' (Vite) or 'build' (CRA)
RUN npm run build

# Stage 2: Serve the static frontend files with Nginx
FROM nginx:alpine

# Copy the build output from the builder stage
# Adjust '/app/dist' if your build output folder is named 'build' or something else
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for client-side routing (crucial for React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the standard HTTP port
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]