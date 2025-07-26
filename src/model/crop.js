const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },

  plantType: {
    type: String,
    required: true,
    index: true,
  },

  sunExposure: {
    type: String,
    enum: ["Full Sun", "Partial Shade", "Shade"],
    required: true,
  },

  soilPH: {
    type: String,
    required: true,
  },

  bloomTime: {
    type: String,
    index: true,
  },

  flowerColor: {
    type: String,
  },

  overview: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },

  lifecycle: {
    planting: {
      season: {
        type: String,
        index: true,
      },
      seedDepth: String,
      spacing: {
        row: String,
        plant: String,
      },
      sowingTips: String,
    },
    growing: {
      irrigationNeeds: String,
      fertilizer: {
        type: String,
      },
      careTips: [String],
    },
  },

  pestsAndDiseases: [
    {
      name: String,
      symptoms: String,
      solution: String,
      type: {
        type: String,
        enum: ["Pest", "Disease"],
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Crop = mongoose.model("Crop", cropSchema);
module.exports = Crop;
