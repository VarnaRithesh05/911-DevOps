# Kubernetes Deployment - Quick Start

## 1. Create Secrets (Required First!)

```powershell
# Set your Slack tokens
$SLACK_BOT_TOKEN = "xoxb-YOUR-BOT-TOKEN"
$SLACK_APP_TOKEN = "xapp-YOUR-APP-TOKEN"

# Create secrets in Kubernetes
kubectl create secret generic slack-secrets `
  --from-literal=bot-token=$SLACK_BOT_TOKEN `
  --from-literal=app-token=$SLACK_APP_TOKEN

Write-Host "✅ Secrets created successfully!" -ForegroundColor Green
```

## 2. Deploy to Kubernetes

```powershell
# Apply all configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

Write-Host "🚀 Deployment started!" -ForegroundColor Green
```

## 3. Check Status

```powershell
# Watch deployment
kubectl get pods -w

# Check logs
$POD_NAME = kubectl get pods -l app=devops-911 -o jsonpath="{.items[0].metadata.name}"
kubectl logs $POD_NAME -c devops-911-bot -f
```

## 4. Test in Slack

Send message in Slack:
```
@911-DevOps !status
```

## 5. Test Alert System

```powershell
# Simulate crash
kubectl delete pod -l app=devops-911

# Watch for Slack alert (should appear within 5 seconds)
# Watch for recovery notification (after pod restarts)
```

## Configuration Files

- **Bot Mode:** Alert-Only (configured in deployment.yaml)
- **Monitoring Interval:** 5 seconds
- **Alert Cooldown:** 60 seconds
- **Max Alerts:** 3 before cooldown
- **Auto-Restart:** Disabled (Kubernetes handles it)
- **Fix Commands:** Disabled (alert-only mode)

## Available Bot Commands

- `!status` - Check system status
- `!health` - Health check
- `@911-DevOps` - Bot help

## Cleanup

```powershell
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/configmap.yaml
kubectl delete -f k8s/hpa.yaml
kubectl delete secret slack-secrets
```
