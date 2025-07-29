# my-fullstack-app/backend/Dockerfile

# Stage 1: Build dependencies, generate Prisma client, and apply migrations
FROM node:20.12.2-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package.json package-lock.json ./
RUN npm install
RUN npm audit fix || true

# Copy Prisma schema and migrations folder (assuming it's named 'prisma')
# and your application source code.
# This ensures 'schema.prisma' and 'migrations' are available for Prisma CLI.
COPY prisma ./prisma
COPY . . 
# Copies remaining source code, including other backend files

# Generate Prisma Client: This creates node_modules/.prisma
RUN npx prisma generate

# Apply Prisma migrations to the SQLite database.
# The DATABASE_URL is expected to be set in docker-compose.yml at runtime.
# For this build step, Prisma will typically create the file in the CWD (./prisma/dev.db)
# based on your schema.prisma datasource url if it's set to 'file:./dev.db'
# For production, 'migrate deploy' is preferred as it respects migration history.
RUN npx prisma migrate deploy


FROM node:20.12.2-alpine

WORKDIR /app

# Copy only production node_modules from builder stage.
# This should include the generated Prisma client within node_modules/@prisma/client.
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema (needed by Prisma Client at runtime for schema checks)
# and your application source code.
COPY prisma ./prisma
COPY . . 
# Copies remaining source code

# Expose the port your backend server listens on
EXPOSE 3000

# Command to start your backend server
# The application will use the DATABASE_URL environment variable provided by Docker Compose
CMD ["npm", "start"]