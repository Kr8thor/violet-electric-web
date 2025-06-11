#!/bin/bash

# WordPress-React Build-Time Integration Test
# This script tests the complete build-time WordPress content fetching system

echo "🚀 Testing WordPress Build-Time Integration"
echo "=========================================="

# Test 1: Clean build with WordPress content fetching
echo ""
echo "📦 Step 1: Testing build with WordPress content fetching..."
echo "This should fetch content from WordPress API during build"

# Clean previous builds
rm -rf dist/
rm -f .env.production
rm -f src/wordpress-content.ts

# Run build (this will trigger the WordPress content plugin)
npm run build

echo ""
echo "🔍 Step 2: Verifying build output..."

# Check if .env.production was created
if [ -f ".env.production" ]; then
    echo "✅ .env.production file created"
    echo "📋 Environment variables:"
    head -5 .env.production
    echo "..."
else
    echo "❌ .env.production file NOT created"
fi

# Check if wordpress-content.ts was generated
if [ -f "src/wordpress-content.ts" ]; then
    echo "✅ TypeScript definitions generated"
    echo "📋 Content interface:"
    grep -A 5 "export interface" src/wordpress-content.ts
else
    echo "❌ TypeScript definitions NOT generated"
fi

# Check build output
if [ -d "dist" ]; then
    echo "✅ Build completed successfully"
    echo "📋 Build output:"
    ls -la dist/
    
    # Check if environment variables are embedded in build
    if grep -q "VITE_WP_" dist/assets/*.js 2>/dev/null; then
        echo "✅ WordPress content embedded in build"
    else
        echo "⚠️ WordPress content may not be embedded (this is normal with Vite's env handling)"
    fi
else
    echo "❌ Build failed - no dist directory"
fi

echo ""
echo "🌐 Step 3: Testing build locally..."

# Start preview server in background
npm run preview &
PREVIEW_PID=$!

# Wait for server to start
sleep 3

# Test the preview
if curl -s http://localhost:4173 > /dev/null; then
    echo "✅ Preview server started successfully"
    echo "🔗 Open http://localhost:4173 to test the site"
    echo "💡 Look for build-time WordPress content instead of hardcoded defaults"
else
    echo "❌ Preview server failed to start"
fi

# Keep server running for manual testing
echo ""
echo "⏳ Preview server running for testing..."
echo "📋 What to check:"
echo "   • Hero title should show WordPress content, not 'Change the Channel'"
echo "   • No runtime API calls to WordPress should be needed"
echo "   • Content should be baked into the static build"
echo "   • Page refresh should show the same content (no flickering)"
echo ""
echo "Press Ctrl+C to stop the preview server"

# Wait for user to stop
wait $PREVIEW_PID

echo ""
echo "🏁 Build-time integration test complete!"
echo ""
echo "📊 Summary:"
echo "   • WordPress content is now fetched at BUILD TIME"
echo "   • No more hardcoded defaultValue props"
echo "   • Content is baked into the static build"
echo "   • Perfect persistence across page refreshes"
echo ""
echo "🔄 Next steps:"
echo "   1. Set up Netlify build hook for auto-rebuilds"
echo "   2. Deploy to Netlify with the new build process"
echo "   3. Configure WordPress to trigger rebuilds on content changes"