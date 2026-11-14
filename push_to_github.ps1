param (
    [string]$RepoUrl
)

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/placement-prep.git)"
}

if (-not $RepoUrl) {
    Write-Host "Error: Repository URL is required." -ForegroundColor Red
    exit 1
}

Write-Host "Connecting to remote: $RepoUrl..." -ForegroundColor Cyan

# Set remote origin
git remote remove origin 2>$null
git remote add origin $RepoUrl

# Push to GitHub
Write-Host "Pushing main branch to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==================================================================" -ForegroundColor Green
    Write-Host "✅ CODE SUCCESSFULLY PUSHED TO GITHUB!" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host "Render will now automatically detect the push and deploy successfully!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Push encountered an issue. Check your GitHub authentication or credentials." -ForegroundColor Yellow
}
