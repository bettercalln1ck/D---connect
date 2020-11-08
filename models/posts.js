const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


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
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    file: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

var Posts = mongoose.model('Post', postSchema);

module.exports = Posts;