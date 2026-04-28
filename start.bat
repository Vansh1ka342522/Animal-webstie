@echo off
echo ========================================
echo   Starting Vanshika's Portfolio Website
echo ========================================
echo.
echo Opening website in your default browser...
echo.
echo NOTE: For the best experience with Three.js 3D effects, 
echo you should run a local server. Try one of these options:
echo.
echo Option 1 - If you have Python installed:
echo   python -m http.server 8000
echo   Then open http://localhost:8000 in your browser
echo.
echo Option 2 - If you have Node.js installed:
echo   npx serve
echo   Then open the URL shown in terminal
echo.
echo Option 3 - VS Code Live Server extension
echo   Right-click index.html and select "Open with Live Server"
echo.
echo ========================================
echo.

:: Try to open with a simple file URL
start "" "%~dp0index.html"

pause
