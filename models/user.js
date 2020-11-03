var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var passportLocalMongoose=require('passport-local-mongoose');



var User=new Schema({
	firstname:{
		type:String,
		default:''
	},
	lastname:{
		type:String,
		default:''
	},
	imgname:{
		type:String,
		default:''
	},
	admin:{
		type:Boolean,
		default:false
	},
	groupsjoined:[
	{
		id: String,
		name:String,
		description:String
	}]
	,
	designation:{
		type:String,
		default:false,
	},
	bio:{
		type:String,
		default:false,
	},
	rating:{
		type:Number,
		default:false,
	},
	skills:[{
		skillname:String
	}],
	skilldesc:{
		type:String,
		default:false,
	},
	experience:[{
		exp:String,
	}],
//	project:[project],
	reviews:[{
		authorid:String,
		review:String,
		rating:Number
	},{
		timestamps: true
	}],
	facebookId: String,	
//	posts:[posts]
	},
	{
	timestamps: true
	});

User.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',User);
