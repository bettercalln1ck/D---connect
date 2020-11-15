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

projectRouter.route('/')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
    Project.find({})
    .populate('comments.author')
    .then((project) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(project);
    }, (err) => next(err))
    .catch((err) => next(err));
})


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
	if(Project.find({name:req.body.name})==null)
	{
			Project.create(req.body)
			.then((project)=>{
				console.log('Project Created ', project);
        		res.statusCode = 200;
        		res.setHeader('Content-Type', 'application/json');
        		res.json({success:true,project});
			}, (err) => next(err))
			.catch((err) => next(err));	
			}else
			{
				err = new Error('Project already by this name');
        		err.status = 404;
        		return next(err);
			}	
});

projectRouter.route('/:projectId')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Project.findById(req.params.projectId)	
    .populate('comments.author')
    .then((project) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,project});
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /project/'+ req.params.projectId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Project.findByIdAndUpdate(req.params.projectId, {
        $set: req.body
    }, { new: true })
    .then((project) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,project});
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Project.findByIdAndRemove(req.params.projectId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,resp});
    }, (err) => next(err))
    .catch((err) => next(err));
});

projectRouter.route('/:projectId/comments')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
    Project.findById(req.params.projectId)
    .populate('comments.author')
    .then((project) => {
        if (project != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(project.comments);
        }
        else {
            err = new Error('Project ' + req.params.projectId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Project.findById(req.params.projectId)
    .then((project) => {
        if (project != null) {
            req.body.author = req.user._id;
            project.comments.push(req.body);
            project.save()
            .then((project) => {
                Project.findById(project._id)
                .populate('comments.author')
                .then((project) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(project);
                })            
            }, (err) => next(err));
        }
        else {
            err = new Error('Project ' + req.params.projectId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /project/'
        + req.params.projectId + '/project');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Project.findById(req.params.projectId)
    .then((project) => {
        if (project != null) {
            for (var i = (project.comments.length -1); i >= 0; i--) {
                project.comments.id(project.comments[i]._id).remove();
            }
            project.save()
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Project ' + req.params.projectId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

projectRouter.route('/:projectId/comments/:commentId')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.corsWithOptions,(req,res,next) => {
    Project.findById(req.params.projectId)
    .populate('comments.author')
    .then((project) => {
        if (project != null && project.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(project.comments.id(req.params.commentId));
        }
        else if (project == null) {
            err = new Error('project ' + req.params.projectId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
  if (project.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
    res.statusCode = 403;
    res.end('POST operation not supported on /project/'+ req.params.projectId
        + '/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Project.findById(req.params.projectId)
    .then((project) => {
        if (project != null && project.comments.id(req.params.commentId) != null) {
          if (!project.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
            if (req.body.rating) {
                project.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                project.comments.id(req.params.commentId).comment = req.body.comment;                
            }
        	project.save()
            	.then((project) => {
                	Project.findById(project._id)
                	.populate('comments.author')
                	.then((project) => {
                   		 res.statusCode = 200;
                    		res.setHeader('Content-Type', 'application/json');
                    		res.json(project);  
                		})              
            }, (err) => next(err));
        }
	   else if (project == null) {
            err = new Error('project ' + req.params.projectId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Project.findById(req.params.projectId)
    .then((project) => {
        if (project != null && project.comments.id(req.params.commentId) != null) {
        if (!project.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
            project.comments.id(req.params.commentId).remove();
        	project.save()
            	.then((project) => {
                	Project.findById(project._id)
                	.populate('comments.author')
                	.then((project) => {
                    		res.statusCode = 200;
                    		res.setHeader('Content-Type', 'application/json');
                    		res.json(project);  
                	})               
            }, (err) => next(err));
	}
        else if (project == null) {
            err = new Error('project ' + req.params.projectId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



projectRouter.route('/:projectId/upvote')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Project.findById(req.params.postId)
    .then((project) =>{
        if(project != null){
            Project.findByIdAndUpdate(req.params.projectId, 
            	{$set: {description:req.body.description}}
            	,{new:true})
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,project})
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

