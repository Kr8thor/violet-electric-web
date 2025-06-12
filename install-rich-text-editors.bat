@echo off
echo Installing Rich Text Editors for Violet Universal Editing System
echo ================================================================

cd /d "C:\Users\Leo\violet-electric-web"

echo.
echo Installing Quill Editor...
npm install quill react-quill @types/quill

echo.
echo Installing Lexical Editor...
npm install lexical @lexical/react @lexical/rich-text @lexical/plain-text @lexical/link @lexical/list @lexical/code @lexical/markdown @lexical/selection @lexical/utils @lexical/html

echo.
echo Installing Additional Dependencies...
npm install dompurify @types/dompurify

echo.
echo Installation Complete!
echo =====================
echo.
echo Next Steps:
echo 1. Run this script to install all dependencies
echo 2. The React components are ready to use
echo 3. Upload the new functions-rich-text-enhanced.php to WordPress
echo 4. Test the rich text editing system
echo.
pause
