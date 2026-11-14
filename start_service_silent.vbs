' Placement Preparation Command Centre - Silent Background Runner
' Runs the application invisibly in the background without a command window.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get directory of this script
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Run python run.py silently (0 = hide window, False = don't wait)
WshShell.CurrentDirectory = scriptDir
WshShell.Run "python run.py", 0, False
