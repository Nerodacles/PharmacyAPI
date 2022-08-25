var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/:filename', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../uploads' + req.url))
});

module.exports = router;