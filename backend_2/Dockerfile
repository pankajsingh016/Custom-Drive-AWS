# Use official Node LTS
FROM node:22

# Set working directory
WORKDIR /app

# Copy only package.json + lock first to leverage Docker cache
COPY package*.json ./

# Install prod deps only
RUN npm ci --omit=dev

# Copy all other files
COPY . .

# Prisma generate (client only)
RUN npx prisma generate

# Expose your app port
EXPOSE 5000

# Run app
CMD ["node", "src/app.js"]
