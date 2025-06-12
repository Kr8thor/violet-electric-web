#!/bin/bash

# Netlify Build Fix Script
echo "🔧 Starting Netlify build fix..."

# Clean any problematic files
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lockb
rm -f yarn.lock

echo "📦 Installing dependencies with npm..."

# Install dependencies
npm install --legacy-peer-deps

echo "🏗️ Building project..."

# Build the project
npm run build

echo "✅ Build completed!"
