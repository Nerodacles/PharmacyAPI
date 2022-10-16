const mongoose = require('mongoose');
const userModel = require('../models/userModel');

const drugs = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true }
}, { _id : false });

const moreDetails = new mongoose.Schema({
    direction: { type: String, required: true },
    street: { type: String, required: true },
    houseNumber: { type: String, required: true },
    reference: { type: String, required: true }
});

const payment = new mongoose.Schema({
    paymentMethod: { type: String, default: 'cash' },
    cash: { type: String },
    paypal: { type: String },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    drugs: [drugs],
    totalPrice: { type: Number, required: true },
    delivered: { type: String, default: 'no' },
    delivery: { type: String },
    createdTime: { type: Date, default: Date.now },
    status: { type: Boolean, default: true },
    location: { type: Object, default: {} },
    payment: {payment},
    moreDetails: {moreDetails}
})

orderSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('orders', orderSchema)