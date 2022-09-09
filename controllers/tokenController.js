const express = require('express')
const router = express.Router();
const auth = require('../helpers/jwt.js')

/**
* @swagger
* /token:
*   get:
*     tags:
*       - Token
*     security:
*       - ApiKeyAuth: []
*     summary: Verify if token is valid
*     description: Verify if token is valid
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Token is valid
*       400:
*         description: Bad request
*       401:
*         description: Token expired
*/

router.get('/', (req, res, next) => {
    if (auth.verifyToken(req.headers.authorization)) {
        res.sendStatus(200)
    }
    else {
        res.sendStatus(401).json({message: "Token expired"})
    }
})

module.exports = router;