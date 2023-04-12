const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const saltRounds = 12;

exports.signup = async (req, res, next) => {
    try {
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
        const hashedPw = await bcrypt.hash(password, saltRounds)
        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        const result = await user.save();
        res.status(201).json({ message: 'User created!', userId: result._id });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.postLogin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        let loadedUser;

        const userFound = await User.findOne({ email: email })
        if (!userFound) {
            const error = new Error("User Doesn't Exist! Please Sign up!")
            error.statusCode = 401;
            throw error;
        }
        // user exists at this point;
        loadedUser = userFound;
        const doesMatch = await bcrypt.compare(password, loadedUser.password)
        if (!doesMatch) {
            const error = new Error("Wrong Password. Please try again")
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'somesupersupersecret', { expiresIn: '1h' })
        return res.status(200).json({
            message: 'Successfully Signed In!',
            token: token,
            userId: loadedUser._id.toString()
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}

exports.getStatus = async (req, res, next) => {
    try {
        const userFound = await User.findById(req.userId)
        if (!userFound) {
            const error = new Error("User not found!")
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json({
            status: userFound.status,
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}

exports.updateUserStatus = async (req, res, next) => {
    try {
        const newStatus = req.body.status;
        const userFound = await User.findById(req.userId)
        if (!userFound) {
            const error = new Error("User not found!")
            error.statusCode = 404;
            throw error;
        }
        userFound.status = newStatus;
        await userFound.save();
        res.status(200).json({
            message: "User Status Updated!",
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}