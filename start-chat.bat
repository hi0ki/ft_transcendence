@echo off
echo ========================================
echo   Restarting Chat Application
echo ========================================
echo.

echo Stopping existing processes...
echo.

REM Kill processes on port 3001 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a 2>nul
)

REM Kill processes on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak >nul

echo.
echo Starting Backend on port 3001...
start "Chat Backend" cmd /k "cd back-end\Chat && npm run start:dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend on port 5173...
start "Chat Frontend" cmd /k "cd front-end && npm run dev"

echo.
echo ========================================
echo   Chat Application Started!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Two new terminal windows have opened.
echo Wait a few seconds for services to start.
echo.
pause
