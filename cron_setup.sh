#!/bin/bash
# Install the auto-deploy script and setup cron

APP_DIR="/var/www/tripoint"

# 1. Move script to app dir
mv /tmp/auto_deploy.sh "$APP_DIR/auto_deploy.sh"
chmod +x "$APP_DIR/auto_deploy.sh"

# 2. Add cron job
# Run every 5 minutes
CRON_CMD="*/5 * * * * $APP_DIR/auto_deploy.sh"

# Check if job already exists
(crontab -l 2>/dev/null | grep -F "$APP_DIR/auto_deploy.sh") || (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo ">>> Auto-deployment setup complete (checks every 5 mins)."
