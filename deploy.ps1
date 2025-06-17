# 🚀 Violet Electric Web - PowerShell Deployment Script
# ====================================================

Write-Host "🚀 Violet Electric Web - Manual Deployment Script" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the violet-electric-web directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Found package.json - in correct directory" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "🔧 Installing dependencies (if needed)..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: npm install had issues, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Build the project
Write-Host "🏗️ Building the project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed! Check the error messages above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Build files are ready in the 'dist' folder" -ForegroundColor Green
Write-Host ""

# Check if Netlify CLI is installed
Write-Host "🔍 Checking for Netlify CLI..." -ForegroundColor Yellow
try {
    $netlifyVersion = netlify --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Netlify CLI found: $netlifyVersion" -ForegroundColor Green
        Write-Host ""
        
        $deploy = Read-Host "🚀 Deploy now with Netlify CLI? (y/n)"
        if ($deploy -eq "y" -or $deploy -eq "Y") {
            Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
            netlify deploy --prod --dir=dist
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Deployment successful!" -ForegroundColor Green
                Write-Host "🌐 Your site should be live shortly at:" -ForegroundColor Cyan
                Write-Host "   https://lustrous-dolphin-447351.netlify.app/" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Deployment failed. Try manual upload instead." -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "❌ Netlify CLI not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Alternative deployment options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1 - Install Netlify CLI:" -ForegroundColor White
Write-Host "  npm install -g netlify-cli" -ForegroundColor Gray
Write-Host "  netlify login" -ForegroundColor Gray
Write-Host "  netlify deploy --prod --dir=dist" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2 - Manual Upload:" -ForegroundColor White
Write-Host "  1. Go to: https://app.netlify.com/sites/lustrous-dolphin-447351/deploys" -ForegroundColor Gray
Write-Host "  2. Click 'Deploy manually'" -ForegroundColor Gray
Write-Host "  3. Drag the 'dist' folder to upload" -ForegroundColor Gray
Write-Host ""

# Open the dist folder in explorer for easy access
Write-Host "📁 Opening dist folder in File Explorer..." -ForegroundColor Yellow
Start-Process explorer.exe -ArgumentList (Get-Location).Path + "\dist"

Write-Host ""
Write-Host "✨ Deployment preparation complete!" -ForegroundColor Green
Read-Host "Press Enter to exit"
