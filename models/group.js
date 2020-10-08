var mongoose=require('mongoose');
var Schema=mongoose.Schema,
User=require('./user')

var groupSchema=new Schema({
	description:{
		type:String,
		default:'',
		trim: true
	},
	created:{
		type:Date,
		default:Date.now
	},
	User:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'User'
	}},{
		timestamps:true
});

module.exports=mongoose.model('Groups',groupSchema);
