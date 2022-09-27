const User = require('../models/userModel')
const bcrypt = require('bcryptjs');
const auth = require('../helpers/jwt.js')

async function login({ username, password }) {
    const user = await User.findOne({username});

    // synchronously compare user entered password with hashed password
    if(bcrypt.compareSync(password, user.password)){
        // Generate a token
        const token = auth.generateAccessToken(username);

        // call toJSON method applied during model instantiation
        return {...user.toJSON(), token}
    }
    return 'err'
}

async function register(params){
    // instantiate a user modal and save to mongoDB
    const user = new User(params);
    await user.save();
    // call toJSON method applied during model instantiation
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
    if (user.role === 'admin') {
        return true
    }
    return false
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