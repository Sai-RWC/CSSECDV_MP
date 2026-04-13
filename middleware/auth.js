const logger = require('../utils/logger');

exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};

exports.isStudent = (req, res, next) => {
    if (req.session?.user && req.session.user.role === 'user') {
        return next();
    }
    logger.warn('Unauthorized Access Attempt', { url: req.url, ip: req.ip, id: req.session?.user?.id });
    res.status(403).render('error', { title: 'Forbidden', message: 'Unauthorized Access Attempt' });
};

exports.isAdmin = (req, res, next) => {
    if (req.session?.user && req.session?.user?.role === 'admin') {
        return next();
    }
    logger.warn('Unauthorized Access Attempt', { url: req.url, ip: req.ip, id: req.session?.user?.id });
    res.status(403).render('error', { title: 'Forbidden', message: 'Unauthorized Access Attempt' });
};

exports.isAdminMod = (req, res, next) => {
    if (req.session?.user && ( req.session?.user?.role === 'admin' || req.session?.user?.role === 'moderator' )) {
        return next();
    }
    logger.warn('Unauthorized Access Attempt', { url: req.url, ip: req.ip, id: req.session?.user?.id });
    res.status(403).render('error', { title: 'Forbidden', message: 'Unauthorized Access Attempt' });
};
