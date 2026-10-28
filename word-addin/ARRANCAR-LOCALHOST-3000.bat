@echo off
chcp 65001 > nul
title Servidor Local Asistente Word (HTTPS :3000)
cd /d "%~dp0"

echo ===================================================================
echo   Lanzador del Servidor Local - Asistente para Microsoft Word
echo ===================================================================
echo.

:: Verificar si el puerto 3000 ya está en uso
netstat -ano | findstr /R /C:":3000 *LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] El servidor local YA se encuentra activo y escuchando en el puerto 3000.
    echo Puedes abrir Microsoft Word y utilizar el complemento directamente.
    echo URL: https://localhost:3000/
    echo.
    pause
    exit /b 0
)

:: Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontró Node.js en el sistema.
    echo Por favor, instala Node.js (LTS) desde https://nodejs.org/ para poder ejecutar el servidor.
    pause
    exit /b 1
)

:: Verificar archivo .env
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [INFO] Se ha generado automáticamente el archivo .env desde la plantilla.
    )
)

echo Iniciando servidor seguro en https://localhost:3000 ...
echo Mantén esta ventana abierta mientras utilices el asistente en Word.
echo (Para cerrarlo cuando termines, presiona Ctrl + C o cierra esta ventana).
echo.
node server.js

pause
