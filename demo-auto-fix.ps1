# Complete Auto-Fix Demo Script
# This demonstrates the entire auto-fix workflow

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  911-DevOps AUTO-FIX DEMONSTRATION" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "This demo will:" -ForegroundColor White
Write-Host "  1. Introduce a lint error" -ForegroundColor Gray
Write-Host "  2. Push to trigger CI/CD failure" -ForegroundColor Gray
Write-Host "  3. Show failure notification" -ForegroundColor Gray
Write-Host "  4. Run auto-fix" -ForegroundColor Gray
Write-Host "  5. Show successful rebuild`n" -ForegroundColor Gray

Read-Host "Press Enter to start the demo"

# Step 1: Introduce error
Write-Host "`n[STEP 1] Introducing lint error..." -ForegroundColor Yellow
$errorCode = "`n// Demo lint error`nconst demoError = 'This breaks lint';"
Add-Content -Path "server.js" -Value $errorCode

Write-Host "  Added intentional error to server.js" -ForegroundColor Gray

# Step 2: Commit and push
Write-Host "`n[STEP 2] Committing and pushing..." -ForegroundColor Yellow
git add server.js
git commit -m "demo: trigger lint failure for auto-fix demo"
$pushOutput = git push origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "  ✗ Push failed" -ForegroundColor Red
    exit 1
}

# Step 3: Wait for failure
Write-Host "`n[STEP 3] Waiting for CI/CD pipeline..." -ForegroundColor Yellow
Write-Host "  Opening GitHub Actions page..." -ForegroundColor Gray
start "https://github.com/VarnaRithesh05/911-DevOps/actions"

Write-Host "`n  Watch for:" -ForegroundColor Cyan
Write-Host "    • Pipeline starts running" -ForegroundColor White
Write-Host "    • Lint step fails (red X)" -ForegroundColor Red
Write-Host "    • Slack notification: 'LINT FAILED'" -ForegroundColor Red

Read-Host "`nPress Enter AFTER you see the failure notification in Slack"

# Step 4: Run auto-fix
Write-Host "`n[STEP 4] Running AUTO-FIX..." -ForegroundColor Yellow
Write-Host "  Analyzing code..." -ForegroundColor Gray
Write-Host "  Fixing errors..." -ForegroundColor Gray
Write-Host "  Committing changes..." -ForegroundColor Gray
Write-Host "  Pushing fixes...`n" -ForegroundColor Gray

.\auto-fix.ps1

# Step 5: Verify success
Write-Host "`n[STEP 5] Verifying rebuild..." -ForegroundColor Yellow
Write-Host "  New pipeline should be running now" -ForegroundColor Gray
Write-Host "  Opening GitHub Actions..." -ForegroundColor Gray

Start-Sleep -Seconds 2
start "https://github.com/VarnaRithesh05/911-DevOps/actions"

Write-Host "`n  Watch for:" -ForegroundColor Cyan
Write-Host "    • New pipeline run started" -ForegroundColor White
Write-Host "    • All checks pass (green checkmarks)" -ForegroundColor Green
Write-Host "    • Slack notification: 'DEPLOYMENT SUCCESS'" -ForegroundColor Green

Read-Host "`nPress Enter AFTER you see the success notification"

# Summary
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  DEMO COMPLETE!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "What we demonstrated:" -ForegroundColor White
Write-Host "  ✓ Automatic failure detection" -ForegroundColor Green
Write-Host "  ✓ Real-time Slack notifications" -ForegroundColor Green
Write-Host "  ✓ Intelligent error analysis" -ForegroundColor Green
Write-Host "  ✓ Automatic code fixes" -ForegroundColor Green
Write-Host "  ✓ Auto-commit and push" -ForegroundColor Green
Write-Host "  ✓ Automatic rebuild triggered" -ForegroundColor Green
Write-Host "  ✓ Success notification" -ForegroundColor Green

Write-Host "`nKey Points for Judges:" -ForegroundColor Yellow
Write-Host "  • Self-healing CI/CD pipeline" -ForegroundColor White
Write-Host "  • Production-grade automation" -ForegroundColor White
Write-Host "  • Minimal human intervention" -ForegroundColor White
Write-Host "  • Intelligent error recovery" -ForegroundColor White

Write-Host "`n============================================`n" -ForegroundColor Cyan
