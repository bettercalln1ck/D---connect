var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var passportLocalMongoose=require('passport-local-mongoose');

var project = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: mongoose.Schema.Types.ObjectId,
	ref: 'User'
    }
}, {
    timestamps: true
});

var reviewSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    review:  {
        type: String,
        required: true
    },
    author:  {
        type: mongoose.Schema.Types.ObjectId,
	ref: 'User'
    }
}, {
    timestamps: true
});


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
		default:'',
	},
	bio:{
		type:String,
		default:'',
	},
	rating:{
		type:Number,
		default:0
	},
	skills: {"type": "array",
   "contains": {
     "type": "number"
   }},
	skilldesc:{
		type:String,
		default:false
	},
	experience:[{
		exp:String,
		default:''
	}],
//	project:[project],
	reviews:[reviewSchema],
	facebookId: String,	
//	posts:[posts]
	},
	{
	timestamps: true
	});

User.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',User);
