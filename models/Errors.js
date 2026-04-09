const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
    
      errorSummary: {
        type: String,
        required: true,
        trim: true,
      },
      errorBody: {
        type: Object
      }
    
},
{
  timestamps:{
    createdAt: "createdAt",
  },
    collection: "Errors",
});

module.exports = mongoose.model('Error', errorSchema);