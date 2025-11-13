FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy application files
COPY server-simple.js .
COPY breakpoint-giveaway.html .
COPY SNIPE-LOGO.png .

# Install dependencies directly (no package.json needed)
RUN npm install express@4.18.2 cors@2.8.5 sqlite3@5.1.6

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server-simple.js"]
