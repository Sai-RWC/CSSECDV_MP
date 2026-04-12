const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    idNum: {
        type: Number,
        required: true,
        unique: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true
     },
    password: {
        type: String,
        required: true
    },
    // might update this into role 
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    numAttempts: {
        type: Number,
        default: 0
    },
    lastLogin: {
        type: Date
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    prevPass: {
        type: [String],
        maxlength: 3
    },
    pwDate: {
        type: Date,
    },
    profPic: String,
    profDesc: String
});

module.exports = mongoose.model('User', userSchema);
