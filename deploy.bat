@echo off
echo 🚀 Building and deploying to Netlify...

echo 📦 Installing dependencies...
call npm install

echo 🏗️ Building project...
call npm run build

echo ✅ Build complete! 
echo 📁 Built files are in the 'dist' folder

echo 🌐 To deploy:
echo   1. Drag the 'dist' folder to Netlify dashboard
echo   2. Or run: netlify deploy --prod --dir=dist --site=lustrous-dolphin-447351

pause
