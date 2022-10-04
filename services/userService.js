const User = require('../models/userModel')
const bcrypt = require('bcryptjs');
const auth = require('../helpers/jwt.js')

async function login({ username, password }) {
    let query = { username: username.toLowerCase().trim().toString() }
    const user = await User.findOne(query);

    // synchronously compare user entered password with hashed password
    if(bcrypt.compareSync(password.trim().toString(), user.password)){
        // Generate a token
        const token = auth.generateAccessToken(username);

        // call toJSON method applied during model instantiation
        return {...user.toJSON(), token}
    }
    return 'err'
}

async function register(params){
    let username = params.username.toLowerCase().trim().toString()
    let password = params.password.trim().toString()
    let email = params.email.trim().toString()

    let query = { username: username.toLowerCase().trim().toString(), email: email.trim().toString() }

    if (email.indexOf('@') == -1) {
        throw new Error('Email is not valid');
    }

    if (await User.findOne({ email: query.email })) {
        throw new Error("Email is already taken");
    }

    // not construct database query with user input
    if (await User.findOne({ username: query.username })) {
        throw new Error("Username is already taken");
    }

    // delete invalid characters from username
    username = username.replace(/[^a-z0-9_\.]/g, '');
    email = email.replace(/[^a-z0-9_\.@]/g, '');
    username = username.replace('.', '');
    

    const user = new User({
        username: username,
        password: password,
        email: email,
    })
    await user.save();

    return user.toJSON();
}

async function getAll() {
    // find all users in mongoDB
    return User.find({})
}

async function getById(id) {
    const user = await User.findById(id);
    // call toJSON method applied during model instantiation
    return user.toJSON()
}

function isUserNameValid(username) {
    const res = /^[a-z0-9_\.]+$/.exec(username);
    const valid = !!res;
    return valid;
}

async function modifyFavs(authToken, fav) {
    const username = auth.getUserByToken(authToken)?.data

    if (isUserNameValid(username)) {
        let usernameS = username.toLowerCase().trim()
        const user = await User.findOne({usernameS});
        if (user.favorites.includes(fav)) { user.favorites = user.favorites.filter((favorite) => favorite !== fav) }
        else { user.favorites.push(fav) }
        await user.save()
        return user.toJSON()
    }
}

async function getFavs(authToken) {
    const username = auth.getUserByToken(authToken)?.data

    if (isUserNameValid(username)) {
        let usernameS = username.toLowerCase().trim()
        const user = await User.findOne({usernameS});
        return user.favorites
    }
}

async function hasFavorite(authToken, id) {
    const username = auth.getUserByToken(authToken)?.data
    if (isUserNameValid(username)) {
        let usernameS = username.toLowerCase().trim()
        const user = await User.findOne({usernameS});
        return user.favorites.includes(id)
    }
}

async function checkUserIsAdmin(token){
    if (!token){
        return false
    }
    let user = await auth.getUserRole(token)
    return user.role == 'admin'
}

async function getUserID(token) {
    let user = await auth.getUserByToken(token)
    if (user) {
        let userData = await User.findOne({username: user.data})
        return userData._id.toString()
    }
}

async function getUserName(id) {
    let userData = await User.findById(id)
    return userData.username
}

module.exports = {
    login,
    register,
    getAll,
    getById,
    modifyFavs,
    hasFavorite,
    getFavs,
    checkUserIsAdmin,
    getUserID,
    getUserName
};