@echo off
chcp 65001 > nul
echo ====================================================
echo  3. Registro del Complemento en Microsoft Word
echo ====================================================
echo.
set "MANIFEST_PATH=%~dp0manifest.xml"
set "GUID=b29788f4-6cb2-4796-9871-331289cf0821"

echo Ruta del manifiesto: %MANIFEST_PATH%
echo Registrando en el Registro de Windows (Office Developer Sideloading)...

reg add "HKCU\Software\Microsoft\Office\16.0\WEF\Developer\%GUID%" /f /v "ManifestPath" /t REG_SZ /d "%MANIFEST_PATH%" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ====================================================
    echo  ✓ Complemento registrado exitosamente en Word!
    echo ====================================================
    echo  Cuando abras Word, verás la pestaña "Asistente Gemini"
    echo  en la cinta de opciones con el botón "Abrir Gemini".
    echo.
    echo  Para que funcione, inicia el servidor con el paso 4:
    echo  "4-iniciar-servidor.bat"
    echo ====================================================
) else (
    echo.
    echo [ERROR] No se pudo escribir en el registro de Windows.
    echo Intenta ejecutar este archivo con permisos estándar de usuario.
)
echo.
pause
