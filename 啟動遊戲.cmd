@echo off
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" call npm install
start "English Lab Server" /min cmd /c "npm run dev -- --host 127.0.0.1 --strictPort"
timeout /t 3 /nobreak >nul
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://127.0.0.1:5173/"
