const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const postController = require('../controllers/postController');
const userController = require('../controllers/userController');

const UserModel = require('../models/userModel');

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

app.get('/create-post', (req, res) => {
    res.render('create-post');
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
app.get('/profile', ensureAuthenticated, (req, res) => {
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
        // Also clear the cookie
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
    UserModel.findById(req.user._id)
    .then(user => {
        if (user.profilePicture) {
            // Delete the old profile picture
            const oldProfilePicturePath = path.join(__dirname, '..', user.profilePicture);
            fs.unlink(oldProfilePicturePath, err => {
                if (err && err.code !== 'ENOENT') {
                    console.error(err);
                    return res.status(500).send('An error occurred while deleting the old profile picture');
                }

                // Save the new profile picture
                var obj = {
                    profilePicture: '/uploads/' + req.file.filename
                }
                UserModel.findByIdAndUpdate(req.user._id, obj, {new: true})
                .then(user => {
                    res.redirect('/profile');
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send('An error occurred while updating the profile picture');
                });
            });
        } else {
            // Save the new profile picture
            var obj = {
                profilePicture: '/uploads/' + req.file.filename
            }
            UserModel.findByIdAndUpdate(req.user._id, obj, {new: true})
            .then(user => {
                res.redirect('/profile');
            })
            .catch(err => {
                console.log(err);
                res.status(500).send('An error occurred while updating the profile picture');
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('An error occurred while retrieving the user');
    });
});

//EDIT PROFILE DETAILS
app.post('/edit-profile', ensureAuthenticated, (req, res) => {
    const { username, firstName, lastName, email } = req.body;

    UserModel.findByIdAndUpdate(req.user._id, { username, firstName, lastName, email })
    .then(() => {
        res.redirect('/profile');
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('An error occurred while updating the profile');
    });
});

module.exports = app;