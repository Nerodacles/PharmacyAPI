var express = require('express');
var router = express.Router();
var path = require('path');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 50 requests per windowMs
    keyGenerator: (req, res) => req.header('x-real-ip')
});

let absolutePath = path.resolve('/home/nero/PharmacyApp/PharmacyFiles/Images')
router.use(limiter)

router.get('/:filename', function(req, res, next) {
    res.sendFile(absolutePath + decodeURI(req.url))
});

module.exports = router;