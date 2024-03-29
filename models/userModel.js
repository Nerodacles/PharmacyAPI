const mongoose = require("mongoose");

const location = new mongoose.Schema({
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
}, { _id : false });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "user" },
    date: { type: Date, default: Date.now() },
    favorites: { type: Array, default: [] },
    status: { type: Boolean, default: true },
    location: location,
});

UserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.password
    }
})

module.exports = mongoose.model("user", UserSchema);