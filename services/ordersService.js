
const orderModel = require('../models/orderModel');
const drugModel = require('../models/model');
const auth = require('../helpers/jwt.js');
const userService = require('../services/userService');
const drugService = require('../services/drugService.js');

async function createOrder(order) {
    let drugIndex, totalPrice = 0;
    for (drugIndex in order.drugs) {
        let drugID = order.drugs[drugIndex].id;
        let query = { id: drugID.toString().trim().toLowerCase()};

        const drug = await drugModel.findById(query.id);
        if (!drug?.status) { throw new Error('Drug not found'); }

        // update the stock of the drug
        drugStock = drug.stock - order.drugs[drugIndex].quantity;
        if (drugStock <= 0) { throw new Error(`No hay suficiente ${drug.name}`) }
        await drugModel.findByIdAndUpdate(query.id, {stock: drugStock}, { new: true });

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
        newOrder.user = await userService.getUserName(newOrder.user.toString());
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

async function getOrdersByUser(userID) {
    let orderIndex, drugIndex = 0;
    const orders = await orderModel.find({user: userID});
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
    return orders.filter(order => order.status == true);
}

async function getOrdersByDelivery(userID) {
    let orderIndex, drugIndex = 0;
    const orders = await orderModel.find({delivery: userID});
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
    return orders.filter(order => order.status == true && order.delivered === 'on the way');
}

async function getOrderByProductID(id) {
    let query = { "_id": id.toString().trim().toLowerCase()};
    let orderIndex, drugIndex = 0;
    let orderFinale = [];
    
    const orders = await orderModel.find({});
    if (!orders) { throw new Error('Orders not found'); }

    // filter orders by product id
    for (orderIndex in orders) {
        let newOrder = orders[orderIndex].toJSON();
        newOrder.user = await userService.getUserName(newOrder.user);
        orders[orderIndex] = newOrder;

        // delete the drug from the order if it is not the one we are looking for and update the totalPrice
        if (orders[orderIndex].drugs.length > 1) {
            let drug = await drugModel.findById(query);
            for (drugIndex in orders[orderIndex].drugs) {
                let newDrug = orders[orderIndex].drugs[drugIndex];
                newDrug.cover = await drugService.getCoverImage(newDrug.id.toString());
                if (newDrug.id.toString() == drug.id.toString()) {
                    orders[orderIndex].totalPrice = drug.price * newDrug.quantity;
                    orderFinale = [newDrug];
                }
            }
            orders[orderIndex].drugs = orderFinale
        }

        // delete the order if it does not contain the drug we are looking for
        for (drugIndex in orders[orderIndex].drugs) {
            let newDrug = orders[orderIndex].drugs[drugIndex];
            newDrug.cover = await drugService.getCoverImage(newDrug.id.toString());
            orders[orderIndex].drugs[drugIndex] = newDrug;
        }
    }
    return orders.filter(order => order.drugs.some(drug => drug.id == id));
}

async function updateStatus(id, status) {
    // validate if status is voolean
    let query = { status: status.toString().trim().toLowerCase()};

    const order = await orderModel.findByIdAndUpdate(id, query, { new: true });
    if (!order) { throw new Error('Order not found'); }
    return order.toJSON();
}

async function checkIfUserIsOwner(token, id) {
    const user = await userService.getUserID(token);
    const order = await orderModel.findById(id);
    return user == order?.user.toString()
}

async function acceptOrder(token, id) {
    const isDelivery = await userService.checkUserIsDelivery(token);
    const delivery = await userService.getUserID(token);
    let query = { _id: id.toString().trim().toLowerCase() };

    if (isDelivery) {
        const order = await orderModel.findById(query);
        if (order.status) {
            order.delivered = 'on the way';
            order.delivery = delivery
            const newOrder = await orderModel.findByIdAndUpdate(query, order, { new: true });
            if (!newOrder) { throw new Error('Order not found'); }
            return newOrder.toJSON();
        } else {
            throw new Error('Order already accepted');
        }
    }
}

async function deliverOrder(token, id) {
    const isDelivery = await userService.checkUserIsDelivery(token);
    const isAdmin = await userService.checkUserIsAdmin(token);
    const delivery = await userService.getUserID(token);
    let query = { _id: id.toString().trim().toLowerCase() };

    if (isDelivery) {
        const order = await orderModel.findById(query);
        if ((order.status && order.delivered == 'on the way' && order.delivery == delivery) || (order.status == true && isAdmin)) {
            order.delivered = 'yes';
            order.deliveredDate = new Date();
            const newOrder = await orderModel.findByIdAndUpdate(query, order, { new: true });
            if (!newOrder) { throw new Error('Order not found'); }
            return newOrder.toJSON();
        } else {
            throw new Error('Order already accepted');
        }
    }
}

module.exports = {
    createOrder,
    acceptOrder,
    deliverOrder,
    getOrders,
    getOrder,
    updateStatus,
    getOrdersByUser,
    getOrdersByDelivery,
    checkIfUserIsOwner,
    getOrderByProductID
};