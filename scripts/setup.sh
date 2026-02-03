#!/bin/bash
# Quick setup script for Satoshi Casino ARK

set -e

echo "⚡ Satoshi Casino ARK - Quick Setup"
echo "===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
# ARK Configuration
ARK_INTROSPECTOR_URL=http://localhost:7073
ARK_NETWORK=regtest

# Vercel KV (will be set by Vercel)
# KV_REST_API_URL=
# KV_REST_API_TOKEN=
# KV_REST_API_READ_ONLY_TOKEN=
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI found"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Start ARK Introspector (in another terminal):"
echo "   cd /path/to/introspector"
echo "   export INTROSPECTOR_SECRET_KEY=\$(openssl rand -hex 32)"
echo "   export INTROSPECTOR_NETWORK=regtest"
echo "   make build && ./introspector"
echo ""
echo "2. Start development server:"
echo "   vercel dev"
echo ""
echo "3. Open http://localhost:3000"
echo ""
echo "For production deployment, see DEPLOY.md"
echo ""
echo "⚡ Happy coding!"
