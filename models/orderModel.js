const mongoose = require('mongoose');
const userModel = require('../models/userModel');

const drugs = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drug',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, { _id : false });

const orderSchema = new mongoose.Schema({
    status: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    drugs: [drugs],
    totalPrice: { type: Number, required: true },
    delivered: { type: Boolean, default: false },
    createdTime: { type: Date, default: Date.now },
})

orderSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('orders', orderSchema)