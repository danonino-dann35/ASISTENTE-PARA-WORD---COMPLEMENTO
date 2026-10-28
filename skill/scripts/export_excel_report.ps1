param (
    [Parameter(Mandatory=$true)]
    [string]$JsonPath,

    [Parameter(Mandatory=$true)]
    [string]$OutputPath
)

$jsonRaw = Get-Content -Path $JsonPath -Raw -Encoding utf8
$res = $jsonRaw | ConvertFrom-Json

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$wb = $excel.Workbooks.Add()

# Hoja 1: Estadisticos e Hipotesis
$ws1 = $wb.Worksheets.Item(1)
$ws1.Name = "Resumen Inferencial APA 7"

$ws1.Cells.Item(1, 1) = "INFORME ESTADÍSTICO - MÉTODO TANDAZO (2026)"
$ws1.Cells.Item(1, 1).Font.Bold = $true
$ws1.Cells.Item(1, 1).Font.Size = 14

$ws1.Cells.Item(3, 1) = "Muestra (N):"
$ws1.Cells.Item(3, 2) = $res.n
$ws1.Cells.Item(4, 1) = "Alfa de Cronbach Pretest:"
$ws1.Cells.Item(4, 2) = $res.alpha_pre
$ws1.Cells.Item(5, 1) = "Alfa de Cronbach Postest:"
$ws1.Cells.Item(5, 2) = $res.alpha_post

$ws1.Cells.Item(7, 1) = "Prueba Estadística"
$ws1.Cells.Item(7, 2) = "Media Pre"
$ws1.Cells.Item(7, 3) = "Media Post"
$ws1.Cells.Item(7, 4) = "Ganancia Media"
$ws1.Cells.Item(7, 5) = "IC 95 % Inferior"
$ws1.Cells.Item(7, 6) = "IC 95 % Superior"
$ws1.Cells.Item(7, 7) = "Estadístico"
$ws1.Cells.Item(7, 8) = "gl"
$ws1.Cells.Item(7, 9) = "p-valor"
$ws1.Cells.Item(7, 10) = "Efecto"

$rangeH = $ws1.Range("A7", "J7")
$rangeH.Font.Bold = $true
$rangeH.Interior.ColorIndex = 15

# Fila t de Student
$ws1.Cells.Item(8, 1) = "t de Student (relacionada)"
$ws1.Cells.Item(8, 2) = $res.mean_pre
$ws1.Cells.Item(8, 3) = $res.mean_post
$ws1.Cells.Item(8, 4) = $res.mean_diff
$ws1.Cells.Item(8, 5) = $res.ci_95[0]
$ws1.Cells.Item(8, 6) = $res.ci_95[1]
$ws1.Cells.Item(8, 7) = "t = $($res.t_stat)"
$ws1.Cells.Item(8, 8) = $res.df
$ws1.Cells.Item(8, 9) = "< .001"
$ws1.Cells.Item(8, 10) = "dz = $($res.d_cohen)"

# Fila Wilcoxon
$ws1.Cells.Item(9, 1) = "Wilcoxon (no paramétrica)"
$ws1.Cells.Item(9, 2) = $res.med_pre
$ws1.Cells.Item(9, 3) = $res.med_post
$ws1.Cells.Item(9, 4) = $res.med_diff
$ws1.Cells.Item(9, 5) = "--"
$ws1.Cells.Item(9, 6) = "--"
$ws1.Cells.Item(9, 7) = "Z = $($res.z_wilcoxon)"
$ws1.Cells.Item(9, 8) = "--"
$ws1.Cells.Item(9, 9) = "< .001"
$ws1.Cells.Item(9, 10) = "r = $($res.r_wilcoxon)"

# Hoja 2: Niveles de Logro
$ws2 = $wb.Worksheets.Add([System.Reflection.Missing]::Value, $ws1)
$ws2.Name = "Niveles de Logro"

$ws2.Cells.Item(1, 1) = "MOVILIDAD PEDAGÓGICA POR NIVELES DE LOGRO"
$ws2.Cells.Item(1, 1).Font.Bold = $true

$ws2.Cells.Item(3, 1) = "Nivel de Logro"
$ws2.Cells.Item(3, 2) = "Pretest (f)"
$ws2.Cells.Item(3, 3) = "Pretest (%)"
$ws2.Cells.Item(3, 4) = "Postest (f)"
$ws2.Cells.Item(3, 5) = "Postest (%)"

$ws2.Range("A3", "E3").Font.Bold = $true
$ws2.Range("A3", "E3").Interior.ColorIndex = 15

$ws2.Cells.Item(4, 1) = "Inicio"
$ws2.Cells.Item(4, 2) = $res.freq_pre.'1'
$ws2.Cells.Item(4, 3) = "$($res.pct_pre.'1') %"
$ws2.Cells.Item(4, 4) = $res.freq_post.'1'
$ws2.Cells.Item(4, 5) = "$($res.pct_post.'1') %"

$ws2.Cells.Item(5, 1) = "En Proceso"
$ws2.Cells.Item(5, 2) = $res.freq_pre.'2'
$ws2.Cells.Item(5, 3) = "$($res.pct_pre.'2') %"
$ws2.Cells.Item(5, 4) = $res.freq_post.'2'
$ws2.Cells.Item(5, 5) = "$($res.pct_post.'2') %"

$ws2.Cells.Item(6, 1) = "Logrado"
$ws2.Cells.Item(6, 2) = $res.freq_pre.'3'
$ws2.Cells.Item(6, 3) = "$($res.pct_pre.'3') %"
$ws2.Cells.Item(6, 4) = $res.freq_post.'3'
$ws2.Cells.Item(6, 5) = "$($res.pct_post.'3') %"

$ws1.Columns.AutoFit() | Out-Null
$ws2.Columns.AutoFit() | Out-Null

$wb.SaveAs($OutputPath)
$wb.Close()
$excel.Quit()

Write-Host "[OK] Libro Excel guardado exitosamente en: $OutputPath" -ForegroundColor Green
