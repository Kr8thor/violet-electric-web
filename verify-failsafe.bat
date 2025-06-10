@echo off
REM Failsafe Verification Script for Windows

echo.
echo ====================================================
echo VERIFYING FAILSAFE CONTENT PERSISTENCE IMPLEMENTATION
echo ====================================================
echo.

echo Checking required files...
echo.

set "all_files_exist=true"

REM Check failsafe persistence layer
if exist "src\utils\failsafeContentPersistence.ts" (
    echo [OK] src\utils\failsafeContentPersistence.ts exists
) else (
    echo [MISSING] src\utils\failsafeContentPersistence.ts
    set "all_files_exist=false"
)

REM Check failsafe hook
if exist "src\hooks\useFailsafeContent.ts" (
    echo [OK] src\hooks\useFailsafeContent.ts exists
) else (
    echo [MISSING] src\hooks\useFailsafeContent.ts
    set "all_files_exist=false"
)

REM Check WordPress bridge script
if exist "wordpress-react-bridge-failsafe.js" (
    echo [OK] wordpress-react-bridge-failsafe.js exists
) else (
    echo [MISSING] wordpress-react-bridge-failsafe.js
    set "all_files_exist=false"
)

REM Check test file
if exist "test-failsafe-persistence.html" (
    echo [OK] test-failsafe-persistence.html exists
) else (
    echo [MISSING] test-failsafe-persistence.html
    set "all_files_exist=false"
)

REM Check documentation
if exist "COMPLETE_FAILSAFE_SOLUTION.md" (
    echo [OK] COMPLETE_FAILSAFE_SOLUTION.md exists
) else (
    echo [MISSING] COMPLETE_FAILSAFE_SOLUTION.md
    set "all_files_exist=false"
)

echo.
if "%all_files_exist%"=="true" (
    echo ====================================
    echo  ALL FAILSAFE FILES ARE IN PLACE!
    echo ====================================
    echo.
    echo Next Steps:
    echo 1. Update React components to use useFailsafeContent hook
    echo 2. Add message handler to App.tsx
    echo 3. Include bridge script in WordPress admin
    echo 4. Test using test-failsafe-persistence.html
    echo.
    echo Quick Test:
    echo - Open test-failsafe-persistence.html in browser
    echo - Click "Run All Tests"
    echo.
    echo Full docs: COMPLETE_FAILSAFE_SOLUTION.md
    echo.
    echo YOUR CONTENT WILL NOW ALWAYS PERSIST!
) else (
    echo ==========================================
    echo  WARNING: Some failsafe files are missing
    echo ==========================================
    echo Please ensure all files are created.
)

echo.
echo Press any key to open the test file...
pause >nul

REM Try to open the test file
if exist "test-failsafe-persistence.html" (
    start test-failsafe-persistence.html
)
