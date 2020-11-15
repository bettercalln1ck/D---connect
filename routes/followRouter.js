var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/user');
var router = express.Router();
var passport=require('passport');
var authenticate=require('../authenticate');
const cors = require('./cors');

const followRouter = express.Router();

followRouter.use(bodyParser.json());


followRouter.route('/:userId/followers')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    User.findById(req.params.userId)
    .populate('followers')
    .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, followers:users.followers, followersCount: users.followersCount});
    }, (err) => next(err))
    .catch((err) => next(err));
});

followRouter.route('/:userId/following')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    User.findById(req.params.userId)
    .populate('following')
    .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, following:users.following, followingCount: users.followingCount});
    }, (err) => next(err))
    .catch((err) => next(err));
});

followRouter.route('/:userId/follow')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    User.findById(req.params.userId)
    .then((users) => {
        if(users != null){
            if(users._id.equals(req.user._id)){
                err = new Error('You cannot follow your self!');
                err.status = 403;
                return next(err);
            }
            if(users.followers.includes(req.user._id)){
                var err = new Error('You already follow this user!');
                err.status = 403;
                return next(err);
            }
            User.findByIdAndUpdate(req.params.userId, {
                $push: {followers: req.user._id},
                $inc: {followersCount: 1}
            }, {new:true})
            .then((users) => {
                User.findByIdAndUpdate(req.user._id, {
                    $push: {following: req.params.userId},
                    $inc: {followingCount: 1}
                }, {new:true})
                .then((users) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true})
                }, (err) => next(err))
            }, (err) => next(err))
        }
        else{
            err = new Error('User ' + req.params.userId + ' not found!');
            err.status = 404;
            return next(err);          
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

followRouter.route('/:userId/unfollow')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    User.findById(req.params.userId)
    .then((users) => {
        if(users != null){
            if(users._id.equals(req.user._id)){
                err = new Error('You cannot unfollow your self!');
                err.status = 403;
                return next(err);
            }
            if(!users.followers.includes(req.user._id)){
                var err = new Error('You do not follow this user!');
                err.status = 403;
                return next(err);
            }
            User.findByIdAndUpdate(req.params.userId, {
                $pull: {followers: req.user._id},
                $inc: {followersCount: -1}
            }, {new:true})
            .then((users) => {
                User.findByIdAndUpdate(req.user._id, {
                    $pull: {following: req.params.userId},
                    $inc: {followingCount: -1}
                }, {new:true})
                .then((users) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true})
                }, (err) => next(err))
            }, (err) => next(err))
        }
        else{
            err = new Error('User ' + req.params.userId + ' not found!');
            err.status = 404;
            return next(err);          
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = followRouter;

// 5fb199445a4b00472c11fd93 ishan
// 5fb1994c5a4b00472c11fd94 nauki
// 5fb199545a4b00472c11fd95 nikhil
// 5fb1995b5a4b00472c11fd96 vishal

