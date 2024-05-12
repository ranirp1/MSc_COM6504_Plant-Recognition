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

/**
 * used to return dynamic time when plant was submitted
 */
const getTimeElapsed = (plantDOS) => {
  // console.log("Hello")
  // Converting into date object
  var plantDate = new Date(plantDOS);
  // Current time
  var currentDate = new Date();

  // Calculating time difference
  var timeDifference = currentDate - plantDate;
  var minutes = Math.floor(timeDifference / (1000 * 60));
  var hours = Math.floor(timeDifference / (1000 * 60 * 60));
  var days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  // Checking time difference for return
  if (minutes < 60) {
    return minutes + ' mins ago';
  } else if (hours < 24) {
    return hours + ' hours ago';
  } else {
    return days + ' days ago';
  }
}

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
  let result = plants.getAll()
  result.then(plants => {
    let data = JSON.parse(plants);
    res.render('main', { title: 'View All Plants', data: data, getTimeElapsed: getTimeElapsed});
  })
});

router.get('/newplant', function(req,res){
  // let plant = plants.create(description="This is a plant description", name="African Iris", img="public/images/uploads/african_iris.jpg");
  res.render('newPlant', { title: 'Express' });
})

// Route handler for saving plant data
router.post('/savePlant', upload.single('imageUpload'), async function(req, res, next) {
  try {
    const { dateTime, description, location, plantSize, plantType, fruitType, leavesType, sunExposureType, plantName , plantColor, userName} = req.body;
    const filePath = req.file.path; // Get the path to the uploaded image file

    // Call the create function from the controller to save the plant data
    const result = await plants.create({
      dos: dateTime,
      description : description,
      location: location,
      plant_size: plantSize,
      flowers: plantType === 'withFlower',
      fruits_or_seeds: fruitType === 'withFruitSeed',
      leaves: leavesType === 'withLeaves',
      sun_exposure: sunExposureType,
      name: plantName,
      flower_colour: plantColor,
      owner_nickname: userName
    }, filePath);

   // console.log(result)

    // Handle the result
    if (result) {
      res.send('<p>Redirecting to route2 in 5 seconds...</p><script>setTimeout(function(){window.location.href="/main";}, 2000);</script>');
      //res.json({ success: true });
    } else {
      res.status(500).send("Error saving plant");
    }
  } catch (error) {
    console.error("Error saving plant:", error);
    res.status(500).send("Error saving plant");
  }
});



const plantdetails = require('../controllers/plants');

router.post('/plantdetails', function(req, res) {
  const plantId = req.body.plantId;
  plantdetails.getById(plantId)
    .then((plant) => {
      if (plant) {
        //res.json(plant);// Send the retrieved plant data in JSON format
        //console.log(res.locals.plant);
        res.render('plantdetails', { plant: plant }); 
      } else {
        res.status(404).send("Plant not found."); // Send a 404 Not Found response
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving plant."); // Send a 500 Internal Server Error response
    });
});

module.exports = router;




