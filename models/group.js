const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var uniqueValidator = require('mongoose-unique-validator');

// var chatSchema = new Schema(
//   {
//     message: {
//       type: String
//     },
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     }
//   },
//   {
//     timestamps: true
//   }
// );

var groupSchema = new Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    name: {
        type: String,
        required: true,
        unique:true,
        dropDups: true
    },
    description:{
        type: String,
        default: ''
    },
    file: {
        type:String,
        default: ''
    }
   // ,
  //  chat:[chatSchema]
}, {
    timestamps: true
});

groupSchema.plugin(mongoosePaginate);
groupSchema.plugin(uniqueValidator);

var Groups = mongoose.model('Group', groupSchema);

module.exports = Groups;