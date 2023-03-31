const {validationResult} = require('express-validator')

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: 'Hello',
                creator: { name: 'Pratham Modi'},
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

    if(!errors.isEmpty()){
        return res.status(422).json({
            message: 'Input Validation Failed.',
            errors: errors.array()
        })
    }
    
    // CREATE A POST IN A DB

    res.status(201).json({
        message: 'Post creation was successful!',
        post: { _id: new Date().toISOString(), 
            title: title, 
            content: content, 
            creator: { name: 'Pratham Modi'},
            createdAt: new Date(),
        }
    })
}