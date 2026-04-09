const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/Users');

describe('Auth Routes', () => {

  beforeAll(async () => {
    await User.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /login should return status 200', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
  });

  it('POST /login with invalid credentials should fail or redirect', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'wrong', password: 'wrong' });
    expect(res.statusCode).toBeGreaterThanOrEqual(300); // e.g. 302 or 401
  });

  it('GET /register should return status 200', async () => {
    const res = await request(app).get('/register');
    expect(res.statusCode).toBe(200);
  });

  it('POST /register should register a user and redirect to /login', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        fname: 'Test',
        lname: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        idNum: '12101234'
      });

    expect(res.statusCode).toBe(302);
    expect(res.header['location']).toBe('/login');

    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).not.toBeNull();
    expect(await bcrypt.compare('password123', user.password)).toBe(true);
  });

  it('POST /register should fail if passwords do not match', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        fname: 'Mismatch',
        lname: 'Test',
        email: 'mismatch@example.com',
        password: 'pass1',
        confirmPassword: 'pass2',
        idNum: '12101234'
      });

    expect(res.text).toContain('Passwords do not match');
  });

  it('POST /register should fail for invalid ID format', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        fname: 'Invalid',
        lname: 'ID',
        email: 'badid@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        idNum: '99999999'
      });

    expect(res.text).toContain('Invalid ID Number format');
  });

  it('POST /register should fail for duplicate email', async () => {
    // create initial user
    await User.create({
      fName: 'Existing',
      lName: 'User',
      email: 'exists@example.com',
      password: await bcrypt.hash('password123', 10),
      idNum: '12101234',
      isTech: false
    });

    const res = await request(app)
      .post('/register')
      .send({
        fname: 'New',
        lname: 'User',
        email: 'exists@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        idNum: '12101234'
      });

    expect(res.text).toContain('An account with this email already exists');
  });
});
