#!/bin/bash
# /var/www/tripoint/auto_deploy.sh
set -euo pipefail

APP_DIR="/var/www/tripoint"
FRONTEND_DIR="$APP_DIR/tripoint-frontend"
LOG_FILE="/var/log/tripoint_deploy.log"
DOMAIN="tripointdiagnostics.co.uk"
EMAIL="admin@${DOMAIN}"
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

    # Point nginx at repo fragment (one-time migrate) so future pulls update location / without hand-edits
    echo ">>> Syncing Nginx with repo fragment..."
    if [ -f "$FRONTEND_DIR/deploy/migrate_nginx_include.py" ] && [ -f /etc/nginx/sites-available/tripoint ]; then
        python3 "$FRONTEND_DIR/deploy/migrate_nginx_include.py" \
            /etc/nginx/sites-available/tripoint \
            "$FRONTEND_DIR/deploy/nginx-location-root.conf"
    fi

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

    # Vite build-time env (GA4 + Google Ads)
    if [ -f "$APP_DIR/config/frontend.env" ]; then
        cp "$APP_DIR/config/frontend.env" "$FRONTEND_DIR/.env.production"
        echo ">>> Loaded Vite env from $APP_DIR/config/frontend.env"
    elif [ -f "$FRONTEND_DIR/.env.production" ]; then
        echo ">>> Using existing $FRONTEND_DIR/.env.production"
    else
        echo ">>> WARNING: No config/frontend.env or tripoint-frontend/.env.production — GA4/Ads use code defaults."
    fi

    echo ">>> Building (SSG)..."
    if npm run build:ssg; then
        echo ">>> Build successful. Testing Nginx config..."
        nginx -t
        echo ">>> Reloading Nginx..."
        systemctl reload nginx

        # Check if SSL is still active in the config (prevents resets from losing SSL)
        if ! grep -q "443 ssl" /etc/nginx/sites-enabled/tripoint; then
            echo ">>> [$(date)] SSL config missing from Nginx. Re-applying..."
            certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect --expand
            systemctl reload nginx
        fi

        echo ">>> Restarting API service..."
        systemctl restart tripoint-api
        echo ">>> [$(date)] Deployment complete."
    else
        echo ">>> [$(date)] Build FAILED."
        exit 1
    fi
fi
