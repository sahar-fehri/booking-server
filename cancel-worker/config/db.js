const mongoose  = require('mongoose');
require('dotenv').config();

//Set up default mongoose connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log('connected to db successfully')
    });
// In order to remove deprecated warning collection.ensureIndex is deprecated. Use createIndexes instead.
//mongoose.set('useCreateIndex', true);

//Get the default connection
const db = mongoose.connection;
module.exports = db;
