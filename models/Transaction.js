let mongoose = require ('mongoose');
const {TX_Status}  = require ('../utils/constants');
const Schema    = mongoose.Schema;
const transactionSchema = new mongoose.Schema({
    idSlot: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true
    },
    user:{
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },
})

transactionSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.__v;
    return obj;
};

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;


module.exports.updateTX = async (id, newStatus) => {
    const newvalues = { $set: {status: newStatus } };
    return await Transaction.findByIdAndUpdate(id, newvalues,  {useFindAndModify: false});
}
