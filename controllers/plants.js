// Import the student model
const plantModel = require('../models/plants');

// Function to create new students
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
        chat: plantData.chat,
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

