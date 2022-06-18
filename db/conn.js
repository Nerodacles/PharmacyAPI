
require('dotenv').config();

const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

// mongoose.connect(process.env.URL, {
//     "auth": { "authSource": "pharmacy" },
//     "user": process.env.USER,
//     "pass": process.env.PASSWORD,
//     directConnection: true,
//     useNewUrlParser: true,
// });

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