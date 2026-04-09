const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/Users');
const bcrypt = require('bcrypt');

let cookie;

beforeAll(async () => {
  // No mongoose.connect() here – use existing connection

  // Clear and recreate test user
  await User.deleteMany({ email: 'student@example.com' });

  const hashedPassword = await bcrypt.hash('correctpassword', 10);
  await User.create({
    fName: 'Test',
    lName: 'User',
    email: 'student@example.com',
    password: hashedPassword,
    idNum: '12100001',
    isTech: false,
    profPic: '',
    profDesc: ''
  });

  const res = await request(app)
    .post('/login')
    .send({
      email: 'student@example.com',
      password: 'correctpassword'
    });

  cookie = res.headers['set-cookie'];
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  // Do NOT call mongoose.disconnect() if your app might need it
});

describe('GET /MyProfile', () => {
  it('should load the profile for logged-in user', async () => {
    const res = await request(app)
      .get('/MyProfile')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.text).toContain('Profile'); // adjust depending on output
  });
});
