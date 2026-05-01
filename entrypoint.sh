#!/bin/sh

# Generate .env file from environment variables at runtime
# This allows the frontend fetch('.env') to work in Cloud Run
echo "GEMINI_API_KEY=${GEMINI_API_KEY}" > .env
echo "MAPS_API_KEY=${MAPS_API_KEY}" >> .env
echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" >> .env
echo "GCP_PROJECT_ID=${GCP_PROJECT_ID}" >> .env
echo "GCP_REGION=${GCP_REGION}" >> .env

echo "Generated .env from environment variables."

# Start a simple HTTP server on the port provided by Cloud Run
# Default to 8080 if PORT is not set
echo "Starting server on port ${PORT:-8080}..."
python -m http.server ${PORT:-8080}
