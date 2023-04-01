const express = require('express');
const { check, body } = require('express-validator')

const router = express.Router();

const feedController = require('../controllers/feed')

// GET /feed/posts
router.get('/posts', feedController.getPosts)

// POST /feed/posts
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

// GET /feed/post/:postId
router.get('/post/:postId', feedController.getSinglePost)

module.exports = router;