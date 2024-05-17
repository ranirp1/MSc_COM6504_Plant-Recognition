// Import the plant model
const plantModel = require('../models/plants');

// Function to create new plants
exports.create = function (plantData, filePath) {
    // Create a new plant instance using the provided user data
    let plant = new plantModel({
        dos: plantData.dos,
        location: plantData.location,
        description: plantData.description,
        plant_size: plantData.plant_size,
        flowers: plantData.flowers,
        leaves: plantData.leaves,
        fruits_or_seeds: plantData.fruits_or_seeds,
        sun_exposure: plantData.sun_exposure,
        flower_colour: plantData.flower_colour,
        name: plantData.name,
        plant_status: plantData.plant_status,
        scientific_name: plantData.scientific_name,
        english_description: plantData.english_description,
        URI: plantData.URI,
        img: filePath,
        owner_nickname: plantData.owner_nickname,
        chat: plantData.chat || [],
        suggestions: plantData.suggestions || []

    });

    // Save the plant to the database and handle success or failure
    return plant.save().then(plant => {
        // Log the created plant
        console.log(plant);

        // Return the plant data as a JSON string
        return JSON.stringify(plant);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

// Function to get all plants
exports.getAll = function () {
    // Retrieve all plants from the database
    return plantModel.find({}).then(plants => {
        // Return the list of plants as a JSON string
        return JSON.stringify(plants);
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

//function to get plant based on id
exports.getById = function (plantId) {
    // Validate the provided plant ID (optional)
    // You can add checks here to ensure the ID is a valid format (e.g., ObjectId)
  
    // Find the plant with the specified ID
    return plantModel.findById(plantId)
      .then((plant) => {
        // Check if a plant was found
        if (!plant) {
          return null; // Return null if plant not found
        }
  
        // Return the plant object as it is (no need for JSON.stringify)
        return plant;
      })
      .catch((err) => {
        console.error("Error finding plant by ID:", err);
        return null; // Return null in case of an error
      });
  };
  

