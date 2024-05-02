var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('plantdetails', { title: 'Express' });
});

router.get('/main', function(req, res, next) {
  res.render('main', { title: 'Express' });
});

router.get('/main', function(req, res, next) {
  res.render('main', { title: 'Plant Recognition' });
});

router.get('/album', function(req, res, next) {
  res.render('album', { title: 'Plant Recognition' });
});

module.exports = router;
