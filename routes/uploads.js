var express = require('express');
var router = express.Router();
var path = require('path');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
});

router.use(limiter)

router.get('/:filename', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../uploads' + req.url))
});

module.exports = router;