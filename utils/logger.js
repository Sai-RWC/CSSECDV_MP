const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),                          // logs to terminal
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),  // errors only
    new winston.transports.File({ filename: 'logs/combined.log' })                // everything
  ]
});

module.exports = logger;
