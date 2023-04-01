require("dotenv").config()

const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGO_DB_URI;

const app = express();
const PORT = 8080;

app.use(bodyParser.json()); // application/json
app.use('/data/images', express.static(path.join(__dirname, '/data/images')));

const feedRoutes = require('./routes/feed')

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes) // now all feedRoutes routes will have /feed at the start

app.use((error,req,res,next) => {
    console.log(error)
    // doing this to throw the correct error;
    const status = error.statusCode || 500; // we are setting this code for every error to throw
    const message = error.message // inbuilt, shows what the error is;
    res.status(status).json({
        message: message
    })
})

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        app.listen(PORT, () => {
            console.log(`Using Port ${PORT}`)
        });
    })
    .catch(err => {
        console.log(err);
    });