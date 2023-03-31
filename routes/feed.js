const express = require('express');
const { check, body } = require('express-validator')

const router = express.Router();

const feedController = require('../controllers/feed')

// GET and POST /feed/posts
router.get('/posts', feedController.getPosts)
router.post('/posts', [
    body('title', 'Please enter a valid title')
        .isString()
        .isLength({ min: 5 })
        .trim(),

    body('content', 'Please enter a valid content field')
        .isString()
        .isLength({ min: 5 })
        .trim(),

], feedController.postPosts)

module.exports = router;