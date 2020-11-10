const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
const commentRouter = express.Router();

const Posts = require('../models/posts');
const Groups = require('../models/group');
const Users = require('../models/user'); 
const Comments = require('../models/comments');

commentRouter.use(bodyParser.json());

commentRouter.route('/:postId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) => {
    Comments.find({'post': req.params.postId})
    .populate('author')
    .then((comment) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, comment})
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    if(req.body != null){
        req.body.author = req.user._id;
        req.body.post = req.params.postId;
        Comments.create(req.body)
        .then((comment) => {
            Posts.findByIdAndUpdate(req.params.postId, {
                $push: {comments: comment._id},
                $inc: {commentcount: 1}
            }, {new:true}, function(err, result){
                if(err){
                    res.send(err);
                }
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success:true});
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else{
        err = new Error('Comment not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments/:postId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Posts.findById(req.params.postId)
    .then((post) => {
        if(post != null){
            if(!post.author.equals(req.user._id)){
                var err = new Error('You are not authorized to delete these comments!');
                err.status = 403;
                return next(err);
            }
            Comments.remove({'post' : req.params.postId})
            .then((resp) => {
                Posts.findByIdAndUpdate(req.params.postId, {
                    $set: {comments : [ ]},
                    $set: {commentcount : 0}
                }, {new:true}, function(err, result){
                    if(err){
                        res.send(err);
                    }
                });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true})
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            err = new Error('Post '+ req.params.postId + ' not found!');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

commentRouter.route('/:postId/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) => {
    Comments.findById(req.params.commentId)
    .populate('author')
    .then((comment) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, comment})
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /comments/:postId/'+ req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if(comment != null){
            if(!comment.author.equals(req.user._id)){
                var err = new Error('You are not authorized to update this comment!');
                err.status = 403;
                return next(err);
            }
            req.body.author = req.user._id;
            Comments.findByIdAndUpdate(req.params.commentId, {
                $set: req.body
            }, {new : true})
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true})
            }, (err) => next(err));
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found!');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if(comment != null){
            if(!comment.author.equals(req.user._id)){
                var err = new Error('You are not authorized to delete this post!');
                err.status = 403;
                return next(err);
            }
            Posts.findByIdAndUpdate(req.params.postId, {
                $pull: {comments: req.params.commentId},
                $inc: {commentcount: -1}
            }, {new:true}, function(err, result) {
                if(err){
                    res.send(err);
                }
            });
            Comments.findByIdAndRemove(req.params.commentId)
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true})
            }, (err) => next(err))
        }
        else{
            err = new Error('Comment ' + req.params.commentId + ' not found!');
            err.status = 404;
            return next(err); 
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = commentRouter;