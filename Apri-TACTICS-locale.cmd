@echo off
cd /d "%~dp0"
where.exe node >nul 2>&1
if errorlevel 1 (
  echo Node.js non trovato. Installa Node.js 20 o successivo e riprova.
  pause
  exit /b 1
)
echo.
echo TACTICS locale: apri http://localhost:4173/ nel browser del PC.
echo Lascia aperta questa finestra mentre provi l'app.
echo Per chiudere il server, premi Ctrl+C.
echo.
call npm run dev
pause
