const express = require('express');
const hbs = require('hbs');
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

const app = express();

const uri = "mongodb+srv://tsukino:uElnJfxOaCI5Vspj@mco.qpmivzx.mongodb.net/?retryWrites=true&w=majority&appName=MCO";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

mongoose.connect(uri, clientOptions).then(() => {
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.set("view engine", "ejs");
require('dotenv').config();

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.json());

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'Lazy Lucy',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: uri }),
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.use('/', userRoutes);

app.use('/', postRoutes);

app.use('/', routes);

app.listen(3000, () => {
    console.log("Server is running");
});
