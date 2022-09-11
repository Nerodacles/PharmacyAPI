require('dotenv').config();

const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

mongoose.connect(process.env.URL, {
    "authSource": "admin",
    "user": process.env.USERADMIN,
    "pass": process.env.PASSWORDADMIN,
});

const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

database.once('disconnected', () => {
    console.log('Database Disconnected');
})

module.exports = {
    database,
    mongoose
}
