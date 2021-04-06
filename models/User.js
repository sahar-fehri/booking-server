let mongoose = require ('mongoose');
//const Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        defaule: Date.now
    },
})

userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    delete obj.privateKey;
    delete obj.__v;
    return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
