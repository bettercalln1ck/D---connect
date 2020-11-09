const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
// var uniqueValidator = require('mongoose-unique-validator');


const postSchema = new Schema({
    message: {
        type: String,
        default: ''
    },
    title:{
        type: String,
        required: true
    },
    author:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upvote: [{
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        dropDups: true,
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
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    // comments:[{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Comment'
    // }],
    file: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// postSchema.plugin(uniqueValidator);

var Posts = mongoose.model('Post', postSchema);

module.exports = Posts;