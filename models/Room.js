let mongoose = require ('mongoose');

var roomSchema = new mongoose.Schema({
    idRoom: {
        type: String,
        required: true
    },
    idSlot: {
        type: String,
        required: true
    },
    start: {
        type: String,
        required: true,

    },
    end: {
        type: String,
        required: true,

    },
    company: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
})

roomSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.__v;
    return obj;
};

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
