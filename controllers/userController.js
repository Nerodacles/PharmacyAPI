const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const userServices = require('../services/userService')

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
*       400:
*         description: Bad request
*       500:
*         description: Internal server error
*/

router.post('/register', (req, res, next) => {
    const {password} = req.body
    const salt = bcrypt.genSaltSync(10);
    req.body.password = bcrypt.hashSync(password, salt);

    userServices.register(req.body).then(
        () => res.sendStatus(200)
    ).catch(
        err => next(err)
    )
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
*         schema:
*           type: object
*           required:
*             - username
*             - password
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
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: Internal server error
*/

router.post('/login', (req, res, next) => {
    const { username, password} = req.body;
    userServices.login({ username, password })
        .then(user => {
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
*       - ApiKeyAuth:
*         - api-key
*     summary: Get all Drugs
*     description: Get all drugs
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Drugs Found
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

router.get('/:id', (req, res, next) => {
    userServices.getById(req.params.id).then(
        (user) => res.json(user)
    ).catch(err => next(err))
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
*               example: 3a22bassansl3gga
*             role:
*               type: string
*               example: user
*             username:
*               type: string
*               example: exh3r3
*             email:
*               type: string
*               example: admin@jmcv.codes
*             date:
*               type: string
*               example: 2020-01-01T00:00:00.000Z
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: User is not found
*/

router.get('/:id', (req, res, next) => {
    userServices.getById(req.params.id).then(
        (user) => res.json(user)
    ).catch(err => next(err))
})



module.exports = router;