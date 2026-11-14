# Register Placement Preparation Command Centre in Windows Startup
# This ensures it automatically starts on system reboot in the background.

$WshShell = New-Object -ComObject WScript.Shell
$StartupFolder = [System.Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $StartupFolder "PlacementCommandCentre.lnk"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetVBS = Join-Path $ProjectDir "start_service_silent.vbs"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$TargetVBS`""
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.Description = "Placement Preparation Command Centre Auto-Start Service"
$Shortcut.Save()

Write-Host "=================================================================="
Write-Host "✅ AUTO-START SERVICE SUCCESSFULLY CONFIGURED!"
Write-Host "=================================================================="
Write-Host "Startup Shortcut created at: $ShortcutPath"
Write-Host "The application will now automatically start in the background"
Write-Host "whenever you restart or log in to your computer."
Write-Host "Permanent Link: http://localhost:8000"
Write-Host "Local Wi-Fi Link: http://10.43.17.154:8000"
Write-Host "=================================================================="
