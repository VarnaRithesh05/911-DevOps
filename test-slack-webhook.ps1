# Test Slack Webhook Script

# Replace this with your actual webhook URL from Slack
# Get it from: https://api.slack.com/apps → Your App → Incoming Webhooks
$webhookUrl = "YOUR_SLACK_WEBHOOK_URL_HERE"

# Test message
$body = @{
    text = "🧪 Test notification from 911-DevOps! Your webhook is working! ✅"
} | ConvertTo-Json

# Send test message
Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType 'application/json'

Write-Host "Test message sent! Check your Slack channel." -ForegroundColor Green
