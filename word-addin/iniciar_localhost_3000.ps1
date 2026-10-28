# -*- coding: utf-8 -*-
<#
.SYNOPSIS
    Inicia el servidor local https://localhost:3000 del Asistente para Microsoft Word.
.DESCRIPTION
    Verifica si el servidor ya está respondiendo en el puerto 3000. Si no lo está,
    lo inicia en segundo plano con Node.js y confirma su disponibilidad.
#>

[CmdletBinding()]
param(
    [int]$Port = 3000
)

Write-Host "Comprobando estado del servidor local en el puerto $Port..." -ForegroundColor Cyan

# Función para verificar si el puerto está en escucha
function Test-PortListening {
    param([int]$p)
    $conn = Test-NetConnection -ComputerName localhost -Port $p -WarningAction SilentlyContinue -InformationLevel Quiet
    return $conn
}

if (Test-PortListening -p $Port) {
    Write-Host "✓ El servidor ya se encuentra activo y respondiendo en https://localhost:$Port/" -ForegroundColor Green
    exit 0
}

# Localizar server.js de manera relativa
$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$candidatePaths = @(
    (Join-Path $currentDir "server.js"),
    (Join-Path $currentDir "..\word-addin\server.js"),
    (Join-Path $currentDir "..\..\word-addin\server.js"),
    (Join-Path (Get-Location) "server.js"),
    (Join-Path (Get-Location) "word-addin\server.js")
)

$serverJsPath = $null
foreach ($path in $candidatePaths) {
    if (Test-Path $path) {
        $serverJsPath = (Resolve-Path $path).Path
        break
    }
}

if (-not $serverJsPath) {
    Write-Host "[ERROR] No se pudo localizar el archivo server.js en las rutas relativas del proyecto." -ForegroundColor Red
    exit 1
}

$workingDir = Split-Path -Parent $serverJsPath
Write-Host "Iniciando servidor Node.js en: $workingDir" -ForegroundColor Yellow

# Iniciar proceso de Node en segundo plano
$proc = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $workingDir -WindowStyle Hidden -PassThru

# Esperar hasta 5 segundos para que abra el socket
$started = $false
for ($i = 1; $i -le 10; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-PortListening -p $Port) {
        $started = $true
        break
    }
}

if ($started) {
    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host " ✓ Servidor iniciado exitosamente en https://localhost:$Port/" -ForegroundColor Green
    Write-Host " PID del proceso: $($proc.Id)" -ForegroundColor Green
    Write-Host " El complemento en Microsoft Word ya puede conectarse con normalidad." -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[ADVERTENCIA] El proceso inició (PID: $($proc.Id)), pero el puerto aún no responde." -ForegroundColor Yellow
    Write-Host "Verifica si faltan dependencias ejecutando 'npm install' en $workingDir" -ForegroundColor Yellow
    exit 1
}
