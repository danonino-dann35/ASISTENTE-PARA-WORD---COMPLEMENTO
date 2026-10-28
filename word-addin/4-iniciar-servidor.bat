@echo off
chcp 65001 > nul
echo ====================================================
echo  4. Iniciar Servidor del Asistente Gemini para Word
echo ====================================================
echo.
cd /d "%~dp0"

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] No se encontró el archivo .env. Creando uno desde .env.example...
        copy ".env.example" ".env" >nul
        echo [IMPORTANTE] Abre el archivo .env y coloca tu GEMINI_API_KEY si deseas que se cargue automáticamente.
        echo (También puedes ingresar tu clave directamente en la pestaña "Ajustes" dentro de Word).
        echo.
    )
)

echo Iniciando servidor seguro en https://localhost:3000 ...
echo Mantén esta ventana abierta mientras utilices el complemento en Word.
echo Para detener el servidor, presiona Ctrl + C en cualquier momento.
echo.
node server.js
pause
