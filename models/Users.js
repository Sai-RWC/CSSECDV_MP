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
    isTech: {
        type: Boolean,
        required: true
    },
    profPic: String,
    profDesc: String
});

module.exports = mongoose.model('User', userSchema);