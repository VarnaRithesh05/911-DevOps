# 🚑 911-DevOps - Emergency DevOps Monitoring & Recovery System

[![CI/CD Pipeline](https://github.com/VarnaRithesh05/911-DevOps/actions/workflows/main.yml/badge.svg)](https://github.com/VarnaRithesh05/911-DevOps/actions/workflows/main.yml)
[![Docker Hub](https://img.shields.io/badge/docker-hub-blue)](https://hub.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **Emergency DevOps system with automated crash detection, Slack bot recovery, and full CI/CD pipeline.**

![911-DevOps Dashboard](https://img.shields.io/badge/Status-Operational-success)

---

## 🎯 **Project Overview**

911-DevOps is a comprehensive DevOps monitoring system that:
- 🔍 **Monitors** containerized applications in real-time
- 🚨 **Alerts** your team via Slack when crashes occur
- 🤖 **Auto-recovers** with ChatOps commands (`!fix`)
- 📊 **Visualizes** system health with an interactive dashboard
- 🚀 **Deploys** automatically via CI/CD pipeline

---

## ✨ **Features**

### 1. **Real-time Monitoring Dashboard**
- Live system health status
- Response time tracking
- Uptime counter
- Activity logs
- Interactive crash simulation

### 2. **Slack Bot Integration**
- Automatic crash notifications
- ChatOps recovery with `!fix` command
- Real-time status updates

### 3. **CI/CD Pipeline**
- ✅ Automated linting
- ✅ Unit testing
- ✅ Security audits
- ✅ Docker build & push
- ✅ Slack notifications

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                  (Code Push Trigger)                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│               GitHub Actions CI/CD                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   CI Stage   │→ │   CD Stage   │→ │   Deploy     │  │
│  │ Lint/Test    │  │ Docker Build │  │  Notify      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Node.js App (server.js)                         │  │
│  │  - Web Dashboard (Port 3000)                     │  │
│  │  - Health Check Endpoint                         │  │
│  │  - Kill Switch (for testing)                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│               Slack Bot (bot.js)                         │
│  - Monitors container every 2 seconds                    │
│  - Sends crash alerts to Slack                           │
│  - Listens for !fix command                              │
│  - Auto-restarts crashed containers                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Docker & Docker Desktop
- Slack workspace
- GitHub account

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VarnaRithesh05/911-DevOps.git
   cd 911-DevOps
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Slack tokens
   ```

4. **Build and run Docker container:**
   ```bash
   docker build -t 911-app .
   docker run -d --name 911-app -p 3000:3000 911-app
   ```

5. **Start the Slack bot:**
   ```bash
   npm run bot
   ```

6. **Open the dashboard:**
   ```
   http://localhost:3000
   ```

---

## 📋 **Environment Variables**

Create a `.env` file with the following:

```env
# Slack Bot Tokens
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_ALERT_CHANNEL=your-channel-id
```

For detailed setup, see [CI-CD-SETUP.md](CI-CD-SETUP.md)

---

## 🔧 **Usage**

### **Dashboard Features:**
- **View Status:** See real-time system health
- **Simulate Crash:** Click "Simulate Crash" button to test
- **Monitor Logs:** View activity in the terminal

### **Slack Bot Commands:**
- `fix` - Restart the crashed container
- `!fix` - Alternative command syntax
- `@BotName fix` - Mention the bot to restart

### **CI/CD Pipeline:**
Automatically triggers on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

---

## 📊 **Pipeline Stages**

### **Stage 1: Continuous Integration (CI)**
```yaml
✓ Checkout Code
✓ Setup Node.js
✓ Install Dependencies
✓ Run Linting
✓ Run Tests
✓ Security Audit
✓ Notify on Failure
```

### **Stage 2: Continuous Delivery (CD)**
```yaml
✓ Build Docker Image
✓ Push to Docker Hub
✓ Tag with SHA & Latest
✓ Notify on Success/Failure
```

---

## 🧪 **Testing**

### **Test the Bot:**
1. Crash the container:
   ```bash
   curl http://localhost:3000/kill
   ```
2. Check Slack for alert notification
3. Type `fix` in Slack channel
4. Container should restart automatically

### **Test the Dashboard:**
1. Open http://localhost:3000
2. Click "Simulate Crash"
3. Watch status turn red
4. Use Slack `!fix` command
5. Status returns to green

---

## 📈 **Monitoring**

### **View Pipeline Status:**
- [GitHub Actions](https://github.com/VarnaRithesh05/911-DevOps/actions)
- Slack notifications in configured channel
- Dashboard status badge (above)

### **Check Container Status:**
```bash
docker ps -a | grep 911-app
docker logs 911-app
```

---

## 🛠️ **Technology Stack**

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js, Express |
| **Frontend** | HTML, CSS, JavaScript |
| **Containerization** | Docker |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Dockerode |
| **Notifications** | Slack Bolt API |
| **Bot Framework** | Slack Socket Mode |

---

## 📁 **Project Structure**

```
911-DevOps/
├── .github/
│   └── workflows/
│       └── main.yml          # CI/CD pipeline
├── public/
│   └── index.html            # Dashboard UI
├── bot.js                    # Slack bot & monitoring
├── server.js                 # Web server & API
├── Dockerfile                # Container configuration
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .gitignore                # Git exclusions
└── CI-CD-SETUP.md           # Setup guide
```

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 **License**

This project is licensed under the MIT License.

---

## 🙏 **Acknowledgments**

- Slack Bolt Framework
- Docker & Dockerode
- GitHub Actions
- Font Awesome Icons

---

## 📞 **Support**

- **Issues:** [GitHub Issues](https://github.com/VarnaRithesh05/911-DevOps/issues)
- **Documentation:** [Setup Guide](CI-CD-SETUP.md)
- **Repository:** [911-DevOps](https://github.com/VarnaRithesh05/911-DevOps)

---

<div align="center">
  <strong>Built with ❤️ for DevOps Engineers</strong>
  <br>
  <sub>Emergency recovery made simple</sub>
</div>

# Testing Slack Notifications - 2025-11-29 13:58:51
