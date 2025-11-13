FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy application files
COPY server-postgres.js .
COPY breakpoint-giveaway.html .
COPY SNIPE-LOGO.png .

# Install dependencies directly (no package.json needed)
RUN npm install express@4.18.2 cors@2.8.5 pg@8.11.3

# Expose port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });" || exit 1

# Start the application
CMD ["node", "server-postgres.js"]
