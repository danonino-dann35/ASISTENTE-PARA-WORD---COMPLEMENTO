@echo off
chcp 65001 > nul
echo ====================================================
echo  1. Instalación de dependencias del Asistente Word
echo ====================================================
echo.
echo Comprobando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado o no se encuentra en el PATH.
    echo Por favor, descarga e instala Node.js (LTS) desde: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detectado correctamente.
echo Instalando paquetes necesarios (express, cors, dotenv, office-addin-dev-certs, selfsigned)...
echo.
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Hubo un problema al instalar las dependencias con npm.
    pause
    exit /b 1
)

echo.
echo ====================================================
echo  ✓ Dependencias instaladas exitosamente.
echo  Ahora ejecuta el paso 2: "2-generar-certificados-ssl.bat"
echo ====================================================
pause
