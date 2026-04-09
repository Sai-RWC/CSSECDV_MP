const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const UserSchema = require('./models/Users');
const ReserveSchema = require('./models/Reservations');
const SeatSchema = require('./models/Seats');
const LabSchema = require('./models/Labs');

// For loading pre-made data
const seedDatabase = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB');

  // Clear schema's existing data
  await UserSchema.deleteMany({});
  await ReserveSchema.deleteMany({});
  await SeatSchema.deleteMany({});
  await LabSchema.deleteMany({});

  // Load static JSON files
  const usersdata = require('./data/usersdata.json');
  const seatsdata = require('./data/seatsdata.json');
  const labsdata = require('./data/labsdata.json');

  const bcrypt = require('bcrypt');

  for (const user of usersdata) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  }

  await UserSchema.insertMany(usersdata);
  await SeatSchema.insertMany(seatsdata);
  await LabSchema.insertMany(labsdata);

  // Take dynamic JSON files
  const reservedata = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/reservedata.json'), 'utf-8'));

  // Replacing reservations' null values
  for (const reserve of reservedata) {

    // finding userID
    const userSchoolId = reserve.userIdNum;
    const user = await UserSchema.findOne({ idNum : userSchoolId }).exec();

    // finding lab and seat ids
    const [ labNamePart, seatCodePart ] = reserve.slotName.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();

    // for dates
    const now = new Date();
    const userReservDate = new Date(now.toISOString().split('T')[0]);
    
    // initializing reservations
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
}

(async () => {
  await seedDatabase();
  console.log('Database seeded!');
  process.exit();
})();