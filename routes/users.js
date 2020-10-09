var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/user');
var router = express.Router();
var passport=require('passport');
var authenticate=require('../authenticate');
const cors = require('./cors');


router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )


router.route('/verifyToken')
.get(cors.corsWithOptions,authenticate.verifyUser,(req, res, next)=> {
  User.findById(req.user._id)
  .then((user) =>{
  res.statusCode=200;
  res.setHeader('Content-Type','application/json');
  res.json({success: true,userId:user._id,username:user.username,firstname: user.firstname,lastname: user.lastname});
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
  .then((user) =>{
      res.statusCode=200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
  },(err) => next(err))
    .catch((err) =>next(err));
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
          res.json({success: true, userId:user._id,username:user.username,status: 'Registration Successful!'});
        });
      });
    }
  });
});

router.post('/login',cors.corsWithOptions,passport.authenticate('local'),(req,res,next) =>{
			var token=authenticate.getToken({_id:req.user._id});
			res.statusCode=200;		
			res.setHeader('Content-Type','application/json');
			res.json({success: true,userId:req.user._id,username:req.user.username,firstname: req.user.firstname,lastname: req.user.lastname,
  token:token,status:'You are successfully login!'});
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

module.exports = router;
