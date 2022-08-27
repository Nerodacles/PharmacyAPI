var express = require('express');
var router = express.Router();
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20 // limit each IP to 50 requests per windowMs
});

router.use(limiter)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express with docker' });
});

module.exports = router;
