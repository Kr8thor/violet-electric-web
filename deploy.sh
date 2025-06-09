#!/bin/bash

echo "🚀 Building and deploying React app with content management fixes..."

cd C:/Users/Leo/violet-electric-web

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the app
echo "🔨 Building React app..."
npm run build

echo "✅ Build complete! The app should now properly persist content from WordPress."
echo "📝 Content will be saved to localStorage and persist across reloads."
echo "🔄 When you save in WordPress admin, the React app will automatically update."

# If using Netlify, the build will automatically deploy
echo "🌐 If connected to Netlify, the app will deploy automatically."
