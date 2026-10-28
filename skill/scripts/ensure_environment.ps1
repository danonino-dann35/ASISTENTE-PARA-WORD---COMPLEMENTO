# Script de Verificacion e Instalacion Automatica de Entorno Python y Dependencias
param (
    [switch]$ForceReinstall
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION DE ENTORNO PYTHON (MÉTODO TANDAZO)      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$pythonCandidates = @(
    "python.exe",
    "py.exe",
    "C:\Program Files\IBM\SPSS Statistics\Python3\python.exe",
    "$env:LOCALAPPDATA\Python\bin\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe"
)

$validPython = $null

foreach ($cand in $pythonCandidates) {
    try {
        $test = Start-Process -FilePath $cand -ArgumentList "--version" -NoNewWindow -PassThru -Wait -ErrorAction SilentlyContinue
        if ($test.ExitCode -eq 0) {
            $validPython = $cand
            Write-Host "[OK] Python detectado en: $cand" -ForegroundColor Green
            break
        }
    } catch {
        # Continuar con el siguiente
    }
}

# Si no existe Python en la maquina, descargarlo desde python.org e instalarlo
if (-not $validPython -or $ForceReinstall) {
    Write-Host "[!] Python no detectado. Descargando instalador oficial desde python.org..." -ForegroundColor Yellow
    $installerUrl = "https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe"
    $installerPath = "$env:TEMP\python-3.12.7-amd64.exe"
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "[OK] Descarga completada. Instalando Python en segundo plano..." -ForegroundColor Cyan
        
        $proc = Start-Process -FilePath $installerPath -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_pip=1" -Wait -PassThru
        if ($proc.ExitCode -eq 0) {
            Write-Host "[OK] Python instalado exitosamente desde python.org!" -ForegroundColor Green
            $validPython = "python.exe"
        } else {
            Write-Host "[ADVERTENCIA] El instalador devolvio codigo: $($proc.ExitCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[ERROR] No se pudo descargar automaticamente Python: $_" -ForegroundColor Red
    }
}

# Verificacion de librerias necesarias
if ($validPython) {
    Write-Host "`nVerificando librerias estadisticas y de oficina..." -ForegroundColor Cyan
    $packages = @("pandas", "scipy", "openpyxl", "python-docx", "pyreadstat")
    
    foreach ($pkg in $packages) {
        $check = Start-Process -FilePath $validPython -ArgumentList "-c `"import $pkg`"" -NoNewWindow -PassThru -Wait -ErrorAction SilentlyContinue
        if ($check.ExitCode -ne 0) {
            Write-Host "[!] Instalando paquete: $pkg..." -ForegroundColor Yellow
            Start-Process -FilePath $validPython -ArgumentList "-m pip install --quiet $pkg" -NoNewWindow -PassThru -Wait -ErrorAction SilentlyContinue
        } else {
            Write-Host "  [OK] $pkg disponible." -ForegroundColor Green
        }
    }
}

Write-Host "`n[COMPLETADO] Entorno verificado y listo para ejecucion." -ForegroundColor Green
return $validPython
