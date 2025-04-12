@echo off
echo Starting College Website Project...
echo.
echo This script will start both the backend and frontend servers.
echo.
echo Press any key to continue...
pause > nul

echo.
echo Starting Backend Server...
start cmd /k "cd backend && node file-server.js"

echo.
echo Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo Servers are starting in separate windows.
echo.
echo Backend: https://gpc-itarsi-backend.onrender.com
echo Frontend: http://localhost:5173
echo.
echo Admin Login:
echo Username: anmol
echo Password: 2007
echo.
echo Press any key to exit this window...
pause > nul
