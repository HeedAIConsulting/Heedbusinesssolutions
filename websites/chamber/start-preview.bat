@echo off
REM ============================================================
REM  WVWC Chamber site — one-click preview launcher (Windows)
REM  Double-click this file to start the local preview server.
REM ============================================================

cd /d "%~dp0"

echo.
echo  ============================================================
echo   West Valley Chamber — Local Preview
echo  ============================================================
echo.
echo  Starting server at http://localhost:5500/
echo  Browser will open automatically.
echo  Press Ctrl+C to stop.
echo.

REM Try Python first
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "" http://localhost:5500/
    python -m http.server 5500
    goto :end
)

REM Fall back to py launcher
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "" http://localhost:5500/
    py -m http.server 5500
    goto :end
)

REM Fall back to Node + npx
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "" http://localhost:5500/
    npx --yes serve -l 5500 .
    goto :end
)

echo.
echo  Could not find Python or Node.js on this PC.
echo  Install one of:
echo    - Python:  https://www.python.org/downloads/  (check "Add to PATH")
echo    - Node.js: https://nodejs.org/
echo  Then double-click this file again.
echo.
pause

:end
