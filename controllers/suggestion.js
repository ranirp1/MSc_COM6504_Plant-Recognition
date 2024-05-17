const Plant = require('../models/plants');

exports.suggest = async function (plantId, suggestionData) {
    try {
        // Find the plant by ID
        const plant = await Plant.findById(plantId);

        if (!plant) {
            console.log("Plant not found");
            return null;
        }

        // Push the chat message to the plant's chat array
        plant.suggestions.push(suggestionData);

        // Save the updated plant document to MongoDB
        const savedPlant = await plant.save();

        console.log(savedPlant);

        // Return the updated plant document
        return savedPlant;
    } catch (error) {
        // Log the error if saving fails
        console.error(error);

        // Return null in case of an error
        return null;
    }
};

exports.getSuggestions = async function (plantId) {
    try {
        // Find the plant by ID
        const plant = await Plant.findById(plantId);

        if (!plant) {
            console.log("Plant not found");
            return null;
        }

        // Return the plant's chat array
        return plant.suggestions;
    } catch (error) {
        // Log the error if fetching fails
        console.error(error);

        // Return null in case of an error
        return null;
    }
};

//function to update the plant name with the suggested name
exports.approve = async function (plantId, suggestedName) {
    try {
        // Find the plant by ID
        const plant = await Plant.findById(plantId);

        if (!plant) {
            console.log("Plant not found");
            return null;
        }

        // Update the plant name with the suggested name
        plant.name = suggestedName;
        console.log("updated plant name");
        // Save the updated plant document to MongoDB
        const savedPlant = await plant.save();

        console.log(savedPlant);

        // Return the updated plant document
        return savedPlant;
    } catch (error) {
        // Log the error if saving fails
        console.error(error);

        // Return null in case of an error
        return null;
    }
};