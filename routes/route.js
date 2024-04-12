const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const postController = require('../controllers/postController');
const userController = require('../controllers/userController');

var UserModel = require('../models/UserModel');
var PostModel = require('../models/PostModel');
var CommentModel = require('../models/CommentModel');

const app = express();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({ storage: storage });

// HOME/INDEX
app.get('/', (req, res) => {
    res.render('index', {user: req.user});
});

// LOGIN
app.get('/login', (req, res) => {
    res.render('login');
});

// SIGNUP
app.get('/signup', (req, res) => {
    res.render('signup');
});

// PRE-ENLIST
app.get('/pre-enlist', postController.getPreEnlistPosts);

// ENLIST
app.get('/enlistment', postController.getEnlistPosts);

// STU-CO
app.get('/student-concerns', postController.getConcernPosts);

//  CREATE POST
app.get('/create-post', (req, res) => {
    res.render('create-post', { user: req.user });
})

// ABOUT
app.get("/about", (req, res) => {
    res.render('about'); 
});

//CONTACT
app.get("/contact", (req, res) => {
    res.render('contact');
});

//PROFILE
app.get('/profile', ensureAuthenticated,postController.getUserPostsAndComments, (req, res) => {
    res.render('profile', { user: req.user });
});

//SEARCH
app.get('/search', postController.searchPosts);

//LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
   
        res.clearCookie('sid');
        res.redirect('/login');
    });
});

//CHECK IF USER IS LOGGED IN
app.get('/check-authentication', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
});

//UPDATE PASSWORD
app.post('/update-password', ensureAuthenticated, (req, res) => {
    const { currentPassword, newPassword } = req.body;

    UserModel.findById(req.user._id).then(user => {
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        bcrypt.compare(currentPassword, user.password).then(isMatch => {
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            bcrypt.hash(newPassword, 10).then(hashedPassword => {
                UserModel.findByIdAndUpdate(req.user._id, { password: hashedPassword })
                .then(() => {
                    res.json({ message: "Password changed successfully!" });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ message: "Internal server error" });
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: "Internal server error" });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        });
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    });
});

//UPLOAD PROFILE PIC
app.post('/upload-profile-picture', upload.single('profilePicture'), (req, res, next) => {
    // Convert the uploaded file to a base64 string
    let profilePicture = fs.readFileSync(req.file.path).toString('base64');

    UserModel.findById(req.user._id)
    .then(user => {
        // Save the new profile picture
        return UserModel.findByIdAndUpdate(req.user._id, { profilePicture: profilePicture }, {new: true});
    })
    .then(user => {
        // Update the user's profile picture in the PostModel
        return PostModel.updateMany(
            { username: req.user.username },
            { profilePicture: profilePicture }
        );
    })
    .then(() => {
        // Update the user's profile picture in the CommentModel
        return CommentModel.updateMany(
            { username: req.user.username },
            { profilePicture: profilePicture }
        );
    })
    .then(() => {
        // Delete the uploaded file after saving it to the database
        fs.unlinkSync(req.file.path);
        res.redirect('/profile');
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('An error occurred while updating the profile picture');
    });
});

//EDIT PROFILE DETAILS
app.post('/edit-profile', ensureAuthenticated, (req, res) => {
    const { username, firstName, lastName, email } = req.body;

    UserModel.findById(req.user._id)
    .then(user => {
        // Save the new username
        return UserModel.findByIdAndUpdate(req.user._id, { username, firstName, lastName, email }, {new: true});
    })
    .then(user => {
        // Update the user's username in the PostModel
        return PostModel.updateMany(
            { username: req.user.username },
            { username: username }
        );
    })
    .then(() => {
        // Update the user's username in the CommentModel
        return CommentModel.updateMany(
            { username: req.user.username },
            { username: username }
        );
    })
    .then(() => {
        res.redirect('/profile');
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('An error occurred while updating the profile');
    });
});

module.exports = app;
