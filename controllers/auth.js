const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const saltRounds = 12;

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, saltRounds)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created!', userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({ email: email })
        .then(userFound => {
            if (!userFound) {
                const error = new Error("User Doesn't Exist! Please Sign up!")
                error.statusCode = 401;
                throw error;
            }
            // user exists at this point;
            loadedUser = userFound;
            return bcrypt.compare(password, loadedUser.password)
        })
        .then(doesMatch => {
            if (!doesMatch) {
                const error = new Error("Wrong Password. Please try again")
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'somesupersupersecret', { expiresIn: '1h' })
            res.status(200).json({
                message: 'Successfully Signed In!',
                token: token,
                userId: loadedUser._id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(userFound => {
            if (!userFound) {
                const error = new Error("User not found!")
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                status: userFound.status,

            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.updateUserStatus = (req, res, next) => {
    const newStatus = req.body.status;
    User.findById(req.userId)
        .then(userFound => {
            if (!userFound) {
                const error = new Error("User not found!")
                error.statusCode = 404;
                throw error;
            }
            userFound.status = newStatus;
            return userFound.save();
        })
        .then(result => {
            res.status(200).json({
                message: "User Status Updated!",
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}