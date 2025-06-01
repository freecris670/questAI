# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install dependencies - используем workspace для установки зависимостей
RUN pnpm install --frozen-lockfile --filter=@questai/api...

# Copy source code
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./
COPY tsconfig.json ./

# Build only the API application directly
RUN cd apps/api && pnpm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "apps/api/dist/main.js"]
