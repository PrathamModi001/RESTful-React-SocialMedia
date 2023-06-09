const express = require('express');
const { body } = require('express-validator')

const router = express.Router();

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/isAuth')

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts)

// POST /feed/posts
router.post('/posts', isAuth,
    [
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
router.get('/posts/:postId', isAuth, feedController.getSinglePost)

// GET /feed/update
router.put('/post/:postId', isAuth,
    [
        body('title', 'Please enter a valid title')
            .isString()
            .isLength({ min: 5 })
            .trim(),

        body('content', 'Please enter a valid content field')
            .isString()
            .isLength({ min: 5 })
            .trim(),

    ], feedController.updatePost)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router;