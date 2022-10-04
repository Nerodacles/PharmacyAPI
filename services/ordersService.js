
const orderModel = require('../models/orderModel');
const drugModel = require('../models/model');
const auth = require('../helpers/jwt.js');
const userService = require('../services/userService');
const drugService = require('../services/drugService.js');

async function createOrder(order) {
    let drugIndex, totalPrice=0;
    for (drugIndex in order.drugs) {
        let drugID = order.drugs[drugIndex].id;
        const drug = await drugModel.findById(drugID);
        if (!drug?.status) { throw new Error('Drug not found'); }
        order.drugs[drugIndex].name = drug.name;
        order.totalPrice = drug.price * order.drugs[drugIndex].quantity;
        totalPrice += order.totalPrice;
    }
    order.totalPrice = totalPrice;
    const newOrder = await orderModel.create(order);
    if (!newOrder) { throw new Error('Order not found'); }
    return newOrder.toJSON();
}

async function getOrders() {
    let orderIndex, drugIndex = 0;
    const orders = await orderModel.find({});
    if (!orders) { throw new Error('Orders not found'); }
    for (orderIndex in orders) {
        let newOrder = orders[orderIndex].toJSON();
        newOrder.user = await userService.getUserName(newOrder.user);
        orders[orderIndex] = newOrder;
        for (drugIndex in orders[orderIndex].drugs) {
            let newDrug = orders[orderIndex].drugs[drugIndex];
            newDrug.cover = await drugService.getCoverImage(newDrug.id.toString());
            orders[orderIndex].drugs[drugIndex] = newDrug;
        }
    }
    return orders;
}

async function getOrder(id) {
    const order = await orderModel.findById(id);
    if (!order) { throw new Error('Order not found'); }
    return order.toJSON();
}

async function getOrdersByUser(username) {
    const orders = await orderModel.find({ username });
    if (!orders) { throw new Error('Orders not found'); }
    return orders;
}

async function updateStatus(id, status) {
    const order = await orderModel.findByIdAndUpdate(id, { status: status }, { new: true });
    if (!order) { throw new Error('Order not found'); }
    return order.toJSON();
}

async function checkIfUserIsOwner(token, id) {
    const user = await userService.getUserID(token);
    const order = await orderModel.findById(id);
    return user == order?.user.toString()
}

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    updateStatus,
    getOrdersByUser,
    checkIfUserIsOwner
};