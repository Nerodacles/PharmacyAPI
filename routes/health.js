let express = require('express');
let router = express.Router();
let path = require('path');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 50 requests per windowMs
    keyGenerator: (req, res) => req.header('x-real-ip')
});

/**
* @swagger
* /health:
*   get:
*     tags:
*       - HealthCheck
*     security: []
*     summary: Returns API operational status
*     description: Returns API operational status
*     produces:
*       - application/json
*     responses:
*       200:
*         description: API operational
*         schema:
*           type: string
*           example: "OK"
*/

router.use(limiter)
router.get('/', function(req, res, next) { res.sendStatus(200) });

module.exports = router;