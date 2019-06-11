const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const auth = require('../../middleware/auth');
const Posts = require('../../models/Posts');
const Profiles = require('../../models/Profiles');
const User = require('../../models/User');

router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try{
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Posts({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
    })
    const post = await newPost.save();
    res.json(post);

    }catch(err){
        console.err(err.message);
        res.status(500).json({msg:'Server Error'});
    }

});

router.get('/', auth , async(req,res)=>{
    try{
        const posts = await Posts.find().sort({date: -1});
        res.json(posts);
    }catch(err){
        console.error(err.message);
        res.status(500).json({msg:'server error'})
    }
});

router.get('/:id', auth , async(req,res)=>{
    try{
        const post = await Posts.findById(req.params.id);
        res.json(post);

        if(!post){
            return res.status(403).json({msg:'Post not found'});
        }

    }catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(403).json({msg:'Post not found'});
        }
        res.status(500).json({msg:'server error'})
    }
});

router.delete('/:id', auth , async(req,res)=>{
    try{
        const post = await Posts.findById(req.params.id);
        if(post.user.toString() != req.user.id){
            return res.status(401).json({msg:'User not authorized'})
        }
        await post.remove();
        res.status(200).json('Post Deleted');
    }catch(err){
        console.error(err.message);
        res.status(500).json({msg:'server error'})
    }
});

router.put('/like/:id', auth, async(req,res) => {
    try{
        const post = await Posts.findById(req.params.id);
        //check if the post is liked already
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: 'post already liked'})
        }
        post.likes.unshift({user:req.user.id});
        await post.save();

        res.json(post.likes)

    }catch(err){
        console.error(err.message);
        res.status(500).json({msg:'Server Error'});
    }
})

router.put('/unlike/:id', auth, async(req,res) => {
    try{
        const post = await Posts.findById(req.params.id);
        //check if the post is liked already
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg: 'post has not liked'})
        }
        const removeIndex = post.likes.map(like => like.user.toString().indexOf(req.user.id))
        post.likes.splice(removeIndex, 1)
        await post.save();

        res.json(post.likes)

    }catch(err){
        console.error(err.message);
        res.status(500).json({msg:'Server Error'});
    }
})

router.post('/comment/:id', [ auth, [
    check('text', 'Text is required').not().isEmpty()
    ]], async(req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        try{
            const post = await Posts.findById(req.params.id);
            const user = await User.findById(req.user.id).select('-password');

            const newCommnet = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }
            
            post.comments.unshift(newCommnet)

            await post.save();
            res.json(post.comments)
            
    
        }catch(err){
            console.error(err.message);
            res.status(500).json({msg:'Server Error'});
        }
    })

router.delete('/comment/:id/:comment_id', auth , async(req,res)=>{
        try{
            const post = await Posts.findById(req.params.id);
            const comment = post.comments.find(comment=> comment.id === req.params.comment_id);

            if(!comment){
                return res.status(401).json({msg:'Comment does not exists'});
            }
            if(comment.user.toString() === req.user.id){
                return res.status(401).json({msg:'User not authorized'});
            }
            
            const removeIndex = post.comments.map(comment => comment.user.toString().indexOf(req.user.id))
            post.comments.splice(removeIndex, 1)
            await post.save();

            res.json(post.comments)

        }catch(err){
            console.error(err.message);
            res.status(500).json({msg:'server error'})
        }
    });

module.exports = router;