const UserSchema = require('../models/Users');
const ReserveSchema = require('../models/Reservations');
const SeatSchema = require('../models/Seats');
const LabSchema = require('../models/Labs');
const { labs, areas } = require('../data/areas');
const logError = require('../middleware/logError');

const timeLabels = require('../data/timeLabels');

function formatReservation(r) {
  return {
    id: r._id,
    lab: r.lab.labName,
    labNum: r.lab?.labName?.match(/\d+/)?.[0] || '',
    seat: r.seat.seatCode,
    reservDate: new Date(r.reservDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: timeLabels[r.timeSlot] || 'Unknown Time Slot',
    startTime: timeLabels[parseInt(r.startTime)] || 'Unknown',
    endTime: timeLabels[parseInt(r.endTime)] || 'Unknown',
    reqMade: new Date(r.reqMade).toLocaleString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    name: r.isAnon ? 'Anonymous' : `${r.userID?.fName} ${r.userID?.lName}`,
    email: r.isAnon ? null : r.userID?.email,
    anonymous: r.isAnon,
    userId: r.userIdNum || 'No ID',
  };
}

//Can delete within first 10 minutes of reservation start
function canDelete(reservation, req, timeLabels) {
  const user = req?.session?.user;

  if (!user || !reservation || reservation.startTime == null || !reservation.reservDate) {
    return false;
  }

  // If the user is a student, allow deletion unconditionally
  if (!user.isTech) return true;

  // Only proceed if the user is a technician
  const now = new Date();
  const reservDate = new Date(reservation.reservDate);

  // Check if the reservation is on the same day
  if (now.toDateString() !== reservDate.toDateString()) {
    return false;
  }

  // Convert startTime index to actual time string from timeLabels array
  const timeStr = timeLabels?.[parseInt(reservation.startTime)];
  if (!timeStr) return false;

  // Parse time string like "04:00 PM"
  const [time, meridian] = timeStr.trim().split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (meridian === 'PM' && hour !== 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;

  const reservStartMinutes = hour * 60 + minute;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const timeDiff = nowMinutes - reservStartMinutes;

  // Allow deletion if we're within the first 10 minutes of the start time
  return timeDiff >= 0 && timeDiff <= 10;
}


// /createreserve
exports.getCreateResStudent = (req, res) => {
  res.render('createreserve', { 
    title: 'Labubuddy | Reserve',
    roleTitle: 'Student',
    success: req.query.success === 'true',
    labs: labs
  });
};

// /submit-reservation
exports.postResStudent = async (req, res) => {
  const { chosenSlot, resDate, startTime, endTime, anonymous } = req.body;

  // Set session user data
  const user = req.session.user;

  try {
    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
    
    // check if merong conflict aljdf
    const conflict = await ReserveSchema.findOne({
      lab: lab._id,
      seat: seat._id,
      reservDate: new Date(resDate),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    // create new res only if no conflict
    if (!conflict) {
        const newRes = new ReserveSchema({
          userID: user.id,
          userIdNum: user.idNum,
          isAnon: anonymous,
          slotName: chosenSlot,
          lab: lab._id,
          seat: seat._id,
          startTime,
          endTime,
          reservDate: new Date(resDate),
          reqMade: phTimeNow
        });

        await newRes.save();
    } else {
      // In case user reserving a taken slot
      return res.render('error', {
        title: 'Reservation Error',
        message: 'Oops! the slot you selected is already reserved.'
      });
    }
    
    return res.redirect(`/createreserve/${user.idNum}?success=true`);
    
  } catch (err) {
    await logError(err, 'reservationController.postResStudent');
    console.error('Form or request body error:', err);
    return res.render('error', {
      title: 'Render Error',
      message: 'Something went wrong.'
    });
  }
    
};


// /Tcreatereserve
exports.getCreateResTech = (req, res) => {
  res.render('Tcreatereserve', { 
    title: 'Labubuddy | TReserve',
    roleTitle: 'Technician',
    success: req.query.success === 'true',
    labs: labs
  });
};


// will get rid of this when session handling is done
// i need url request for the student id to be finished

// /Tsubmit-reservation 
exports.postResTech = async (req, res) => {
  const { studentID, chosenSlot, resDate, startTime, endTime, anonymous } = req.body;
  
  try {
    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');

    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    const studentUserID = await UserSchema.findOne({ idNum: studentID }).exec();
    
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
    
    // check if merong conflict aljdf
    const conflict = await ReserveSchema.findOne({
      lab: lab._id,
      seat: seat._id,
      reservDate: new Date(resDate),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    // create new res only if no conflict
    if (!conflict) {
        const newRes = new ReserveSchema({
          userID: studentUserID,
          userIdNum: studentID,
          isAnon: anonymous,
          slotName: chosenSlot,
          lab: lab._id,
          seat: seat._id,
          startTime,
          endTime,
          reservDate: new Date(resDate),
          reqMade: phTimeNow
        });

        await newRes.save();
    } else {
      // In case user reserving a taken slot
      return res.render('error', {
        title: 'Reservation Error',
        message: 'Oops! the slot you selected is already reserved.'
      });
    }
    
    return res.redirect('/Tcreatereserve?success=true');
    
  } catch (err) {
    await logError(err, 'reservationController.postResTech');
    console.error('Form or request body error:', err);
    return res.render('error', {
      title: 'Render Error',
      message: 'Something went wrong.'
    });
  }
};


// /viewreservs
exports.getViewResStudent = async (req, res) => {   //student view

  try {
    // Set session user data
    const user = req.session.user;
    
    //add if not valid user here

    const rawReservations = await ReserveSchema.find({ userIdNum: user.idNum })
      .populate('lab')
      .populate('seat')
      .populate('userID')
      .lean();

    //const formattedReservations = rawReservations.map(formatReservation);
    const formattedReservations = rawReservations.map(r => ({   //new
      ...formatReservation(r),
      canDelete: canDelete(r, req, timeLabels)
    }));

    res.render('viewreservs', {
      title: 'Labubuddy | View Reservations',
      roleTitle: 'Student',
      reservations: formattedReservations,
      //canDelete: canDelete(reservation)
    });
    
  } catch (error) {
    await logError(error, 'reservationController.getViewResStudent');
    console.error('Student view error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Could not load reservations.'
    });
  }
};

// /tviewreservs
exports.getViewResTech = async (req, res) => {
  const { lab, date, startTime, endTime } = req.query;
  const filter = {};

  // Filter by lab ID if provided
  if (lab) filter.lab = lab;

  // Filter by date (exact match)
  if (date) filter.reservDate = new Date(date);

  if (startTime && endTime) {
    const start = parseInt(startTime);
    const end = parseInt(endTime);
    filter.startTime = { $lt: end };
    filter.endTime = { $gt: start };
  }

  try {
    const reservations = await ReserveSchema.find(filter)
      .populate('lab')
      .populate('seat')
      .populate('userID')
      .lean();

    //const formattedReservations = reservations.map(formatReservation);
    const formattedReservations = reservations.map(r => ({   //new
      ...formatReservation(r),
      canDelete: canDelete(r, req, timeLabels)
    }));
    const availableSeats = 40 - reservations.length;

    const isFiltered = lab && date && startTime && endTime;

    // Get lab name for display
    let labName = 'No lab selected';
    if (lab) {
      try {
        const labDoc = await LabSchema.findById(lab).lean();
        labName = labDoc?.labName || 'No lab selected';
      } catch (err) {
        await logError(err, 'reservationController.getViewResTech.labLookup');
        console.error('Lab lookup failed:', err);
        labName = 'No lab selected';
      }
    }

    const formattedFilter = {
      lab: labName,
      date: date
        ? new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        : null,
      time: (startTime && endTime) ? `Slot ${startTime} to ${endTime}` : null
    };

    res.render('tviewreservs', {
      title: 'Labubuddy | Filtered Reservations',
      filter: formattedFilter,
      roleTitle: 'Technician',
      isFiltered,
      availableSeats,
      reservations: formattedReservations
    });

  } catch (error) {
    await logError(error, 'reservationController.getViewResTech');
    console.error('Technician filter error:', error);
    res.render('error', {
      title: 'Error',
      roleTitle: 'Technician',
      message: 'Could not fetch filtered results.'
    });
  }
};


// /tfilterreservs
exports.getFilterResTech = async (req, res) => {
    //const labs = await Lab.find().lean();
    const labs = await LabSchema.find().lean();

    res.render('tfilterreservs', {
      title: 'Labubuddy | Technician Filter',
      roleTitle: 'Technician',
      timeLabels,
      labs
    });
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await ReserveSchema.findById(req.params.id)
    .populate('lab seat');

    if(!reservation){
      return res.status(404).send('Reservation not found')
    }

    if(!canDelete(reservation, req, timeLabels)){
      return res.status(403).send('You do not have permission to delete this reservation');
    }

    await ReserveSchema.findByIdAndDelete(req.params.id);

    const referer = req.get('Referer') || '/viewreservs';
    res.redirect(referer);
  } catch (error) {
    await logError(error, 'reservationController.deleteReservation');
    console.error("Error deleting reservation:", error);
    res.status(500).send("Failed to delete reservation.");
  }
};

// /editres/:id
exports.getEditRes = async (req, res) => {
  try {
    const reservation = await ReserveSchema.findById(req.params.id)
      .populate('lab seat');

    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    const labs = await LabSchema.find();

    const labsClean = labs.map(lab => ({
      value: lab._id.toString(),
      name: lab.labName
    }));


    // Format the reservation date
    const formattedDate = reservation.reservDate.toISOString().split('T')[0];

    res.render('editreserve', {
      roleTitle: 'Student',
      lab: reservation.lab.labName,
      labId: reservation.lab._id.toString(),
      seat: reservation.seat?.seatCode,
      chosenSlot: reservation.slotName,
      startTime: timeLabels[parseInt(reservation.startTime)] || 'Unknown',
      endTime: timeLabels[parseInt(reservation.endTime)] || 'Unknown',
      startTimeIndex: reservation.startTime,
      endTimeIndex: reservation.endTime,
      reservDate: formattedDate,
      editId: reservation._id,
      success: req.query.success === 'true',
      labs: labsClean,
      timeLabels
    });

  } catch (err) {
    await logError(err, 'reservationController.getEditRes');
    console.error('Edit reservation error:', err);
    res.status(500).send('Server error while loading reservation');
  }
};

// /Teditres/:id
exports.getEditTRes = async (req, res) => {
  try {
    const reservation = await ReserveSchema.findById(req.params.id)
      .populate('lab seat');

    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    const labs = await LabSchema.find();

    const labsClean = labs.map(lab => ({
      value: lab._id.toString(),
      name: lab.labName
    }));


    // Format the reservation date
    const formattedDate = reservation.reservDate.toISOString().split('T')[0];

    res.render('Teditreserve', {
      roleTitle: 'Technician',
      lab: reservation.lab.labName,
      labId: reservation.lab._id.toString(),
      labNum: reservation.lab.labName.match(/\d+/)?.[0] || '',
      seat: reservation.seat?.seatCode,
      chosenSlot: reservation.slotName,
      startTime: timeLabels[parseInt(reservation.startTime)] || 'Unknown',
      endTime: timeLabels[parseInt(reservation.endTime)] || 'Unknown',
      startTimeIndex: reservation.startTime,
      endTimeIndex: reservation.endTime,
      timeSlot: reservation.timeSlot,
      reservDate: formattedDate,
      editId: reservation._id,
      success: req.query.success === 'true',
      labs: labsClean,
      timeLabels, 
      reservation: reservation
    });

  } catch (err) {
    await logError(err, 'reservationController.getEditTRes');
    console.error('Edit reservation error:', err);
    res.status(500).send('Server error while loading reservation');
  }
};


exports.postEditRes = async (req, res) => {
  const { chosenSlot, resDate, startTime, endTime, anonymous } = req.body;
  const reservationId = req.params.id;

  try {
    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');
    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    if (!lab || !seat) {
      return res.render('error', {
        title: 'Invalid Reservation',
        message: 'The selected lab or seat does not exist.'
      });
    }

    const conflictingRes = await ReserveSchema.findOne({
      _id: { $ne: reservationId },
      slotName: chosenSlot,
      lab: lab._id,
      seat: seat._id,
      //timeSlot: timeSlot,
      //reservDate: new Date(resDate)
      reservDate: new Date (resDate),
      $or: [
        {
          startTime: { $lt: endTime},
          endTime: { $gt: startTime}
        }
      ]
    });

    if (conflictingRes) {
      return res.render('error', {
        title: 'Conflict Detected',
        message: 'Oops! Another reservation is already booked for that slot.'
      });
    }

    const reservationToEdit = await ReserveSchema.findById(reservationId);

    if (!reservationToEdit) {
      return res.render('error', {
        title: 'Reservation Not Found',
        message: 'Cannot find reservation to update.'
      });
    }

    reservationToEdit.slotName = chosenSlot;
    reservationToEdit.lab = lab._id;
    reservationToEdit.seat = seat._id;
    //reservationToEdit.timeSlot = timeSlot;
    reservationToEdit.startTime = startTime;
    reservationToEdit.endTime = endTime;
    reservationToEdit.reservDate = new Date(resDate);
    reservationToEdit.isAnon = anonymous;
    reservationToEdit.reqMade = phTimeNow;

    await reservationToEdit.save();

    return res.redirect(`/viewreservs/${reservationToEdit.userIdNum}?success=true`);

  } catch (err) {
    await logError(err, 'reservationController.postEditRes');
    console.error('Form or request body error:', err);
    return res.render('error', {
      title: 'Render Error',
      message: 'Something went wrong.'
    });
  }
};


exports.postEditTRes = async (req, res) => {
  const { chosenSlot, resDate, startTime, endTime, anonymous } = req.body;
  const reservationId = req.params.id;

  try {
    const [ labNamePart, seatCodePart ] = chosenSlot.split(', seat ');
    const lab = await LabSchema.findOne({ labName : labNamePart }).exec();
    const seat = await SeatSchema.findOne({ seatCode: seatCodePart }).exec();
    const now = new Date();
    const phTimeNow = now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    if (!lab || !seat) {
      return res.render('error', {
        title: 'Invalid Reservation',
        message: 'The selected lab or seat does not exist.'
      });
    }

    const conflictingRes = await ReserveSchema.findOne({
      _id: { $ne: reservationId },
      //slotName: chosenSlot,
      lab: lab._id,
      seat: seat._id,
      //timeSlot: timeSlot,
      //reservDate: new Date(resDate)

      reservDate: new Date(resDate),
      $or: [
        {
          startTime: { $lt: endTime},
          endTime: { $gt: startTime}
        }
      ]
    });

    if (conflictingRes) {
      return res.render('error', {
        title: 'Conflict Detected',
        message: 'Oops! Another reservation is already booked for that slot.'
      });
    }

    const reservationToEdit = await ReserveSchema.findById(reservationId);

    if (!reservationToEdit) {
      return res.render('error', {
        title: 'Reservation Not Found',
        message: 'Cannot find reservation to update.'
      });
    }

    reservationToEdit.slotName = chosenSlot;
    reservationToEdit.lab = lab._id;
    reservationToEdit.seat = seat._id;
    //reservationToEdit.timeSlot = timeSlot;
    reservationToEdit.startTime = startTime;
    reservationToEdit.endTime = endTime;
    reservationToEdit.reservDate = new Date(resDate);
    reservationToEdit.isAnon = anonymous;
    reservationToEdit.reqMade = phTimeNow;

    await reservationToEdit.save();

    return res.redirect('/tviewreservs?success=true');
    
  } catch (err) {
    await logError(err, 'reservationController.postEditTRes');
    console.error('Form or request body error:', err);
    return res.render('error', {
      title: 'Render Error',
      message: 'Something went wrong.'
    });
  }
};