# Test Slack Webhook Script

# Replace this with your actual webhook URL
$webhookUrl = "https://hooks.slack.com/services/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"

# Test message
$body = @{
    text = "🧪 Test notification from 911-DevOps! Your webhook is working! ✅"
} | ConvertTo-Json

# Send test message
Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType 'application/json'

Write-Host "Test message sent! Check your Slack channel." -ForegroundColor Green
