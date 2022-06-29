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
*         description: Drugs Found
*/

var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res, next) {
    res.sendStatus('OK')
  });

module.exports = router;