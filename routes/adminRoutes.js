const express = require('express');
const router = express.Router();

const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const CommentModel = require('../models/CommentModel');

function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Unauthorized');
    }
}

//  LOAD ADMIN MENU
router.get('/admin', isAdmin, (req, res) => {
    UserModel.find().then(users => {
        PostModel.find().populate('username').then(posts => {
            res.render('admin-menu', { users: users, posts: posts });
        });
    });
});

//  DELETE POST
router.delete('/admin/post/:id', isAdmin, (req, res) => {
    PostModel.findByIdAndDelete(req.params.id).then(() => {
        res.redirect('/admin');
    });
});


//  BAN USER
router.put('/admin/user/:id/ban', isAdmin, (req, res) => {
    UserModel.findByIdAndUpdate(req.params.id, { banned: true }).then(() => {
        res.redirect('/admin');
    });
});

//  UNBAN USER
router.put('/admin/user/:id/unban', isAdmin, (req, res) => {
    UserModel.findByIdAndUpdate(req.params.id, { banned: false }).then(() => {
        res.redirect('/admin');
    });
});

module.exports = router;
