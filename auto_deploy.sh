#!/bin/bash
# /var/www/tripoint/auto_deploy.sh

APP_DIR="/var/www/tripoint"
FRONTEND_DIR="$APP_DIR/tripoint-frontend"
LOG_FILE="/var/log/tripoint_deploy.log"

exec 1>>"$LOG_FILE" 2>&1

# Ensure we are in the right directory
cd "$APP_DIR" || exit 1

# Fetch latest changes
git fetch origin main

# Check if local is behind remote
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo ">>> [$(date)] Changes detected. Updating..."
    
    # Pull changes
    git pull origin main
    
    # Rebuild
    cd "$FRONTEND_DIR" || exit 1
    echo ">>> Installing dependencies..."
    npm install --legacy-peer-deps
    
    echo ">>> Building..."
    if npm run build; then
        echo ">>> Build successful. Reloading Nginx..."
        systemctl reload nginx
        echo ">>> Restarting API service..."
        systemctl restart tripoint-api
        echo ">>> [$(date)] Deployment complete."
    else
        echo ">>> [$(date)] Build FAILED."
    fi
fi
