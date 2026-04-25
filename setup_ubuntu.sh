#!/bin/bash
# ==============================================================================
# PCCOE ERMS - Automated Ubuntu Server Setup
# Run this script with: sudo bash setup_ubuntu.sh
# ==============================================================================

set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}  PCCOE Exam Remuneration System - Ubuntu Setup${NC}"
echo -e "${BLUE}====================================================${NC}"

# Check for root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root or using sudo.${NC}"
  echo "Example: sudo bash setup_ubuntu.sh"
  exit 1
fi

# Detect server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}Detected Server IP: ${SERVER_IP}${NC}"

# ==============================================================================
# 1. System Updates & Dependencies
# ==============================================================================
echo -e "\n${BLUE}[1/7] Updating system and installing basic dependencies...${NC}"
apt-get update -y
apt-get install -y curl git ufw build-essential

# ==============================================================================
# 2. Install PostgreSQL & Setup Database
# ==============================================================================
echo -e "\n${BLUE}[2/7] Installing and configuring PostgreSQL...${NC}"
apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
systemctl enable postgresql
systemctl start postgresql

# Set password and create database
echo "Configuring PostgreSQL user 'postgres' with password 'ERMSPCCOE'..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'ERMSPCCOE';"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS \"ERMS\";"
sudo -u postgres psql -c "CREATE DATABASE \"ERMS\";"

# Run seed data
if [ -d "backend/seed" ]; then
    echo "Running database schema and seed scripts..."
    # Export password so psql doesn't prompt
    export PGPASSWORD="ERMSPCCOE"
    psql -U postgres -h localhost -d ERMS -f backend/seed/01_schema.sql
    psql -U postgres -h localhost -d ERMS -f backend/seed/02_seed_data.sql
    echo -e "${GREEN}Database seeded successfully.${NC}"
else
    echo -e "${RED}Warning: backend/seed directory not found. Skipping database seed.${NC}"
fi

# ==============================================================================
# 3. Install Node.js (v18)
# ==============================================================================
echo -e "\n${BLUE}[3/7] Installing Node.js (v18)...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js is already installed. Version: $(node -v)"
fi

# Install PM2 globally
npm install -g pm2

# ==============================================================================
# 4. Backend Setup
# ==============================================================================
echo -e "\n${BLUE}[4/7] Configuring and starting Backend...${NC}"
cd backend

# Configure .env
if [ -f ".env" ]; then
    # Update DB password
    sed -i "s/DB_PASS=.*/DB_PASS=ERMSPCCOE/g" .env
    # Update FRONTEND_URL to use the actual IP (port 80)
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://${SERVER_IP}|g" .env
else
    echo -e "${RED}Warning: backend/.env not found! Please create it later.${NC}"
fi

# Install dependencies and start PM2
npm install
pm2 stop erms-api 2>/dev/null || true
pm2 start server.js --name "erms-api"
pm2 save
pm2 startup | grep -v "PM2" | bash || true
cd ..

# ==============================================================================
# 5. Frontend Setup & Build
# ==============================================================================
echo -e "\n${BLUE}[5/7] Building Frontend...${NC}"
cd frontend

# Configure .env
if [ ! -f ".env" ]; then
    echo "VITE_GOOGLE_CLIENT_ID=45227534265-6g7msdfts77c85rm4qf18q64tohpg32d.apps.googleusercontent.com" > .env
fi
# Update or add VITE_API_URL
if grep -q "VITE_API_URL" .env; then
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://${SERVER_IP}/api|g" .env
else
    echo "VITE_API_URL=http://${SERVER_IP}/api" >> .env
fi

# Install dependencies and build
npm install
npm run build
cd ..

# ==============================================================================
# 6. Install & Configure Nginx
# ==============================================================================
echo -e "\n${BLUE}[6/7] Installing and configuring Nginx...${NC}"
apt-get install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/erms <<EOF
server {
    listen 80;
    server_name ${SERVER_IP};

    # Serve React Frontend
    location / {
        root $(pwd)/frontend/dist;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # Reverse Proxy for Node.js API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/erms /etc/nginx/sites-enabled/

# Ensure Nginx user can read the dist directory
chmod -R 755 $(pwd)/frontend/dist

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# ==============================================================================
# 7. Firewall Configuration
# ==============================================================================
echo -e "\n${BLUE}[7/7] Configuring UFW Firewall...${NC}"
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (Nginx)
ufw allow 5000/tcp  # Backend API (Optional, but good for debugging)
ufw --force enable

echo -e "\n${BLUE}====================================================${NC}"
echo -e "${GREEN}  SUCCESS! Deployment completed.${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "You can now access the system at: ${GREEN}http://${SERVER_IP}${NC}"
echo -e "Your API is running at:           ${GREEN}http://${SERVER_IP}/api${NC}"
echo -e ""
echo -e "IMPORTANT: Update 'GOOGLE_SHEET_ID' in backend/.env manually if not done."
echo -e "Don't forget to whitelist http://${SERVER_IP} in Google Cloud Console."
echo -e "${BLUE}====================================================${NC}"
