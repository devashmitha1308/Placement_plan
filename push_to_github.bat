@echo off
title Push Placement Command Centre to GitHub
echo ==================================================================
echo Pushing Placement Command Centre to GitHub for Render Deployment...
echo ==================================================================
powershell -ExecutionPolicy Bypass -File "%~dp0push_to_github.ps1" %*
pause
