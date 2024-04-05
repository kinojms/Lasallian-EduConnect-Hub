const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const bodyParse = require('body-parser');
const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const routes = require('./routes/route');

// const postController = require('./controllers/postController');

const app = express();

// MONGO_URL="mongodb://localhost:27017/MCO";
mongoose.connect('mongodb://localhost:27017/MCO');

// Create an instance of express-handlebars
const hbs = exphbs.create({ 
    extname: '.hbs',
    layoutsDir: __dirname + '/views/layouts/', // Set the layouts directory
    defaultLayout: false, // Disable default layout
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    }
});


app.set("view engine", "ejs");
require('dotenv').config();

// Set Handlebars as the view engine
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to setup sessions
app.use(session({
    secret: 'Lazy Lucy',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/MCO' }),
    cookie: { secure: false } // Note: secure should be set to true when in a production environment
}));

// Middleware for Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Middleware for Authentication Status
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

// USER ROUTES FOR SIGNUP/LOGIN
app.use('/', userRoutes);

app.use('/', postRoutes);

app.use('/', routes);

// LISTENING ON PORT 3000
app.listen(3000, () => {
    console.log("Server is running");
});
