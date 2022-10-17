const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs');
const auth = require('../helpers/jwt.js')

async function login({ username, password }) {
    let query = { username: username.toLowerCase().trim().toString() }
    const user = await userModel.findOne(query);

    // synchronously compare user entered password with hashed password
    try {
        if(bcrypt.compareSync(password.trim().toString(), user.password)){
            // if the user status is false, throw an error
            if (!user.status) {
                throw new Error('User not found');
            }
            
            // Generate a token
            const token = auth.generateAccessToken(username);
    
            // call toJSON method applied during model instantiation
            return {...user.toJSON(), token}
        }
        return "err"
    }
    catch (err) {
        throw new Error('La contraseña es incorrecta');
    }
}

async function register(params){
    let query = { 
        username: params.username.toLowerCase().trim().toString(), 
        password: params.password.trim().toString(), 
        email: params.email.trim().toString(),
        phone: params.phone.trim().toString(),
    }

    if (query.email.indexOf('@') == -1) {
        throw new Error('Email is not valid');
    }

    if (await userModel.findOne({ email: query.email })) {
        throw new Error("Email is already taken");
    }

    if (await userModel.findOne({ username: query.username })) {
        throw new Error("Username is already taken");
    }

    if (await userModel.findOne({ username: query.username })) {
        throw new Error("Phone number is already taken");
    }

    if (query.phone.length != 10) {
        throw new Error('Phone number is not valid');
    }

    if (query.password.length < 5) {
        throw new Error('Password must be at least 5 characters long');
    }

    // delete invalid characters from username
    query.username = query.username.replace(/[^a-z0-9_\.]/g, '');
    query.email = query.email.replace(/[^a-z0-9_\.@]/g, '');
    query.username = query.username.replace('.', '');
    
    // replace all but numbers 
    query.phone = query.phone.replace(/[^0-9]/g, '');

    const user = new userModel({
        username: query.username,
        password: query.password,
        email: query.email,
        phone: query.phone,
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

async function checkUserIsDelivery(token){
    if (!token){
        return false
    }
    let user = await auth.getUserRole(token)
    return user.role == 'delivery'
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
    return userData?.username
}

async function updateStatus(id, status) {
    // validate if status is voolean
    let query = { _id: id.toString().trim() , status: status.toString().toLowerCase()};

    const order = await userModel.findByIdAndUpdate(query._id, {status: query.status}, { new: true });
    if (!order) { throw new Error('Order not found'); }
    return order.toJSON();
}

async function updateLocation(id, location) {
    let query = { _id: id.toString().trim(), location: location };
    const user = await userModel.findById(query._id);

    if (!user) { throw new Error('User not found'); }
    const userData = await userModel.findByIdAndUpdate(query._id, {location: query.location}, { new: true });
    return userData.toJSON();
}

async function changePassword(token, oldPassword, newPassword) {
    let query = { token: token.toString().trim(), oldPassword: oldPassword.toString().trim(), newPassword: newPassword.toString().trim() };
    
    let username = await auth.getUserByToken(query.token)
    if (!username) { throw new Error('User not found'); }

    let user = await userModel.findOne({username: username.data})
    if (!user) { throw new Error('User not found'); }

    if(bcrypt.compareSync(query.oldPassword, user.password)){
        const salt = bcrypt.genSaltSync(10)
        query.newPassword = bcrypt.hashSync(query.newPassword, salt)
        user.password = query.newPassword

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
    checkUserIsDelivery,
    getUserID,
    getUserName,
    updateStatus,
    updateLocation,
    changePassword
};