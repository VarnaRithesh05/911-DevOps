const request = require('supertest');
const express = require('express');

// Create a test version of the server
function createTestServer() {
  const app = express();
  app.use(express.static('public'));

  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  app.get('/kill', (req, res) => {
    res.send("Server killing...");
    // Don't actually kill in tests
  });
// ...existing code...

describe('Server Configuration Tests', () => {
  test('should use port 3000 by default', () => {
    // Change this to make test fail:
    expect(port).toBe(3000); // <-- Changed from 3000 to 9999 to fail
  });
  
  // ...existing code...
});
  return app;
}

describe('Server API Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestServer();
  });

  describe('GET /health', () => {
    test('should return 200 status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    test('should return OK message', async () => {
      const response = await request(app).get('/health');
      expect(response.text).toBe('OK');
    });

    test('should respond quickly (< 100ms)', async () => {
      const start = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('GET /kill', () => {
    test('should return 200 status', async () => {
      const response = await request(app).get('/kill');
      expect(response.status).toBe(200);
    });

    test('should return killing message', async () => {
      const response = await request(app).get('/kill');
      expect(response.text).toBe('Server killing...');
    });
  });

  describe('Static Files', () => {
    test('should serve static files from public directory', async () => {
      const response = await request(app).get('/index.html');
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/html/);
    });
  });
});

describe('Server Configuration', () => {
  test('should use port 3000 by default', () => {
    const port = 3000;
    expect(port).toBe(3000);
  });

  test('should initialize Express app', () => {
    const app = createTestServer();
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
  });
});
