@echo off
echo Building College Website for deployment...
echo.

echo Running npm build...
call npm run build

echo.
echo Build completed successfully!
echo.
echo You can now deploy the 'dist' folder to Render.
echo.
echo Press any key to exit...
pause > nul
