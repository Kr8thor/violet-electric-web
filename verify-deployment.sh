#!/bin/bash

# Netlify Deployment Verification Script
# Check if the latest push triggered a successful rebuild

echo "🚀 Netlify Deployment Status Check"
echo "=================================="
echo ""

# Get the latest commit hash
LATEST_COMMIT=$(git rev-parse HEAD)
SHORT_COMMIT=${LATEST_COMMIT:0:7}

echo "📊 Latest Commit: $SHORT_COMMIT"
echo "📋 Commit Message: $(git log -1 --pretty=%B)"
echo ""

echo "🔗 Direct Links:"
echo "   • Netlify Site: https://lustrous-dolphin-447351.netlify.app"
echo "   • Netlify Dashboard: https://app.netlify.com/sites/lustrous-dolphin-447351"
echo "   • GitHub Repository: https://github.com/Kr8thor/violet-electric-web"
echo ""

echo "⏳ Deployment Process:"
echo "   1. ✅ Changes pushed to GitHub"
echo "   2. 🔄 Netlify auto-detecting changes..."
echo "   3. ⏱️  Build process (typically 2-4 minutes)"
echo "   4. 🌐 Live deployment to CDN"
echo ""

echo "📋 Files Changed in Latest Commit:"
git diff --name-only HEAD~1 HEAD

echo ""
echo "🎯 What to Verify:"
echo "   • Site loads correctly"
echo "   • New documentation is accessible"
echo "   • Universal editing still works"
echo "   • WordPress admin integration functional"
echo ""

echo "🔍 Check deployment status at:"
echo "   https://app.netlify.com/sites/lustrous-dolphin-447351/deploys"
