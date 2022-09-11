const mongoose = require('mongoose');
const { Schema } = mongoose;

const drugSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    description: {
        required: true,
        type: String,
    },
    price: {
        required: true,
        type: Number,
        default: 200,
    },
    cover: {
        type: String,
        required: false
    },
    tags: {
        type: Array,
        required: true,
    },
    createdTime: {
        type: Date,
        default: Date.now
    }
})

drugSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('drugs', drugSchema)