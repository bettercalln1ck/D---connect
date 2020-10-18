const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');
const groupRouter = express.Router();
var mongoosePaginate = require('mongoose-paginate');
const Groups = require('../models/groups');
var users = require('../models/user'); 


Groups.plugin(mongoosePaginate);

groupRouter.use(bodyParser.json());

groupRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
	Groups.paginate({},1,10)
    Groups.find(req.query)
    .populate('admin')
    .populate('users')
    .then((groups) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(groups.documents);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.admin = req.user._id;
        req.body.users = req.user._id;
        Groups.create(req.body)
        .then((group) => {
            Groups.findById(group._id)
            .populate('admin')
            .populate('users')
            .then((group) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(group);
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
    Groups.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));        
});



module.exports = groupRouter;