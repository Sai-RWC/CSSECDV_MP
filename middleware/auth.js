exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
};

exports.isStudent = (req, res, next) => {
  if (req.session?.user && !req.session.user.isTech) {
    return next();
  }
  res.status(403).render('error', { title: 'Forbidden', message: 'Student access only.' });
};

exports.isTechnician = (req, res, next) => {
  if (req.session?.user?.isTech) {
    return next();
  }
  res.status(403).render('error', { title: 'Forbidden', message: 'Technician access only.' });
};