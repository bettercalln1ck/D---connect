const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');
const groupRouter = express.Router();
var mongoosePaginate = require('mongoose-paginate');
const Groups = require('../models/group');
var users = require('../models/user'); 



groupRouter.use(bodyParser.json());

var options = {
  sort: { created_at: -1 },
  populate: 'users',
  populate: 'admin',
  lean: true,
  offset: 0, 
  limit: 10
};

groupRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
	Groups.paginate({},options)   
 //   .populate('admin')
 //   .populate('users')
    .then((pageCount, paginatedResults) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        console.log('Pages:', pageCount);
    	console.log(paginatedResults);
        res.json({success:true,pageCount});
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.admin = req.user._id;
        req.body.users = req.user._id;
     /*   Groups.findOne({"name":req.body.name})
        .then((group) =>{
        err = new Error('Group already availbale by this name');
        err.status = 404;
        return next(err);
        })*/  
        Groups.create(req.body)
        .then((group) => {
            Groups.findById(group._id)
            .populate('admin')
            .populate('users')
            .then((group) => {
                 users.findByIdAndUpdate(req.user._id, {
                $push: {groupsjoined: {"id":req.params.groupId,"name":group.name,"description":group.description}}
                },{new:true}, function(err, result) {
                if (err) {
                res.send(err);
                }
                });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,group});
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Group not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /groups');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
    res.end('PUT operation not supported on /groups');	        
});

groupRouter.route('/:groupId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    Groups.findById(req.params.groupId)
    .populate('admin')
    .populate('users')
    .then((group) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,group});
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, (req,res,next) => {
    req.statusCode=403;
    res.end('POST operation not supported on /groups/');
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Groups.findById(req.params.groupId)
    .then((group) => {
        if (group != null) {
            if (!group.admin.equals(req.user._id)) {
                var err = new Error('You are not authorized to update this group info!');
                err.status = 403;
                return next(err);
            }
            req.body.admin = req.user._id;
            Groups.findByIdAndUpdate(req.params.groupId, {
                $set: req.body
            }, { new: true })
            .then((group) => {
                Groups.findById(group._id)
                .populate('admin')
                .populate('users')
                .then((group) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,group}); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('Group ' + req.params.groupId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Groups.findById(req.params.groupId)
    .then((group) => {
        if (group != null) {
            if (!group.admin.equals(req.user._id)) {
                var err = new Error('You are not authorized to delete this notice!');
                err.status = 403;
                return next(err);
            }
            Groups.findByIdAndRemove(req.params.groupId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Group ' + req.params.groupId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

groupRouter.route('/joinGroup/:groupId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Groups.findById(req.params.groupId)
    .then((group) =>{
       console.log(group.users);

 /*      Groups.find({users:{$in:[req.user._id]}})
       .then((gr)=>{
         err = new Error('User already in this group');
            err.status = 404;
         //   next(err);
            res.send(err);
        });
    /*    if(req.user._id.equals(group.users.user._id))
        {
        err = new Error('user already in this group');
        err.status = 404;
        return next(err);
        }*/
        users.findByIdAndUpdate(req.user._id, {
            $push: {groupsjoined: {"id":req.params.groupId,"name":group.name,"description":group.description}}
        },{new:true}, function(err, result) {
            if (err) {
              res.send(err);
            }
        });
        Groups.findByIdAndUpdate(req.params.groupId, {
            $push: {users: req.user._id}
        },{new: true})
        .then((group) => {
            Groups.findById(req.params.groupId)
            .populate('admin')
            .populate('users')
            .then((group) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,group});  
            },(err)=>next(err))
        .catch((err)=>next(err))
        })
    }, (err) => next(err))
    .catch((err) => next(err));
});

groupRouter.route('/:groupId/chat')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Groups.findById(req.params.groupId)
    .populate('chat.sender')
    .then((group) =>{
        if (group!= null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(group.chat);
        }
        else {
            err = new Error('Group' + req.params.groupId + ' not found');
            err.status = 404;
            return next(err);
        }

    },(err) => next(err))
    .catch((err) => next(err));
});

module.exports = groupRouter;