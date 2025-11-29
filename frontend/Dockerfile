# Development Dockerfile for React Frontend
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with cache mount for faster rebuilds
# Using --mount=type=cache for npm cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

# Copy frontend source
COPY . .

# Expose the dev server port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev", "--", "--host"]
