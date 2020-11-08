const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
const postRouter = express.Router();

const Posts = require('../models/posts');

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
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

module.exports = postRouter;