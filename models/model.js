const mongoose = require('mongoose');
const { Schema } = mongoose;

const drugSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
})

drugSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('drugs', drugSchema)