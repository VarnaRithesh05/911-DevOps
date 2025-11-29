require('dotenv').config();
const { App } = require('@slack/bolt');
const Docker = require('dockerode');
const docker = new Docker();

// Initialize App with Socket Mode
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

const CONTAINER_NAME = '911-app'; 
const ALERT_CHANNEL = process.env.SLACK_ALERT_CHANNEL || 'general'; // Channel for alerts

let wasRunning = true; // Track previous state to avoid spam

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
  
  // Check if message contains "!fix" or "fix"
  if (message.text && message.text.toLowerCase().includes('fix')) {
    console.log('🔧 Fix command detected! Initiating restart...');
    await say(`🚑 *911-DevOps*: Emergency restart initiated by <@${message.user}>...`);
    
    try {
      const container = docker.getContainer(CONTAINER_NAME);
      await container.restart();
      await say('✅ *SUCCESS*: System restored. Services are back online.');
      console.log('✅ Container restarted successfully');
      wasRunning = true; // Reset monitoring state
    } catch (error) {
      await say(`❌ *ERROR*: Could not restart. Manual intervention required.\n\`\`\`${error.message}\`\`\``);
      console.error('❌ Restart failed:', error);
    }
  }
});

// Listen to app mentions (when someone @mentions the bot)
app.event('app_mention', async ({ event, say }) => {
  console.log('📩 Bot mentioned:', event.text);
  
  if (event.text.toLowerCase().includes('fix')) {
    console.log('🔧 Fix command detected via mention! Initiating restart...');
    await say(`🚑 *911-DevOps*: Emergency restart initiated by <@${event.user}>...`);
    
    try {
      const container = docker.getContainer(CONTAINER_NAME);
      await container.restart();
      await say('✅ *SUCCESS*: System restored. Services are back online.');
      console.log('✅ Container restarted successfully');
      wasRunning = true; // Reset monitoring state
    } catch (error) {
      await say(`❌ *ERROR*: Could not restart. Manual intervention required.\n\`\`\`${error.message}\`\`\``);
      console.error('❌ Restart failed:', error);
    }
  }
});

(async () => {
  await app.start();
  console.log('⚡️ 911-DevOps Bot is online and watching!');
})();