const { validationResult } = require('express-validator')
const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: 'Hello',
                creator: { name: 'Pratham Modi' },
                createdAt: new Date(),
                imageUrl: '/data/images/scenery.png',
                content: 'This is my first post here!',
            }
        ]
    })
}

exports.postPosts = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Failed.');
        error.statusCode = 422;
        throw error;
    }

    const newPost = new Post({
        title: title,
        imageUrl: '/data/images/scenery.png',
        content: content,
        creator: { name: 'Pratham Modi' }
    })

    newPost.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Post creation was successful!',
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}