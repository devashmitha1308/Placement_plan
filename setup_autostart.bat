@echo off
title Setup Auto-Start for Placement Command Centre
echo ==================================================================
echo Configuring Auto-Start for Placement Preparation Command Centre...
echo ==================================================================
powershell -ExecutionPolicy Bypass -File "%~dp0setup_autostart.ps1"
pause
