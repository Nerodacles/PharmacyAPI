const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs');
const auth = require('../helpers/jwt.js')

async function login({ username, password }) {
    let query = { username: username.toLowerCase().trim().toString() }
    const user = await userModel.findOne(query);

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

    if (await userModel.findOne({ email: query.email })) {
        throw new Error("Email is already taken");
    }

    // not construct database query with user input
    if (await userModel.findOne({ username: query.username })) {
        throw new Error("Username is already taken");
    }

    // delete invalid characters from username
    username = username.replace(/[^a-z0-9_\.]/g, '');
    email = email.replace(/[^a-z0-9_\.@]/g, '');
    username = username.replace('.', '');
    

    const user = new userModel({
        username: username,
        password: password,
        email: email,
    })
    await user.save();

    return user.toJSON();
}

async function getAll() {
    // find all users in mongoDB
    return userModel.find({})
}

async function getById(id) {
    const user = await userModel.findById(id);
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
        const user = await userModel.findOne({usernameS});
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
        const user = await userModel.findOne({usernameS});
        return user.favorites
    }
}

async function hasFavorite(authToken, id) {
    const username = auth.getUserByToken(authToken)?.data
    if (isUserNameValid(username)) {
        let usernameS = username.toLowerCase().trim()
        const user = await userModel.findOne({usernameS});
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
        let userData = await userModel.findOne({username: user.data})
        return userData._id.toString()
    }
}

async function getUserName(id) {
    let userData = await userModel.findById(id)
    return userData.username
}

async function updateStatus(id, status) {
    // validate if status is voolean
    let query = { _id: id.toString().trim() , status: status.toString().toLowerCase()};
    const order = await userModel.findByIdAndUpdate(query._id, {status: query.status}, { new: true });
    if (!order) { throw new Error('Order not found'); }
    return order.toJSON();
}

async function changePassword(id, oldPassword, newPassword) {
    let query = { _id: id.toString().trim() };
    const user = await userModel.findById(query._id);
    if (!user) { throw new Error('User not found'); }
    if(bcrypt.compareSync(oldPassword.trim().toString(), user.password)){
        user.password = newPassword
        await user.save()
        return user.toJSON();
    }
    return 'err'
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
    getUserName,
    updateStatus,
    changePassword
};