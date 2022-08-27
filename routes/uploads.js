var express = require('express');
var router = express.Router();
var path = require('path');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
});

let absolutePath = path.resolve(__dirname, '../uploads')
router.use(limiter)

router.get('/:filename', function(req, res, next) {
    res.sendFile(absolutePath + decodeURI(req.url))
});

module.exports = router;