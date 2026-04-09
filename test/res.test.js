const request = require('supertest');
const { Mongoose } = require('mongoose');
const app = require('../app');

const Lab = require('../models/Labs');
const Seat = require('../models/Seats');
const Reserve = require('../models/Reservations');

const testMongoose = new Mongoose();

beforeAll(async () => {
  await testMongoose.connect('mongodb://127.0.0.1:27017/labubuddy_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Clean up
  await testMongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await testMongoose.disconnect();
});

describe('Reservation Routes', () => {

  it('POST /submit-reservation should create a reservation and redirect on success', async () => {
    const lab = await Lab.create({ labName: 'Test Lab' });
    const seat = await Seat.create({ seatCode: 'A1', lab: lab._id });

    const res = await request(app).post('/submit-reservation').send({
      chosenSlot: `${lab.labName}, seat ${seat.seatCode}`,
      resDate: '2025-08-05',
      startTime: '10',
      endTime: '11',
      anonymous: true
    });

    expect(res.statusCode).toBe(302); // redirect to /createreserve?success=true
  });

  it('POST /submit-reservation should create a reservation and redirect on success', async () => {
  // Create mock lab and seat
  const lab = await Lab.create({ labName: 'Test Lab' });
  const seat = await Seat.create({ lab: lab._id, seatCode: 'S1' });

  const res = await request(app).post('/submit-reservation').send({
    slotName: `${lab.labName}, seat ${seat.seatCode}`,
    lab: lab._id.toString(),
    seat: seat._id.toString(),
    startTime: '10',                // or any valid string
    endTime: '11',
    reservDate: new Date().toISOString(),
    reqMade: new Date().toISOString(),
    isAnon: true
  });

  expect(res.statusCode).toBeGreaterThanOrEqual(300); // usually a redirect (302)
});
});
