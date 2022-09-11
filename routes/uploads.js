let express = require('express');
let router = express.Router();
let path = require('path');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 50 requests per windowMs
    keyGenerator: (req, res) => req.header('x-real-ip')
});

let absolutePath = path.resolve(__dirname, '../uploads')
router.use(limiter)

router.get('/:filename', function(req, res, next) {
    let file = path.normalize(req.url)
    res.sendFile(absolutePath + decodeURI(file))
});

module.exports = router;