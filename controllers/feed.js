const { validationResult } = require('express-validator')
const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
    Post.find()
        .then(posts => {
            res.status(200).json({
                message: 'Posts Fetched Successfully',
                posts: posts
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
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

exports.getSinglePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("The Post doesn't exist!");
                error.statusCode = 404;
                next(error);
            }
            res.status(200).json({
                message: 'Post Fetched Successfully',
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
};