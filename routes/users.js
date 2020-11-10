var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/user');
var router = express.Router();
var passport=require('passport');
var authenticate=require('../authenticate');
const cors = require('./cors');
const { spawn } = require("child_process");
var uniqueValidator = require('mongoose-unique-validator');


router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )


router.route('/verifyToken')
.get(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=> {
  User.findById(req.user._id)
  .then((user) =>{
  res.statusCode=200;
  res.setHeader('Content-Type','application/json');
  res.json({success: true,userId:user._id,username:user.username,firstname: user.firstname,lastname: user.lastname, imgpath:user.imgname});
  },(err) =>{
    res.redirect('/logout');
    next(err)})
  .catch((err) => next(err));
});

/* GET users listing. */
router.route('/')
.get(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=> {
  User.find({})
	.then((user) =>{
	res.statusCode=200;
	res.setHeader('Content-Type','application/json');
	res.json(user);
	},(err) =>next(err))
	.catch((err) => next(err));
});

router.route('/profile/:userId')
.get(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=> {
  User.findById(req.params.userId)
  .populate('posts')
  .then((user) =>{
      res.statusCode=200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true,userId:user._id,username:user.username,firstname: user.firstname,lastname: user.lastname,admin:user.admin,groups:user.groupsjoined,designation:user.designation,bio:user.bio,rating:user.rating,skills:user.skills,skilldesc:user.skills,experience:user.experience,reviews:user.reviews,imgname:user.imgname,posts:user.posts});
  },(err) => next(err))
    .catch((err) =>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    User.findById(req.params.userId)
    .then((user) => {
        if (user != null) {
           /* if (!user._id.equals(req.user._id)) {
                var err = new Error('You are not authorize to edit other people profile!');
                err.status = 403;
                return next(err);
            }
            console.log(req.body);
      /*      for(var i=0;i<req.body.skills.length;i++)
            {
              var object=req.body.skills[i];
              console.log(object);
            }*/
        //    console.log(req.body.experience);
          //  req.body.admin = req.user._id;
            User.findByIdAndUpdate(req.params.userId, 
              {$set:req.body
           /*   {
                designation:req.body.designation
            ,
                bio:req.body.bio
            ,
              rating:req.body.rating
            ,
            // {
              // $push:{skills:{$each: [req.body.skills]}}
            // }
            // ,
            
              skilldesc:req.body.skilldesc
            ,
  /*          {
                $push:{experience:{$each:[req.body.experience]}}
            }
            ,{
              $push:{reviews:{$each:[req.body.reviews]}}
            }
            ,
            }*/
          },{ new: true })
            .then((user) => {
                User.findById(req.params.userId)
                .then((user) => {
              /*    for(var i=0;i<req.body.skills.length;i++)
                  {
                    var object=req.body.skills[i];
                    user.skills.push(object);
                    console.log(object);
                  }
                   for(var i=0;i<req.body.experience.length;i++)
                  {
                    var object=req.body.experience[i];
                    user.experience.push(object);
                    console.log(object);
                  }
                   for(var i=0;i<req.body.reviews.length;i++)
                  {
                    var object=req.body.reviews[i];
                    user.reviews.push(object);
                    console.log(object);
                  }
                  user.save();*/

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,user}); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('User ' + req.params.userId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

//router.route('/profile/:userId')
//.get()

router.post('/signup',cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true,status: 'Registration Successful!'});
        });
      });
    }
  });
});

router.post('/login',cors.corsWithOptions,passport.authenticate('local'),(req,res,next) =>{
			var token=authenticate.getToken({_id:req.user._id});
			res.statusCode=200;		
			res.setHeader('Content-Type','application/json');
			res.json({success: true,userId:req.user._id,token:token,status:'You are successfully login!'});



 /*   const python = spawn("python", ["./routes/scripts/searchUsers.py", "nauki"]);
      //collects data form the script
      python.stdout.on("data", (data) => {
      console.log("data receiving from python script");
      datatosend = data.toString();
      console.log(`${datatosend}`);
     // res.end(datatosend);
    });
    //close event is emitted when stdio stream of child process has been closed
    python.on("close", (code) => {
      console.log(`child process closes with code ${code}`);
      //res.end(datatosend);
     // res.end(
     //   "Will send all the subdomain to you!" + req.params.domain + datatosend
    //  );
      console.log(`${datatosend}+hi`);
    });*/

});

  

router.route('/search')
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=> {
  argument=req.body.argument;
  console.log(argument);
      const python = spawn("python3", ["./routes/scripts/searchUsers.py", argument]);
      //collects data form the script
      python.stdout.on("data", (data) => {
      console.log("data receiving from python script");
      datatosend = data.toString();

      console.log(`${datatosend}`);
     // res.end(datatosend);
    });
    //close event is emitted when stdio stream of child process has been closed
    python.on("close", (code) => {
      console.log(`child process closes with code ${code}`);
      //res.end(datatosend);
     // res.end(
     //   "Will send all the subdomain to you!" + req.params.domain + datatosend
    //  );
//    datatosend=datatosend.replace(/'/g, '"');
  //  datatosend=stringToJson(datatosend);
   // console.log(`${datatosend}+hi`);

    console.log(JSON.parse(datatosend));
    // User.findById(JSON.parse(datatosend)._id)
    // .then((user)=>{
      user=JSON.parse(datatosend);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true,user});
    // })

    
   //   console.log(`${datatosend}+hi`);
    });
});


router.get('/logout',cors.corsWithOptions,(req,res) =>{
	if(req.session){
		req.session.destroy();
		res.clearCookie('session-id');
    res.statusCode = 200;
//		res.redirect('/');
  res.json({success: true,status: 'Successfully log out!'});

	}
	else{
    res.clearCookie('session-id');
		var err =new Error('You are not logged in');
		err.status =403;
		next(err);
	}

});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

router.route('/:userId/reviews')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
    User.findById(req.params.userId)
    .populate('reviews.author')
    .then((user) => {
        if (user != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user.reviews);
        }
        else {
            err = new Error('User ' + req.params.userId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    User.findById(req.params.userId)
    .then((user) => {
        if (user != null) {
            req.body.author = req.user._id;
            user.reviews.push(req.body);
            user.save()
            .then((user) => {
                User.findById(user._id)
                .populate('reviews.author')
                .then((user) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
                })            
            }, (err) => next(err));
        }
        else {
            err = new Error('User ' + req.params.userId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /users/'
        + req.params.userId + '/reviews');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    User.findById(req.params.userId)
    .then((user) => {
        if (user != null) {
            for (var i = (user.reviews.length -1); i >= 0; i--) {
                user.reviews.id(dish.reviews[i]._id).remove();
            }
            user.save()
            .then((user) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user);                
            }, (err) => next(err));
        }
        else {
            err = new Error('User ' + req.params.userId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});


router.route('/:userId/reviews/:reviewId')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.corsWithOptions,(req,res,next) => {
    User.findById(req.params.userId)
    .populate('reviews.author')
    .then((user) => {
     // console
        if (user != null && user.reviews.id(req.params.reviewId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user.reviews.id(req.params.reviewId));
        }
        else if (user == null) {
            err = new Error('User ' + req.params.userId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Review ' + req.params.reviewId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
  if (user.reviews.id(req.params.reviewId).author._id.equals(req.user._id)) {
                    err = new Error('You are not authorized to edit this review');
                    err.status = 403;
                    return next(err);
                }
    res.statusCode = 403;
    res.end('POST operation not supported on /users/'+ req.params.userId
        + '/reviews/' + req.params.reviewId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    User.findById(req.params.userId)
    .populate('reviews.author')
    .then((user) => {
        if (user != null && user.reviews.id(req.params.reviewId) != null) {
          if (user.reviews.id(req.params.reviewId).author._id.equals(req.user._id)) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
            if (req.body.rating) {
                user.reviews.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                user.reviews.id(req.params.commentId).comment = req.body.comment;                
            }
          user.save()
              .then((user) => {
                  Users.findById(user._id)
                  .populate('reviews.author')
                  .then((user) => {
                       res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(user);  
                    })              
            }, (err) => next(err));
        }
     else if (user == null) {
            err = new Error('User ' + req.params.userId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Review ' + req.params.reviewId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    User.findById(req.params.userId)
    .then((user) => {
        if (user != null && user.reviews.id(req.params.reviewId) != null) {
        if (user.reviews.id(req.params.reviewId).author._id.equals(req.user._id)) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
            user.comments.id(req.params.userId).remove();
          user.save()
              .then((user) => {
                  Users.findById(user._id)
                  .populate('comments.author')
                  .then((user) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(user);  
                  })               
            }, (err) => next(err));
  }
        else if (user == null) {
            err = new Error('User ' + req.params.userId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Review ' + req.params.userId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = router;
