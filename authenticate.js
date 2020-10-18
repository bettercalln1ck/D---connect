var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var User=require('./models/user');
var JwtStrategy=require('passport-jwt').Strategy;
var ExtractJwt= require('passport-jwt').ExtractJwt;
var jwt=require('jsonwebtoken');

var config=require('./config');


exports.local=passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken=function(user){
	return jwt.sign(user,config.secretKey,
		{expiresIn: 360000});
};

var opts={};

opts.jwtFromRequest=ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey=config.secretKey;

exports.jwtPassport=passport.use(new JwtStrategy(opts,
	(jwt_payload,done) => {
	console.log("JWT payload: ",jwt_payload);
	User.findOne({_id: jwt_payload._id},(err,user) =>{
	if (err){
		return done(err,false);
	}else if(user){
		return done(null,user);
	}
	else{
		return done(null,false);
	}

	})
	}));

exports.verifyUser=passport.authenticate('jwt',{session:false});

exports.verifyAdmin=(req,res,next)=>{
	if(req.user.admin){
	next();
	} else{
	var err=new Error('You are not admin');
	err.status=403;
	next(err);
	}
};

/*exports.verifyOrdinaryUser=(req,res,next)=>{
Dishes.find({"comments.id" : req.params.commentId},{"comments.$" :1} )	
.then((dish) => {
	console.log(dish.comments);
	if(req.user._id.equals(dish.comments.author.id))
	{
		next();
	}else{
	var err=new Error('You are not authorised user');
	err.status=403;
	next(err);	
	}
}, (err) => next(err))
    .catch((err) => next(err));
};*/


	
