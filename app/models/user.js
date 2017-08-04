var mongoose = require('mongoose');
var schema = mongoose.Schema;

module.exports = mongoose.model('user', new schema({
    userName: String,
    userPassword: String,
    admin: Boolean
}))