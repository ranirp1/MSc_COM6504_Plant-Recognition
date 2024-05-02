var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Plant Details */
router.get('/plantdetails', function(req, res, next) {
  res.render('plantdetails', { title: 'Express' });
});

module.exports = router;
