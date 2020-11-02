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
	}],
	facebookId: String,	
});

User.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',User);
