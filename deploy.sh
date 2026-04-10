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

# 4. Build Frontend (SSG pre-render)
echo ">>> Building frontend..."
cd "$FRONTEND_DIR"

# Vite build-time env: VITE_GA4_MEASUREMENT_ID required for GA4. Prefer repo-level config on the server.
if [ -f "$APP_DIR/config/frontend.env" ]; then
    cp "$APP_DIR/config/frontend.env" "$FRONTEND_DIR/.env.production"
    echo ">>> Loaded Vite env from $APP_DIR/config/frontend.env"
elif [ -f "$FRONTEND_DIR/.env.production" ]; then
    echo ">>> Using existing $FRONTEND_DIR/.env.production"
else
    echo ">>> WARNING: No config/frontend.env or tripoint-frontend/.env.production — GA4 will be DISABLED."
    echo ">>> Set VITE_GA4_MEASUREMENT_ID. Copy tripoint-frontend/.env.production.example and fill."
fi

npm install --legacy-peer-deps
# SKIP_IMAGE_OPTIMIZE=1 is handled by tripoint-frontend/scripts/run-build-ssg.mjs (skips sharp).
npm run build:ssg

# 5. Configure Nginx
echo ">>> Configuring Nginx..."
cat > /etc/nginx/sites-available/tripoint <<EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $FRONTEND_DIR/dist;
    index index.html;

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_vary on;

    # Prerender + SPA fallback: fragment lives in repo; git pull + nginx reload updates behaviour
    include $FRONTEND_DIR/deploy/nginx-location-root.conf;

    # Custom 404 (served by React Router when no route matches)
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    # Hashed static assets: long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Stripe Webhooks Reverse Proxy
    location /webhooks/ {
        proxy_pass http://127.0.0.1:8000/webhooks/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

# 6. Setup Python Backend
echo ">>> Setting up Python backend..."
apt-get install -y python3 python3-pip python3-venv

# Create venv if not exists
if [ ! -d "$APP_DIR/venv" ]; then
    python3 -m venv "$APP_DIR/venv"
fi

# Install dependencies
source "$APP_DIR/venv/bin/activate"
pip install fastapi uvicorn WazeRouteCalculator requests google-api-python-client google-auth google-auth-oauthlib email-validator python-dotenv aiosqlite stripe python-multipart reportlab

# Create Systemd Service
cat > /etc/systemd/system/tripoint-api.service <<EOL
[Unit]
Description=TriPoint API Service
After=network.target

[Service]
User=root
WorkingDirectory=$APP_DIR/python-scripts
EnvironmentFile=$APP_DIR/python-scripts/.env
Environment="PATH=$APP_DIR/venv/bin:/usr/bin"
ExecStart=$APP_DIR/venv/bin/uvicorn api:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Reload Systemd and Start Service
systemctl daemon-reload
systemctl enable tripoint-api
systemctl restart tripoint-api

# Enable site and remove default
ln -sf /etc/nginx/sites-available/tripoint /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and Reload Nginx
nginx -t
systemctl reload nginx

# 6. Setup SSL
echo ">>> Ensuring SSL is configured..."
# We always run this to make sure the Nginx config (which we just overwrote) is patched with SSL directives.
# Certbot is idempotent and will skip renewal if not needed, but will re-apply the Nginx config.
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect --expand

echo ">>> Deployment Complete! Visit https://$DOMAIN"
