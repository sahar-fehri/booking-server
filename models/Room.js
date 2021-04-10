let mongoose = require ('mongoose');
const {Status}  = require ('../utils/constants');
var roomSchema = new mongoose.Schema({
    resourceId: {
        type: String,
        required: true
    },
    idSlot: {
        type: String,
        required: true
    },
    start: {
        type: Number,
        required: true,

    },
    end: {
        type: Number,
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
    title: {
        type: String,
        required: true,

    }
})

roomSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.__v;
    return obj;
};

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;


module.exports.getAllAvailibilitiesByCompany = async (idCompany) =>{
    return await Room.find({company:  idCompany, status: Status.Booked});
}

module.exports.cancelRoom = async (idSlot) => {
    console.log('here to cancell this', idSlot)
    const query = {idSlot: idSlot};
    const newvalues = { $set: {status: Status.Canceled } };
    return await Room.updateOne(query, newvalues);
}
