const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path')

const Post = require('../models/post');
const fileHelper = require('../util/file')

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

    if (!req.file) { // if image does not exist
        const error = new Error("Not an Image");
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = req.file.path

    const newPost = new Post({
        title: title,
        imageUrl: imageUrl,
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

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Failed.');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image; // not updating the image;

    if (req.file) { // a new file was picked 
        imageUrl = req.file.path
    }

    if (!imageUrl) { // if there is no imageUrl till now, throw an error
        const error = new Error('No File Picked!')
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post Not Found')
                error.statusCode = 404;
                throw error;
            }
            // deleting old image if we select a new one
            if (imageUrl !== post.imageUrl) {
                fileHelper.deleteFile(post.imageUrl);
            }

            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl
            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'Post Updated Successfully!',
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

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('Post Not Found')
                error.statusCode = 500
                throw error;
            }
            fileHelper.deleteFile(post.imageUrl);
            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            res.status(200).json({
                message: 'Post Deleted Successfully',
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