const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true, unique: true}
})

module.exports = mongoose.model('User', userSchema)