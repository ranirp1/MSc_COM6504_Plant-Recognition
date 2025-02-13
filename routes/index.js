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
    filename = Date.now() + '.' + file_extension[file_extension.length - 1];
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

/* GET login page. */
router.get('/', function (req, res, next) {
  res.render('loginpage', { title: 'Express' });
});

/* POST login page. */
router.post('/', function (req, res, next) {
  const username = req.body.username;

  // Check if the username already exists in IndexedDB
  const transaction = requestIDB.result.transaction(["user"]);
  const userStore = transaction.objectStore("user");
  const getRequest = userStore.getAll();

  getRequest.addEventListener("success", (event) => {
    const userData = event.target.result;
    const usernames = userData.map(user => user.username);

    // Check if the username exists
    if (usernames.includes(username)) {
      // Username already exists, redirect to homepage
      res.redirect('/homepage');
    } else {
      // Username does not exist, store it in IndexedDB
      const addRequest = userStore.add({ username: username });

      addRequest.addEventListener("success", () => {
        console.log("User data added successfully");
        // Redirect to homepage
        res.redirect('/homepage');
      });

      addRequest.addEventListener("error", (event) => {
        console.error("Error storing user data:", event.target.error);
        res.status(500).send("Error storing user data");
      });
    }
  });
});


/* GET home page. */
router.get('/homepage', function (req, res, next) {
  res.render('homepage', {
    backgroundImage: 'images/bg.jpg',
    title: 'Express'
  });
});

/* Plant Details */
router.get('/plantdetails', function (req, res, next) {
  res.render('plantdetails', { title: 'Express' });
});

/* All Plant Page */
router.get('/main', function (req, res, next) {
  let result = plants.getAll()
  result.then(plants => {
    let data = JSON.parse(plants);
    res.render('main', { title: 'View All Plants', data: data, getTimeElapsed: getTimeElapsed });
  })
});

router.get('/newplant', function (req, res) {
  // let plant = plants.create(description="This is a plant description", name="African Iris", img="public/images/uploads/african_iris.jpg");
  res.render('newPlant', { title: 'Express' });
})

// Route handler for saving plant data
router.post('/savePlant', upload.single('imageUpload'), async function (req, res, next) {
  try {
    const { dateTime, description, location, plantSize, plantType, fruitType, leavesType, sunExposureType, plantName, plantColor, userName } = req.body;
    const filePath = req.file.path; // Get the path to the uploaded image file

    // Call the create function from the controller to save the plant data
    const result = await plants.create({
      dos: dateTime,
      description: description,
      location: location,
      plant_size: plantSize,
      flowers: plantType === 'withFlower',
      fruits_or_seeds: fruitType === 'withFruitSeed',
      leaves: leavesType === 'withLeaves',
      sun_exposure: sunExposureType,
      name: plantName,
      flower_colour: plantColor,
      owner_nickname: userName,
      plant_status: false
    }, filePath);

    console.log(result)

    // Handle the result
    if (result) {
      res.send('<p> Redirecting to Main.......</p><script>setTimeout(function(){window.location.href="/main";}, 2000);</script>');
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

router.post('/plantdetails', function (req, res) {
  const plantId = req.body.plantId;
  const username = req.body.username;

  plantdetails.getById(plantId)
    .then((plant) => {
      if (plant) {
        //res.json(plant);// Send the retrieved plant data in JSON format
        //console.log(res.locals.plant);
        const resource = `http://dbpedia.org/resource/${encodeURIComponent(plant.name)}`;
        const endpointUrl = 'https://dbpedia.org/sparql';
        const sparqlQuery = `
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX dbo: <http://dbpedia.org/ontology/>
          PREFIX dbp: <http://dbpedia.org/property/>
          SELECT ?label ?description
          WHERE {
          <http://dbpedia.org/resource/${encodeURIComponent(plant.name)}> rdfs:label ?label .
          <http://dbpedia.org/resource/${encodeURIComponent(plant.name)}> dbo:abstract ?description .
          FILTER(langMatches(lang(?label),"en") && langMatches(lang(?description),"en"))
          }
           `;

        const encodedQuery = encodeURIComponent(sparqlQuery);
        const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

        fetch(url)
          .then(response => response.json())
          .then(data => {
            console.log("Fetched data:", data); // Log the fetched data
            let bindings = data.results.bindings;

            // Check if the data is found
            if (bindings.length === 0) {
              console.log("Data not found");
              // Render the 'plantdetails' page without specific data
              res.render('plantdetails', { plant: plant });
              return;
            }

            let result = JSON.stringify(bindings)

            // Check if the description exists before rendering
            //let description = bindings[0].description? bindings[0].description.value : null;

            res.render('plantdetails', {
              name: bindings[0]?.label?.value || 'Data not found',
              description: bindings[0]?.description?.value || 'Description not found',
              JSONresult: result,
              plant: plant,
              username: username
            });


          })
          .catch(error => {
            console.error('Error fetching data:', error);
            res.render('plantdetails', { title: 'Plant Details', plant: plant }); // Render the page without data in case of an error
          });


        // res.render('plantdetails', { plant: plant });
      } else {
        res.status(404).send("Plant not found."); // Send a 404 Not Found response
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving plant."); // Send a 500 Internal Server Error response
    });
});


const chat = require('../controllers/chat');

router.post('/plantdetails/:plantId/chat', function (req, res) {
  const plantId = req.params.plantId;
  const chatData = req.body;

  chat.create(plantId, chatData)
    .then((plant) => {
      if (plant) {
        res.status(201).send("Chat message saved successfully!");
      } else {
        res.status(404).send("Plant not found.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving chat message.");
    });
});

// Route handler for getting chat data
router.get('/plantdetails/:plantId/chat', function (req, res) {
  const plantId = req.params.plantId;

  chat.getById(plantId)
    .then((chat) => {
      if (chat) {
        res.json(chat); // Send the retrieved chat data in JSON format
      } else {
        res.status(404).send("Plant not found."); // Send a 404 Not Found response
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving chat."); // Send a 500 Internal Server Error response
    });
});

const suggestions = require('../controllers/suggestion');

router.post('/plantdetails/:plantId/suggestions', function (req, res) {
  const plantId = req.params.plantId;
  const suggestionData = req.body;

  suggestions.suggest(plantId, suggestionData)
    .then((plant) => {
      if (plant) {
        res.status(201).send("suggested name saved successfully!");
      } else {
        res.status(404).send("Plant not found.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving suggested name.");
    });
});

// Route handler for getting suggestions data
router.get('/plantdetails/:plantId/suggestions', function (req, res) {
  const plantId = req.params.plantId;

  suggestions.getSuggestion(plantId)
    .then((suggestions) => {
      if (suggestions) {
        res.json(suggestions); // Send the retrieved chat data in JSON format
      } else {
        res.status(404).send("Plant not found."); // Send a 404 Not Found response
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving Suggestion."); // Send a 500 Internal Server Error response
    });
});

// Route handler for approving a suggested name and updating the plant name
router.post('/plantdetails/:plantId/approvesuggestions', function (req, res) {
  const plantId = req.params.plantId;
  const suggestedName = req.body.suggestedName;

  console.log(plantId, suggestedName);
  suggestions.approve(plantId, suggestedName)
    .then((plant) => {
      if (plant) {
        res.status(200).send("Suggested name approved successfully!");
      } else {
        res.status(404).send("Plant not found.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error approving suggested name.");
    });
});


module.exports = router;




