const UserSchema = require('../models/Users');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

exports.getIndex = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

exports.getLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

exports.getLogin = (req, res) => {
    res.render('login', {
        title: 'Labubuddy | Login',
        error: null,
        layout: false,
    });
};

exports.postLogin = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await UserSchema.findOne({ email });

        if (!user) {
            // console.log('User not found');
            return res.status(401).render('login', {
                title: 'Labubuddy | Login',
                layout: false,
                // errorMessage: 'User not found'
            });
        }

        //console.log('Entered password:', password);
        //console.log('Stored hashed password:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        //console.log('Password match:', isMatch);


        if (user.isLocked) {
            const diffMs = new Date() - user.lastLogin;
            const diffMinutes = diffMs / 60000;
            const minsWait = 1;
            console.log(`diffMinutes: ${diffMinutes}`);
            if (diffMinutes < minsWait){
                logger.warn('Account is locked', {id: user._id, attempts: user.numAttempts})
                return res.status(401).render('login', {
                    title: 'Labubuddy | Login',
                    layout: false,
                    error: `Account is locked try again in ${minsWait - Math.floor(diffMinutes)} minutes`,
                });
            } else {
                logger.warn('Account is unlocked', {id: user._id});
                user.isLocked = false;
                if (isMatch) {
                    user.numAttempts = 0;
                }
                await user.save();
            }
        }

        if (!isMatch) {
            logger.warn('Login attempt', {id: user._id, ip: req.ip})
            user.numAttempts = user.numAttempts + 1;
            user.lastLogin = new Date();
            if (user.numAttempts > 5) { // bring this back to 5 after everythings done
                logger.warn('Account is locked', {id: user._id})
                user.isLocked = true;
            }
            await user.save()
            return res.status(401).render('login', {
                title: 'Labubuddy | Login',
                layout: false,
                error: "Invalid email or password",
            });
        }

        // Set session user data
        req.session.user = {
            id: user._id,
            fName: user.fName,
            lName: user.lName,
            idNum: user.idNum,
            email: user.email,
            role: user.role,
            profPic: user.profPic,
            profDesc: user.profDesc,
            isAdmin: user.role === 'admin'
        };

        // Session management for "Remember Me"
        if (rememberMe) {
            req.session.cookie.maxAge = 21 * 24 * 60 * 60 * 1000; // 3 weeks
        } else {
            req.session.cookie.expires = false;
        }

        if(user.role === 'admin' || user.role === 'moderator') {
            console.log("redirecting");
            return res.redirect('/Tcreatereserve');
        } else {
            return res.redirect(`/createreserve/${user.idNum}`);
        }
    } catch (err) {
        // await logError(err, 'authController.postLogin');
        // console.error(err);
        logger.error(err.message);
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
    // https://www.geeksforgeeks.org/javascript/javascript-program-to-validate-password-using-regular-expressions/
    const { fname, lname, email, password, confirmPassword, idNum } = req.body;

    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }

    // Validate idNum format
    const idNumPattern = /^1\d{7}/;

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
            profPic: '',
            profDesc: ''
        });

        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        logger.error(err.message);
        // await logError(err, 'authController.postRegister');
        // console.error(err);
        res.send('Registration failed');
    }
};
