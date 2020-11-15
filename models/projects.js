const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

var commentSchemapro = new Schema({
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


const projectSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    description:{
        type: String,
        required: true
    },
    upvote: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    upvotecount: {
        type: Number,
        default: 0
    },
    upvotebool:{
        type: Boolean,
        default:  false
    },
    comments:[commentSchemapro],
    commentcount:{
        type: Number,
        default: 0
    },
    file: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

var Project = mongoose.model('Project', projectSchema);

module.exports = Project;