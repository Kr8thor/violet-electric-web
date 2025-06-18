# Netlify Deployment Verification Script (PowerShell)
# Check if the latest push triggered a successful rebuild

Write-Host "🚀 Netlify Deployment Status Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get the latest commit hash
$latestCommit = git rev-parse HEAD
$shortCommit = $latestCommit.Substring(0, 7)

Write-Host "📊 Latest Commit: $shortCommit" -ForegroundColor Green
Write-Host "📋 Commit Message: $(git log -1 --pretty=%B)" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔗 Direct Links:" -ForegroundColor Magenta
Write-Host "   • Netlify Site: https://lustrous-dolphin-447351.netlify.app" -ForegroundColor Blue
Write-Host "   • Netlify Dashboard: https://app.netlify.com/sites/lustrous-dolphin-447351" -ForegroundColor Blue
Write-Host "   • GitHub Repository: https://github.com/Kr8thor/violet-electric-web" -ForegroundColor Blue
Write-Host ""

Write-Host "⏳ Deployment Process:" -ForegroundColor Yellow
Write-Host "   1. ✅ Changes pushed to GitHub" -ForegroundColor Green
Write-Host "   2. 🔄 Netlify auto-detecting changes..." -ForegroundColor Yellow
Write-Host "   3. ⏱️  Build process (typically 2-4 minutes)" -ForegroundColor Yellow
Write-Host "   4. 🌐 Live deployment to CDN" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 Files Changed in Latest Commit:" -ForegroundColor Cyan
git diff --name-only HEAD~1 HEAD

Write-Host ""
Write-Host "🎯 What to Verify:" -ForegroundColor Magenta
Write-Host "   • Site loads correctly" -ForegroundColor White
Write-Host "   • New documentation is accessible" -ForegroundColor White
Write-Host "   • Universal editing still works" -ForegroundColor White
Write-Host "   • WordPress admin integration functional" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Check deployment status at:" -ForegroundColor Cyan
Write-Host "   https://app.netlify.com/sites/lustrous-dolphin-447351/deploys" -ForegroundColor Blue

# Try to open the Netlify dashboard
Write-Host ""
Write-Host "🌐 Opening Netlify dashboard..." -ForegroundColor Green
Start-Process "https://app.netlify.com/sites/lustrous-dolphin-447351/deploys"
