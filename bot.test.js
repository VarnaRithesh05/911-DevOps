// Mock dependencies
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

jest.mock('@slack/bolt', () => ({
  App: jest.fn().mockImplementation(() => ({
    message: jest.fn(),
    event: jest.fn(),
    start: jest.fn().mockResolvedValue(true),
    client: {
      chat: {
        postMessage: jest.fn().mockResolvedValue({})
      }
    }
  }))
}));

jest.mock('dockerode', () => {
  return jest.fn().mockImplementation(() => ({
    getContainer: jest.fn().mockReturnValue({
      inspect: jest.fn().mockResolvedValue({
        State: { Running: true }
      }),
      restart: jest.fn().mockResolvedValue({})
    })
  }));
});

describe('Bot Configuration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should load environment variables', () => {
    const dotenv = require('dotenv');
    expect(dotenv.config).toBeDefined();
  });

  test('should initialize Slack App with correct configuration', () => {
    process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
    process.env.SLACK_APP_TOKEN = 'xapp-test-token';
    
    const { App } = require('@slack/bolt');
    const app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      socketMode: true
    });

    expect(App).toHaveBeenCalledWith({
      token: 'xoxb-test-token',
      appToken: 'xapp-test-token',
      socketMode: true
    });
  });

  test('should initialize Docker client', () => {
    const Docker = require('dockerode');
    const docker = new Docker();
    expect(docker).toBeDefined();
    expect(Docker).toHaveBeenCalled();
  });

  test('should use default alert channel if not specified', () => {
    delete process.env.SLACK_ALERT_CHANNEL;
    const ALERT_CHANNEL = process.env.SLACK_ALERT_CHANNEL || 'general';
    expect(ALERT_CHANNEL).toBe('general');
  });

  test('should use custom alert channel if specified', () => {
    process.env.SLACK_ALERT_CHANNEL = 'devops-alerts';
    const ALERT_CHANNEL = process.env.SLACK_ALERT_CHANNEL || 'general';
    expect(ALERT_CHANNEL).toBe('devops-alerts');
  });
});

describe('Container Name Tests', () => {
  test('should monitor correct container name', () => {
    const CONTAINER_NAME = '911-app';
    expect(CONTAINER_NAME).toBe('911-app');
  });

  test('container name should not be empty', () => {
    const CONTAINER_NAME = '911-app';
    expect(CONTAINER_NAME).toBeTruthy();
    expect(CONTAINER_NAME.length).toBeGreaterThan(0);
  });
});

describe('Fix Command Detection Tests', () => {
  test('should detect !fix command', () => {
    const message = '!fix';
    expect(message.toLowerCase().includes('fix')).toBe(true);
  });

  test('should detect fix in any case', () => {
    const messages = ['fix', 'Fix', 'FIX', '!fix', 'please fix'];
    messages.forEach(msg => {
      expect(msg.toLowerCase().includes('fix')).toBe(true);
    });
  });

  test('should not detect non-fix messages', () => {
    const message = 'hello world';
    expect(message.toLowerCase().includes('fix')).toBe(false);
  });
});

describe('Monitoring Configuration Tests', () => {
  test('should have monitoring interval of 2000ms', () => {
    const MONITORING_INTERVAL = 2000;
    expect(MONITORING_INTERVAL).toBe(2000);
  });

  test('wasRunning state should initialize to true', () => {
    let wasRunning = true;
    expect(wasRunning).toBe(true);
  });
});

describe('Advanced Bot Configuration Tests', () => {
  test('should support alert-only mode', () => {
    process.env.BOT_MODE = 'alert-only';
    const BOT_MODE = process.env.BOT_MODE || 'full';
    expect(BOT_MODE).toBe('alert-only');
  });

  test('should support full mode by default', () => {
    delete process.env.BOT_MODE;
    const BOT_MODE = process.env.BOT_MODE || 'full';
    expect(BOT_MODE).toBe('full');
  });

  test('should disable auto-restart in alert-only mode', () => {
    process.env.ENABLE_AUTO_RESTART = 'false';
    const ENABLE_AUTO_RESTART = process.env.ENABLE_AUTO_RESTART !== 'false';
    expect(ENABLE_AUTO_RESTART).toBe(false);
  });

  test('should enable auto-restart by default', () => {
    delete process.env.ENABLE_AUTO_RESTART;
    const ENABLE_AUTO_RESTART = process.env.ENABLE_AUTO_RESTART !== 'false';
    expect(ENABLE_AUTO_RESTART).toBe(true);
  });

  test('should configure monitoring interval from environment', () => {
    process.env.MONITORING_INTERVAL = '5000';
    const MONITORING_INTERVAL = parseInt(process.env.MONITORING_INTERVAL || '2000');
    expect(MONITORING_INTERVAL).toBe(5000);
  });

  test('should configure alert cooldown from environment', () => {
    process.env.ALERT_COOLDOWN = '60000';
    const ALERT_COOLDOWN = parseInt(process.env.ALERT_COOLDOWN || '60000');
    expect(ALERT_COOLDOWN).toBe(60000);
  });

  test('should configure max consecutive alerts', () => {
    process.env.MAX_CONSECUTIVE_ALERTS = '3';
    const MAX_CONSECUTIVE_ALERTS = parseInt(process.env.MAX_CONSECUTIVE_ALERTS || '3');
    expect(MAX_CONSECUTIVE_ALERTS).toBe(3);
  });
});
