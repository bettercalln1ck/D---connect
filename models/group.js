const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        required: true
    },
    description:{
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

var Groups = mongoose.model('Group', groupSchema);

module.exports = Groups;