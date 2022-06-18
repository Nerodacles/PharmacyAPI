const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
})

module.exports = mongoose.model('drugs', drugSchema)