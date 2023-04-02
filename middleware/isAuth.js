const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }

    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try {
        // decode and verify the token. NOW decodedToken contains the ENTIRE json object we passed in postLogin
        decodedToken = jwt.verify(token, 'somesupersupersecret')

    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    // verification failed but worked, so not in catch()
    if (!decodedToken) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    // verification success
    // we can access userId because we are passing it in postLogin
    // storing it in req.userId so that we can use this somewhere else as well
    req.userId = decodedToken.userId;
    next();
}