@echo off
echo 🚀 Building and Deploying to Netlify...
echo.

cd /d "C:\Users\Leo\violet-electric-web"

echo 📦 Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🌐 Deploying to production...
call netlify deploy --prod --dir=dist
if %errorlevel% neq 0 (
    echo ❌ Deploy failed!
    pause
    exit /b 1
)

echo ✅ Deployment complete!
echo 🌐 Your site is live at: https://violetrainwater.com
echo.
pause
