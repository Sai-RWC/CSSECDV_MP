const ErrorModel = require('../models/Errors');

const logError = async (error, location) => {
  try {
    const errDoc = new ErrorModel({
      errorSummary: `${location || 'Unknown Location'}: ${error.message}`,
      errorBody: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });

    await errDoc.save();
    console.log('Logged error to DB:', errDoc.errorSummary);
  } catch (e) {
    console.error('Failed to log error:', e);
  }
};

module.exports = logError;
