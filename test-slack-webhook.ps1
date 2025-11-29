# Test Slack Webhook Script

# Replace this with your actual webhook URL from Slack
# Get it from: https://api.slack.com/apps → Your App → Incoming Webhooks

# Prompt for webhook URL securely (won't be committed to git)
$webhookUrl = Read-Host -Prompt "Enter your Slack Webhook URL"

if ([string]::IsNullOrWhiteSpace($webhookUrl)) {
    Write-Host "❌ Error: Webhook URL cannot be empty!" -ForegroundColor Red
    exit 1
}

# Test message
$body = @{
    text = "🧪 Test notification from 911-DevOps! Your webhook is working! ✅"
} | ConvertTo-Json

try {
    # Send test message
    Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType 'application/json'
    Write-Host "✅ Test message sent successfully! Check your Slack channel." -ForegroundColor Green
}
catch {
    Write-Host "❌ Error sending message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - 'no_service': Webhook URL is invalid or deactivated" -ForegroundColor Yellow
    Write-Host "  - 'invalid_payload': Message format is incorrect" -ForegroundColor Yellow
    Write-Host "`nPlease create a new webhook at: https://api.slack.com/apps" -ForegroundColor Cyan
}
