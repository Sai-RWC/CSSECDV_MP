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
    const { reset } = req.query;
    res.render('login', {
        title: 'Labubuddy | Login',
        error: null,
        success: reset === 'success' ? 'Password changed successfully. Please log in.' : null,
        layout: false,
    });
};

exports.postLogin = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await UserSchema.findOne({ email });

        if (!user) {
            logger.warn('Login failed: user not found', { email, ip: req.ip });
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

        const MAX_ATTEMPTS = 5;
        const LOCK_WINDOW_MINUTES = 5;
        const LOCK_DURATION_MINUTES = 15;

        if (user.isLocked) {
            const diffMs = new Date() - user.lastLogin;
            const diffMinutes = diffMs / 60000;
            if (diffMinutes < LOCK_DURATION_MINUTES) {
                logger.warn('Account is locked', {id: user._id, attempts: user.numAttempts});
                const remaining = Math.ceil(LOCK_DURATION_MINUTES - diffMinutes);
                return res.status(401).render('login', {
                    title: 'Labubuddy | Login',
                    layout: false,
                    error: `Account is locked. Try again in ${remaining} minute.`,
                });
            } else {
                logger.warn('Account is unlocked', {id: user._id});
                user.isLocked = false;
                user.numAttempts = 0;
                await user.save();
            }
        }

        if (!isMatch) {
            logger.warn('Login attempt', {id: user._id, ip: req.ip});
            const now = new Date();
            if (user.lastLogin && now - user.lastLogin > LOCK_WINDOW_MINUTES * 60 * 1000) {
                user.numAttempts = 0;
            }
            user.numAttempts = user.numAttempts + 1;
            user.lastLogin = now;
            if (user.numAttempts > MAX_ATTEMPTS) {
                logger.warn('Account is locked', {id: user._id});
                user.isLocked = true;
                await user.save();
                return res.status(401).render('login', {
                    title: 'Labubuddy | Login',
                    layout: false,
                    error: `Account locked after ${MAX_ATTEMPTS} failed login attempts. Try again in ${LOCK_DURATION_MINUTES} minutes.`,
                });
            }
            await user.save();
            return res.status(401).render('login', {
                title: 'Labubuddy | Login',
                layout: false,
                error: "Invalid email or password",
            });
        }

        const previousUse = user.lastLogin ? new Date(user.lastLogin) : null;
        if (previousUse) {
            req.flash('success', `Last account use was on ${previousUse.toLocaleString()}`);
        } else {
            req.flash('success', 'No previous account use recorded.');
        }
        logger.info('Successful login', { id: user._id, email: user.email, ip: req.ip });

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

        if (user.numAttempts > 0 || user.isLocked) {
            user.numAttempts = 0;
            user.isLocked = false;
        }

        user.lastLogin = new Date();
        await user.save();

        if (previousUse) {
            req.flash('success', `Last account use was on ${previousUse.toLocaleString()}`);
        }

        /*
        if(user.role === 'admin' || user.role === 'moderator') {
            console.log("redirecting");
            return res.redirect('/Tcreatereserve');
        } else {
            return res.redirect(`/createreserve/${user.idNum}`);
        }
            */
        
        if(user.role === 'admin' || user.role === 'moderator') {
            //logger.info('Admin/Moderator logged in', {id: user._id})          //DO WE NEED THIS
            return res.redirect(`/viewprofile/${user.idNum}`)
        } else {
            // logger.info('Student logged in', {id: user._id})
            return res.redirect(`/viewprofile/${user.idNum}`)
        }

    } catch (err) {
        // await logError(err, 'authController.postLogin');
        // console.error(err);
        logger.error(err.stack || err.message);
        res.status(500).render('error', {
            title: 'Server Error',
            message: 'Login failed. Please try again later.'
        });
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
    const { fname, lname, email, password, confirmPassword, idNum, securityQuestion, securityAnswer } = req.body;

    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }

    // Validate idNum format
    const idNumPattern = /^1\d{7}/;

    if (!idNumPattern.test(idNum)) {
        return res.send('Invalid ID Number format. Must be 8 digits, start with 1, and include valid entry year (e.g., 12345678)');
    }

    if (!securityQuestion || !securityAnswer) {
        return res.send('Security question and answer are required');
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
            profDesc: '',
            securityQuestion,
            securityAnswer
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

//get forgot password to render forgot password page
exports.getForgotPassword = (req, res) => {
    res.render('forgot-password', {
        title: 'Labubuddy | Forgot Password',
        layout: false
    });
};

//post forgot password to handle form submission
exports.postForgotPassword = async (req, res) => {
    let { email, securityAnswer, newPassword } = req.body;

    try {
        email = (email || '').trim().toLowerCase();
        if (!email && req.session.forgotEmail) {
            email = req.session.forgotEmail;
        }
        const user = await UserSchema.findOne({ email });

        if (!user) {
            return res.status(401).render('forgot-password', {
                title: 'Labubuddy | Forgot Password',
                layout: false,
                error: 'User not found. Please check your email and try again.'
            });
        }

        // Check if password was changed recently (within 1 day)
        if (user.pwDate) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (user.pwDate > oneDayAgo) {
                return res.status(401).render('forgot-password', {
                    title: 'Labubuddy | Forgot Password',
                    layout: false,
                    error: 'Password change too recent. Please wait at least 1 day before using forgot password.'
                });
            }
        }

        // Step 1: email exists, show security question
        if (!securityAnswer && !newPassword) {
            req.session.forgotEmail = email;
            return res.render('forgot-password', {
                title: 'Labubuddy | Forgot Password',
                layout: false,
                user,
                securityQuestion: user.securityQuestion
            });
        }

        // Step 2: validate answer and new password
        if (!securityAnswer) {
            return res.status(400).render('forgot-password', {
                title: 'Labubuddy | Forgot Password',
                layout: false,
                user,
                securityQuestion: user.securityQuestion,
                error: 'Please provide your security answer.'
            });
        }

        if (!user.securityAnswer || user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
            return res.status(401).render('forgot-password', {
                title: 'Labubuddy | Forgot Password',
                layout: false,
                user,
                securityQuestion: user.securityQuestion,
                error: 'Incorrect security answer'
            });
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,28}$/;
        if (!newPassword || !passwordPattern.test(newPassword)) {
            return res.status(400).render('forgot-password', {
                title: 'Labubuddy | Forgot Password',
                layout: false,
                user,
                securityQuestion: user.securityQuestion,
                error: 'New password must be 8 to 28 characters and include uppercase, lowercase, number, and special character'
            });
        }

        const isCurrentMatch = await bcrypt.compare(newPassword, user.password);
        if (isCurrentMatch) {
            return res.status(400).render('forgot-password', {
                title: 'Labubuddy | Forgot Password',
                layout: false,
                user,
                securityQuestion: user.securityQuestion,
                error: 'New password cannot be the same as your current password or a previously used password'
            });
        }

        if (user.prevPass && user.prevPass.length > 0) {
            for (const oldPass of user.prevPass) {
                const isOldMatch = await bcrypt.compare(newPassword, oldPass);
                if (isOldMatch) {
                    return res.status(400).render('forgot-password', {
                        title: 'Labubuddy | Forgot Password',
                        layout: false,
                        user,
                        securityQuestion: user.securityQuestion,
                        error: 'New password cannot be the same as your current password or a previously used password'
                    });
                }
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password history
        if (!user.prevPass) user.prevPass = [];
        user.prevPass.unshift(user.password); // Add current password to history
        if (user.prevPass.length > 3) user.prevPass = user.prevPass.slice(0, 3); // Keep only last 3

        user.password = hashedPassword;
        user.pwDate = new Date();
        user.numAttempts = 0;
        user.isLocked = false;
        await user.save();

        logger.info('Password reset for user', { id: user._id, email: user.email });

        delete req.session.forgotEmail;

        return res.redirect('/login?reset=success');

    } catch (err) {
        logger.error(err.stack || err.message);
        res.status(500).render('error', {
            title: 'Server Error',
            message: 'Password reset failed. Please try again later.'
        });
    }
};

