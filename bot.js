require('dotenv').config();
const { App } = require('@slack/bolt');
const Docker = require('dockerode');
const { exec } = require('child_process');
const { promisify } = require('util');
const docker = new Docker();
const execAsync = promisify(exec);

// Initialize App with Socket Mode
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Advanced Configuration
const BOT_CONFIG = {
  containerName: process.env.CONTAINER_NAME || '911-app',
  alertChannel: process.env.ALERT_CHANNEL || 'general',
  botMode: process.env.BOT_MODE || 'full', // 'alert-only' or 'full'
  enableAutoRestart: process.env.ENABLE_AUTO_RESTART !== 'false',
  enableFixCommand: process.env.ENABLE_FIX_COMMAND !== 'false',
  monitoringInterval: parseInt(process.env.MONITORING_INTERVAL || '2000'),
  alertCooldown: parseInt(process.env.ALERT_COOLDOWN || '60000'), // 1 minute cooldown
  maxConsecutiveAlerts: parseInt(process.env.MAX_CONSECUTIVE_ALERTS || '3'),
};

// Advanced State Management
let botState = {
  wasRunning: true,
  lastAlertTime: 0,
  consecutiveAlerts: 0,
  healthCheckFailures: 0,
  isInCooldown: false,
};

// Auto-fix function
async function runAutoFix() {
  console.log('🔧 Running auto-fix script...');
  try {
    const { stdout, stderr } = await execAsync('powershell -ExecutionPolicy Bypass -File ./auto-fix.ps1');
    console.log('Auto-fix output:', stdout);
    return { success: true, output: stdout };
  } catch (error) {
    console.error('Auto-fix error:', error);
    return { success: false, error: error.message };
  }
}

// Advanced Alert System with Cooldown
async function sendAlert(message, severity = 'warning') {
  const now = Date.now();
  
  // Check cooldown period
  if (botState.isInCooldown && (now - botState.lastAlertTime) < BOT_CONFIG.alertCooldown) {
    console.log('⏸️ Alert suppressed - in cooldown period');
    return;
  }
  
  // Check max consecutive alerts
  if (botState.consecutiveAlerts >= BOT_CONFIG.maxConsecutiveAlerts) {
    console.log('⏸️ Alert suppressed - max consecutive alerts reached');
    botState.isInCooldown = true;
    return;
  }
  
  const icons = { critical: '🚨', warning: '⚠️', info: 'ℹ️' };
  const icon = icons[severity] || '📢';
  
  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: BOT_CONFIG.alertChannel,
      text: `${icon} ${message}`,
      mrkdwn: true,
    });
    
    botState.lastAlertTime = now;
    botState.consecutiveAlerts++;
    console.log(`✉️ Alert sent (${botState.consecutiveAlerts}/${BOT_CONFIG.maxConsecutiveAlerts})`);
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

// 1. MONITORING LOOP (The Watchdog) - Alert Only Mode
setInterval(async () => {
  try {
    const container = docker.getContainer(BOT_CONFIG.containerName);
    const data = await container.inspect();
    
    if (!data.State.Running) {
      throw new Error('Container is not running');
    }
    
    // Container is healthy - reset state
    if (!botState.wasRunning) {
      await sendAlert(
        `✅ *RECOVERY: System Back Online!*\n\nContainer \`${BOT_CONFIG.containerName}\` has been restored.\n\n🎉 All services are operational.`,
        'info'
      );
    }
    
    botState.wasRunning = true;
    botState.healthCheckFailures = 0;
    botState.consecutiveAlerts = 0;
    botState.isInCooldown = false;
    
  } catch (error) {
    botState.healthCheckFailures++;
    
    // Only alert if state changed (not already alerted)
    if (botState.wasRunning) {
      botState.wasRunning = false;
      
      // In alert-only mode, just send notification
      if (BOT_CONFIG.botMode === 'alert-only') {
        await sendAlert(
          `🚨 *ALERT: System Down!*\n\n` +
          `Container: \`${BOT_CONFIG.containerName}\`\n` +
          `Status: Crashed/Stopped\n` +
          `Failures: ${botState.healthCheckFailures}\n\n` +
          `⚠️ *Alert-Only Mode*: Automatic restart is disabled.\n` +
          `Please manually investigate and restart the container.`,
          'critical'
        );
        console.log('⚠️ CRASH DETECTED - Alert sent (Alert-Only Mode)');
      } 
      // In full mode, offer restart option
      else {
        await sendAlert(
          `🚨 *ALERT: System Down!*\n\n` +
          `Container: \`${BOT_CONFIG.containerName}\`\n` +
          `Status: Crashed/Stopped\n` +
          `Failures: ${botState.healthCheckFailures}\n\n` +
          `${BOT_CONFIG.enableFixCommand ? '💡 Type `!fix` to restart or `!autofix` to rebuild.' : '⚠️ Manual intervention required.'}`,
          'critical'
        );
        console.log('⚠️ CRASH DETECTED - Alert sent');
      }
    }
  }
}, BOT_CONFIG.monitoringInterval);

// 2. CHATOPS COMMANDS (Only active if not in alert-only mode)

// Status command (always available)
app.message(/!status|!health/i, async ({ message, say }) => {
  console.log('📊 Status check requested');
  
  try {
    const container = docker.getContainer(BOT_CONFIG.containerName);
    const data = await container.inspect();
    
    const uptime = new Date(data.State.StartedAt);
    const status = data.State.Running ? '✅ Running' : '❌ Stopped';
    
    await say(
      `📊 *System Status Report*\n\n` +
      `Container: \`${BOT_CONFIG.containerName}\`\n` +
      `Status: ${status}\n` +
      `Mode: \`${BOT_CONFIG.botMode}\`\n` +
      `Uptime: ${uptime.toLocaleString()}\n` +
      `Health Failures: ${botState.healthCheckFailures}\n` +
      `Consecutive Alerts: ${botState.consecutiveAlerts}/${BOT_CONFIG.maxConsecutiveAlerts}\n` +
      `\n*Configuration:*\n` +
      `• Auto-Restart: ${BOT_CONFIG.enableAutoRestart ? '✅' : '❌'}\n` +
      `• Fix Commands: ${BOT_CONFIG.enableFixCommand ? '✅' : '❌'}\n` +
      `• Monitoring Interval: ${BOT_CONFIG.monitoringInterval}ms\n` +
      `• Alert Cooldown: ${BOT_CONFIG.alertCooldown}ms`
    );
  } catch (error) {
    await say(`❌ *Error*: Could not retrieve status.\n\`\`\`${error.message}\`\`\``);
  }
});

// Only enable fix commands if not in alert-only mode
if (BOT_CONFIG.botMode !== 'alert-only' && BOT_CONFIG.enableFixCommand) {
  
  // Listen to ALL messages (for debugging)
  app.message(async ({ message, say }) => {
    console.log('📩 Message received:', message.text);
    
    const messageText = message.text.toLowerCase();
    
    // Check for !autofix or !fix-ci command
    if (messageText.includes('!autofix') || messageText.includes('!fix-ci')) {
      console.log('🤖 Auto-fix command detected! Running automated fixes...');
      await say(`🤖 *Auto-Fix System*: Analyzing and fixing CI/CD issues initiated by <@${message.user}>...`);
      
      const result = await runAutoFix();
      
      if (result.success) {
        await say('✅ *AUTO-FIX COMPLETE*: Code fixed and pushed! CI/CD pipeline will run automatically.\n\n📊 Check status: https://github.com/VarnaRithesh05/911-DevOps/actions');
      } else {
        await say(`⚠️ *AUTO-FIX PARTIAL*: Some issues may require manual intervention.\n\n\`\`\`${result.error}\`\`\``);
      }
    }
    // Check if message contains "!fix" or "fix" for container restart
    else if (messageText.includes('fix') && !messageText.includes('status')) {
      console.log('🔧 Fix command detected! Initiating container restart...');
      await say(`🚑 *911-DevOps*: Emergency restart initiated by <@${message.user}>...`);
      
      try {
        const container = docker.getContainer(BOT_CONFIG.containerName);
        await container.restart();
        await say('✅ *SUCCESS*: Container restarted. Services are back online.');
        console.log('✅ Container restarted successfully');
        botState.wasRunning = true; // Reset monitoring state
        botState.consecutiveAlerts = 0;
      } catch (error) {
        await say(`❌ *ERROR*: Could not restart. Try \`!autofix\` for CI/CD issues.\n\`\`\`${error.message}\`\`\``);
        console.error('❌ Restart failed:', error);
      }
    }
  });

  // Listen to app mentions (when someone @mentions the bot)
  app.event('app_mention', async ({ event, say }) => {
    console.log('📩 Bot mentioned:', event.text);
    
    const eventText = event.text.toLowerCase();
    
    if (eventText.includes('autofix') || eventText.includes('fix-ci')) {
      console.log('🤖 Auto-fix command detected via mention!');
      await say(`🤖 *Auto-Fix System*: Analyzing and fixing CI/CD issues initiated by <@${event.user}>...`);
      
      const result = await runAutoFix();
      
      if (result.success) {
        await say('✅ *AUTO-FIX COMPLETE*: Code fixed and pushed! CI/CD pipeline will run automatically.\n\n📊 Check status: https://github.com/VarnaRithesh05/911-DevOps/actions');
      } else {
        await say(`⚠️ *AUTO-FIX PARTIAL*: Some issues may require manual intervention.\n\n\`\`\`${result.error}\`\`\``);
      }
    }
    else if (eventText.includes('fix') && !eventText.includes('status')) {
      console.log('🔧 Fix command detected via mention! Initiating container restart...');
      await say(`🚑 *911-DevOps*: Emergency restart initiated by <@${event.user}>...`);
      
      try {
        const container = docker.getContainer(BOT_CONFIG.containerName);
        await container.restart();
        await say('✅ *SUCCESS*: Container restarted. Services are back online.');
        console.log('✅ Container restarted successfully');
        botState.wasRunning = true; // Reset monitoring state
        botState.consecutiveAlerts = 0;
      } catch (error) {
        await say(`❌ *ERROR*: Could not restart. Try \`!autofix\` for CI/CD issues.\n\`\`\`${error.message}\`\`\``);
        console.error('❌ Restart failed:', error);
      }
    }
    else {
      const mode = BOT_CONFIG.botMode === 'alert-only' ? ' (Alert-Only Mode)' : '';
      const commands = BOT_CONFIG.botMode === 'alert-only' 
        ? `*Available commands:*\n• \`!status\` - Check system status\n• \`!health\` - Health check`
        : `*Available commands:*\n• \`!status\` - Check system status\n• \`fix\` - Restart crashed container\n• \`!autofix\` - Auto-fix CI/CD errors and rebuild\n• \`!fix-ci\` - Same as autofix`;
      
      await say(`👋 Hi <@${event.user}>! I'm the 911-DevOps bot${mode}.\n\n${commands}`);
    }
  });
} else {
  console.log('⚠️ Alert-Only Mode: Fix commands disabled');
  
  // In alert-only mode, still respond to mentions with info
  app.event('app_mention', async ({ event, say }) => {
    await say(
      `👋 Hi <@${event.user}>! I'm the 911-DevOps bot in *Alert-Only Mode*.\n\n` +
      `I'm monitoring \`${BOT_CONFIG.containerName}\` and will send alerts when issues are detected.\n\n` +
      `*Available commands:*\n• \`!status\` - Check system status\n• \`!health\` - Health check\n\n` +
      `⚠️ Automatic restart and fix commands are disabled in this mode.`
    );
  });
}

(async () => {
  await app.start();
  console.log('⚡️ 911-DevOps Bot is online and watching!');
  console.log(`📊 Configuration:`);
  console.log(`   Mode: ${BOT_CONFIG.botMode}`);
  console.log(`   Container: ${BOT_CONFIG.containerName}`);
  console.log(`   Alert Channel: ${BOT_CONFIG.alertChannel}`);
  console.log(`   Monitoring Interval: ${BOT_CONFIG.monitoringInterval}ms`);
  console.log(`   Auto-Restart: ${BOT_CONFIG.enableAutoRestart ? 'Enabled' : 'Disabled'}`);
  console.log(`   Fix Commands: ${BOT_CONFIG.enableFixCommand ? 'Enabled' : 'Disabled'}`);
  
  if (BOT_CONFIG.botMode === 'alert-only') {
    console.log('⚠️ ALERT-ONLY MODE: Bot will send notifications but not perform actions');
    console.log('💡 Commands: !status, !health');
  } else {
    console.log('💡 Commands: fix (restart), !autofix (fix CI/CD errors), !status');
  }
})();