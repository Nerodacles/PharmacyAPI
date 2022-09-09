const express = require('express')
const router = express.Router();
const userServices = require('../services/userService');

/**
* @swagger
* /favs:
*   get:
*     tags:
*       - Users Favorites
*     security:
*       - ApiKeyAuth: []
*     summary: Get user favorites
*     description: Get user favorites
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Favorites returned
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

router.get('/', (req, res, next) => {
    userServices.getFavs(req.headers.authorization)
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
})

/**
* @swagger
* /favs/modify/{id}:
*   post:
*     tags:
*       - Users Favorites
*     security:
*       - ApiKeyAuth: []
*     summary: Add or remove a favorite
*     description: Add or remove a favorite
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         description: Id of the favorite
*         in: path
*         required: true
*         type: string
*     responses:
*       200:
*         description: Favorite added or removed
*         schema:
*           type: string
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

router.post('/modify/:id', (req, res, next) => {
    userServices.modifyFavs(req.headers.authorization, req.params.id)
        .then((user) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
})

module.exports = router;