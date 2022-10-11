let express = require('express');
let router = express.Router();
let path = require('path');
const rateLimit = require('express-rate-limit');
let userService = require('../services/userService');

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1h
    max: async (req, response) => {
        if (await userService.checkUserIsAdmin(req.headers.authorization)) return 0
        else return 1000
    },
    keyGenerator: (req, res) => req.header('x-real-ip'),
    message: async (req, response) => {
        if (await userService.checkUserIsAdmin(req.headers.authorization)) return 'You can make infinite requests every hour.'
        else return 'You can only make 200 requests every hour.'
    }
});

let absolutePath = path.resolve(__dirname, '../uploads')
router.use(limiter)

router.get('/:filename', function(req, res, next) {
    let file = path.normalize(req.url)
    res.sendFile(absolutePath + decodeURI(file))
});

module.exports = router;