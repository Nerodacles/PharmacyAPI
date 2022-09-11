const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
})

tagsSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('tags', tagsSchema)