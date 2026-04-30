@echo off
setlocal
cd /d "%~dp0"

echo.
echo  ============================================================
echo   West Valley ~ Warner Center Chamber - Local Preview
echo  ============================================================
echo.

:: Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo  [!] Node.js is required.
    echo      Download from https://nodejs.org/  ^(LTS version^)
    echo      Then double-click this file again.
    echo.
    pause
    exit /b 1
)

:: Show Node version
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  [+] Node.js %NODE_VER% detected

:: Install deps if missing
if not exist "node_modules\express" (
    echo  [+] Installing dependencies ^(one-time, ~30 sec^)...
    call npm install --silent --no-audit --no-fund
    if errorlevel 1 (
        echo.
        echo  [!] npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
    echo  [+] Dependencies installed.
)

:: Optional .env hint
if not exist ".env" (
    echo  [i] No .env file found - AI runs in demo mode.
    echo      To activate live AI: copy .env.example to .env and add ANTHROPIC_API_KEY.
)

echo.
echo  [+] Opening browser to http://localhost:5500/
echo  [+] Starting server. Press Ctrl+C in this window to stop.
echo.

:: Open browser shortly after starting
start "" /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5500/"

:: Run server (blocks until Ctrl+C)
node server.js

echo.
echo  Server stopped.
pause
