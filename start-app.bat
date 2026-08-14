@echo off
REM KisanBandhu Startup Script
REM This script starts both the server and client applications

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           Starting KisanBandhu Application...              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Set the base directory
cd /d "%~dp0"

REM Start the server in a new window
echo Starting Backend Server...
start "KisanBandhu Server" cmd /k "cd server && C:\Program Files\nodejs\node.exe src/server.js"

REM Wait a moment for server to start
timeout /t 2 /nobreak

REM Start the client in a new window
echo Starting Frontend Client...
start "KisanBandhu Client" cmd /k "cd client && set Path=C:\Program Files\nodejs;%Path% && npm run dev"

REM Wait for client to start
timeout /t 3 /nobreak

REM Open the browser
echo Opening application in browser...
start http://localhost:5173

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Application is starting! Browser will open automatically   ║
echo ║  Server: http://localhost:5000                             ║
echo ║  Client: http://localhost:5173                             ║
echo ║                                                            ║
echo ║  To stop, close both terminal windows                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
