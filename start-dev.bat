@echo off
echo Starting Family Feud Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && go run server/main.go"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend/family100-fe && npm install && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
