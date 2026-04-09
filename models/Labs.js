const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    labName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Lab', labSchema);