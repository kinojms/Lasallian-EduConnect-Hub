const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const passport = require('passport');

router.post("/signup", userController.signup);

router.post("/login", passport.authenticate('local', { failureRedirect: '/login' }), userController.login);

module.exports = router;
