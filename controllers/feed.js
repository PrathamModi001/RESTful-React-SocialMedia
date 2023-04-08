const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path')

const Post = require('../models/post');
const User = require('../models/user')
const fileHelper = require('../util/file')

exports.getPosts = async (req, res, next) => {
    try {
        const currentPage = req.query.page || 1;
        const perPage = 2;
        let totalItems;
        totalItems = await Post.find().countDocuments()
        const posts = await Post.find().skip((currentPage - 1) * perPage).limit(perPage)

        return res.status(200).json({
            message: 'Posts Fetched Successfully',
            posts: posts,
            totalItems: totalItems
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.postPosts = async (req, res, next) => {
    try {
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

        const title = req.body.title;
        const content = req.body.content;
        const imageUrl = req.file.path

        const newPost = new Post({
            title: title,
            imageUrl: imageUrl,
            content: content,
            creator: req.userId
        })

        await newPost.save()
        const userFound = await User.findById(req.userId);

        userFound.posts.push(newPost);
        await userFound.save();

        return res.status(201).json({
            message: 'Post creation was successful!',
            post: newPost,
            creator: { _id: userFound._id, name: userFound.name }
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.getSinglePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error("The Post doesn't exist!");
            error.statusCode = 404;
            next(error);
        }
        return res.status(200).json({
            message: 'Post Fetched Successfully',
            post: post
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
};

exports.updatePost = async (req, res, next) => {
    try {
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

        const post = await Post.findById(postId)

        if (!post) {
            const error = new Error('Post Not Found')
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString !== req.userId) {
            const error = new Error('You are NOT the creator of this post!')
            error.statusCode = 403;
            throw error;
        }
        // deleting old image if we select a new one
        if (imageUrl !== post.imageUrl) {
            fileHelper.deleteFile(post.imageUrl);
        }

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl
        const result = await post.save()
        return res.status(200).json({
            message: 'Post Updated Successfully!',
            post: result
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }

}

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId)

        if (!post) {
            const error = new Error('Post Not Found')
            error.statusCode = 500
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('You are NOT the creator of this post!')
            error.statusCode = 403;
            throw error;
        }

        // deleting the image from the imgs dir
        fileHelper.deleteFile(post.imageUrl);

        await Post.findByIdAndRemove(postId)

        const userFound = await User.findById(req.userId)
        userFound.posts.pull(postId)
        
        await userFound.save();
        return res.status(200).json({
            message: 'Post Deleted Successfully',
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}