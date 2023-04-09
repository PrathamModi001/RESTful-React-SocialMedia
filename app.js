require("dotenv").config()

const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const multer = require('multer');
const cors = require('cors');

const MONGODB_URI = process.env.MONGO_DB_URI;

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
app.use(cors())
const PORT = 8080;

//multer configs
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './data/images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json()); // application/json being served because RESTful
// multer middleware
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
// static serving of images
app.use('/data/images', express.static(path.join(__dirname, '/data/images')));

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes) // now all feedRoutes routes will have /feed at the start
app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
    console.log(error)
    // doing this to throw the correct error;
    const status = error.statusCode || 500; // we are setting this code for every error to throw
    const data = error.data;
    const message = error.message // inbuilt, shows what the error is;
    res.status(status).json({
        message: message,
        data: data
    })
})

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        server.listen(PORT, () => {
            console.log(`Using Port ${PORT}`)
        });
        io.on('connection', socket => {
            console.log('Socket Connected!')
        })
    })
    .catch(err => {
        console.log(err);
    });