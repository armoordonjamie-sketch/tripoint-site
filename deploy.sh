#!/bin/bash
set -e

# Configuration
DOMAIN="tripointdiagnostics.co.uk"
EMAIL="admin@$DOMAIN" # Adjust if you have a specific email
REPO_URL="https://github.com/armoordonjamie-sketch/tripoint-site.git"
APP_DIR="/var/www/tripoint"
FRONTEND_DIR="$APP_DIR/tripoint-frontend"

echo ">>> Starting Deployment for $DOMAIN on $(hostname)..."

# 1. Update System
echo ">>> Updating system packages..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
DEBIAN_FRONTEND=noninteractive apt-get install -y curl git nginx certbot python3-certbot-nginx

# 2. Install Node.js (LTS)
echo ">>> Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

# 3. Setup Application Directory
echo ">>> Setting up application..."
if [ -d "$APP_DIR" ]; then
    echo "Directory exists. Pulling latest changes..."
    cd "$APP_DIR"
    git pull
else
    echo "Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
fi

# 4. Build Frontend
echo ">>> Building frontend..."
cd "$FRONTEND_DIR"
npm install --legacy-peer-deps
npm run build

# 5. Configure Nginx
echo ">>> Configuring Nginx..."
cat > /etc/nginx/sites-available/tripoint <<EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $FRONTEND_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
EOL

# Enable site and remove default
ln -sf /etc/nginx/sites-available/tripoint /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and Reload Nginx
nginx -t
systemctl reload nginx

# 6. Setup SSL
echo ">>> Setting up SSL..."
# Check if certificate already exists to avoid rate limits/errors on re-run
if ! certbot certificates | grep -q "$DOMAIN"; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
else
    echo "SSL Certificate already exists."
fi

echo ">>> Deployment Complete! Visit https://$DOMAIN"
