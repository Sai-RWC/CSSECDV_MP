const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatCode: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Seat', seatSchema);