const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
const postRouter = express.Router();

const Posts = require('../models/posts');
const Groups = require('../models/group');
const Users = require('../models/user'); 

postRouter.use(bodyParser.json());

// const postFilesRouter = require('./postFilesRouter');

// postRouter.use('/postFiles', postFilesRouter);

postRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Posts.find(req.query)
    .populate('author')
    .then((posts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, posts});
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    req.statusCode=403;
    res.end('POST operation not supported on /posts');
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /posts');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Posts.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, resp});
    }, (err) => next(err))
    .catch((err) => next(err));        
});

postRouter.route('/:groupId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) =>{
    Posts.find({'group':req.params.groupId})
    .populate('author')
    // .populate('comments')
    .then((post) => {
        for(var i=0;i<post.length;i++){
            for(var j=0;j<post[i].upvote.length;j++){
                if(post[i].upvote[j].equals(req.user._id)){
                    post[i].upvotebool = true;
                    break;
                }
            }
            post[i].upvotecount = post[i].upvote.length;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, post})
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    if(req.body != null){
        req.body.author = req.user._id;
        req.body.group = req.params.groupId;
        Posts.create(req.body)
        .then((post) => {
            Users.findByIdAndUpdate(req.user._id, {
                $push:{posts: post._id}
            },{new:true}, function(err, result){
                if(err){
                    res.send(err);
                }
            });
            Posts.findById(post._id)
            .populate('author')
            .then((post) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true, post});
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else{
        err = new Error('Post not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /posts/:groupId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Groups.findById(req.params.groupId)
    .then((group) => {
        if(group != null){
            if(!group.admin.equals(req.user._id)){
                var err = new Error('You are not authorized to delete these posts!');
                err.status = 403;
                return next(err);
            }
            Posts.remove({'group':req.params.groupId})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true, resp})
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            err = new Error('Group '+ req.params.groupId + ' not found!');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

postRouter.route('/:groupId/:postId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) => {
    Posts.findById(req.params.postId)
    .populate('author')
    // .populate('comments')
    .then((post) => {
        for(var i=0;i<post.upvote.length;i++){
            if(post.upvote[i].equals(req.user._id)){
                post.upvotebool = true;
            }
        }
        post.upvotecount = post.upvote.length;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, post})
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    req.statusCode=403;
    res.end('POST operation not supported on /posts/:groupId/:postId');
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
    .then((post) => {
        if(post != null){
            if(!post.author.equals(req.user._id)){
                var err = new Error('You are not authorized to update this post!');
                err.status = 403;
                return next(err);
            }
            req.body.author = req.user._id;
            Posts.findByIdAndUpdate(req.params.postId, {
                $set: req.body
            }, {new: true})
            .then((post) => {
                Posts.findById(req.params.postId)
                .populate('author')
                // .populate('comments')
                .then((post) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true, post});
                })
            }, (err) => next(err))
        }
        else{
            err = new Error('Post ' + req.params.postId + ' not found!');
            err.status = 404;
            return next(err); 
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
    .then((post) =>{
        if(post != null){
            if(!post.author.equals(req.user._id)){
                var err = new Error('You are not authorized to delete this post!');
                err.status = 403;
                return next(err);
            }
            Users.findByIdAndUpdate(req.user._id, {
                $pull: {posts: req.params.postId}
            }, {new:true}, function(err, result) {
                if(err){
                    res.send(err);
                }
            });
            Posts.findByIdAndRemove(req.params.postId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true, resp})
            }, (err) => next(err))
        }
        else{
            err = new Error('Post ' + req.params.postId + ' not found!');
            err.status = 404;
            return next(err); 
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

postRouter.route('/:groupId/:postId/upvote')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
    .then((post) =>{
        if(post != null){
            Posts.findByIdAndUpdate(req.params.postId, {
                $push: {upvote: req.user._id},
                $inc: {upvotecount: 1}
            },{new:true})
            .then((post) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true, post})
            }, (err) => next(err));
        }
        else{
            err = new Error('Post ' + req.params.postId + ' not found!');
            err.status = 404;
            return next(err);          
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

postRouter.route('/:groupId/:postId/cancelUpvote')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
    .then((post) =>{
        if(post != null){
            Posts.findByIdAndUpdate(req.params.postId, {
                $pull: {upvote: req.user._id},
                $inc: {upvotecount: -1}
            },{new:true})
            .then((post) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true, post})
            }, (err) => next(err));
        }
        else{
            err = new Error('Post ' + req.params.postId + ' not found!');
            err.status = 404;
            return next(err);          
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

module.exports = postRouter;