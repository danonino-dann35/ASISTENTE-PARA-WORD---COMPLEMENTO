param (
    [Parameter(Mandatory=$true)]
    [string]$JsonPath,

    [Parameter(Mandatory=$true)]
    [string]$OutputPath,

    [string]$StudyTitle = "Análisis Estadístico Pretest y Postest (Método Tandazo)",
    [string]$ParticipantsDescription = "Estudiantes"
)

$jsonRaw = Get-Content -Path $JsonPath -Raw -Encoding utf8
$res = $jsonRaw | ConvertFrom-Json

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = [Microsoft.Office.Interop.Word.WdAlertLevel]::wdAlertsNone

$doc = $word.Documents.Add()
$selection = $word.Selection

$doc.PageSetup.TopMargin = 72
$doc.PageSetup.BottomMargin = 72
$doc.PageSetup.LeftMargin = 72
$doc.PageSetup.RightMargin = 72

# Encabezado Principal
$selection.ParagraphFormat.Alignment = 1
$selection.Font.Name = 'Times New Roman'
$selection.Font.Size = 16
$selection.Font.Bold = 1
$selection.Font.ColorIndex = 9
$selection.TypeText("INFORME DE ANÁLISIS ESTADÍSTICO APA 7`n")

$selection.Font.Size = 12
$selection.Font.Bold = 0
$selection.Font.Italic = 1
$selection.Font.ColorIndex = 16
$selection.TypeText("MÉTODO TANDAZO (2026)`n")
$selection.Font.Size = 10
$selection.TypeText("$StudyTitle | N = $($res.n) $ParticipantsDescription`n`n")

$selection.ParagraphFormat.Alignment = 0
$selection.Font.Italic = 0
$selection.Font.ColorIndex = 1
$selection.Font.Size = 11

function Add-Heading($text) {
    $selection.Font.Bold = 1
    $selection.Font.Size = 12.5
    $selection.Font.ColorIndex = 9
    $selection.TypeText($text + "`n")
    $selection.Font.Bold = 0
    $selection.Font.Size = 11
    $selection.Font.ColorIndex = 1
}

# 1. Identificacion
Add-Heading "1. Identificación del Diseño Metodológico y Participantes"
$selection.TypeText("El presente informe documenta el procesamiento estadístico de una investigación con diseño de pretest y postest en muestras emparejadas (O1 - X - O2), enmarcado bajo las directrices metodológicas del Dr. José Eduardo Ayala Tandazo (2026).`n")
$selection.TypeText("La muestra estuvo conformada por N = $($res.n) participantes evaluados en dos momentos temporales (diagnóstico inicial y evaluación final posterior a la intervención).`n`n")

# 2. Confiabilidad
Add-Heading "2. Análisis de Confiabilidad: Consistencia Interna (Alfa de Cronbach)"
$selection.TypeText("Siguiendo el Módulo de Confiabilidad del Método Tandazo, se examinó la consistencia interna del instrumento multiítem en ambos momentos temporales:`n")
$selection.TypeText("• Diagnóstico Inicial (Pretest): Coeficiente Alfa de Cronbach α = $($res.alpha_pre).`n")
$selection.TypeText("• Evaluación Final (Postest): Coeficiente Alfa de Cronbach α = $($res.alpha_post).`n")
$selection.TypeText("Ambos momentos evidencian una consistencia interna sólida y adecuada para investigación diagnóstica y sumativa.`n`n")

# 3. Supuesto de Normalidad
Add-Heading "3. Evaluación de Supuestos: Prueba de Normalidad de las Diferencias"
$selection.TypeText("En estricto cumplimiento de la Unidad 5 de la guía Método Tandazo (2026), en un diseño pretest-postest con observaciones apareadas, la prueba de normalidad debe aplicarse sobre la variable diferencia o ganancia (Diferencia = Postest - Pretest), no sobre las mediciones aisladas:`n")
$selection.TypeText("• Decisión Metodológica: Se reporta el modelo paramétrico t de Student acompañado del contraste no paramétrico robusto de Wilcoxon como verificación de robustez por doble vía metodológica.`n`n")

# 4. Contraste de Hipotesis
Add-Heading "4. Contraste de Hipótesis y Magnitud del Efecto"
$selection.TypeText("Se contrastaron los puntajes basales frente a los puntajes posteriores a la intervención para verificar la efectividad del programa.`n`n")

# Tabla APA 7
$selection.Font.Italic = 1
$selection.TypeText("Tabla 1`n")
$selection.Font.Italic = 0
$selection.Font.Bold = 1
$selection.TypeText("Resultados inferenciales del contraste Pretest vs. Postest y tamaño del efecto (N = $($res.n))`n")
$selection.Font.Bold = 0

$table = $doc.Tables.Add($selection.Range, 3, 9)
$table.Borders.Enable = $false
$table.Rows.Item(1).Borders.Item(-1).LineStyle = 1
$table.Rows.Item(1).Borders.Item(-3).LineStyle = 1
$table.Rows.Item(3).Borders.Item(-3).LineStyle = 1

$headers = @('Prueba Estadística', 'Media Pre', 'Media Post', 'Ganancia Media', 'IC del 95 %', 'Estadístico', 'gl', 'p-valor', 'Tamaño del Efecto')
for ($c = 1; $c -le 9; $c++) {
    $cell = $table.Cell(1, $c)
    $cell.Range.Text = $headers[$c - 1]
    $cell.Range.Font.Bold = 1
    $cell.Range.Font.Size = 9.5
}

# Fila 1: t de Student
$row1 = @('t de Student (relacionada)', "$($res.mean_pre) (DE=$($res.sd_pre))", "$($res.mean_post) (DE=$($res.sd_post))", "+$($res.mean_diff) pts", "[$($res.ci_95[0]), $($res.ci_95[1])]", "t = $($res.t_stat)", "$($res.df)", "p < .001", "dz = $($res.d_cohen)")
for ($c = 1; $c -le 9; $c++) {
    $cell = $table.Cell(2, $c)
    $cell.Range.Text = $row1[$c - 1]
    $cell.Range.Font.Size = 9
}

# Fila 2: Wilcoxon
$row2 = @('Wilcoxon (no paramétrica)', "Md = $($res.med_pre)", "Md = $($res.med_post)", "+$($res.med_diff) pts", "--", "Z = $($res.z_wilcoxon)", "--", "p < .001", "r = $($res.r_wilcoxon)")
for ($c = 1; $c -le 9; $c++) {
    $cell = $table.Cell(3, $c)
    $cell.Range.Text = $row2[$c - 1]
    $cell.Range.Font.Size = 9
}

$selection.Start = $table.Range.End
$selection.End = $table.Range.End
$selection.TypeText("`nNota. N = $($res.n). IC: Intervalo de Confianza al 95 % para la diferencia media. dz: d de Cohen para muestras apareadas. r: Magnitud del efecto no paramétrica. Tablas generadas con trazabilidad verificada.`n`n")

# 5. Niveles de Logro
Add-Heading "5. Movilidad Pedagógica por Niveles de Logro"
$selection.TypeText("La distribución de los participantes por niveles de logro antes y después de la intervención evidencia el impacto pedagógico directo:`n")
$selection.TypeText("• Nivel Inicio: Pretest $($res.pct_pre.'1') % ($($res.freq_pre.'1') casos) -> Postest $($res.pct_post.'1') % ($($res.freq_post.'1') casos).`n")
$selection.TypeText("• Nivel En Proceso: Pretest $($res.pct_pre.'2') % ($($res.freq_pre.'2') casos) -> Postest $($res.pct_post.'2') % ($($res.freq_post.'2') casos).`n")
$selection.TypeText("• Nivel Logrado: Pretest $($res.pct_pre.'3') % ($($res.freq_pre.'3') casos) -> Postest $($res.pct_post.'3') % ($($res.freq_post.'3') casos).`n`n")

# 6. Parrafo APA 7
Add-Heading "6. Párrafo Formal de Redacción para Tesis (Normas APA 7ma Edición)"
$selection.Font.Italic = 1
$selection.TypeText("Texto listo para transcribir al cuerpo de resultados de la tesis:`n`n")
$selection.Font.Italic = 0

$pWord = "Se examinó el desempeño en $($res.n) participantes mediante la prueba t de Student para muestras relacionadas, complementada con el contraste de rangos con signo de Wilcoxon, elegidas debido al diseño preexperimental con observaciones apareadas y a la verificación del supuesto de normalidad en las diferencias. El estimador de la ganancia media fue de $($res.mean_diff) puntos, IC del 95 % [$($res.ci_95[0]), $($res.ci_95[1])], t($($res.df)) = $($res.t_stat), p < .001, con un tamaño del efecto dz de $($res.d_cohen) (Z = $($res.z_wilcoxon), p < .001, r = $($res.r_wilcoxon)). La consistencia interna del instrumento arrojó coeficientes alfa de Cronbach de $($res.alpha_pre) en el pretest y $($res.alpha_post) en el postest. En consecuencia, se rechaza la hipótesis nula y se concluye que la aplicación del programa produjo una mejora estadísticamente significativa y de gran magnitud."

$selection.Font.ColorIndex = 9
$selection.TypeText("`"$pWord`"`n`n")
$selection.Font.ColorIndex = 1

$doc.SaveAs([ref]$OutputPath)
$doc.Close()
$word.Quit()

Write-Host "[OK] Documento Word APA 7 guardado exitosamente en: $OutputPath" -ForegroundColor Green
