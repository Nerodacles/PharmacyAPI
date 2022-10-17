const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const userService = require('../services/userService')

/**
* @swagger
* /users/register:
*   post:
*     tags:
*       - Users
*     summary: Register a new user
*     description: Register a new user
*     security: []
*     parameters:
*       - in: body
*         name: Register a new user
*         description: Register a new user
*         type: object
*         required: true
*         schema:
*           type: object
*           required:
*             - username
*             - email
*             - password
*           properties:
*             username:
*               type: string
*               description: Username of the user
*             email:
*               type: string
*               description: Email of the user
*             password:
*               type: string
*               description: Password of the user
*     responses:
*       200:
*         description: User registered
*         schema:
*           type: string
*           example: "OK"
*       400:
*         description: Bad request
*       500:
*         description: Internal server error
*/

router.post('/register', (req, res, next) => {
    const { password } = req.body
    const salt = bcrypt.genSaltSync(10);
    req.body.password = bcrypt.hashSync(password, salt);

    userService.register(req.body)
    .then((user) => { res.status(200).json(user) })
    .catch((err) => { res.status(500).json(`${err}`) })
})

/**
* @swagger
* /users/login:
*   post:
*     tags:
*       - Users
*     summary: Login a user
*     description: Login a user
*     security: []
*     parameters:
*       - in: body
*         name: Login User Data
*         description: User data for login
*         required: true
*         schema:
*           type: object
*           required:
*             - username
*               password
*           properties:
*             username:
*               type: string
*               description: Username of the user
*             password:
*               type: string
*               description: Password of the user
*     responses:
*       200:
*         description: User logged in
*         schema:
*           type: object
*           properties:
*             token:
*               type: string
*               description: JWT token
*             username:
*               type: string
*               description: Username of the user
*             email:
*               type: string
*               description: Email of the user
*             id:
*               type: string
*               description: Id of the user
*             role:
*               type: string
*               description: Role of the user
*             date:
*               type: string
*               description: Date of the user
*           example:
*             id: 62ae1de392d3f0b8a6
*             username: test
*             email: test@test.com
*             role: user
*             date: 2020-01-01T00:00:00.000Z
*             token: eypXVCJ9.eIjoiIjoxNjU3MDU2NjI5fQ.c5iagFuyBPGH_w
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: Internal server error
*/

router.post('/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    userService.login({ username, password })
        .then(user => {
            if (user == 'err'){ return res.sendStatus(400) }
            res.json(user)
        }
    ).catch(err => next(res.sendStatus(400)))
})

/**
* @swagger
* /users/All:
*   get:
*     tags:
*       - Users
*     security:
*       - ApiKeyAuth: []
*       - ApiKeyDef: []
*     summary: Get all users
*     description: Get all users
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Users returned
*         schema:
*           type: object
*           properties:
*             username:
*               type: string
*               description: Username of the user
*             email:
*               type: string
*               description: Email of the user
*             role:
*               type: string
*               description: Role of the user
*             date:
*               type: string
*               description: Date of the user
*             id:
*               type: string
*               description: Id of the user
*           example:
*             - username: test
*               email: test@test.com
*               role: user
*               date: 2020-01-01T00:00:00.000Z
*               id: 62ae1de392d3f0b8a6
*             - username: test2
*               email: test2@test.com
*               role: admin
*               date: 2020-01-01T00:00:00.000Z
*               id: 62ae1de392d3f0b8a7
*             
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

router.get('/All', async (req, res, next) => {
    let token = req.headers.authorization
    if (await userService.checkUserIsAdmin(token)) {
        userService.getAll()
        .then(users => { res.json(users) } )
        .catch(err => next(err))
    }
    else { res.sendStatus(401) }
})

/**
* @swagger
* /users/changePassword:
*   patch:
*     tags:
*       - Users
*     security: []
*     summary: Change password
*     description: Change password
*     produces:
*       - application/json
*     parameters:
*       - in: body
*         name: oldPassword
*         description: Old password
*         required:
*           - oldPassword
*         properties:
*           oldPassword:
*             type: string
*       - in: body
*         name: newPassword
*         description: New password
*         required:
*           - newPassword
*         properties:
*           newPassword:
*             type: string
*     responses:
*       200:
*         description: User found
*         schema:
*           type: object
*           properties:
*             id:
*               type: string
*             role:
*               type: string
*             username:
*               type: string
*             email:
*               type: string
*             date:
*               type: string
*           example:
*             id: 62ae1de392d3f0b8a6
*             username: test
*             email: test@test.com
*             role: user
*             date: 2020-01-01T00:00:00.000Z
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: User is not found
*/

router.patch('/changePassword', (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    userService.changePassword(token, req.body.oldPassword, req.body.newPassword)
    .then((user) => { res.status(200).json(user); })
    .catch((err) => { res.status(500).json(err); });
})

/**
* @swagger
* /users/{id}:
*   get:
*     tags:
*       - Users
*     security: []
*     summary: Get a user data
*     description: Get a user data
*     produces:
*       - application/json
*     parameters:
*       - in: path
*         name: id
*         description: User id
*         required:
*           - id
*         properties:
*           id:
*             type: string
*     responses:
*       200:
*         description: User found
*         schema:
*           type: object
*           properties:
*             id:
*               type: string
*             role:
*               type: string
*             username:
*               type: string
*             email:
*               type: string
*             date:
*               type: string
*           example:
*             id: 62ae1de392d3f0b8a6
*             username: test
*             email: test@test.com
*             role: user
*             date: 2020-01-01T00:00:00.000Z
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: User is not found
*/

router.get('/:id', (req, res, next) => {
    userService.getById(req.params.id)
    .then( (user) => res.json(user))
    .catch(err => next(err))
})

/**
* @swagger
* /users/{id}:
*   get:
*     tags:
*       - Users
*     security: []
*     summary: Get a user data
*     description: Get a user data
*     produces:
*       - application/json
*     parameters:
*       - in: path
*         name: id
*         description: User id
*         required:
*           - id
*         properties:
*           id:
*             type: string
*     responses:
*       200:
*         description: User found
*         schema:
*           type: object
*           properties:
*             id:
*               type: string
*             role:
*               type: string
*             username:
*               type: string
*             email:
*               type: string
*             date:
*               type: string
*           example:
*             id: 62ae1de392d3f0b8a6
*             username: test
*             email: test@test.com
*             role: user
*             date: 2020-01-01T00:00:00.000Z
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: User is not found
*/

router.patch('/:id', async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    if (await userService.checkUserIsAdmin(token)) {
        return userService.updateStatus(req.params.id, req.body.status)
        .then((order) => { res.status(200).json(order); })
        .catch((err) => { res.status(500).json(err); });
    }
    if (await userService.checkUserIsDelivery(token)) {
        return userService.updateLocation(req.params.id, req.body.location)
        .then((order) => { res.status(200).json(order); })
        .catch((err) => { res.status(500).json(err); });
    }
    else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
})


module.exports = router;
