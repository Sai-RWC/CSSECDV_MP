const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const iframeRoutes = require('./routes/iframeRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session management
app.use(session({
  secret: 'LabubuddySecretKey123!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', reservationRoutes);
app.use('/', iframeRoutes);


// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.log('Could not connect to MongoDB...', err));


// Handlebars setup (.handlebars ext)
const hbs = exphbs.create({
  extname: 'handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    formatDate: function (date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    eq: function (a, b) {
      return a === b;
    },
    ifEquals: function (arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    json: context => JSON.stringify(context)
  }
});

app.engine('handlebars', hbs.engine);

app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));


// Prevent browser caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// For Login - Remember Function
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;