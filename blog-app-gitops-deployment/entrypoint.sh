#!/bin/sh

set -e  # Exit on error

# Create env-config.js with runtime variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_KEY: "${VITE_API_KEY}",
  VITE_AUTH_DOMAIN: "${VITE_AUTH_DOMAIN}",
  VITE_PROJECT_ID: "${VITE_PROJECT_ID}",
  VITE_STORAGE_BUCKET: "${VITE_STORAGE_BUCKET}",
  VITE_MESSAGING_SENDER_ID: "${VITE_MESSAGING_SENDER_ID}",
  VITE_APP_ID: "${VITE_APP_ID}"
};
EOF

# Ensure env-config.js is readable
chmod 644 /usr/share/nginx/html/env-config.js

# Start Nginx
exec nginx -g 'daemon off;'
