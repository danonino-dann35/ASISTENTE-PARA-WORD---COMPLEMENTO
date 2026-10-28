@echo off
chcp 65001 > nul
title Asistente para Subir a GitHub
cd /d "%~dp0"

echo ===================================================================
echo     Subir Proyecto a GitHub - Asistente Word & Suite Tesis
echo ===================================================================
echo.
echo Antes de continuar:
echo 1. Ve a https://github.com/new
echo 2. Crea tu repositorio (PÚBLICO).
echo    - IMPORTANTE: No marques "Add a README file"
echo    - No marques .gitignore ni License (ya están incluidos aquí).
echo 3. Copia el enlace HTTPS de tu repositorio.
echo    (Ejemplo: https://github.com/TU_USUARIO/word-thesis-spss-copilot.git)
echo.
set /p REPO_URL="Pega aquí la URL HTTPS de tu repositorio de GitHub: "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] No ingresaste ninguna URL. Operación cancelada.
    pause
    exit /b 1
)

echo.
echo [1/4] Inicializando Git local...
if not exist ".git" (
    git init
)

echo [2/4] Agregando archivos al control de versiones...
git add .

echo [3/4] Creando el primer commit...
git commit -m "feat: Lanzamiento inicial - Asistente Editorial Word + Suite Estadística Tesis APA 7"

echo [4/4] Conectando con GitHub y subiendo a la rama principal (main)...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo   ✓ ¡PROYECTO SUBIDO EXITOSAMENTE A GITHUB!
    echo ===================================================================
    echo Ya puedes visitar tu repositorio en: %REPO_URL%
    echo.
) else (
    echo.
    echo ===================================================================
    echo [AVISO DE AUTENTICACIÓN]
    echo Si GitHub te pide iniciar sesión, autoriza mediante tu navegador
    echo o ingresa tu Personal Access Token (PAT).
    echo ===================================================================
)

pause
