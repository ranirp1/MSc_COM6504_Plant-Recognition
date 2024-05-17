let mongoose = require('mongoose');

// Get the Schema class from mongoose
let Schema = mongoose.Schema;

// Defining the schema for the Plant model
let PlantSchema = new Schema(
    {

        // Defining the date/time seen field with type Date
        dos: { type: Date },
        // Defining the location field with type String, required,
        // and max length of 25 characters
        location: { type: String }, //, required: true, max: 25 },
        // Define the description field with type String, required,
        // and max length of 500 characters
        description: { type: String },//, required: true, max: 500 },
        // Define the plant size field with type String, required,
        // and max length of 100 characters
        plant_size: { type: String },//, required: true, max: 100 },
        // Define the plant flowers field with type Boolean, required
        flowers: { type: Boolean },//, required: true},
        // Define the plant leaves field with type Boolean, required
        leaves: { type: Boolean },//, required: true},
        // Define the plant fruits_or_seeds field with type Boolean, required
        fruits_or_seeds: { type: Boolean },// required: true},
        // Define the plant sun exposure field with type String, required
        // and max length of 50 characters
        sun_exposure: { type: String },// required: true, max: 50 },
        // Define the plant flower colour field with type String, required
        // and max length of 50 characters
        flower_colour: { type: String },// required: true, max: 50 },

        //IDENTIFICATION PART
        // Define the plant name field with type String, required
        // and max length of 100 characters
        name: { type: String },// required: true, max: 100 },
        // Define the plant status field with type Boolean, required
        plant_status: { type: Boolean },// required: true},
        // Define the plant common/scientific name from DBPedia with type String
        scientific_name: { type: String },
        // Define the plant english language description from DBPedia with type String
        english_description: { type: String },
        // Define the plant URI from DBPedia with type String
        URI: { type: String },
        // Define the img field with type String
        img: { type: String },
        // Define the plant owner/user's nickname field with type String
        owner_nickname: { type: String },
        // Define the plant's chat field with type array
        chat: [],
        suggestions: []
    }
);

/* Configure the 'toObject' option for the schema to include getters
 and virtuals when converting to an object*/
PlantSchema.set('toObject', { getters: true, virtuals: true });

// Create the mongoose model 'Plant' based on the defined schema
let Plant = mongoose.model('plant', PlantSchema);

// Export the Plant model for use in other modules
module.exports = Plant;

