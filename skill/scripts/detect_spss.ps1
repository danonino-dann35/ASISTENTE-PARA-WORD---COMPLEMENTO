# Script de Deteccion y Diagnostico de IBM SPSS Statistics
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  DETECCION INTELIGENTE DE IBM SPSS STATISTICS            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$spssRoots = @(
    "C:\Program Files\IBM\SPSS Statistics",
    "C:\Program Files\IBM\SPSS\Statistics",
    "C:\Program Files (x86)\IBM\SPSS Statistics"
)

$detectedPath = $null
$spssExe = $null
$spssPython = $null
$version = "Desconocida"

foreach ($root in $spssRoots) {
    if (Test-Path $root) {
        $statsExe = Join-Path $root "stats.exe"
        if (Test-Path $statsExe) {
            $detectedPath = $root
            $spssExe = $statsExe
            
            # Buscar version en ejecutable o carpetas
            try {
                $fvi = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($statsExe)
                $version = $fvi.FileVersion
            } catch {
                $version = "Detectada"
            }
            
            # Buscar Python integrado de SPSS
            $pyPath = Join-Path $root "Python3\python.exe"
            if (Test-Path $pyPath) {
                $spssPython = $pyPath
            }
            break
        }
    }
}

$status = [PSCustomObject]@{
    SpssInstalled = ($null -ne $spssExe)
    SpssPath      = $spssExe
    SpssVersion   = $version
    SpssPython    = $spssPython
}

if ($status.SpssInstalled) {
    Write-Host "[OK] IBM SPSS Statistics detectado exitosamente." -ForegroundColor Green
    Write-Host "     Ruta: $($status.SpssPath)" -ForegroundColor Gray
    Write-Host "     Version: $($status.SpssVersion)" -ForegroundColor Gray
    if ($status.SpssPython) {
        Write-Host "     Motor Python SPSS: $($status.SpssPython)" -ForegroundColor Gray
    }
} else {
    Write-Host "[INFO] IBM SPSS no esta instalado en las rutas predeterminadas." -ForegroundColor Yellow
    Write-Host "       El procesamiento continuara mediante el motor estadistico de Python." -ForegroundColor Gray
}

return ($status | ConvertTo-Json -Compress)
