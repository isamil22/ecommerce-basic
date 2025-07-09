# Stage 1: Build the React application
FROM node:18-alpine as builder
WORKDIR /app

# Copy the package.json and the package-lock.json
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the React app (Vite output is in 'dist' folder)
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built application from the 'builder' stage
# The output from Vite is in the 'dist' folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]