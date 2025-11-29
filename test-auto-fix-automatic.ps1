# Quick test script to demonstrate automatic auto-fix

Write-Host "`n=== TESTING AUTOMATIC AUTO-FIX ===" -ForegroundColor Cyan

# Instructions for adding webhook
Write-Host "`n1. Add SLACK_WEBHOOK_URL to GitHub Secrets:" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/VarnaRithesh05/911-DevOps/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "   Click 'New repository secret'" -ForegroundColor White
Write-Host "   Name: SLACK_WEBHOOK_URL" -ForegroundColor Cyan
Write-Host "   Value: [Your webhook URL from Slack API]" -ForegroundColor Gray
Write-Host "   Get webhook: https://api.slack.com/apps -> Your App -> Incoming Webhooks" -ForegroundColor Gray

$confirm = Read-Host "`nHave you added the SLACK_WEBHOOK_URL secret to GitHub? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Please add the secret first, then run this script again." -ForegroundColor Red
    Write-Host "Run: .\test-slack-webhook.ps1 to test your webhook locally first!" -ForegroundColor Yellow
    exit
}

Write-Host "`n2. Creating intentional error..." -ForegroundColor Yellow
Add-Content -Path "server.js" -Value "`nconst testError = 'auto-fix test';"

Write-Host "3. Committing and pushing..." -ForegroundColor Yellow
git add server.js
git commit -m "test: automatic auto-fix system"
git push origin main

Write-Host "`n4. Watch what happens:" -ForegroundColor Green
Write-Host "   a) Main CI/CD pipeline will FAIL" -ForegroundColor Red
Write-Host "   b) Auto-fix workflow will start AUTOMATICALLY" -ForegroundColor Cyan
Write-Host "   c) It will fix the error and push" -ForegroundColor Green
Write-Host "   d) New build will start and SUCCEED" -ForegroundColor Green
Write-Host "   e) You'll get Slack notification!" -ForegroundColor Green

Write-Host "`n5. Monitor here:" -ForegroundColor Yellow
Write-Host "   https://github.com/VarnaRithesh05/911-DevOps/actions" -ForegroundColor Cyan

start "https://github.com/VarnaRithesh05/911-DevOps/actions"

Write-Host "`nWatch for these workflows:" -ForegroundColor White
Write-Host "  1. '911-DevOps CI/CD Pipeline' (will fail)" -ForegroundColor Red
Write-Host "  2. 'Auto-Fix on Failure' (will run and fix)" -ForegroundColor Green  
Write-Host "  3. '911-DevOps CI/CD Pipeline' again (will succeed)" -ForegroundColor Green

Write-Host "`nThis is FULLY AUTOMATIC - no manual intervention needed!" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan
