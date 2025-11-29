# Test Slack Notifications for CI/CD Failures
# This script tests all the different notification types

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CI/CD Slack Notification Tester" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Prompt for webhook URL
$webhookUrl = Read-Host -Prompt "Enter your Slack Webhook URL"

if ([string]::IsNullOrWhiteSpace($webhookUrl)) {
    Write-Host "`n[ERROR] Webhook URL cannot be empty!" -ForegroundColor Red
    exit 1
}

# Test 1: Lint Failure Notification
Write-Host "`n1. Testing LINT FAILURE notification..." -ForegroundColor Yellow
$lintFailBody = @{
    text = "❌ *LINT FAILED*`n*Project:* 911-DevOps`n*Branch:* ``main```n*Stage:* Code Linting (ESLint)`n*Commit:* ``abc123```n*Author:* TestUser`n`n🔍 Fix linting errors and push again.`n*View Details:* https://github.com/VarnaRithesh05/911-DevOps/actions"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $lintFailBody -ContentType 'application/json'
    Write-Host "   [SUCCESS] Lint failure notification sent!" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "   [ERROR] Failed to send: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test Failure Notification
Write-Host "`n2. Testing TEST FAILURE notification..." -ForegroundColor Yellow
$testFailBody = @{
    text = "❌ *TESTS FAILED*`n*Project:* 911-DevOps`n*Branch:* ``main```n*Stage:* Unit Tests`n*Commit:* ``abc123```n*Author:* TestUser`n`n🧪 Fix failing tests and push again.`n*View Details:* https://github.com/VarnaRithesh05/911-DevOps/actions"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $testFailBody -ContentType 'application/json'
    Write-Host "   [SUCCESS] Test failure notification sent!" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "   [ERROR] Failed to send: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Build/Deploy Failure Notification
Write-Host "`n3. Testing BUILD FAILURE notification..." -ForegroundColor Yellow
$buildFailBody = @{
    text = "❌ *CD FAILED*: Docker build/push failed`n*Branch:* ``main```n*Commit:* ``abc123```n*Author:* TestUser`n`n🐳 Check Docker configuration and try again.`n*View Details:* https://github.com/VarnaRithesh05/911-DevOps/actions"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $buildFailBody -ContentType 'application/json'
    Write-Host "   [SUCCESS] Build failure notification sent!" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "   [ERROR] Failed to send: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Success Notification
Write-Host "`n4. Testing SUCCESS notification..." -ForegroundColor Yellow
$successBody = @{
    text = "✅ *DEPLOYMENT SUCCESS*`n*Pipeline:* CI/CD Completed`n*Branch:* ``main```n*Image:* ``username/911-devops:latest```n*Commit:* ``abc123```n*Author:* TestUser`n🚀 Ready for deployment!"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $successBody -ContentType 'application/json'
    Write-Host "   [SUCCESS] Success notification sent!" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Failed to send: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nCheck your Slack channel for 4 test messages:" -ForegroundColor White
Write-Host "  1. Lint Failure" -ForegroundColor Gray
Write-Host "  2. Test Failure" -ForegroundColor Gray
Write-Host "  3. Build Failure" -ForegroundColor Gray
Write-Host "  4. Deployment Success" -ForegroundColor Gray

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. If messages appeared, your webhook is working!" -ForegroundColor White
Write-Host "  2. Add webhook to GitHub Secrets:" -ForegroundColor White
Write-Host "     https://github.com/VarnaRithesh05/911-DevOps/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "  3. Secret name: SLACK_WEBHOOK_URL" -ForegroundColor White
Write-Host "  4. Push code to trigger real notifications!" -ForegroundColor White
Write-Host "" -ForegroundColor White
