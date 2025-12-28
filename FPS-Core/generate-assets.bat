@echo off
echo ========================================
echo STRANGER THINGS - MESHY ASSET GENERATOR
echo ========================================
echo.
echo Starting asset generation...
echo This will take 30-60 minutes.
echo.

cd /d "%~dp0"

REM Set the API key
set MESHY_API_KEY=msy_TgknSgucpW7n9PSmXXjCvEktvsqEEHCl1U2Y

REM Run with npx (which should work even if npm isn't in PATH)
echo Using npx to run generation script...
npx tsx scripts/meshy-generator.ts

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! All models generated!
    echo ========================================
    echo.
    echo Models saved to: public\models\
    echo.
    echo Next steps:
    echo 1. Check the models in public\models\
    echo 2. Run: npm run dev
    echo 3. Enjoy your Stranger Things game!
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Generation failed
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

echo.
echo Press any key to exit...
pause >nul
