#!/bin/bash
# /var/www/tripoint/auto_deploy.sh
set -euo pipefail

APP_DIR="/var/www/tripoint"
FRONTEND_DIR="$APP_DIR/tripoint-frontend"
LOG_FILE="/var/log/tripoint_deploy.log"
LOCK_FILE="/var/lock/tripoint_deploy.lock"

exec 1>>"$LOG_FILE" 2>&1

# Prevent overlapping cron runs
exec 200>"$LOCK_FILE"
flock -n 200 || exit 0

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

    # Update Python dependencies
    echo ">>> Installing Python dependencies..."
    source "$APP_DIR/venv/bin/activate"
    pip install -q -r "$APP_DIR/python-scripts/requirements.txt" 2>/dev/null || \
        pip install -q fastapi uvicorn WazeRouteCalculator requests google-api-python-client google-auth google-auth-oauthlib email-validator python-dotenv aiosqlite stripe python-multipart reportlab

    # Rebuild frontend (SSG)
    cd "$FRONTEND_DIR" || exit 1
    echo ">>> Installing dependencies..."
    if [ -f package-lock.json ]; then
        npm ci --legacy-peer-deps
    else
        npm install --legacy-peer-deps
    fi

    echo ">>> Building (SSG)..."
    if npm run build:ssg; then
        echo ">>> Build successful. Testing Nginx config..."
        nginx -t
        echo ">>> Reloading Nginx..."
        systemctl reload nginx
        echo ">>> Restarting API service..."
        systemctl restart tripoint-api
        echo ">>> [$(date)] Deployment complete."
    else
        echo ">>> [$(date)] Build FAILED."
        exit 1
    fi
fi
