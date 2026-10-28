' ===================================================================
' Lanzador Silencioso en Segundo Plano para el Asistente de Word
' Permite arrancar https://localhost:3000 sin mantener una ventana negra abierta.
' ===================================================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Ejecutar el servidor con ventana oculta (0) y sin esperar (False)
WshShell.CurrentDirectory = strPath
WshShell.Run "cmd /c node server.js", 0, False

WScript.Echo "El servidor local https://localhost:3000 ha sido iniciado silenciosamente en segundo plano." & vbCrLf & vbCrLf & "Ya puedes abrir Microsoft Word y hacer clic en 'Abrir Asistente'."
