const UserSchema = require('../models/Users');
const ReserveSchema = require('../models/Reservations');
const logError = require('../middleware/logError');

const timeLabels = require('../data/timeLabels');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// /viewprofile/:idNum
exports.getViewProfileStudent = async (req, res) => {
  try {
    const idNum = parseInt(req.params.idNum);
    const currentUserIdNum = req.session.user?.idNum || null;
    
    if (isNaN(idNum)) {
      return res.status(400).render('error', { title: 'Invalid User ID' });
    }
    const [user, reservations] = await Promise.all([
      UserSchema.findOne({ idNum: idNum }).lean(),
      ReserveSchema.find({ userIdNum: idNum }).lean()
    ]);    
    if (!user) {
      return res.status(404).render('error', { title: 'User Not Found' });
    }   
    const transformedReservations = reservations.map(reservation => {
      const startTimeIndex = parseInt(reservation.startTime);
      const endTimeIndex = parseInt(reservation.endTime);
      return {
        ...reservation,
        startTimeLabel: timeLabels[startTimeIndex] || 'Invalid start time',
        endTimeLabel: timeLabels[endTimeIndex] || 'Invalid end time'
      };
    });
    res.render('viewprofile', {
      title: 'Labubuddy | View Profile',
      roleTitle: 'Student',
      user: user,
      reservations: transformedReservations,
    });
  } catch (error) {
    await logError(error, 'userController.getViewProfileStudent');
    console.error("View Profile Error:", error);
    res.status(500).render('error', { title: 'Server Error' });
  }
}

exports.getMyProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user.id;
     
    const user = await UserSchema.findById(userId).lean();
    
    if (!user) {
      return res.status(404).render('error', { 
        title: 'User Not Found',
        currentUser: req.session.user 
      });
    }

    const reservations = await ReserveSchema.find({ userIdNum: user.idNum }).lean();
    
    // Transform reservations to include time labels
    const transformedReservations = reservations.map(reservation => {
      const startTimeIndex = parseInt(reservation.startTime);
      const endTimeIndex = parseInt(reservation.endTime);
      return {
        ...reservation,
        startTimeLabel: timeLabels[startTimeIndex] || 'Invalid start time',
        endTimeLabel: timeLabels[endTimeIndex] || 'Invalid end time'
      };
    });
    
    res.render('viewprofile', {
      title: 'Labubuddy | My Profile',
      roleTitle: user.isTech ? 'Technician' : 'Student',
      user: user,
      currentUser: req.session.user,
      reservations: transformedReservations,  // Use transformed reservations
      isOwnProfile: true
    });
    
  } catch (error) {
    await logError(error, 'userController.getMyProfile');
    console.error('My Profile Error:', error);
    res.status(500).render('error', { 
      title: 'Server Error',
      currentUser: req.session.user 
    });
  }
};

// /profile/:email
exports.getViewProfileTech = async (req, res) => {
  const user = await User.findOne({ email: req.params.email }).lean();
  if (user) {
    res.render('viewprofile', { user });
  } else {
    res.status(404).render('error', { title: 'User Not Found' });
  }
};

// /editprofile/:idNum
exports.getEditProfile = async (req, res) => {
  try {
    // Get user from session instead of URL parameter
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user.id; // Using the ObjectId from session
    
    const user = await UserSchema.findById(userId).lean();
    
    if (!user) {
      return res.status(404).render('error', { 
        title: 'User Not Found',
        currentUser: req.session.user 
      });
    }
    
    res.render('editprofile', {
      title: 'Labubuddy | Edit Profile',
      roleTitle: 'Student',
      user: user,
      currentUser: req.session.user
    });
  } catch (error) {
    await logError(error, 'userController.getEditProfile');
    console.error(error);
    res.status(500).render('error', { 
      title: 'Server Error',
      currentUser: req.session.user 
    });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.session.user?.id || req.session.user?.idNum || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${userId}_${timestamp}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

exports.uploadProfilePicture = upload.single('profilePicture');

exports.postEditProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    const { description } = req.body;
    const userId = req.session.user.id;
    const updateData = {};
    
    if (description !== undefined) {
      updateData.profDesc = description;
    }
    if (req.file) {
      const currentUser = await UserSchema.findById(userId);
      
      if (currentUser && currentUser.profPic) {
        const oldPicturePath = path.join('public', currentUser.profPic);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }  
      updateData.profPic = `/uploads/profiles/${req.file.filename}`;
    }
    
    const result = await UserSchema.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );  
    if (!result) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).render('error', { 
        title: 'User Not Found',
        currentUser: req.session.user 
      });
    }
    
    res.redirect(`/MyProfile`);
    
  } catch (error) {
    await logError(error, 'userController.postEditProfile');
    console.error(error);
    
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).render('error', { 
      title: 'Server Error',
      currentUser: req.session.user 
    });
  }
};

// /searchusers
exports.getSearchUsers = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    const currentUserIdNum = req.session.user.idNum;
    const users = await UserSchema.find({ 
      idNum: { $ne: currentUserIdNum }
    }).lean();
    res.render('searchusers', {
      title: 'LABubuddy | Search Users',
      roleTitle: req.session.user.isTech ? 'Technician' : 'Student',
      users: users,
      currentUserIdNum: currentUserIdNum,
      currentUser: req.session.user
    });
  } catch (error) {
    await logError(error, 'userController.getSearchUsers');
    console.error('Search Users Error:', error);
    res.status(500).render('error', { 
      title: 'Server Error',
      currentUser: req.session.user 
    });
  }
};

// /searchusers
exports.postSearchUsers = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { searchName, roleFilter } = req.body;
    
    let searchQuery = {};
    
    if (searchName && searchName.trim() !== '') {
      const trimmedSearch = searchName.trim();
      const nameParts = trimmedSearch.split(/\s+/); 
      
      if (nameParts.length === 1) {
        searchQuery.$or = [
          { fName: { $regex: nameParts[0], $options: 'i' } },
          { lName: { $regex: nameParts[0], $options: 'i' } }
        ];
      } else if (nameParts.length === 2) {
        searchQuery.$and = [
          { fName: { $regex: nameParts[0], $options: 'i' } },
          { lName: { $regex: nameParts[1], $options: 'i' } }
        ];
      } else {
        searchQuery.$or = [
          {
            $and: [
              { fName: { $regex: nameParts[0], $options: 'i' } },
              { lName: { $regex: nameParts.slice(1).join(' '), $options: 'i' } }
            ]
          },
          {
            $and: [
              { fName: { $regex: nameParts.slice(0, -1).join(' '), $options: 'i' } },
              { lName: { $regex: nameParts[nameParts.length - 1], $options: 'i' } }
            ]
          },
          { fName: { $regex: trimmedSearch, $options: 'i' } },
          { lName: { $regex: trimmedSearch, $options: 'i' } }
        ];
      }
    }
    if (roleFilter && roleFilter !== 'all') {
      if (roleFilter === 'technician') {
        searchQuery.isTech = true;
      } else if (roleFilter === 'student') {
        searchQuery.isTech = false;
      }
    }
    const currentUserIdNum = req.session.user.idNum;
    searchQuery.idNum = { $ne: currentUserIdNum };
    
    const users = await UserSchema.find(searchQuery).lean();
    
    res.render('searchusers', {
      title: 'LABubuddy | Search Users',
      roleTitle: req.session.user.isTech ? 'Technician' : 'Student',
      users: users,
      searchName: searchName,
      roleFilter: roleFilter,
      currentUserIdNum: currentUserIdNum,
      currentUser: req.session.user
    });
  } catch (error) {
    await logError(error, 'userController.postSearchUsers');
    console.error('Search Error:', error);
    res.status(500).render('error', { 
      title: 'Server Error',
      currentUser: req.session.user 
    });
  }
};

// /deleteAccount
exports.deleteAccount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const idNum = parseInt(req.params.idNum);
    const currentUserIdNum = req.session.user.idNum;
    
    if (idNum !== currentUserIdNum) {
      return res.status(403).json({ error: 'Unauthorized - You can only delete your own account' });
    }

    const deletedReservations = await ReserveSchema.deleteMany({ userIdNum: idNum });
    const deletedUser = await UserSchema.findOneAndDelete({ idNum: idNum });
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    }); 
    res.status(200).json({ 
      message: 'Account deleted successfully', 
      reservationsDeleted: deletedReservations.deletedCount 
    });
  } catch (error) {
    await logError(error, 'userController.deleteAccount');
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

