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

const CONTAINER_NAME = '911-app'; 
const ALERT_CHANNEL = process.env.SLACK_ALERT_CHANNEL || 'general'; // Channel for alerts

let wasRunning = true; // Track previous state to avoid spam

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

// 1. MONITORING LOOP (The Watchdog)
setInterval(async () => {
  try {
    const container = docker.getContainer(CONTAINER_NAME);
    const data = await container.inspect();
    
    if (!data.State.Running) {
      throw new Error('Dead');
    }
    
    // Container is running - reset state
    wasRunning = true;
    
  } catch (error) {
    // Container is dead - send alert ONCE
    if (wasRunning) {
      wasRunning = false;
      try {
        await app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: ALERT_CHANNEL,
          text: `🚨 *ALERT: System Down!*\n\nContainer \`${CONTAINER_NAME}\` has crashed.\n\n⚠️ Services are offline. Type \`!fix\` to restart.`
        });
        console.log('⚠️ CRASH DETECTED - Alert sent to Slack!');
      } catch (slackError) {
        console.error('Failed to send Slack alert:', slackError);
      }
    }
  }
}, 2000);

// 2. CHATOPS COMMAND - Multiple ways to trigger the fix

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
  else if (messageText.includes('fix')) {
    console.log('🔧 Fix command detected! Initiating container restart...');
    await say(`🚑 *911-DevOps*: Emergency restart initiated by <@${message.user}>...`);
    
    try {
      const container = docker.getContainer(CONTAINER_NAME);
      await container.restart();
      await say('✅ *SUCCESS*: Container restarted. Services are back online.');
      console.log('✅ Container restarted successfully');
      wasRunning = true; // Reset monitoring state
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
  else if (eventText.includes('fix')) {
    console.log('🔧 Fix command detected via mention! Initiating container restart...');
    await say(`🚑 *911-DevOps*: Emergency restart initiated by <@${event.user}>...`);
    
    try {
      const container = docker.getContainer(CONTAINER_NAME);
      await container.restart();
      await say('✅ *SUCCESS*: Container restarted. Services are back online.');
      console.log('✅ Container restarted successfully');
      wasRunning = true; // Reset monitoring state
    } catch (error) {
      await say(`❌ *ERROR*: Could not restart. Try \`!autofix\` for CI/CD issues.\n\`\`\`${error.message}\`\`\``);
      console.error('❌ Restart failed:', error);
    }
  }
  else {
    await say(`👋 Hi <@${event.user}>! I'm the 911-DevOps bot.\n\n*Available commands:*\n• \`fix\` - Restart crashed container\n• \`!autofix\` - Auto-fix CI/CD errors and rebuild\n• \`!fix-ci\` - Same as autofix`);
  }
});

(async () => {
  await app.start();
  console.log('⚡️ 911-DevOps Bot is online and watching!');
  console.log('💡 Commands: fix (restart), !autofix (fix CI/CD errors)');
})();