const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
const projectRouter = express.Router();
const fetch = require('node-fetch');

const Project = require('../models/projects');
const Users = require('../models/user'); 

projectRouter.use(bodyParser.json());



projectRouter.route('/githubusername')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
	Users.findByIdAndUpdate(req.user._id, 
              {$set: {githubusername:req.body.githubusername}
          		},{ new: true }).then((user)=>{
          		   res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,user}); 
                }, (err) => next(err));

});

projectRouter.route('/addProject')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
	url="https://api.github.com/users/"+req.user.githubusername+"/repos";
	fetch(url)
	.then(response => response.json())
  	.then(data => {
    	projects=[];
    	for(var i=0;i<data.length;i++)
    	{
    		projects.push(data[i].name);
    	}
    	res.json({success:true, projects});
  	})
  .catch(err => next(err));
  /*  Project.find({}).sort({'updatedAt':-1})
    .then((project) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true, project});
    }, (err) => next(err))
    .catch((err) => next(err));*/
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{				
});


projectRouter.route('/:projectId/upvote')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Project.findById(req.params.postId)
    .then((project) =>{
        if(project != null){
            Project.findByIdAndUpdate(req.params.projectId, {
                $push: {upvote: req.user._id},
                $inc: {upvotecount: 1}
            },{new:true})
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true})
            }, (err) => next(err));
        }
        else{
            err = new Error('Project ' + req.params.projectId + ' not found!');
            err.status = 404;
            return next(err);          
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

projectRouter.route('/:projectId/cancelUpvote')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Project.findById(req.params.projectId)
    .then((project) =>{
        if(project != null){
            Project.findByIdAndUpdate(req.params.projectId, {
                $pull: {upvote: req.user._id},
                $inc: {upvotecount: -1}
            },{new:true})
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true})
            }, (err) => next(err));
        }
        else{
            err = new Error('Project ' + req.params.projectId + ' not found!');
            err.status = 404;
            return next(err);          
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = projectRouter;

