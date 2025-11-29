# CI/CD Pipeline Setup Guide

## 🚀 Overview
This project uses GitHub Actions for automated CI/CD pipeline with the following stages:

### CI (Continuous Integration)
1. **Linting** - Code quality checks
2. **Testing** - Unit tests
3. **Security Audit** - Vulnerability scanning

### CD (Continuous Delivery)
4. **Build** - Docker image creation
5. **Push** - Publish to Docker Hub
6. **Notify** - Slack notifications

---

## ⚙️ Required GitHub Secrets

To enable the CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

### Setup Instructions:
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the following secrets:

### Required Secrets:

| Secret Name | Description | How to Get It |
|------------|-------------|---------------|
| `DOCKER_USERNAME` | Your Docker Hub username | Sign up at hub.docker.com |
| `DOCKER_PASSWORD` | Your Docker Hub password or access token | Docker Hub → Account Settings → Security → New Access Token |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL for notifications | Slack → Apps → Incoming Webhooks → Add to Workspace |

---

## 🔧 How to Get Each Secret

### 1. Docker Hub Credentials

**Get DOCKER_USERNAME:**
```
Your Docker Hub username (e.g., "johndoe")
```

**Get DOCKER_PASSWORD:**
1. Go to https://hub.docker.com/
2. Sign in
3. Click your avatar → **Account Settings**
4. Click **Security** → **New Access Token**
5. Name it "GitHub Actions"
6. Copy the token (this is your `DOCKER_PASSWORD`)

### 2. Slack Webhook URL

**Get SLACK_WEBHOOK_URL:**
1. Go to https://api.slack.com/apps
2. Click **Create New App** → **From scratch**
3. Name it "911-DevOps Pipeline"
4. Select your workspace
5. Click **Incoming Webhooks** → Toggle **Activate Incoming Webhooks** to ON
6. Click **Add New Webhook to Workspace**
7. Select the channel for notifications
8. Copy the Webhook URL (starts with `https://hooks.slack.com/services/...`)

---

## 📋 Pipeline Workflow

### Trigger Events:
- **Push to `main` branch** → Full CI/CD pipeline
- **Push to `develop` branch** → CI only (no deployment)
- **Pull Request to `main`** → CI checks only
- **Manual trigger** → Via GitHub Actions UI

### Pipeline Flow:

```
┌─────────────────────────────────────────────────────────┐
│  TRIGGER: Push to main/develop or Pull Request         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  JOB 1: Continuous Integration (CI)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Checkout Code                                 │  │
│  │ 2. Setup Node.js 18                              │  │
│  │ 3. Install Dependencies (npm ci)                 │  │
│  │ 4. Run Linting (ESLint)                         │  │
│  │ 5. Run Unit Tests (Jest)                        │  │
│  │ 6. Security Audit (npm audit)                   │  │
│  │ 7. Notify Slack on Failure                      │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ ✅ CI Passed
                     ▼
┌─────────────────────────────────────────────────────────┐
│  JOB 2: Continuous Delivery (CD) - Only on main        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Checkout Code                                 │  │
│  │ 2. Setup Docker Buildx                           │  │
│  │ 3. Login to Docker Hub                           │  │
│  │ 4. Extract Metadata (tags, labels)              │  │
│  │ 5. Build Docker Image                            │  │
│  │ 6. Push to Docker Hub                            │  │
│  │ 7. Notify Slack (Success/Failure)               │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
              ✅ Deployment Ready
```

---

## 🧪 Testing the Pipeline

### 1. Test CI Only:
```bash
# Create a new branch
git checkout -b test-ci

# Make a change
echo "# Test" >> README.md
git add .
git commit -m "test: CI pipeline"
git push origin test-ci

# Create a pull request → CI will run
```

### 2. Test Full CI/CD:
```bash
# Merge to main
git checkout main
git merge test-ci
git push origin main

# Full pipeline will run: CI → CD → Deploy
```

---

## 📊 Pipeline Status

Check pipeline status:
- GitHub Actions tab in your repository
- Slack notifications in your configured channel

### Expected Notifications:

**On Success:**
```
✅ DEPLOYMENT SUCCESS
Pipeline: CI/CD Completed
Branch: main
Image: username/911-devops:latest
Commit: abc123
Author: YourName
🚀 Ready for deployment!
```

**On Failure:**
```
🚨 CI FAILED: Lint/Test/Security checks failed on branch main
Commit: abc123
Author: YourName
```

---

## 🐛 Troubleshooting

### Pipeline fails with "Invalid credentials"
- Check that `DOCKER_USERNAME` and `DOCKER_PASSWORD` are set correctly
- Verify Docker Hub access token is valid

### No Slack notifications
- Verify `SLACK_WEBHOOK_URL` is correct
- Check webhook is active in Slack settings

### Build fails
- Check Dockerfile syntax
- Verify all dependencies in package.json

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

---

## ✅ Checklist

Before pushing:
- [ ] All GitHub Secrets configured
- [ ] Docker Hub account created
- [ ] Slack webhook configured
- [ ] Code passes local tests
- [ ] README updated

---

**Need help?** Check the GitHub Actions logs for detailed error messages.
