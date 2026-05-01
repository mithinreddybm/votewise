FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Ensure the entrypoint script is executable
RUN chmod +x entrypoint.sh

# Expose the port Cloud Run uses
EXPOSE 8080

# Start with the entrypoint script
CMD ["./entrypoint.sh"]
