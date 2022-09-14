let express = require('express');
let router = express.Router();
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 50 requests per windowMs
  keyGenerator: (req, res) => req.header('x-real-ip')
});

router.use(limiter)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express - PharmacyAPI' });
});

module.exports = router;
