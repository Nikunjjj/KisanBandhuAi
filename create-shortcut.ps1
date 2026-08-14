$DesktopPath = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath 'KisanBandhu.lnk'
$BatchFilePath = 'c:\Users\PC\Downloads\KisanBandhu_Main-main\KisanBandhu_Main-main\start-app.bat'

# Create COM object for shell
$WshShell = New-Object -ComObject WScript.Shell

# Create shortcut
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $BatchFilePath
$Shortcut.WorkingDirectory = 'c:\Users\PC\Downloads\KisanBandhu_Main-main\KisanBandhu_Main-main'
$Shortcut.Description = 'Start KisanBandhu Application (Server + Client)'
$Shortcut.WindowStyle = 1  # Normal window

# Save shortcut
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host "Location: $ShortcutPath" -ForegroundColor Cyan
