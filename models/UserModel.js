const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     email: String,
//     lastName: String,
//     firstName: String,
//     username: { type: String, unique: true },
//     password: String
// });

const userSchema = new mongoose.Schema({
    email: String,
    lastName: String,
    firstName: String,
    username: { type: String, unique: true },
    password: String,
    profilePicture: String // New field for the profile picture
});

module.exports = mongoose.model("User", userSchema);
