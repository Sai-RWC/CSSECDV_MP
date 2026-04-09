const ReserveSchema = require('../models/Reservations');
const LabSchema = require('../models/Labs');
const { labs, areas } = require('../data/areas');
const mongoose = require('mongoose');
const logError = require('../middleware/logError');


// /unavailiframe
exports.getUnavailFrame = (req, res) => {
  res.render('unavailiframe', {
    title: 'Slots Unavailable',
    layout: false
  });
};

// /reserveiframe
exports.getResIframe = async (req, res) => {
  const { date, start, end, lab } = req.query;
  console.log('Query params:', req.query);
  let reservedSeats = [];
  let labID;

  try {
    /*
    // Find Lab by name
    labID = await LabSchema.findOne({ labName: `Lab ${lab}` }).exec();
    console.log(`Lab ${lab}`);
    */

    /*
    console.log(labID? "True" : "False");
    console.log('Lab ID:', labID);
    */

// Find Lab by ID or name
    let labID;
    if (mongoose.Types.ObjectId.isValid(lab)) {
      // If lab is a valid ObjectId, find by ID
      labID = await LabSchema.findById(lab).exec();
      console.log(`Looking for lab by ID: ${lab}`);
    } else {
      // If lab is a name, find by name
      let labName = lab;
      if (!lab.startsWith('Lab ')) {
        labName = `Lab ${lab}`;
      }
      labID = await LabSchema.findOne({ labName: labName }).exec();
      console.log(`Looking for lab by name: ${labName}`);
    }

    if (!labID) {
      console.error(`Lab not found for query: ${lab}`);
      return res.render('reserveiframe', {
        title: 'Invalid Lab',
        layout: false,
        areas,
        reservedSeats: []
      });
    }

    // Find reservations with same param
    // Find all overlapping reservations once
    const allReservations = await ReserveSchema.find({
      lab: labID._id,
      reservDate: new Date(date),
      startTime: { $lt: end },
      endTime: { $gt: start }
    }).populate('seat').lean();

    // Extract all reserved seat codes
    allReservations.forEach(r => {
      if (r.seat?.seatCode) reservedSeats.push(r.seat.seatCode);
    });

    console.log('All reservations found for given slot:', allReservations);


  } catch (err) {
    await logError(err, 'iframeController.getResIframe');
    console.error('Error loading reservation:', err);
  }

  res.render('reserveiframe', {
    title: 'Reservation Slots',
    layout: false,
    areas,
    reservedSeats
  });
};