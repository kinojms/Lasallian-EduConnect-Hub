const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    lastName: String,
    firstName: String,
    username: { type: String, unique: true },
    password: String,
    profilePicture: { data: Buffer, contentType: String },
    role: { type: String, default: 'user'},
    banned: Boolean,
});

module.exports = mongoose.model("User", userSchema);
