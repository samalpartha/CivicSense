# Stage 1: Build the React Application
FROM node:20-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production
# We will pass VITE_API_URL via --build-arg if needed, or rely on relative paths if on same domain (not likely for Cloud Run split services)
# For this setup, we'll assume the user will provide the backend URL later or we use a default.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
