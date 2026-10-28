@echo off
chcp 65001 > nul
echo ====================================================
echo  2. Generación y Confianza de Certificados SSL
echo ====================================================
echo.
echo Microsoft Word requiere que los complementos se sirvan a través de HTTPS local seguro.
echo Este script configurará los certificados de desarrollo para "localhost".
echo.
echo Presiona cualquier tecla para generar y registrar los certificados...
pause > nul

call npx office-addin-dev-certs install --days 365
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] El instalador interactivo puede haber solicitado confirmación.
    echo Si apareció una ventana emergente de Windows preguntando si deseas instalar el certificado,
    echo selecciona "SÍ" para confiar en el certificado de localhost.
)

echo.
echo ====================================================
echo  ✓ Certificados SSL configurados.
echo  Ahora ejecuta el paso 3: "3-registrar-en-word.bat"
echo ====================================================
pause
