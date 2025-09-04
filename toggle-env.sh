#!/bin/bash

# FashionSmith Environment Toggle Script

if [ "$1" = "dev" ]; then
    echo "🔧 Switching to DEVELOPMENT environment..."
    
    # Server .env
    sed -i 's/NODE_ENV=production/NODE_ENV=development/' server/.env
    sed -i 's|CLIENT_URL=https://fashion-smith.vercel.app|CLIENT_URL=http://localhost:5173|' server/.env
    sed -i 's|API_URL=https://fashionsmith.onrender.com|API_URL=http://localhost:3000|' server/.env
    sed -i 's|GOOGLE_REDIRECT_URL=https://fashionsmith.onrender.com/api/auth/google/callback|GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/google/callback|' server/.env
    
    # Client .env  
    sed -i 's|VITE_API_URL=https://fashionsmith.onrender.com|VITE_API_URL=http://localhost:3000|' client/.env
    
    echo "✅ Switched to development environment"
    
elif [ "$1" = "prod" ]; then
    echo "🚀 Switching to PRODUCTION environment..."
    
    # Server .env
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' server/.env
    sed -i 's|CLIENT_URL=http://localhost:5173|CLIENT_URL=https://fashion-smith.vercel.app|' server/.env
    sed -i 's|API_URL=http://localhost:3000|API_URL=https://fashionsmith.onrender.com|' server/.env
    sed -i 's|GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/google/callback|GOOGLE_REDIRECT_URL=https://fashionsmith.onrender.com/api/auth/google/callback|' server/.env
    
    # Client .env
    sed -i 's|VITE_API_URL=http://localhost:3000|VITE_API_URL=https://fashionsmith.onrender.com|' client/.env
    
    echo "✅ Switched to production environment"
    
else
    echo "Usage: ./toggle-env.sh [dev|prod]"
    echo "  dev  - Switch to development environment"
    echo "  prod - Switch to production environment"
fi
