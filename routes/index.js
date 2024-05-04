var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants')
var multer = require('multer');

// storage defines the storage options to be used for file upload with multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/');
  },
  filename: function (req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split(".");
    // Make the file name the date + the file extension
    filename =  Date.now() + '.' + file_extension[file_extension.length-1];
    cb(null, filename);
  }
});
let upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loginpage', { title: 'Express' });
});

/* Plant Details */
router.get('/plantdetails', function(req, res, next) {
  res.render('plantdetails', { title: 'Express' });
});

/* All Plant Page */
router.get('/main', function(req, res, next) {
  res.render('main', { title: 'Express' });
});

router.get('/newplant', function(req,res){
  // let plant = plants.create(description="This is a plant description", name="African Iris", img="public/images/uploads/african_iris.jpg");
  res.render('newPlant', { title: 'Express' });
})

router.get('/display', function(req, res, next) {
  let result = plants.getAll()
  result.then(plants => {
    let data = JSON.parse(plants);
    // console.log("jjujuju", data.length)
    res.render('display', { title: 'View All Plants', data: data});
  })
});

module.exports = router;




