const UserSchema = require('../models/Users');
const bcrypt = require('bcrypt');
const logError = require('../middleware/logError');

exports.getLogout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Labubuddy | Login',
    layout: false
  });
};

exports.postLogin = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await UserSchema.findOne({ email });

    if (!user) {
      console.log('User not found');
      return res.status(401).render('login', {
        title: 'Labubuddy | Login',
        layout: false,
        errorMessage: 'User not found'
      });
    }

    //console.log('Entered password:', password);
    //console.log('Stored hashed password:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    //console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).render('login', {
        title: 'Labubuddy | Login',
        layout: false,
        errorMessage: 'Incorrect password'
      });
    }

    // Set session user data
    req.session.user = {
      id: user._id,
      fName: user.fName,
      lName: user.lName,
      idNum: user.idNum,
      email: user.email,
      isTech: user.isTech,
      profPic: user.profPic,
      profDesc: user.profDesc
    };

    // Session management for "Remember Me"
    if (rememberMe) {
      req.session.cookie.maxAge = 21 * 24 * 60 * 60 * 1000; // 3 weeks
    } else {
      req.session.cookie.expires = false;
    }

    if(user.isTech) {
      return res.redirect('/Tcreatereserve');
    } else {
    return res.redirect(`/createreserve/${user.idNum}`);
    }
  } catch (err) {
    await logError(err, 'authController.postLogin');
    console.error(err);
    res.status(500).send('Login failed');
  }
};

exports.getRegister = (req, res) => {
  res.render('register', {
    title: 'Labubuddy | Register',
    layout: false
  });
};

exports.postRegister = async (req, res) => {
  const { fname, lname, email, password, confirmPassword, idNum } = req.body;

  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  // Validate idNum format
  const idNumPattern = /^1(0[1-9]|1[0-9]|2[0-5])0\d{4}$/; // DLSU id number format

  if (!idNumPattern.test(idNum)) {
    return res.send('Invalid ID Number format. Must be 8 digits, start with 1, and include valid entry year (e.g., 12345678)');
  }

  try {
    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) {
      return res.send('An account with this email already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserSchema({
      fName: fname,
      lName: lname,
      email,
      password: hashedPassword,
      idNum,
      isTech: false, // Default to student
      profPic: '',
      profDesc: ''
    });

    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    await logError(err, 'authController.postRegister');
    console.error(err);
    res.send('Registration failed');
  }
};
