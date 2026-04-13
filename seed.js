const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const UserSchema = require('./models/Users');
const ReserveSchema = require('./models/Reservations');
const SeatSchema = require('./models/Seats');
const LabSchema = require('./models/Labs');

const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/myapp');

  // Clear existing data
  await UserSchema.deleteMany({});
  await ReserveSchema.deleteMany({});
  await SeatSchema.deleteMany({});
  await LabSchema.deleteMany({});

  // Load static JSON files
  const usersdata = require('./data/usersdata.json');
  const seatsdata = require('./data/seatsdata.json');
  const labsdata = require('./data/labsdata.json');

  //Hash password + security answer
  for (const user of usersdata) {
    // Normalize fields
    user.email = user.email.trim().toLowerCase();
    user.fName = user.fName.trim();
    user.lName = user.lName.trim();

    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;

    // Ensure security question exists
    if (!user.securityQuestion) {
      user.securityQuestion = "first_username";
    }

    // Ensure security answer exists
    if (!user.securityAnswer) {
      user.securityAnswer = "defaultanswer";
    }

    // Normalize + hash security answer
    const normalizedAnswer = user.securityAnswer.trim().toLowerCase();
    const hashedAnswer = await bcrypt.hash(normalizedAnswer, 10);
    user.securityAnswer = hashedAnswer;
  }

  // Insert base data
  await UserSchema.insertMany(usersdata);
  await SeatSchema.insertMany(seatsdata);
  await LabSchema.insertMany(labsdata);

  // Load reservation data
  const reservedata = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/reservedata.json'), 'utf-8')
  );

  for (const reserve of reservedata) {
    // Find user
    const user = await UserSchema.findOne({ idNum: reserve.userIdNum }).exec();

    // Parse lab + seat
    const [labNamePart, seatCodePart] = reserve.slotName.split(', seat ');

    const lab = await LabSchema.findOne({ labName: labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();

    // Date handling
    const now = new Date();
    const userReservDate = new Date(now.toISOString().split('T')[0]);

    // Create reservation
    const newRes = new ReserveSchema({
      userID: user._id,
      userIdNum: reserve.userIdNum,
      isAnon: reserve.isAnon,
      slotName: reserve.slotName,
      lab: lab._id,
      seat: seat._id,
      startTime: reserve.startTime,
      endTime: reserve.endTime,
      reservDate: userReservDate,
      reqMade: new Date()
    });

    await newRes.save();
  }
};

(async () => {
  try {
    await seedDatabase();
    console.log('Database seeded with security questions!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();