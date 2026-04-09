// '/'
exports.getIndex = (req, res) => {
  res.render('index', {
    title: 'Labubuddy',
    layout: false
  });
};

// '/landingpage'
exports.getLanding = (req, res) => {
  res.render('landingpage', {
    title: 'Labubuddy',
    layout: false
  });
};