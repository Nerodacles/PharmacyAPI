const express = require('express')
const router = express.Router();
const orderService = require('../services/ordersService');
const userService = require('../services/userService');
const auth = require('../helpers/jwt.js')

/**
* @swagger
* /orders:
*   get:
*     tags:
*       - Orders
*     security:
*       - ApiKeyAuth: [admin]
*     summary: Get All Orders
*     description: Get All Orders
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Orders
*         schema:
*           type: Array
*           properties:
*             id:
*               type: string
*               description: Id of the favorite
*           example:
*             - "123456789"
*             
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

router.get('/', async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    if ( await !userService.checkUserIsAdmin(token) || await !userService.checkUserIsDelivery(token)) { return res.status(401).json({ message: 'Unauthorized' }); }
    else {
        orderService.getOrders()
        .then((orders) => {res.status(200).json(orders);})
        .catch((err) => { res.status(500).json(err); });
    }
})

/**
* @swagger
* /orders/user/{id}:
*   get:
*     tags:
*       - Orders
*     security:
*       - ApiKeyAuth: []
*     summary: Get User Orders
*     description: Get User Orders
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Orders
*         schema:
*           type: Array
*           properties:
*             id:
*               type: string
*               description: Id of the order
*           example:
*             - "123456789"
*             
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

router.get('/user/:id', async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    if ( await !userService.checkUserIsAdmin(token) || await !userService.checkUserIsDelivery(token)) { return res.status(401).json({ message: 'Unauthorized' }); }

    let query = { user: req.params.id.toString().trim() };
    orderService.getOrdersByUser(req.params.id)
    .then((orders) => {res.status(200).json(orders);})
    .catch((err) => { res.status(500).json(err); });
})

/**
* @swagger
* /orders/product/{id}:
*   get:
*     tags:
*       - Orders
*     security:
*       - ApiKeyAuth: []
*     summary: Get User Orders
*     description: Get User Orders
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Orders
*         schema:
*           type: Array
*           properties:
*             id:
*               type: string
*               description: Id of the order
*           example:
*             - "123456789"
*             
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

router.get('/product/:id', async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    if ( await !userService.checkUserIsAdmin(token) || await !userService.checkUserIsDelivery(token)) { return res.status(401).json({ message: 'Unauthorized' }); }

    orderService.getOrderByProductID(req.params.id)
    .then((orders) => {res.status(200).json(orders);})
    .catch((err) => { res.status(500).json(err); });
})

/**
* @swagger
* /orders/{id}:
*   get:
*     tags:
*       - Orders
*     security:
*       - ApiKeyAuth: []
*     summary: Get orders by id
*     description: Get orders by id only if the user is the owner of the order or is admin
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Orders
*         schema:
*           type: Array
*           properties:
*             id:
*               type: string
*               description: Id of the favorite
*           example:
*             - "123456789"
*             
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

router.get('/:id', async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    if ( await !userService.checkUserIsAdmin(token) || await !userService.checkUserIsDelivery(token) || await orderService.checkIfUserIsOwner(token, req.params.id) ) {
        orderService.getOrder(req.params.id)
        .then((order) => {res.status(200).json(order);})
        .catch((err) => { res.status(500).json(err); });
    }
    else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
})

/**
* @swagger
* /orders:
*   post:
*     tags:
*       - Orders
*     security:
*       - ApiKeyAuth: []
*     summary: Create Order
*     description: Create Order only if authorization token is valid
*     produces:
*       - application/json
*     consumes:
*       multipart/form-data
*     parameters:
*       - name: drugs
*         description: Drugs
*         in: body
*         required: true
*         type: array
*         items:
*           type: object
*           properties:
*             id:
*               type: string
*               description: Id of the drug
*             quantity:
*               type: number
*               description: Quantity of the drug
*       - name: location
*         description: Location
*         in: body
*         required: true
*         type: array
*         items:
*           type: object
*           properties:
*             lat:
*               type: number
*               description: Latitude
*             lng:
*               type: number
*               description: Longitude
*     responses:
*       200:
*         description: Orders
*         schema:
*           type: Array
*           properties:
*             id:
*               type: string
*               description: Id of the favorite
*           example:
*             - "123456789"
*             
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

router.post('/', async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    if (await auth.getUserByToken(token)) {
        let userID = await userService.getUserID(token);
        orderService.createOrder({
            drugs: req.body.drugs,
            location: req.body.location,
            user: userID
        })
        .then((order) => { res.status(200).json(order); })
        .catch((err) => { res.status(500).json(err); });
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
})

/**
* @swagger
* /status/{id}:
*   patch:
*     tags:
*       - Orders
*     security:
*       - ApiKeyAuth: [admin]
*     summary: Update Order Status
*     description: Update Order Status only if the user is admin
*     produces:
*       - application/json
*     consumes:
*       multipart/form-data
*     parameters:
*       - name: id
*         description: Order Id
*         in: path
*         required: true
*         type: string
*       - name: id
*         description: Order Id
*         in: formData
*         required: true
*         type: string
*       - name: status
*         description: Status
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Orders
*         schema:
*           type: Array
*           properties:
*             id:
*               type: string
*               description: Id of the favorite
*           example:
*             - "123456789"
*             
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

router.patch('/status/:id', (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    if (userService.checkUserIsAdmin(token) || userService.checkUserIsDelivery(token)) {
        orderService.updateStatus(req.params.id, req.body.status)
        .then((order) => { res.status(200).json(order); })
        .catch((err) => { res.status(500).json(err); });
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
})

module.exports = router;