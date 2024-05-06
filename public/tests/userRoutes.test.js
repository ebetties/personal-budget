// tests/server.test.js

const request = require('supertest');
const app = require('../../server'); // Import your Express app



  
  describe('Server Routes', () => {
    it('should return 401 for GET /dashboard when no token is provided', async () => {
      const response = await request(app).get('/dashboard');
      expect(response.status).toBe(401);
    });
  });
  
  
  describe('Middleware', () => {
    it('should return 401 for GET /budget when no token is provided', async () => {
      const response = await request(app).get('/budget');
      expect(response.status).toBe(401);
    });
  });
  
  
  
