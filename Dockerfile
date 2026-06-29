# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument from Jenkins
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Debug (remove after verification)
RUN echo "================================="
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}"
RUN echo "================================="

# Build React application
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
