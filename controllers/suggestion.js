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