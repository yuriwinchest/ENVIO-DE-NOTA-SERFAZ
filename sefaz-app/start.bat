@echo off
echo ========================================
echo   NFe Manager - Iniciando Sistema
echo ========================================
echo.

REM Inicia o Backend em uma nova janela
echo [1/2] Iniciando Backend (Node.js)...
start "NFe Backend" cmd /k "cd backend && node src/index.js"

REM Aguarda 2 segundos
timeout /t 2 /nobreak > nul

REM Inicia o Frontend em uma nova janela
echo [2/2] Iniciando Frontend (React)...
start "NFe Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Sistema Iniciado!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul
