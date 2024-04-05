const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const validator = require('validator');

function validateEmail(email) {
    return validator.isEmail(email);
}

passport.use(new LocalStrategy(
    function(username, password, done) {
      UserModel.findOne({ username: username })
        .then(user => {
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          bcrypt.compare(password, user.password)
            .then(isMatch => {
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Incorrect password.' });
              }
            })
            .catch(err => done(err));
        })
        .catch(err => done(err));
    }
));  

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  UserModel.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err);
    });
});
  

exports.signup = async (req, res, next) => {
    const { email, lastName, firstName, username, password } = req.body;

    if (!email || !lastName || !firstName || !username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    UserModel.findOne({ username: username }).then(existingUser => {
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        } else {
            bcrypt.hash(password, 10).then(hashedPassword => {
                const newUser = new UserModel({
                    email: email,
                    lastName: lastName,
                    firstName: firstName,
                    username: username,
                    password: hashedPassword
                });

                newUser.save().then(savedUser => {
                    req.login(savedUser, function(err) {
                        if (err) { return next(err); }
                        // Return a JSON response instead of redirecting
                        return res.json({ message: "Account created successfully!" });
                    });
                }).catch(err => {
                    console.error("Error saving user:", err);
                    res.status(500).json({ message: "Internal server error" });
                });
            });
        }
    }).catch(err => {
        console.error("Error finding user:", err);
        res.status(500).json({ message: "Internal server error" });
    });
};

exports.login = (req, res) => {
  res.json({ message: "Login successful!", loggedInUser: req.user });
};

exports.updatePassword = (req, res) => {
  if (!req.session.user || !req.session.user.username) {
    return res.status(400).json({ message: "User not logged in." });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required." });
  }

  const username = req.session.user.username;

  UserModel.findOne({ username: username }).then(user => {
      if (!user) {
          return res.status(404).json({ message: "Username not found." });
      }

      bcrypt.compare(currentPassword, user.password).then(isMatch => {
          if (isMatch) {
              bcrypt.hash(newPassword, 10).then(hashedPassword => {
                  user.password = hashedPassword;
                  user.save().then(() => {
                      res.json({ message: "Password updated successfully!" });
                  }).catch(err => {
                      console.error("Error saving user:", err);
                      res.status(500).json({ message: "Internal server error" });
                  });
              });
          } else {
              return res.status(401).json({ message: "Incorrect current password." });
          }
      }).catch(err => {
          console.error("Error comparing passwords:", err);
          res.status(500).json({ message: "Internal server error" });
      });
  }).catch(err => {
      console.error("Error finding user:", err);
      res.status(500).json({ message: "Internal server error" });
  });
};

