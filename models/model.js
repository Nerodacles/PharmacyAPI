const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    name: { required: true, type: String },
    description: { required: true, type: String },
    price: { required: true, type: Number, default: 200 },
    stock: { required: true, type: Number, default: 50 },
    cover: { type: String, required: false },
    tags: { type: Array, required: true },
    createdTime: { type: Date, default: Date.now },
    status: { type: Boolean, default: true },
})

drugSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('drugs', drugSchema)