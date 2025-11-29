# 🚀 Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl installed and configured
- Docker image pushed to registry: `varnarithesh05/911-devops:latest`

## 📦 What's Included

### Kubernetes Manifests
- **deployment.yaml** - Multi-container pod with server + alert-only bot
- **service.yaml** - LoadBalancer service
- **configmap.yaml** - Bot configuration
- **secrets-template.yaml** - Slack credentials template
- **hpa.yaml** - Horizontal Pod Autoscaler (2-5 replicas)
- **ingress.yaml** - Nginx ingress with SSL

## 🔧 Configuration

### Bot Modes

The bot supports two modes configured via environment variables:

#### 1. **Alert-Only Mode** (Kubernetes Default)
```yaml
env:
  - name: BOT_MODE
    value: "alert-only"
  - name: ENABLE_AUTO_RESTART
    value: "false"
  - name: ENABLE_FIX_COMMAND
    value: "false"
```

**Features:**
- ✅ Monitors container health every 5 seconds
- ✅ Sends Slack alerts when system goes down
- ✅ Sends recovery notifications when system comes back up
- ✅ Alert cooldown (60 seconds) to prevent spam
- ✅ Max consecutive alerts (3) before entering cooldown
- ❌ No automatic restarts
- ❌ No fix commands (!fix, !autofix disabled)
- ✅ Status commands (!status, !health) available

#### 2. **Full Mode** (Local Development)
```yaml
env:
  - name: BOT_MODE
    value: "full"
  - name: ENABLE_AUTO_RESTART
    value: "true"
  - name: ENABLE_FIX_COMMAND
    value: "true"
```

**Features:**
- ✅ All Alert-Only features
- ✅ Automatic container restarts via `!fix` command
- ✅ CI/CD auto-fix via `!autofix` command
- ✅ ChatOps recovery commands

### Advanced Settings

**Monitoring Configuration:**
```yaml
- name: MONITORING_INTERVAL
  value: "5000"  # Check every 5 seconds
- name: ALERT_COOLDOWN
  value: "60000"  # 60 second cooldown between alerts
- name: MAX_CONSECUTIVE_ALERTS
  value: "3"  # Max alerts before cooldown
```

**Container Configuration:**
```yaml
- name: CONTAINER_NAME
  valueFrom:
    configMapKeyRef:
      name: bot-config
      key: container-name
- name: ALERT_CHANNEL
  valueFrom:
    configMapKeyRef:
      name: bot-config
      key: alert-channel
```

## 🚀 Deployment Steps

### Step 1: Create Kubernetes Secrets

**IMPORTANT:** Never commit actual secrets to git!

```bash
# Create Slack secrets
kubectl create secret generic slack-secrets \
  --from-literal=bot-token=xoxb-YOUR-SLACK-BOT-TOKEN \
  --from-literal=app-token=xapp-YOUR-SLACK-APP-TOKEN

# Verify secrets
kubectl get secrets
```

### Step 2: Deploy ConfigMaps

```bash
# Apply configuration
kubectl apply -f k8s/configmap.yaml

# Verify
kubectl get configmap
kubectl describe configmap bot-config
```

### Step 3: Deploy Application

```bash
# Deploy the application
kubectl apply -f k8s/deployment.yaml

# Verify deployment
kubectl get deployments
kubectl get pods
kubectl describe deployment devops-911-app
```

### Step 4: Create Service

```bash
# Create LoadBalancer service
kubectl apply -f k8s/service.yaml

# Get external IP (may take a few minutes)
kubectl get service devops-911-service
```

### Step 5: (Optional) Enable Autoscaling

```bash
# Apply HPA
kubectl apply -f k8s/hpa.yaml

# Check HPA status
kubectl get hpa
kubectl describe hpa devops-911-hpa
```

### Step 6: (Optional) Setup Ingress

```bash
# Install nginx ingress controller (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Apply ingress
kubectl apply -f k8s/ingress.yaml

# Verify ingress
kubectl get ingress
```

## 📊 Monitoring & Debugging

### Check Pod Logs

```bash
# Get pod names
kubectl get pods

# View server logs
kubectl logs <pod-name> -c devops-911-server

# View bot logs (alert-only mode)
kubectl logs <pod-name> -c devops-911-bot -f

# Stream both containers
kubectl logs <pod-name> --all-containers -f
```

### Check Pod Status

```bash
# Describe pod
kubectl describe pod <pod-name>

# Get pod events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check resource usage
kubectl top pods
kubectl top nodes
```

### Test Health Endpoint

```bash
# Port forward to test locally
kubectl port-forward deployment/devops-911-app 3000:3000

# Test health (in another terminal)
curl http://localhost:3000/health
```

### Bot Status Check

Send a Slack message to check bot status:
```
@911-DevOps !status
```

Expected response:
```
📊 System Status Report

Container: `devops-911-app`
Status: ✅ Running
Mode: `alert-only`
Uptime: ...
Health Failures: 0
Consecutive Alerts: 0/3

Configuration:
• Auto-Restart: ❌
• Fix Commands: ❌
• Monitoring Interval: 5000ms
• Alert Cooldown: 60000ms
```

## 🔄 Updates & Rollbacks

### Update Deployment

```bash
# Update image
kubectl set image deployment/devops-911-app \
  devops-911-server=varnarithesh05/911-devops:v2 \
  devops-911-bot=varnarithesh05/911-devops:v2

# Check rollout status
kubectl rollout status deployment/devops-911-app

# View rollout history
kubectl rollout history deployment/devops-911-app
```

### Rollback Deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/devops-911-app

# Rollback to specific revision
kubectl rollout undo deployment/devops-911-app --to-revision=2
```

## 🧪 Testing Alert System

### Test 1: Simulate Crash

```bash
# Kill a pod to test alerts
kubectl delete pod <pod-name>

# Bot should send Slack alert:
# "🚨 ALERT: System Down!
# Container: `devops-911-app`
# Status: Crashed/Stopped
# ⚠️ Alert-Only Mode: Automatic restart is disabled."
```

### Test 2: Recovery Alert

```bash
# Pod will auto-restart via Kubernetes
# Bot should send recovery notification:
# "✅ RECOVERY: System Back Online!
# Container: `devops-911-app` has been restored.
# 🎉 All services are operational."
```

### Test 3: Alert Cooldown

```bash
# Delete pod multiple times rapidly
kubectl delete pod <pod-name>
# Wait for restart
kubectl delete pod <pod-name>

# Bot will suppress alerts during cooldown period (60s)
```

## 🔒 Security Best Practices

1. **Never commit secrets** to version control
2. **Use Kubernetes secrets** for sensitive data
3. **Enable RBAC** for pod permissions
4. **Use network policies** to restrict traffic
5. **Set resource limits** to prevent resource exhaustion
6. **Use read-only file systems** where possible
7. **Scan images** for vulnerabilities regularly

## 📈 Scaling

### Manual Scaling

```bash
# Scale to 3 replicas
kubectl scale deployment devops-911-app --replicas=3

# Verify
kubectl get pods
```

### Autoscaling (HPA)

The HPA will automatically scale between 2-5 replicas based on:
- CPU utilization > 70%
- Memory utilization > 80%

```bash
# Monitor HPA
kubectl get hpa -w
```

## 🧹 Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/configmap.yaml
kubectl delete -f k8s/hpa.yaml
kubectl delete -f k8s/ingress.yaml

# Delete secrets
kubectl delete secret slack-secrets

# Or delete everything at once
kubectl delete all --all
```

## 🎯 Production Checklist

- [ ] Secrets created via kubectl (not committed)
- [ ] ConfigMap updated with correct channel ID
- [ ] Image pushed to registry
- [ ] Resource limits configured
- [ ] Health probes working
- [ ] HPA configured and tested
- [ ] Monitoring/logging setup
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented
- [ ] Alert-only mode tested in Slack

## 📞 Troubleshooting

### Bot Not Starting

```bash
# Check logs
kubectl logs <pod-name> -c devops-911-bot

# Common issues:
# - Missing secrets: kubectl get secrets
# - Wrong tokens: kubectl describe secret slack-secrets
# - Network issues: kubectl describe pod <pod-name>
```

### No Slack Alerts

```bash
# Verify bot is running
kubectl logs <pod-name> -c devops-911-bot

# Check configuration
kubectl describe configmap bot-config

# Test manually
kubectl exec -it <pod-name> -c devops-911-bot -- node -e "console.log(process.env)"
```

### Service Not Accessible

```bash
# Check service
kubectl get svc devops-911-service

# Check endpoints
kubectl get endpoints devops-911-service

# Port forward for testing
kubectl port-forward svc/devops-911-service 8080:80
```

## 🌟 Architecture

```
┌─────────────────────────────────────────┐
│         Kubernetes Cluster              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     Pod (devops-911-app)          │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  Container: Server          │ │ │
│  │  │  - Express App              │ │ │
│  │  │  - Port 3000                │ │ │
│  │  │  - Health Checks            │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │  Container: Bot (Alert-Only)│ │ │
│  │  │  - Monitors Server          │ │ │
│  │  │  - Sends Slack Alerts       │ │ │
│  │  │  - No Auto-Restart          │ │ │
│  │  │  - Status Commands          │ │ │
│  │  └─────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     LoadBalancer Service          │ │
│  │     External IP: xxx.xxx.xxx.xxx  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     HPA (2-5 replicas)            │ │
│  │     CPU/Memory based scaling      │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
              │
              │ Slack Webhooks
              ▼
      ┌───────────────┐
      │  Slack Channel│
      │  Alerts Only  │
      └───────────────┘
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Slack Bolt Documentation](https://slack.dev/bolt-js/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
